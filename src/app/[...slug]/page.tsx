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
    rewritten = rewritten.replace(/href="\/(?!FlaconiCareers)([^"]*)"/g, `href="${prefix}/$1"`);
    rewritten = rewritten.replace(/src="\/(?!FlaconiCareers)([^"]*)"/g, `src="${prefix}/$1"`);
    rewritten = rewritten.replace(/srcset="\/(?!FlaconiCareers)([^"]*)"/g, `srcset="${prefix}/$1"`);

    return rewritten;
  };

  html = rewriteLinks(html);
  head = rewriteLinks(head);

  const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>|<script\b[^>]*\/>/gmi;
  html = html.replace(scriptRegex, '');
  head = head.replace(scriptRegex, '');

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
