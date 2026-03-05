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
  
  let fileName = 'dom_home.html';
  if (pathPart === 'culture') fileName = 'dom_culture.html';
  if (pathPart === 'locations') fileName = 'dom_locations.html';
  if (pathPart === 'our-teams') fileName = 'dom_our-teams.html';
  if (pathPart === 'jobs') fileName = 'dom_jobs.html';

  const filePath = path.join(process.cwd(), 'captured_dom', fileName);
  if (!fs.existsSync(filePath)) {
    return <div>Page not found in prototype: {pathPart}</div>;
  }

  let html = fs.readFileSync(filePath, 'utf8');
  html = html.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gm, '');
  
  // Link mapping for GitHub Pages (trailing slashes added)
  const prefix = '/FlaconiCareers';
  html = html.replace(/href="https:\/\/www\.flaconi\.de\/karriere\/en\/culture\//g, `href="${prefix}/culture/"`);
  html = html.replace(/href="https:\/\/www\.flaconi\.de\/karriere\/en\/locations\//g, `href="${prefix}/locations/"`);
  html = html.replace(/href="https:\/\/www\.flaconi\.de\/karriere\/en\/our-teams\//g, `href="${prefix}/our-teams/"`);
  html = html.replace(/href="https:\/\/www\.flaconi\.de\/karriere\/en\/stellenangebote\//g, `href="${prefix}/jobs/"`);
  html = html.replace(/href="https:\/\/www\.flaconi\.de\/karriere\/en\//g, `href="${prefix}/"`);

  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  
  const bodyContent = bodyMatch ? bodyMatch[1] : html;
  const headContent = headMatch ? headMatch[1] : '';

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        body { margin: 0; padding: 0; display: flex; flex-direction: column; align-items: center; min-height: 100vh; background-color: #ffffff; }
        .dom-container { width: 100%; display: flex; flex-direction: column; align-items: center; }
      ` }} />
      <div dangerouslySetInnerHTML={{ __html: headContent }} />
      <div className="dom-container" dangerouslySetInnerHTML={{ __html: bodyContent }} />
    </>
  );
}
