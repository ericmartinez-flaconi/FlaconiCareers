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

    rewritten = rewritten.replace(/https?:\/\/(www\.)?flaconi\.de\/karriere\/(en\/)?culture\/?/g, `${prefix}/culture/`);
    rewritten = rewritten.replace(/https?:\/\/(www\.)?flaconi\.de\/karriere\/(en\/)?locations\/?/g, `${prefix}/locations/`);
    rewritten = rewritten.replace(/https?:\/\/(www\.)?flaconi\.de\/karriere\/(en\/)?our-teams\/?/g, `${prefix}/our-teams/`);
    rewritten = rewritten.replace(/https?:\/\/(www\.)?flaconi\.de\/karriere\/(en\/)?stellenangebote\/?/g, `${prefix}/jobs/`);
    
    rewritten = rewritten.replace(/https?:\/\/(www\.)?flaconi\.de\/karriere\/(en\/)?/g, `${prefix}/`);

    rewritten = rewritten.replace(/src="\//g, `src="${prefix}/`);
    rewritten = rewritten.replace(/href="\//g, `href="${prefix}/`);
    rewritten = rewritten.replace(/srcset="\//g, `srcset="${prefix}/`);

    return rewritten;
  };

  html = rewriteLinks(html);
  head = rewriteLinks(head);

  const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>|<script\b[^>]*\/>/gmi;
  html = html.replace(scriptRegex, '');
  head = head.replace(scriptRegex, '');
  
  head = head.replace(/<base\b[^>]*\/?>/gmi, '');

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
