import fs from 'fs';
import path from 'path';
import ClientStyleManager from '@/components/ClientStyleManager';

export async function generateStaticParams() {
  return [
    { slug: ['en'] },
    { slug: ['culture'] },
    { slug: ['locations'] },
    { slug: ['our-teams'] },
    { slug: ['karriere'] },
    { slug: ['stellenangebote'] }
  ];
}

export default async function Page({ params }: { params: { slug: string[] } }) {
  const { slug } = await params;
  let pageName = slug[slug.length - 1];

  // Alias logic
  if (pageName === 'en') {
    pageName = 'home';
  }
  if (pageName === 'stellenangebote') {
    pageName = 'jobs';
  }

  const filePath = path.join(process.cwd(), 'captured_dom', `responsive_${pageName}.json`);
  if (!fs.existsSync(filePath)) {
    return <div>Page not found: {pageName}</div>;
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  let html = data.body;
  let head = data.head;

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
