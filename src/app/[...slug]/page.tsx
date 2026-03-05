import fs from 'fs';
import path from 'path';
import JobsPage from '../jobs/page';

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
  
  if (pathPart === 'jobs') {
    return <JobsPage />;
  }

  let fileName = 'responsive_home.json';
  if (pathPart === 'culture') fileName = 'responsive_culture.json';
  if (pathPart === 'locations') fileName = 'responsive_locations.json';
  if (pathPart === 'our-teams') fileName = 'responsive_our-teams.json';

  const filePath = path.join(process.cwd(), 'captured_dom', fileName);
  if (!fs.existsSync(filePath)) {
    return <div>Page not found in prototype: {pathPart}</div>;
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let html = data.body;
  let head = data.head;

  // Strip all scripts from head and body to prevent redirects or tracking
  const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>|<script\b[^>]*\/>/gmi;
  html = html.replace(scriptRegex, '');
  head = head.replace(scriptRegex, '');
  
  // Strip base tag as it points to the real domain
  head = head.replace(/<base\b[^>]*\/?>/gmi, '');
  
  const prefix = '/FlaconiCareers';
  html = html.replace(/href="https:\/\/www\.flaconi\.de\/karriere\/(en\/)?culture\//g, `href="${prefix}/culture/"`);
  html = html.replace(/href="https:\/\/www\.flaconi\.de\/karriere\/(en\/)?locations\//g, `href="${prefix}/locations/"`);
  html = html.replace(/href="https:\/\/www\.flaconi\.de\/karriere\/(en\/)?our-teams\//g, `href="${prefix}/our-teams/"`);
  html = html.replace(/href="https:\/\/www\.flaconi\.de\/karriere\/(en\/)?stellenangebote\//g, `href="${prefix}/jobs/"`);
  html = html.replace(/href="https:\/\/www\.flaconi\.de\/karriere\/(en\/)?(?!"|#)/g, `href="${prefix}/"`);

  return (
    <div className={data.bodyClass} style={{ margin: 0, padding: 0 }}>
      {/* We can't easily inject into head here without a special component, 
          but for a prototype, this body content injection is often enough 
          if the main styles are in globals.css */}
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
