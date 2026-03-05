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

    // 1. Rewrite absolute links to our prototype paths
    // We do the specific ones first
    rewritten = rewritten.replace(/https?:\/\/(www\.)?flaconi\.de\/karriere\/(en\/)?culture\/?/g, `${prefix}/culture/`);
    rewritten = rewritten.replace(/https?:\/\/(www\.)?flaconi\.de\/karriere\/(en\/)?locations\/?/g, `${prefix}/locations/`);
    rewritten = rewritten.replace(/https?:\/\/(www\.)?flaconi\.de\/karriere\/(en\/)?our-teams\/?/g, `${prefix}/our-teams/`);
    rewritten = rewritten.replace(/https?:\/\/(www\.)?flaconi\.de\/karriere\/(en\/)?stellenangebote\/?/g, `${prefix}/jobs/`);
    
    // 2. Rewrite any other flaconi karriere link to root
    rewritten = rewritten.replace(/https?:\/\/(www\.)?flaconi\.de\/karriere\/(en\/)?/g, `${prefix}/`);

    // 3. Handle relative links if any were missed
    rewritten = rewritten.replace(/src="\//g, `src="${prefix}/`);
    rewritten = rewritten.replace(/href="\//g, `href="${prefix}/`);
    rewritten = rewritten.replace(/srcset="\//g, `srcset="${prefix}/`);

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
