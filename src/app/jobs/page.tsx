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

    // 1. Remove base tag
    rewritten = rewritten.replace(/<base\b[^>]*\/?>/gmi, '');

    // 2. Normalize flaconi links
    rewritten = rewritten.replace(/https?:\/\/(www\.)?flaconi\.de\/karriere\/(en\/)?culture\/?/g, '/culture/');
    rewritten = rewritten.replace(/https?:\/\/(www\.)?flaconi\.de\/karriere\/(en\/)?locations\/?/g, '/locations/');
    rewritten = rewritten.replace(/https?:\/\/(www\.)?flaconi\.de\/karriere\/(en\/)?our-teams\/?/g, '/our-teams/');
    rewritten = rewritten.replace(/https?:\/\/(www\.)?flaconi\.de\/karriere\/(en\/)?stellenangebote\/?/g, '/jobs/');
    rewritten = rewritten.replace(/https?:\/\/(www\.)?flaconi\.de\/karriere\/(en\/)?/g, '/');

    // 3. Prefix with negative lookahead to prevent duplication
    rewritten = rewritten.replace(/href="\/(?!FlaconiCareers)([^"]*)"/g, `href="${prefix}/$1"`);
    rewritten = rewritten.replace(/src="\/(?!FlaconiCareers)([^"]*)"/g, `src="${prefix}/$1"`);
    rewritten = rewritten.replace(/srcset="\/(?!FlaconiCareers)([^"]*)"/g, `srcset="${prefix}/$1"`);

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
