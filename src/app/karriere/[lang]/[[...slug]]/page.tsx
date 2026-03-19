import fs from 'fs';
import path from 'path';
import TemplateRenderer from '@/components/TemplateRenderer';
import JobsClient from '@/app/jobs/JobsClient';
import { getTemplate } from '@/lib/templateLoader';

export const dynamicParams = true;

export async function generateStaticParams() {
  const langs = ['en', 'de'];
  const pages = ['jobs', 'life-at-flaconi', 'locations', 'our-teams', 'stellenangebote', 'how-we-hire'];

  const params = [];
  for (const lang of langs) {
    // Language home: /karriere/[lang]
    params.push({ lang, slug: [] });
    
    // Sub pages: /karriere/[lang]/[page]
    for (const page of pages) {
      params.push({ lang, slug: [page] });
    }
  }
  return params;
}

export default async function Page({ params }: { params: Promise<{ lang: string, slug?: string[] }> }) {
  const { lang, slug } = await params;

  // pageName defaults to 'home' if slug is empty
  let pageName = (!slug || slug.length === 0) ? 'home' : slug[slug.length - 1];

  // Map legacy names or aliases
  if (pageName === 'howwework' || pageName === 'karriere') {
    pageName = 'how-we-hire';
  }
  
  if (pageName === 'culture') {
    pageName = 'life-at-flaconi';
  }
  
  // Jobs alias
  if (pageName === 'stellenangebote' || pageName === 'jobs') {
    pageName = 'jobs';
  }

  // Try to load the modern HTML template
  const data = getTemplate(pageName);
  
  if (!data) {
    // Fallback to legacy JSON if template folder doesn't exist yet
    const responsivePath = path.join(process.cwd(), 'captured_dom', `responsive_${pageName}.json`);
    if (!fs.existsSync(responsivePath)) {
       return <div>Template for "{pageName}" not found.</div>;
    }
    const legacyData = JSON.parse(fs.readFileSync(responsivePath, 'utf8'));
    
    if (pageName === 'jobs') {
       return <JobsClient initialData={legacyData} />;
    }
    return <TemplateRenderer data={legacyData} />;
  }

  // Handle dynamic jobs for the new HTML template format
  if (pageName === 'jobs') {
    return <JobsClient initialData={data} />;
  }

  return <TemplateRenderer data={data} />;
}
