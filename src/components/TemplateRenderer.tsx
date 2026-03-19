'use client';

import { CMS_CONFIG } from '@/CMS_CONFIG';
import ClientStyleManager from '@/components/ClientStyleManager';

interface TemplateRendererProps {
  data: {
    head: string;
    body: string;
    bodyClass: string;
    htmlClass: string;
  };
}

/**
 * The standard way to render captured WordPress DOM in the Next.js app.
 * A human can "code on top" by adding slot replacement logic here.
 */
export default function TemplateRenderer({ data }: TemplateRendererProps) {
  let { head, body, bodyClass, htmlClass } = data;

  // 1. Strip all original scripts (we replace them with Next.js/React logic)
  const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>|<script\b[^>]*\/>/gmi;
  head = head.replace(scriptRegex, '');
  body = body.replace(scriptRegex, '');

  // 2. Remove base tag to avoid interfering with routing
  head = head.replace(/<base\b[^>]*\/?>/gmi, '');

  // 3. Normalize Paths
  // This allows humans to use {{BASE_PATH}} in the JSON files instead of hardcoding '/FlaconiCareers'
  const normalizedBase = CMS_CONFIG.BASE_PATH.replace(/\/$/, '');
  
  // Extract lang from current path if possible, default to 'de'
  const pathParts = typeof window !== 'undefined' ? window.location.pathname.split('/') : [];
  // For /karriere/en/karriere, lang is at index 2 if basePath is empty
  // More robust: look for 'en' or 'de' in path
  const lang = pathParts.includes('en') ? 'en' : 'de';

  // Replace placeholders in new templates
  head = head.replaceAll('{{BASE_PATH}}', normalizedBase);
  body = body.replaceAll('{{BASE_PATH}}', normalizedBase);
  head = head.replaceAll('{{LANG}}', lang);
  body = body.replaceAll('{{LANG}}', lang);

  // Normalize all internal links to follow the new pattern /karriere/[lang]/[page]
  // We target href="/some-page" and href="{{BASE_PATH}}/some-page"
  const localizedPrefix = `${normalizedBase}/karriere/${lang}`;
  
  // Helper to localize a path
  const localizePath = (path: string) => {
    // Root or base path maps to /karriere/[lang] (Home)
    if (path === '/' || path === '' || path === normalizedBase || path === `${normalizedBase}/`) {
      return localizedPrefix;
    }
    // Remove trailing slash for consistency during check
    const cleanPath = path.replace(/\/$/, '');
    
    // Pattern rules:
    // /jobs or /stellenangebote (legacy) -> /karriere/[lang]/jobs (Jobs)
    if (cleanPath.endsWith('/jobs') || cleanPath.endsWith('/stellenangebote')) {
      return `${localizedPrefix}/jobs`;
    }

    // Legacy and old slugs -> /karriere/[lang]/how-we-hire
    if (cleanPath.endsWith('/karriere') || cleanPath.endsWith('/howwework')) {
      return `${localizedPrefix}/how-we-hire`;
    }

    // culture -> life-at-flaconi
    if (cleanPath.endsWith('/culture')) {
      return `${localizedPrefix}/life-at-flaconi`;
    }

    const pages = ['life-at-flaconi', 'locations', 'our-teams', 'how-we-hire'];
    for (const page of pages) {
      if (cleanPath.endsWith(`/${page}`)) {
        return `${localizedPrefix}/${page}`;
      }
    }
    return path;
  };

  // Replace root-relative links
  body = body.replace(/href="\/([^"]*)"/g, (match, p1) => {
    // Skip if it's already localized (e.g., /karriere/de/...) or an asset
    const isLocalized = p1.match(/^karriere\/(de|en)(\/|$)/);
    if (isLocalized || p1.startsWith('assets/') || p1.includes('.')) return match;
    
    const localized = localizePath('/' + p1);
    return `href="${localized}"`;
  });

  // Replace {{BASE_PATH}} links that were already replaced
  const escapedBase = normalizedBase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const baseRegex = new RegExp(`href="${escapedBase}\/([^"]*)"`, 'g');
  body = body.replace(baseRegex, (match, p1) => {
    const isLocalized = p1.match(/^karriere\/(de|en)(\/|$)/);
    if (isLocalized || p1.startsWith('assets/') || p1.includes('.') || p1 === '') {
       if (p1 === '') return `href="${localizePath(normalizedBase + '/')}"`;
       return match;
    }
    const localized = localizePath(normalizedBase + '/' + p1);
    return `href="${localized}"`;
  });

  // Also handle legacy hardcoded paths if they exist
  if (normalizedBase !== '/FlaconiCareers') {
    head = head.replaceAll('/FlaconiCareers/', `${normalizedBase}/`);
    body = body.replaceAll('/FlaconiCareers/', `${normalizedBase}/`);
    // Handle double slashes if normalizedBase is empty
    head = head.replaceAll('//assets/', '/assets/');
    body = body.replaceAll('//assets/', '/assets/');
  }

  // 4. Inject Project-Wide Responsive Fixes
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
      <ClientStyleManager bodyClass={bodyClass} htmlClass={htmlClass} />
      <div dangerouslySetInnerHTML={{ __html: head }} />
      <div 
        style={{ margin: 0, padding: 0, overflowX: 'hidden' }}
        dangerouslySetInnerHTML={{ __html: body }} 
      />
    </>
  );
}
