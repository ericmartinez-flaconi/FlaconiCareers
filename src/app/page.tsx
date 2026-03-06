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

    // 1. Remove base tag
    rewritten = rewritten.replace(/<base\b[^>]*\/?>/gmi, '');

    // 2. Normalize flaconi links to relative (WITHOUT prefix)
    const base = 'https?://(www\\.)?flaconi\\.de/karriere/(en/)?';
    rewritten = rewritten.replace(new RegExp(`href="${base}culture/?`, 'g'), 'href="/culture/"');
    rewritten = rewritten.replace(new RegExp(`href="${base}locations/?`, 'g'), 'href="/locations/"');
    rewritten = rewritten.replace(new RegExp(`href="${base}our-teams/?`, 'g'), 'href="/our-teams/"');
    rewritten = rewritten.replace(new RegExp(`href="${base}stellenangebote/?`, 'g'), 'href="/jobs/"');
    rewritten = rewritten.replace(new RegExp(`href="${base}(?!"|#|\\s|wp-content|wp-includes)`, 'g'), 'href="/"');

    // 3. Normalize asset links to relative (WITHOUT prefix)
    rewritten = rewritten.replace(/https?:\/\/(www\.)?flaconi\.de\/karriere\/(wp-content|wp-includes)\//g, '/assets/$2/');

    // 4. Apply prefix to ALL root-relative links, avoiding double prefixing
    // This handles both navigation and assets consistently
    rewritten = rewritten.replace(/(href|src|srcset)="\/(?!FlaconiCareers)([^"]*)"/g, `$1="${prefix}/$2"`);

    return rewritten;
  };

  html = rewriteLinks(html);
  head = rewriteLinks(head);

  // Strip scripts to prevent hydration issues and redirects
  const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>|<script\b[^>]*\/>/gmi;
  html = html.replace(scriptRegex, '');
  head = head.replace(scriptRegex, '');

  // Add robust force styles
  head += `
    <style>
      @media screen and (min-width: 1024px) {
        .site-header-inner-wrap { display: flex !important; }
        #masthead { display: block !important; }
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
