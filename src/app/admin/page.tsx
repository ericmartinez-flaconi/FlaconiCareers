'use client';
import { useState } from 'react';
import Papa from 'papaparse';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [sheetUrl, setSheetUrl] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [status, setStatus] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'flaconi2026') { // Simple password
      setIsAuthorized(true);
    } else {
      alert('Wrong password');
    }
  };

  const handleSync = async () => {
    setStatus('Syncing...');
    try {
      // 1. Fetch CSV from Google Sheets
      const response = await fetch(sheetUrl);
      const csvText = await response.text();
      
      // 2. Parse CSV to JSON
      const parsed = Papa.parse(csvText, { header: true });
      const jsonData = JSON.stringify(parsed.data, null, 2);

      // 3. Commit to GitHub using GitHub API
      // First, get the current file SHA (required for updates)
      const repo = 'ericmartinez-flaconi/FlaconiCareers';
      const path = 'app-v2/captured_dom/jobs_live.json';
      
      const getFile = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
        headers: { 'Authorization': `token ${githubToken}` }
      });
      const fileData = await getFile.json();
      const sha = fileData.sha;

      const updateFile = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${githubToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'chore: sync jobs from google sheets',
          content: btoa(unescape(encodeURIComponent(jsonData))),
          sha: sha
        })
      });

      if (updateFile.ok) {
        setStatus('SUCCESS! Live jobs updated. Site will rebuild in 2 mins.');
      } else {
        const err = await updateFile.json();
        setStatus(`FAILED: ${err.message}`);
      }
    } catch (error: any) {
      setStatus(`ERROR: ${error.message}`);
    }
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <form onSubmit={handleLogin} className="p-8 bg-white shadow-xl rounded-xl space-y-4 border border-gray-200">
          <h1 className="text-xl font-black uppercase tracking-tighter">Admin Login</h1>
          <input 
            type="password" 
            placeholder="Password" 
            className="w-full p-3 border border-gray-300 rounded text-black"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="w-full bg-pink-600 text-white p-3 font-bold uppercase tracking-widest hover:bg-black transition-all">Enter</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50 text-black">
      <div className="max-w-2xl mx-auto bg-white p-10 shadow-xl rounded-2xl border border-gray-200 space-y-8">
        <h1 className="text-3xl font-black uppercase tracking-tighter">Job CMS Dashboard</h1>
        
        <div className="space-y-2">
          <label className="text-xs font-black uppercase text-gray-400">Published Google Sheets CSV URL</label>
          <input 
            type="text" 
            placeholder="https://docs.google.com/spreadsheets/d/.../pub?output=csv" 
            className="w-full p-4 border border-gray-200 rounded-lg text-sm"
            value={sheetUrl}
            onChange={(e) => setSheetUrl(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black uppercase text-gray-400">GitHub Personal Access Token (PAT)</label>
          <input 
            type="password" 
            placeholder="ghp_xxxxxxxxxxxx" 
            className="w-full p-4 border border-gray-200 rounded-lg text-sm"
            value={githubToken}
            onChange={(e) => setGithubToken(e.target.value)}
          />
          <p className="text-[10px] text-gray-400">We never store this token. It stays in your browser session only.</p>
        </div>

        <button 
          onClick={handleSync}
          className="w-full bg-black text-white p-5 font-black uppercase tracking-[0.2em] hover:bg-pink-600 transition-all rounded-lg"
        >
          Sync & Publish to Site
        </button>

        {status && (
          <div className={`p-4 rounded-lg text-sm font-bold border ${status.includes('SUCCESS') ? 'bg-green-50 border-green-200 text-green-700' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
            {status}
          </div>
        )}

        <div className="pt-8 border-t border-gray-100">
          <h3 className="text-sm font-black uppercase mb-4">Rollback Instructions</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            1. Open your Google Sheet.<br/>
            2. Go to <strong>File &gt; Version history &gt; See version history</strong>.<br/>
            3. Select a previous date and click <strong>Restore this version</strong>.<br/>
            4. Come back here and click <strong>Sync &amp; Publish</strong> again.
          </p>
        </div>
      </div>
    </div>
  );
}
