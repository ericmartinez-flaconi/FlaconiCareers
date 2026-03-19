import fs from 'fs';
import path from 'path';

export interface TemplateData {
  head: string;
  body: string;
  bodyClass: string;
  htmlClass: string;
}

/**
 * Loads a human-friendly .html template and parses it into TemplateData.
 * 
 * Format expected in .html:
 * <!-- @htmlClass: class-name -->
 * <!-- @bodyClass: class-name -->
 * 
 * <!-- START_HEAD -->
 * ...
 * <!-- END_HEAD -->
 * 
 * <!-- START_BODY -->
 * ...
 * <!-- END_BODY -->
 */
export function getTemplate(pageName: string): TemplateData | null {
  const filePath = path.join(process.cwd(), 'templates', `${pageName}.html`);
  
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const content = fs.readFileSync(filePath, 'utf8');

  // Extract classes using simple regex
  const htmlClassMatch = content.match(/<!--\s*@htmlClass:\s*(.*?)\s*-->/);
  const bodyClassMatch = content.match(/<!--\s*@bodyClass:\s*(.*?)\s*-->/);

  // Extract head and body sections
  const headMatch = content.match(/<!--\s*START_HEAD\s*-->([\s\S]*?)<!--\s*END_HEAD\s*-->/);
  const bodyMatch = content.match(/<!--\s*START_BODY\s*-->([\s\S]*?)<!--\s*END_BODY\s*-->/);

  if (!headMatch || !bodyMatch) {
    return null;
  }

  return {
    htmlClass: htmlClassMatch ? htmlClassMatch[1].trim() : '',
    bodyClass: bodyClassMatch ? bodyClassMatch[1].trim() : '',
    head: headMatch[1].trim(),
    body: bodyMatch[1].trim(),
  };
}
