import fs from 'fs';
import path from 'path';

export default async function JobsPage() {
  const responsivePath = path.join(process.cwd(), 'captured_dom', 'responsive_jobs.json');
  const liveJobsPath = path.join(process.cwd(), 'captured_dom', 'jobs_live.json');
  
  const data = JSON.parse(fs.readFileSync(responsivePath, 'utf8'));
  const liveJobs = JSON.parse(fs.readFileSync(liveJobsPath, 'utf8'));

  let html = data.body;
  let head = data.head;

  // 1. Link mapping
  const prefix = '/FlaconiCareers';
  html = html.replace(/href="https:\/\/www\.flaconi\.de\/karriere\/(en\/)?culture\//g, `href="${prefix}/culture/"`);
  html = html.replace(/href="https:\/\/www\.flaconi\.de\/karriere\/(en\/)?locations\//g, `href="${prefix}/locations/"`);
  html = html.replace(/href="https:\/\/www\.flaconi\.de\/karriere\/(en\/)?our-teams\//g, `href="${prefix}/our-teams/"`);
  html = html.replace(/href="https:\/\/www\.flaconi\.de\/karriere\/(en\/)?stellenangebote\//g, `href="${prefix}/jobs/"`);
  html = html.replace(/href="https:\/\/www\.flaconi\.de\/karriere\/(en\/)?(?!"|#)/g, `href="${prefix}/"`);

  // 2. Inject live jobs into the job table
  // We look for the job container or a specific marker
  if (liveJobs.length > 0) {
    const jobItemsHtml = liveJobs.map((job: any) => `
      <div class="job" data-location="${job.Location}" data-team="${job.Department}">
        <div class="main-column">
          <div><a href="${job.URL}" class="job-title"><strong>${job.Title} (LIVE)</strong></a></div>
          <div class="info-column"><div class="info-items">
            <div style="display: flex; flex-wrap: wrap; column-gap: 36px;">
              <p style="display:flex;"><span>${job.Location}</span></p>
              <p style="display:flex;"><span>${job.Department}</span></p>
            </div>
          </div></div>
        </div>
        <div class="button-column" style="display: table; margin-left: auto;">
          <div style="display: table-cell; vertical-align: middle;">
            <div class="apply-link"><a href="${job.URL}" target="blank"><span>more details</span></a></div>
          </div>
        </div>
      </div>
    `).join('');

    // Prepend live jobs to the existing list
    html = html.replace(/class="job-list-container">/i, `class="job-list-container">${jobItemsHtml}`);
  }

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
