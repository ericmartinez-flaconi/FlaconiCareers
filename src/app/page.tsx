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

    // 1. Rewrite ABSOLUTE flaconi links to our prototype paths
    const base = 'https?://(www\\.)?flaconi\\.de/karriere/(en/)?';
    
    rewritten = rewritten.replace(new RegExp(`href="${base}culture/?`, 'g'), `href="${prefix}/culture/"`);
    rewritten = rewritten.replace(new RegExp(`href="${base}locations/?`, 'g'), `href="${prefix}/locations/"`);
    rewritten = rewritten.replace(new RegExp(`href="${base}our-teams/?`, 'g'), `href="${prefix}/our-teams/"`);
    rewritten = rewritten.replace(new RegExp(`href="${base}stellenangebote/?`, 'g'), `href="${prefix}/jobs/"`);
    rewritten = rewritten.replace(new RegExp(`href="${base}(?!wp-content|wp-includes|wp-json)(?!"|#|\\s)`, 'g'), `href="${prefix}/"`);

    // 2. Rewrite ROOT-RELATIVE links (e.g. /assets/...) to include the prefix
    // We use a negative lookahead to prevent double-prefixing
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
