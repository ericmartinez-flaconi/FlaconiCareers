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

    rewritten = rewritten.replace(/https?:\/\/(www\.)?flaconi\.de\/karriere\/(en\/)?culture\/?/g, `${prefix}/culture/`);
    rewritten = rewritten.replace(/https?:\/\/(www\.)?flaconi\.de\/karriere\/(en\/)?locations\/?/g, `${prefix}/locations/`);
    rewritten = rewritten.replace(/https?:\/\/(www\.)?flaconi\.de\/karriere\/(en\/)?our-teams\/?/g, `${prefix}/our-teams/`);
    rewritten = rewritten.replace(/https?:\/\/(www\.)?flaconi\.de\/karriere\/(en\/)?stellenangebote\/?/g, `${prefix}/jobs/`);
    
    rewritten = rewritten.replace(/https?:\/\/(www\.)?flaconi\.de\/karriere\/(en\/)?/g, `${prefix}/`);

    rewritten = rewritten.replace(/src="\//g, `src="${prefix}/`);
    rewritten = rewritten.replace(/href="\//g, `href="${prefix}/`);
    rewritten = rewritten.replace(/srcset="\//g, `srcset="${prefix}/`);

    return rewritten;
  };

  data.body = rewriteLinks(data.body);
  data.head = rewriteLinks(data.head);

  // Strip scripts
  const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>|<script\b[^>]*\/>/gmi;
  data.body = data.body.replace(scriptRegex, '');
  data.head = data.head.replace(scriptRegex, '');
  
  // Strip base tag
  data.head = data.head.replace(/<base\b[^>]*\/?>/gmi, '');

  return <JobsClient initialData={data} />;
}
