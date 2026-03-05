import fs from 'fs';
import path from 'path';

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
  
  // Apply the same link mapping
  html = html.replace(/href="https:\/\/www\.flaconi\.de\/karriere\/en\/culture\//g, 'href="/culture');
  html = html.replace(/href="https:\/\/www\.flaconi\.de\/karriere\/en\/locations\//g, 'href="/locations');
  html = html.replace(/href="https:\/\/www\.flaconi\.de\/karriere\/en\/our-teams\//g, 'href="/our-teams');
  html = html.replace(/href="https:\/\/www\.flaconi\.de\/karriere\/en\/stellenangebote\//g, 'href="/jobs');
  html = html.replace(/href="https:\/\/www\.flaconi\.de\/karriere\/en\//g, 'href="/"');

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
