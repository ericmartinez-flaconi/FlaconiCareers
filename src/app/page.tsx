import fs from 'fs';
import path from 'path';

export default function Home() {
  const filePath = path.join(process.cwd(), 'captured_dom', 'responsive_home.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  let html = data.body;
  let head = data.head;

  const prefix = '/FlaconiCareers';

  const rewriteLinks = (content: string) => {
    if (!content) return content;
    let rewritten = content;

    // 1. Remove base tag immediately to avoid path confusion
    rewritten = rewritten.replace(/<base\b[^>]*\/?>/gmi, '');

    // 2. Normalize absolute flaconi links to root-relative paths (WITHOUT prefix yet)
    rewritten = rewritten.replace(/https?:\/\/(www\.)?flaconi\.de\/karriere\/(en\/)?culture\/?/g, '/culture/');
    rewritten = rewritten.replace(/https?:\/\/(www\.)?flaconi\.de\/karriere\/(en\/)?locations\/?/g, '/locations/');
    rewritten = rewritten.replace(/https?:\/\/(www\.)?flaconi\.de\/karriere\/(en\/)?our-teams\/?/g, '/our-teams/');
    rewritten = rewritten.replace(/https?:\/\/(www\.)?flaconi\.de\/karriere\/(en\/)?stellenangebote\/?/g, '/jobs/');
    rewritten = rewritten.replace(/https?:\/\/(www\.)?flaconi\.de\/karriere\/(en\/)?/g, '/');

    // 3. Prefix all root-relative paths with our project prefix, 
    // but ONLY if they haven't been prefixed already.
    // Use negative lookahead (?!FlaconiCareers) to prevent duplication.
    rewritten = rewritten.replace(/href="\/(?!FlaconiCareers)([^"]*)"/g, `href="${prefix}/$1"`);
    rewritten = rewritten.replace(/src="\/(?!FlaconiCareers)([^"]*)"/g, `src="${prefix}/$1"`);
    rewritten = rewritten.replace(/srcset="\/(?!FlaconiCareers)([^"]*)"/g, `srcset="${prefix}/$1"`);

    return rewritten;
  };

  html = rewriteLinks(html);
  head = rewriteLinks(head);

  // Strip scripts to prevent hydration issues and redirects
  const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>|<script\b[^>]*\/>/gmi;
  html = html.replace(scriptRegex, '');
  head = head.replace(scriptRegex, '');

  // Ensure viewport meta is present and correct for mobile
  if (!head.includes('name="viewport"')) {
    head = `<meta name="viewport" content="width=device-width, initial-scale=1">${head}`;
  }

  return (
    <html lang="en" className={data.htmlClass}>
      <head dangerouslySetInnerHTML={{ __html: head }} />
      <body 
        className={data.bodyClass} 
        style={{ margin: 0, padding: 0, overflowX: 'hidden' }}
        dangerouslySetInnerHTML={{ __html: html }} 
      />
    </html>
  );
}
