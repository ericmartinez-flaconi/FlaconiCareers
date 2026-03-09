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
    
    rewritten = rewritten.replace(new RegExp(`href="${base}(?!"|#|\\s|wp-content|wp-includes|wp-json)`, 'g'), `href="${prefix}/"`);

    rewritten = rewritten.replace(/https?:\/\/(www\.)?flaconi\.de\/karriere\/(wp-content|wp-includes|fonts|anya)\//g, `${prefix}/assets/$2/`);

    rewritten = rewritten.replace(/(src|href|srcset)="\/karriere\//g, `$1="${prefix}/assets/`);
    rewritten = rewritten.replace(/(src|href|srcset)="\/(wp-content|wp-includes|fonts|anya)/g, `$1="${prefix}/assets/$2`);

    const doublePrefix = new RegExp(`${prefix}${prefix}`, 'g');
    rewritten = rewritten.replace(doublePrefix, prefix);

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
