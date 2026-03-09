'use client';
import { useEffect } from 'react';

export default function ClientStyleManager({ bodyClass, htmlClass }: { bodyClass: string, htmlClass: string }) {
  useEffect(() => {
    if (htmlClass) {
      document.documentElement.className = htmlClass;
    }
    if (bodyClass) {
      // Append classes to existing body classes (like 'antialiased' from layout)
      document.body.className = `antialiased ${bodyClass}`;
    }
    
    // cleanup on unmount if needed
    return () => {
      // maybe reset classes? 
    };
  }, [bodyClass, htmlClass]);

  return null;
}
