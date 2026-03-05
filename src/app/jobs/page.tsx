import fs from 'fs';
import path from 'path';
import JobsClient from './JobsClient';

export default async function JobsPage() {
  const responsivePath = path.join(process.cwd(), 'captured_dom', 'responsive_jobs.json');
  const data = JSON.parse(fs.readFileSync(responsivePath, 'utf8'));

  // Pre-process links for static build
  const prefix = '/FlaconiCareers';
  data.body = data.body.replace(/href="https:\/\/www\.flaconi\.de\/karriere\/(en\/)?culture\//g, `href="${prefix}/culture/"`);
  data.body = data.body.replace(/href="https:\/\/www\.flaconi\.de\/karriere\/(en\/)?locations\//g, `href="${prefix}/locations/"`);
  data.body = data.body.replace(/href="https:\/\/www\.flaconi\.de\/karriere\/(en\/)?our-teams\//g, `href="${prefix}/our-teams/"`);
  data.body = data.body.replace(/href="https:\/\/www\.flaconi\.de\/karriere\/(en\/)?stellenangebote\//g, `href="${prefix}/jobs/"`);
  data.body = data.body.replace(/href="https:\/\/www\.flaconi\.de\/karriere\/(en\/)?(?!"|#)/g, `href="${prefix}/"`);

  // Strip scripts
  const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>|<script\b[^>]*\/>/gmi;
  data.body = data.body.replace(scriptRegex, '');
  data.head = data.head.replace(scriptRegex, '');
  
  // Strip base tag
  data.head = data.head.replace(/<base\b[^>]*\/?>/gmi, '');

  return <JobsClient initialData={data} />;
}
