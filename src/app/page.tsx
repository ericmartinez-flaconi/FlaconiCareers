import fs from 'fs';
import path from 'path';
import ClientStyleManager from '@/components/ClientStyleManager';

export default function Home() {
  const filePath = path.join(process.cwd(), 'captured_dom', 'responsive_home.json');
  if (!fs.existsSync(filePath)) {
    return <div>Captured DOM for Home not found.</div>;
  }
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

    // 2. Map incorrect internal links that might have been partially rewritten
    rewritten = rewritten.replace(new RegExp(`href="${prefix}/karriere/?`, 'g'), `href="${prefix}/"`);
    rewritten = rewritten.replace(new RegExp(`href="${prefix}/en/?`, 'g'), `href="${prefix}/"`);

    // 3. Exception for Large Videos (remains absolute)
    const largeVideos = [
      '250915_flaconi_CompanyVideo2526_V05_FINAL_HighRes.mp4',
      'Cultural-Pillars-Value-Day-30-sec.mp4'
    ];
    largeVideos.forEach(vid => {
      const remotePath = vid.includes('Cultural') 
        ? `https://www.flaconi.de/karriere/wp-content/uploads/2024/06/${vid}`
        : `https://www.flaconi.de/karriere/wp-content/uploads/2025/11/${vid}`;
      
      // Target multiple potential broken patterns
      rewritten = rewritten.replace(new RegExp(`${prefix}/assets/videos/[^"]*${vid}`, 'g'), remotePath);
      rewritten = rewritten.replace(new RegExp(`${prefix}/wp-content/uploads/[^"]*${vid}`, 'g'), remotePath);
    });

    // 4. Robustly handle all root-relative links
    rewritten = rewritten.replace(/(href|src|srcset)="\/(?!FlaconiCareers)([^"]*)"/g, `$1="${prefix}/$2"`);

    const doublePrefix = new RegExp(`${prefix}${prefix}`, 'g');
    rewritten = rewritten.replace(doublePrefix, prefix);

    return rewritten;
  };

  html = rewriteLinks(html);
  head = rewriteLinks(head);

  const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>|<script\b[^>]*\/>/gmi;
  html = html.replace(scriptRegex, '');
  head = head.replace(scriptRegex, '');

  head = head.replace(/<base\b[^>]*\/?>/gmi, '');

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
    <>
      <ClientStyleManager bodyClass={data.bodyClass} htmlClass={data.htmlClass} />
      <div dangerouslySetInnerHTML={{ __html: head }} />
      <div 
        style={{ margin: 0, padding: 0, overflowX: 'hidden' }}
        dangerouslySetInnerHTML={{ __html: html }} 
      />
    </>
  );
}
