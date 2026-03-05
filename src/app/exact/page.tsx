import fs from 'fs';

export default function ExactPage() {
  const filePath = '/Users/eric.martinez/.gemini/tmp/flaconicareerspage/exact_dom_v2.html';
  let html = fs.readFileSync(filePath, 'utf8');

  // Fix relative links (some might remain after inlining)
  html = html.replace(/src="\//g, 'src="https://www.flaconi.de/');
  html = html.replace(/href="\//g, 'href="https://www.flaconi.de/');
  html = html.replace(/srcset="\//g, 'srcset="https://www.flaconi.de/');

  // Remove scripts that might cause issues (e.g., WPML redirect, tracking)
  const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>|<script\b[^>]*\/>/gmi;
  html = html.replace(scriptRegex, '');
  
  // Strip base tag
  html = html.replace(/<base\b[^>]*\/?>/gmi, '');
  
  // Basic cleaning of the head/body to avoid double nesting in Next.js
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  
  const bodyContent = bodyMatch ? bodyMatch[1] : html;
  const headContent = headMatch ? headMatch[1] : '';

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: headContent }} />
      <div 
        className="exact-dom-clone-v2"
        dangerouslySetInnerHTML={{ __html: bodyContent }} 
      />
    </>
  );
}
