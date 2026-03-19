'use client';
import { useEffect } from 'react';
import Papa from 'papaparse';
import { CMS_CONFIG } from '@/CMS_CONFIG';
import TemplateRenderer from '@/components/TemplateRenderer';
import './jobs.css';

export default function JobsClient({ initialData }: { initialData: any }) {
  useEffect(() => {
    // 0. Detect language
    const isEn = typeof window !== 'undefined' && window.location.pathname.includes('/en/');
    const moreDetailsLabel = isEn ? 'more details' : 'mehr Details';
    const syncingLabel = isEn ? 'Syncing Live Jobs...' : 'Live Jobs werden synchronisiert...';

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

    async function fetchLiveJobs() {
      const jobTable = document.querySelector('.job-table');
      if (!jobTable) {
        console.warn('Could not find .job-table container');
        return;
      }

      // Instead of clearing the whole table, we identify the static jobs and the loading indicator
      // We keep anything else that might be in the table (though usually there isn't)
      
      const loadingId = 'jobs-loading-indicator';
      let loadingEl = document.getElementById(loadingId);
      
      if (!loadingEl) {
        loadingEl = document.createElement('div');
        loadingEl.id = loadingId;
        loadingEl.style.cssText = "display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 100px 0; width: 100%; grid-column: 1 / -1; background: #fff; position: relative; z-index: 20;";
        loadingEl.innerHTML = `
          <div class="jobs-spinner"></div>
          <p style="margin-top: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.2em; font-size: 14px; color: #db2777;">${syncingLabel}</p>
        `;
        
        // Hide existing static jobs
        const staticJobs = jobTable.querySelectorAll('.job');
        staticJobs.forEach((j: any) => j.style.display = 'none');
        
        jobTable.appendChild(loadingEl);
      }

      try {
        const cacheBuster = `&cb=${new Date().getTime()}`;
        const response = await fetch(CMS_CONFIG.GOOGLE_SHEET_CSV_URL + cacheBuster);
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const csvText = await response.text();
        const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
        const liveJobs = parsed.data;

        if (liveJobs.length > 0) {
           // Remove loading and static jobs
           jobTable.innerHTML = ''; 
           
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
                        <div class=\"apply-link\">
                            <a href=\"${url || '#'}\" target=\"_blank\">
                                <span>${moreDetailsLabel}</span>
                                <span class=\"icon kb-svg-icon-wrap kb-svg-icon-fe_chevronRight kt-btn-icon-side-right\">
                                <svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" xmlns=\"http://www.w3.org/2000/svg\" aria-hidden=\"true\">
                                    <polyline points=\"9 18 15 12 9 6\"></polyline>
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
        if (loadingEl) loadingEl.innerHTML = `<p style="padding: 40px; text-align: center; color: red;">Failed to load jobs. Please refresh the page.</p>`;
      }
    }

    fetchLiveJobs();
  }, []);

  return <TemplateRenderer data={initialData} />;
}
