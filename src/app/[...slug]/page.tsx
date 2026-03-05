import fs from 'fs';
import path from 'path';
import JobsPage from '../jobs/page';

export async function generateStaticParams() {
  return [
    { slug: ['culture'] },
    { slug: ['locations'] },
    { slug: ['our-teams'] },
    { slug: ['jobs'] }
  ];
}

export default async function Page({ params }: { params: { slug: string[] } }) {
  const { slug } = await params;
  const pageName = slug[slug.length - 1];

  if (pageName === 'jobs') {
    return <JobsPage />;
  }

  const filePath = path.join(process.cwd(), 'captured_dom', `responsive_${pageName}.json`);
  if (!fs.existsSync(filePath)) {
    return <div>Page not found: {pageName}</div>;
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  let html = data.body;
  let head = data.head;

  // Prefixing for GitHub Pages deployment
  const prefix = '/FlaconiCareers';
  html = html.replace(/src="\//g, `src="${prefix}/`);
  html = html.replace(/href="\//g, `href="${prefix}/`);
  html = html.replace(/srcset="\//g, `srcset="${prefix}/`);

  // Fix internal links to stay in our prototype
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
