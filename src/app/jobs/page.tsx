import fs from 'fs';
import path from 'path';
import JobsClient from './JobsClient';

export default async function JobsPage() {
  const responsivePath = path.join(process.cwd(), 'captured_dom', 'responsive_jobs.json');
  const data = JSON.parse(fs.readFileSync(responsivePath, 'utf8'));

  // Pre-process links for static build
  const prefix = '/FlaconiCareers';
  data.body = data.body.replace(/src="\//g, `src="${prefix}/`);
  data.body = data.body.replace(/href="\//g, `href="${prefix}/`);
  data.body = data.body.replace(/srcset="\//g, `srcset="${prefix}/`);

  // Fix internal links to stay in our prototype
  const baseFlaconi = /https?:\/\/(www\.)?flaconi\.de\/karriere\/(en\/)?/g;
  data.body = data.body.replace(new RegExp(baseFlaconi.source + 'culture\\/?', 'g'), `${prefix}/culture/`);
  data.body = data.body.replace(new RegExp(baseFlaconi.source + 'locations\\/?', 'g'), `${prefix}/locations/`);
  data.body = data.body.replace(new RegExp(baseFlaconi.source + 'our-teams\\/?', 'g'), `${prefix}/our-teams/`);
  data.body = data.body.replace(new RegExp(baseFlaconi.source + 'stellenangebote\\/?', 'g'), `${prefix}/jobs/`);
  data.body = data.body.replace(new RegExp(baseFlaconi.source + '(?!"|#|\\s)', 'g'), `${prefix}/`);

  // Strip scripts
  const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>|<script\b[^>]*\/>/gmi;
  data.body = data.body.replace(scriptRegex, '');
  data.head = data.head.replace(scriptRegex, '');
  
  // Strip base tag
  data.head = data.head.replace(/<base\b[^>]*\/?>/gmi, '');

  return <JobsClient initialData={data} />;
}
