import fs from 'fs';
import path from 'path';
import JobsClient from './JobsClient';

export default async function JobsPage() {
  const responsivePath = path.join(process.cwd(), 'captured_dom', 'responsive_jobs.json');
  const data = JSON.parse(fs.readFileSync(responsivePath, 'utf8'));

  const prefix = '/FlaconiCareers';

  const rewriteLinks = (content: string) => {
    if (!content) return content;
    let rewritten = content;

    const base = 'https?://(www\\.)?flaconi\\.de/karriere/(en/)?';
    rewritten = rewritten.replace(new RegExp(`href="${base}culture/?`, 'g'), `href="${prefix}/culture/"`);
    rewritten = rewritten.replace(new RegExp(`href="${base}locations/?`, 'g'), `href="${prefix}/locations/"`);
    rewritten = rewritten.replace(new RegExp(`href="${base}our-teams/?`, 'g'), `href="${prefix}/our-teams/"`);
    rewritten = rewritten.replace(new RegExp(`href="${base}stellenangebote/?`, 'g'), `href="${prefix}/jobs/"`);
    rewritten = rewritten.replace(new RegExp(`href="${base}(?!"|#|\\s|wp-content|wp-includes|wp-json|fonts|anya)`, 'g'), `href="${prefix}/"`);

    const largeVideos = [
      '250915_flaconi_CompanyVideo2526_V05_FINAL_HighRes.mp4',
      'Cultural-Pillars-Value-Day-30-sec.mp4'
    ];
    largeVideos.forEach(vid => {
      const remotePath = vid.includes('Cultural') 
        ? `https://www.flaconi.de/karriere/wp-content/uploads/2024/06/${vid}`
        : `https://www.flaconi.de/karriere/wp-content/uploads/2025/11/${vid}`;
      
      const regex = new RegExp(`${prefix}/assets/videos/[^"]*${vid}`, 'g');
      rewritten = rewritten.replace(regex, remotePath);
    });

    rewritten = rewritten.replace(/(href|src|srcset)="\/(?!FlaconiCareers)([^"]*)"/g, `$1="${prefix}/$2"`);

    return rewritten;
  };

  data.body = rewriteLinks(data.body);
  data.head = rewriteLinks(data.head);

  // Strip scripts
  const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>|<script\b[^>]*\/>/gmi;
  data.body = data.body.replace(scriptRegex, '');
  data.head = data.head.replace(scriptRegex, '');
  
  data.head = data.head.replace(/<base\b[^>]*\/?>/gmi, '');

  data.head += `
    <style>
      @media screen and (min-width: 1024px) {
        #mobile-drawer { display: none !important; }
        .menu-toggle-open { display: none !important; }
      }
      @media screen and (max-width: 1023px) {
        .menu-toggle-open { display: block !important; }
        #site-navigation { display: none !important; }
      }
    </style>
  `;

  return <JobsClient initialData={data} />;
}
