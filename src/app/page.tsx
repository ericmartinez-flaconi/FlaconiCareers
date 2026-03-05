import fs from 'fs';
import path from 'path';

export default function Home() {
  const filePath = path.join(process.cwd(), 'captured_dom', 'responsive_home.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  let html = data.body;
  let head = data.head;

  // Prefixing for GitHub Pages deployment
  const prefix = '/FlaconiCareers';
  html = html.replace(/src="\//g, `src="${prefix}/`);
  html = html.replace(/href="\//g, `href="${prefix}/`);
  html = html.replace(/srcset="\//g, `srcset="${prefix}/`);

  // Fix internal links to stay in our prototype
  // Matches: http(s)://(www.)flaconi.de/karriere/(en/)?...
  const flaconiRegex = /https?:\/\/(www\.)?flaconi\.de\/karriere\/(en\/)?/g;
  
  html = html.replace(flaconiRegex, (match, www, en) => {
    // Determine the path after /karriere/(en/)?
    const rest = html.substring(html.indexOf(match) + match.length);
    if (rest.startsWith('culture')) return `${prefix}/culture/`;
    if (rest.startsWith('locations')) return `${prefix}/locations/`;
    if (rest.startsWith('our-teams')) return `${prefix}/our-teams/`;
    if (rest.startsWith('stellenangebote')) return `${prefix}/jobs/`;
    return `${prefix}/`;
  });

  // Since regex replace with callback in standard string.replace(regex, cb) 
  // might be tricky with many occurrences, let's use a simpler but more comprehensive set:
  const baseFlaconi = /https?:\/\/(www\.)?flaconi\.de\/karriere\/(en\/)?/g;
  html = html.replace(new RegExp(baseFlaconi.source + 'culture\\/?', 'g'), `${prefix}/culture/`);
  html = html.replace(new RegExp(baseFlaconi.source + 'locations\\/?', 'g'), `${prefix}/locations/`);
  html = html.replace(new RegExp(baseFlaconi.source + 'our-teams\\/?', 'g'), `${prefix}/our-teams/`);
  html = html.replace(new RegExp(baseFlaconi.source + 'stellenangebote\\/?', 'g'), `${prefix}/jobs/`);
  html = html.replace(new RegExp(baseFlaconi.source + '(?!"|#|\\s)', 'g'), `${prefix}/`);

  // Strip scripts to prevent hydration issues
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
