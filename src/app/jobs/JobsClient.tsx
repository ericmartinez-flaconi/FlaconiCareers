'use client';
import { useEffect, useState } from 'react';
import fs from 'fs'; // Note: This will be handled for static export
import path from 'path';

// This component handles the 1:1 DOM rendering and the Live Sync script
export default function JobsPage({ initialData }: { initialData: any }) {
  const [isClient, setIsAuthorized] = useState(false);

  useEffect(() => {
    // This script runs in the browser to fetch live data
    const fetchLiveJobs = async () => {
      // REPLACE THIS URL with your "Published to Web" CSV URL from Google Sheets
      const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS_placeholder_replace_me/pub?output=csv';
      
      try {
        const response = await fetch(SHEET_CSV_URL);
        const csvText = await response.text();
        
        // Simple CSV parser
        const lines = csvText.split('\n').map(line => line.split(','));
        const headers = lines[0];
        const jobs = lines.slice(1).map(line => {
          let obj: any = {};
          headers.forEach((header, i) => obj[header.trim()] = line[i]?.replace(/"/g, '').trim());
          return obj;
        }).filter(j => j.Title);

        if (jobs.length > 0) {
          const container = document.querySelector('.job-list-container');
          if (container) {
            const jobsHtml = jobs.map(job => `
              <div class="job live-job" style="border-left: 4px solid #db2777; margin-bottom: 10px; background: #fffafb;">
                <div class="main-column">
                  <div><a href="${job.URL}" target="_blank" class="job-title"><strong>${job.Title}</strong> <span style="font-size: 10px; background: #db2777; color: white; padding: 2px 6px; border-radius: 10px; margin-left: 10px;">LIVE</span></a></div>
                  <div class="info-column"><div class="info-items">
                    <div style="display: flex; flex-wrap: wrap; column-gap: 36px;">
                      <p style="display:flex;"><span>📍 ${job.Location}</span></p>
                      <p style="display:flex;"><span>🏢 ${job.Department}</span></p>
                    </div>
                  </div></div>
                </div>
                <div class="button-column" style="display: table; margin-left: auto;">
                  <div style="display: table-cell; vertical-align: middle;">
                    <div class="apply-link"><a href="${job.URL}" target="_blank"><span>Apply Now</span></a></div>
                  </div>
                </div>
              </div>
            `).join('');
            
            // Prepend to the existing list
            container.insertAdjacentHTML('afterbegin', jobsHtml);
          }
        }
      } catch (e) {
        console.error('Live Sync Failed:', e);
      }
    };

    fetchLiveJobs();
  }, []);

  return (
    <div className={initialData.bodyClass} style={{ margin: 0, padding: 0 }}>
       {/* Use a simple container instead of html/body */}
       <div dangerouslySetInnerHTML={{ __html: initialData.body }} />
    </div>
  );
}
