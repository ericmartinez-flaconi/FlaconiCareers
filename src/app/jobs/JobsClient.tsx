'use client';
import { useEffect, useState } from 'react';

export default function JobsClient({ initialData }: { initialData: any }) {
  // This component handles the 1:1 DOM rendering and the Live Sync script
  useEffect(() => {
    async function fetchLiveJobs() {
      try {
        const response = await fetch('/FlaconiCareers/captured_dom/jobs_live.json');
        const liveJobs = await response.json();
        
        // Find the job list container in the DOM and update it
        const jobListElement = document.querySelector('.jobs-list-container') || document.querySelector('.job-listings');
        if (jobListElement && liveJobs.length > 0) {
           // We can dynamically render the live jobs here if needed
           console.log('Live jobs loaded:', liveJobs.length);
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
