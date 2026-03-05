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
    
    rewritten = rewritten.replace(new RegExp(`href="${base}(?!wp-content|wp-includes|wp-json)(?!"|#|\\s)`, 'g'), `href="${prefix}/"`);

    return rewritten;
  };

  data.body = rewriteLinks(data.body);
  data.head = rewriteLinks(data.head);

  // Strip scripts
  const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>|<script\b[^>]*\/>/gmi;
  data.body = data.body.replace(scriptRegex, '');
  data.head = data.head.replace(scriptRegex, '');

  return <JobsClient initialData={data} />;
}
