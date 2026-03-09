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

    // 1. Map absolute flaconi karriere links to our local routes
    const base = 'https?://(www\\.)?flaconi\\.de/karriere/(en/)?';
    rewritten = rewritten.replace(new RegExp(`href="${base}culture/?`, 'g'), `href="${prefix}/culture/"`);
    rewritten = rewritten.replace(new RegExp(`href="${base}locations/?`, 'g'), `href="${prefix}/locations/"`);
    rewritten = rewritten.replace(new RegExp(`href="${base}our-teams/?`, 'g'), `href="${prefix}/our-teams/"`);
    rewritten = rewritten.replace(new RegExp(`href="${base}stellenangebote/?`, 'g'), `href="${prefix}/jobs/"`);
    // Generic root link
    rewritten = rewritten.replace(new RegExp(`href="${base}(?!"|#|\\s|wp-content|wp-includes|wp-json|fonts|anya)`, 'g'), `href="${prefix}/"`);

    // 2. Map ABSOLUTE flaconi asset directories to our local assets folder
    rewritten = rewritten.replace(/https?:\/\/(www\.)?flaconi\.de\/karriere\/(wp-content|wp-includes|fonts|anya)\//g, `${prefix}/assets/$2/`);

    // 3. Map ROOT-RELATIVE paths to our local assets folder
    // This catches src="/karriere/wp-content/..." and src="/wp-content/..."
    // Note: We use negative lookahead to prevent double-prefixing.
    rewritten = rewritten.replace(/(src|href|srcset)="\/(?!FlaconiCareers)karriere\//g, `$1="${prefix}/assets/`);
    rewritten = rewritten.replace(/(src|href|srcset)="\/(?!FlaconiCareers)(wp-content|wp-includes|fonts|anya)/g, `$1="${prefix}/assets/$2`);

    // 4. Final safety cleanup for any double prefixing that might occur
    const doublePrefix = new RegExp(`${prefix}${prefix}`, 'g');
    rewritten = rewritten.replace(doublePrefix, prefix);

    return rewritten;
  };

  html = rewriteLinks(html);
  head = rewriteLinks(head);

  // Strip scripts to prevent hydration issues and redirects
  const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>|<script\b[^>]*\/>/gmi;
  html = html.replace(scriptRegex, '');
  head = head.replace(scriptRegex, '');

  // Strip base tag
  head = head.replace(/<base\b[^>]*\/?>/gmi, '');

  // Fix Header Misalignment
  head += `
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
