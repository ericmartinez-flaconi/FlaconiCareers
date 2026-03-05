'use client';
import { useEffect, useState } from 'react';
import Papa from 'papaparse';
import { CMS_CONFIG } from '@/CMS_CONFIG';

export default function JobsClient({ initialData }: { initialData: any }) {
  // This component handles the 1:1 DOM rendering and the Live Sync from Google Sheets
  useEffect(() => {
    // 1. Define the Global Filter Function
    (window as any).filterJobTabelle = () => {
      const locationVal = (document.getElementById('locations') as HTMLSelectElement)?.value || 'all';
      const teamVal = (document.getElementById('teams') as HTMLSelectElement)?.value || 'all';
      const worktypeVal = (document.getElementById('worktypes') as HTMLSelectElement)?.value || 'all';

      console.log('Filtering:', { locationVal, teamVal, worktypeVal });

      const jobs = document.querySelectorAll('.job-table .job');
      jobs.forEach((job: any) => {
        const matchesLocation = locationVal === 'all' || job.getAttribute('data-location').includes(locationVal);
        const matchesTeam = teamVal === 'all' || job.getAttribute('data-team') === teamVal;
        const matchesWorktype = worktypeVal === 'all' || job.getAttribute('data-worktype') === worktypeVal;

        if (matchesLocation && matchesTeam && matchesWorktype) {
          job.style.display = 'flex';
        } else {
          job.style.display = 'none';
        }
      });
    };

    async function fetchLiveJobs() {
      try {
        console.log('Fetching live jobs from Google Sheets:', CMS_CONFIG.GOOGLE_SHEET_CSV_URL);
        const response = await fetch(CMS_CONFIG.GOOGLE_SHEET_CSV_URL);
        const csvText = await response.text();
        
        const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
        const liveJobs = parsed.data;
        
        const jobTable = document.querySelector('.job-table');
        if (jobTable && liveJobs.length > 0) {
           jobTable.innerHTML = '';
           
           liveJobs.forEach((job: any) => {
             if (!job.Title && !job.URL) return;

             const jobEl = document.createElement('div');
             jobEl.className = 'job';
             // Set data attributes for filtering
             jobEl.setAttribute('data-location', job.Location || '');
             jobEl.setAttribute('data-team', job.Team || '');
             jobEl.setAttribute('data-worktype', job.WorkType || '');

             jobEl.innerHTML = `
                <div class="main-column">
                    <div>
                        <a href="${job.URL || '#'}" class="job-title">
                            <strong>${job.Title || 'Job Opening'}</strong>
                        </a>
                    </div>
                    <div class="info-column">
                        <div class="info-items">
                            <div style="display: flex; flex-wrap: wrap; column-gap: 36px;">
                                <p style="display:flex; margin-bottom: unset;">
                                    <img src="https://www.flaconi.de/karriere/wp-content/uploads/2024/03/standort.jpg" height="24" width="19" style="width: 19px;">
                                    &nbsp;<span>${job.Location || 'Remote / Berlin'}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="button-column" style="display: table; margin-left: auto;">
                    <div style="display: table-cell; vertical-align: middle;">
                        <div class="apply-link">
                            <a href="${job.URL || '#'}" target="blank">
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
           // Trigger initial filter logic if any dropdown is pre-selected
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
