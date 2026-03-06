'use client';
import { useEffect, useState } from 'react';
import Papa from 'papaparse';
import { CMS_CONFIG } from '@/CMS_CONFIG';

export default function JobsClient({ initialData }: { initialData: any }) {
  // This component handles the 1:1 DOM rendering and the Live Sync from Google Sheets
  useEffect(() => {
    // 1. Define the Global Filter Function
    (window as any).filterJobTabelle = () => {
      const locationVal = (document.getElementById('locations') as HTMLSelectElement)?.value || '';
      const teamVal = (document.getElementById('teams') as HTMLSelectElement)?.value || '';
      const worktypeVal = (document.getElementById('worktypes') as HTMLSelectElement)?.value || '';

      console.log('Filter triggering with:', { locationVal, teamVal, worktypeVal });

      const jobs = document.querySelectorAll('.job-table .job');
      jobs.forEach((job: any) => {
        const jobLoc = (job.getAttribute('data-location') || '').toLowerCase();
        const jobTeam = (job.getAttribute('data-team') || '').toLowerCase();
        const jobWork = (job.getAttribute('data-worktype') || '').toLowerCase();

        const fLoc = locationVal.toLowerCase();
        const fTeam = teamVal.toLowerCase();
        const fWork = worktypeVal.toLowerCase();

        // City-level matching for locations (e.g. "Halle" matches "Halle (Saale)")
        const getCity = (s: string) => s.split(/[\(,\s]/)[0].toLowerCase();
        const matchesLocation = !fLoc || getCity(jobLoc).includes(getCity(fLoc)) || getCity(fLoc).includes(getCity(jobLoc));
        
        // Teams can be tricky (e.g. "Data Analytics" vs "Data & Analytics")
        // We strip non-alphanumeric for a safer comparison
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
      if (jobTable) {
        // Clear existing jobs immediately and show a spinner
        jobTable.innerHTML = `
          <div id="jobs-loading-indicator" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 0; width: 100%; grid-column: 1 / -1;">
            <div class="spinner" style="width: 40px; height: 40px; border: 4px solid rgba(0,0,0,0.1); border-top: 4px solid #db2777; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            <p style="margin-top: 20px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.2em; font-size: 12px; color: #db2777;">Syncing Live Jobs...</p>
            <style>
              @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            </style>
          </div>
        `;
      }

      try {
        // Add cache buster to URL
        const cacheBuster = `&cb=${new Date().getTime()}`;
        console.log('Fetching live jobs from Google Sheets:', CMS_CONFIG.GOOGLE_SHEET_CSV_URL);
        const response = await fetch(CMS_CONFIG.GOOGLE_SHEET_CSV_URL + cacheBuster);
        const csvText = await response.text();
        
        const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
        const liveJobs = parsed.data;
        
        if (jobTable && liveJobs.length > 0) {
           // Clear loading indicator
           jobTable.innerHTML = '';
           
           liveJobs.forEach((job: any) => {
             // Sanitize keys and values (remove extra quotes and trim)
             const sanitize = (val: string) => (val || '').replace(/^"|"$/g, '').replace(/^"|"$/g, '').trim();
             
             const title = sanitize(job.Title);
             const department = sanitize(job.Department || job.Team);
             const location = sanitize(job.Location);
             const url = sanitize(job.URL);

             if (!title && !url) return;

             const jobEl = document.createElement('div');
             jobEl.className = 'job';
             // Set data attributes for filtering
             jobEl.setAttribute('data-location', location);
             jobEl.setAttribute('data-team', department);
             jobEl.setAttribute('data-worktype', ''); // Optional

             jobEl.innerHTML = `
                <div class="main-column">
                    <div>
                        <a href="${url || '#'}" class="job-title">
                            <strong>${title || 'Job Opening'}</strong>
                        </a>
                    </div>
                    <div class="info-column">
                        <div class="info-items">
                            <div style="display: flex; flex-wrap: wrap; column-gap: 36px;">
                                <p style="display:flex; margin-bottom: unset;">
                                    <img src="/FlaconiCareers/assets/wp-content/uploads/2024/03/standort.jpg" height="24" width="19" style="width: 19px;">
                                    &nbsp;<span>${location || 'Remote / Berlin'}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="button-column" style="display: table; margin-left: auto;">
                    <div style="display: table-cell; vertical-align: middle;">
                        <div class="apply-link">
                            <a href="${url || '#'}" target="blank">
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
           console.log('Live jobs injected:', liveJobs.length);
           // Trigger initial filter logic
           (window as any).filterJobTabelle();
        }
      } catch (e) {
        console.error('Failed to sync live jobs from Google Sheets:', e);
      }
    }

    fetchLiveJobs();
  }, []);

  return (
    <html lang="en" className={initialData.htmlClass}>
      <head dangerouslySetInnerHTML={{ __html: initialData.head }} />
      <body 
        className={initialData.bodyClass} 
        style={{ margin: 0, padding: 0 }}
        dangerouslySetInnerHTML={{ __html: initialData.body }} 
      />
    </html>
  );
}
