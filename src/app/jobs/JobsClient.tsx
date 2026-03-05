'use client';
import { useEffect, useState } from 'react';

export default function JobsClient({ initialData }: { initialData: any }) {
  // This component handles the 1:1 DOM rendering and the Live Sync script
  useEffect(() => {
    async function fetchLiveJobs() {
      try {
        const response = await fetch('/FlaconiCareers/captured_dom/jobs_live.json');
        const liveJobs = await response.json();
        
        const jobTable = document.querySelector('.job-table');
        if (jobTable && liveJobs.length > 0) {
           // Clear existing jobs if we have live ones
           jobTable.innerHTML = '';
           
           liveJobs.forEach((job: any) => {
             const jobEl = document.createElement('div');
             jobEl.className = 'job';
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
        }
      } catch (e) {
        console.error('Failed to sync live jobs:', e);
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
