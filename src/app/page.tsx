import fs from 'fs';
import path from 'path';

export default function Home() {
  const filePath = path.join(process.cwd(), 'captured_dom', 'dom_home.html');
  let html = fs.readFileSync(filePath, 'utf8');

  // Strip scripts
  html = html.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gm, '');
  
  // Link mapping: Point Flaconi URLs to local app routes
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
