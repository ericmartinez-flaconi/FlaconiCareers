import fs from 'fs';
import path from 'path';

export async function generateStaticParams() {
  return [
    { slug: ['culture'] },
    { slug: ['locations'] },
    { slug: ['our-teams'] },
    { slug: ['jobs'] },
  ];
}

export default async function Page({ params }: { params: { slug: string[] } }) {
  const { slug } = await params;
  const pathPart = slug[0];
  
  let fileName = 'responsive_home.json';
  if (pathPart === 'culture') fileName = 'responsive_culture.json';
  if (pathPart === 'locations') fileName = 'responsive_locations.json';
  if (pathPart === 'our-teams') fileName = 'responsive_our-teams.json';
  if (pathPart === 'jobs') fileName = 'responsive_jobs.json';

  const filePath = path.join(process.cwd(), 'captured_dom', fileName);
  if (!fs.existsSync(filePath)) {
    return <div>Page not found in prototype: {pathPart}</div>;
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let html = data.body;
  let head = data.head;

  html = html.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gm, '');
  
  const prefix = '/FlaconiCareers';
  html = html.replace(/href="https:\/\/www\.flaconi\.de\/karriere\/(en\/)?culture\//g, `href="${prefix}/culture/"`);
  html = html.replace(/href="https:\/\/www\.flaconi\.de\/karriere\/(en\/)?locations\//g, `href="${prefix}/locations/"`);
  html = html.replace(/href="https:\/\/www\.flaconi\.de\/karriere\/(en\/)?our-teams\//g, `href="${prefix}/our-teams/"`);
  html = html.replace(/href="https:\/\/www\.flaconi\.de\/karriere\/(en\/)?stellenangebote\//g, `href="${prefix}/jobs/"`);
  html = html.replace(/href="https:\/\/www\.flaconi\.de\/karriere\/(en\/)?(?!"|#)/g, `href="${prefix}/"`);

  return (
    <html lang="en" className={data.htmlClass}>
      <head dangerouslySetInnerHTML={{ __html: head }} />
      <body 
        className={data.bodyClass} 
        style={{ margin: 0, padding: 0 }}
        dangerouslySetInnerHTML={{ __html: html }} 
      />
    </html>
  );
}
