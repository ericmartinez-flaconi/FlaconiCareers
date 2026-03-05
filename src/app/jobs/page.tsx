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
  // We use a more generic replacement for absolute flaconi karriere links
  data.body = data.body.replace(/https:\/\/www\.flaconi\.de\/karriere\/(en\/)?culture\/?/g, `${prefix}/culture/`);
  data.body = data.body.replace(/https:\/\/www\.flaconi\.de\/karriere\/(en\/)?locations\/?/g, `${prefix}/locations/`);
  data.body = data.body.replace(/https:\/\/www\.flaconi\.de\/karriere\/(en\/)?our-teams\/?/g, `${prefix}/our-teams/`);
  data.body = data.body.replace(/https:\/\/www\.flaconi\.de\/karriere\/(en\/)?stellenangebote\/?/g, `${prefix}/jobs/`);
  // Any other flaconi karriere link goes to prototype root
  data.body = data.body.replace(/https:\/\/www\.flaconi\.de\/karriere\/(en\/)?(?!"|#)/g, `${prefix}/`);

  // Strip scripts
  const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>|<script\b[^>]*\/>/gmi;
  data.body = data.body.replace(scriptRegex, '');
  data.head = data.head.replace(scriptRegex, '');
  
  // Strip base tag
  data.head = data.head.replace(/<base\b[^>]*\/?>/gmi, '');

  return <JobsClient initialData={data} />;
}
