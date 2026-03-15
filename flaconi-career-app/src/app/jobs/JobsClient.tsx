'use client';
import { useEffect } from 'react';
import Papa from 'papaparse';
import { CMS_CONFIG } from '@/CMS_CONFIG';
import ClientStyleManager from '@/components/ClientStyleManager';

export default function JobsClient({ initialData }: { initialData: any }) {
  useEffect(() => {
    // 1. Define the Global Filter Function
    (window as any).filterJobTabelle = () => {
      const locationVal = (document.getElementById('locations') as HTMLSelectElement)?.value || '';
      const teamVal = (document.getElementById('teams') as HTMLSelectElement)?.value || '';
      const worktypeVal = (document.getElementById('worktypes') as HTMLSelectElement)?.value || '';

      const jobs = document.querySelectorAll('.job-table .job');
      jobs.forEach((job: any) => {
        const jobLoc = (job.getAttribute('data-location') || '').toLowerCase();
        const jobTeam = (job.getAttribute('data-team') || '').toLowerCase();
        const jobWork = (job.getAttribute('data-worktype') || '').toLowerCase();

        const fLoc = locationVal.toLowerCase();
        const fTeam = teamVal.toLowerCase();
        const fWork = worktypeVal.toLowerCase();

        const getCity = (s: string) => s.split(/[\(,\s]/)[0].toLowerCase();
        const matchesLocation = !fLoc || getCity(jobLoc).includes(getCity(fLoc)) || getCity(fLoc).includes(getCity(jobLoc));
        
        const normalize = (s: string) => s.replace(/[^a-z0-9]/g, '');
        const matchesTeam = !fTeam || normalize(jobTeam).includes(normalize(fTeam)) || normalize(fTeam).includes(normalize(jobTeam));
        
        const matchesWorktype = !fWork || jobWork.includes(fWork) || fWork.includes(jobWork);

        if (matchesLocation && matchesTeam && matchesWorktype) {
          job.style.display = 'flex';
        } else {
          job.style.display = 'none';
        }
      });
    };

    // 2. Inject CSS for Clean UI and Responsive Filters
    const style = document.createElement('style');
    style.innerHTML = `
      /* Hide original Greenhouse app and any legacy static jobs */
      #grnhse_app, #grnhse_iframe { display: none !important; height: 0 !important; overflow: hidden !important; }
      .job-table .job { display: flex; } /* Ensure our dynamic jobs are visible by default */
      
      /* Fix "Typography behind inputs" - ensure filters have a solid background and proper spacing */
      .job-filter {
        display: flex !important;
        flex-wrap: wrap !important;
        gap: 16px !important;
        background: #fff !important;
        padding: 20px !important;
        border-radius: 8px !important;
        position: relative !important;
        z-index: 10 !important;
        box-shadow: 0 4px 12px rgba(0,0,0,0.05) !important;
        margin-bottom: 30px !important;
      }
      .job-filter .filter-kind {
        flex: 1 1 300px !important;
        min-width: 200px !important;
      }
      .job-filter select {
        width: 100% !important;
        height: 48px !important;
        border: 1px solid #ddd !important;
        border-radius: 4px !important;
        padding: 0 12px !important;
        font-size: 16px !important;
      }
      
      @media (max-width: 1024px) {
        .job-filter {
          flex-direction: column !important;
        }
        .job-filter .filter-kind {
          width: 100% !important;
          flex: none !important;
        }
      }
      
      /* Ensure the job list is visible and clean */
      .job-table {
        min-height: 400px;
        position: relative;
        background: #fff;
        z-index: 1;
      }
    `;
    document.head.appendChild(style);

    async function fetchLiveJobs() {
      const jobTable = document.querySelector('.job-table');
      if (!jobTable) {
        console.warn('Could not find .job-table container');
        return;
      }

      // Clear existing jobs immediately and show a spinner
      jobTable.innerHTML = `
        <div id="jobs-loading-indicator" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 100px 0; width: 100%; grid-column: 1 / -1; background: #fff; position: relative; z-index: 20;">
          <div class="spinner" style="width: 50px; height: 50px; border: 5px solid rgba(0,0,0,0.1); border-top: 5px solid #db2777; border-radius: 50%; animation: spin 1s linear infinite;"></div>
          <p style="margin-top: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.2em; font-size: 14px; color: #db2777;">Syncing Live Jobs...</p>
          <style>
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          </style>
        </div>
      `;

      try {
        const cacheBuster = `&cb=${new Date().getTime()}`;
        console.log('Fetching live jobs from:', CMS_CONFIG.GOOGLE_SHEET_CSV_URL);
        const response = await fetch(CMS_CONFIG.GOOGLE_SHEET_CSV_URL + cacheBuster);
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const csvText = await response.text();
        const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
        const liveJobs = parsed.data;
        
        console.log('Parsed jobs count:', liveJobs.length);

        if (liveJobs.length > 0) {
           jobTable.innerHTML = ''; // Clear spinner
           
           liveJobs.forEach((job: any) => {
             const sanitize = (val: string) => (val || '').replace(/^"|"$/g, '').trim();
             
             const title = sanitize(job.Title);
             const department = sanitize(job.Department || job.Team);
             const location = sanitize(job.Location);
             const url = sanitize(job.URL);

             if (!title && !url) return;

             const jobEl = document.createElement('div');
             jobEl.className = 'job';
             jobEl.setAttribute('data-location', location);
             jobEl.setAttribute('data-team', department);
             jobEl.setAttribute('data-worktype', '');

             jobEl.innerHTML = `
                <div class="main-column">
                    <div>
                        <a href="${url || '#'}" class="job-title" target="_blank">
                            <strong>${title || 'Job Opening'}</strong>
                        </a>
                    </div>
                    <div class="info-column">
                        <div class="info-items">
                            <div style="display: flex; flex-wrap: wrap; column-gap: 36px;">
                                <p style="display:flex; margin-bottom: unset; align-items: center;">
                                    <img src="${CMS_CONFIG.BASE_PATH}/assets/images/images_wp-content_uploads_2024_03_standort.webp" height="24" width="19" style="width: 19px; margin-right: 8px;">
                                    <span>${location || 'Remote / Berlin'}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="button-column" style="display: table; margin-left: auto;">
                    <div style="display: table-cell; vertical-align: middle;">
                        <div class="apply-link">
                            <a href="${url || '#'}" target="_blank">
                                <span>more details</span>
                                <span class="icon kb-svg-icon-wrap kb-svg-icon-fe_chevronRight kt-btn-icon-side-right">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                    <polyline points="9 18 15 12 9 6"></polyline>
                                </svg>
                            </span>
                            </a>
                        </div>
                    </div>
                </div>
             `;
             jobTable.appendChild(jobEl);
           });
           (window as any).filterJobTabelle();
        } else {
          jobTable.innerHTML = '<p style="padding: 40px; text-align: center;">No job openings found at the moment. Please check back later!</p>';
        }
      } catch (e) {
        console.error('Failed to sync live jobs:', e);
        jobTable.innerHTML = `<p style="padding: 40px; text-align: center; color: red;">Failed to load jobs. Please refresh the page.</p>`;
      }
    }

    fetchLiveJobs();
  }, []);

  return (
    <>
      <ClientStyleManager bodyClass={initialData.bodyClass} htmlClass={initialData.htmlClass} />
      <div dangerouslySetInnerHTML={{ __html: initialData.head }} />
      <div 
        style={{ margin: 0, padding: 0 }}
        dangerouslySetInnerHTML={{ __html: initialData.body }} 
      />
    </>
  );
}
