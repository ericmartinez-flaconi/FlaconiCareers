import Script from 'next/script';
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <style dangerouslySetInnerHTML={{ __html: `
          /* Global Mobile Drawer Fixes */
          body.showing-popup-drawer-from-right #mobile-drawer {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
          }
          body.showing-popup-drawer-from-right #mobile-drawer .drawer-inner {
            transform: translateX(0) !important;
          }
          #mobile-drawer .drawer-inner {
            transition: transform 0.3s ease-in-out !important;
            transform: translateX(100%) !important;
          }
          /* Lock scroll when menu open */
          body.showing-popup-drawer-from-right {
            overflow: hidden !important;
          }
        `}} />
        <Script id="hamburger-logic" strategy="afterInteractive">
          {`
            document.addEventListener('click', function(e) {
              const openBtn = e.target.closest('.menu-toggle-open');
              const closeBtn = e.target.closest('.menu-toggle-close');
              const overlay = e.target.closest('.drawer-overlay');

              if (openBtn) {
                document.body.classList.add('showing-popup-drawer-from-right');
              }
              if (closeBtn || overlay) {
                document.body.classList.remove('showing-popup-drawer-from-right');
              }
            });
          `}
        </Script>
      <Script id="navigation-interceptor" strategy="afterInteractive">
          {`
            const localizeLinks = (containerSelector) => {
              const navContainer = document.querySelector(containerSelector);
              if (!navContainer) return;

              const links = navContainer.querySelectorAll('a');
              links.forEach(link => {
                const href = link.getAttribute('href');
                if (href && href.includes('flaconi.de/karriere')) {
                  try {
                    const url = new URL(href);
                    let newPath = url.pathname.replace('/karriere/en/', '/').replace('/karriere/de/', '/').replace('/karriere/', '/');
                    
                    // Specific mapping for known German slugs
                    const slugMap = {
                      'kultur': 'culture',
                      'standorte': 'locations',
                      'unsere-teams': 'our-teams',
                      'karriere': 'karriere',
                      'stellenangebote': 'jobs'
                    };
                    
                    const pathParts = newPath.split('/').filter(p => p);
                    const lastPart = pathParts[pathParts.length - 1];

                    if (slugMap[lastPart]) {
                      newPath = \`/FlaconiCareers/\${slugMap[lastPart]}/\`;
                    } else if (pathParts.length > 0) {
                      newPath = \`/FlaconiCareers/\${lastPart}/\`;
                    } else {
                      newPath = '/FlaconiCareers/';
                    }

                    // Clean up double slashes
                    newPath = newPath.replace(/\\/\\/+/g, '/');
                    
                    link.setAttribute('href', newPath);
                  } catch (e) {
                    // Ignore invalid URLs
                  }
                }
              });
            };

            // Run on initial load and after any client-side navigation that might re-render the header
            const observer = new MutationObserver(() => {
              localizeLinks('#site-navigation'); // Desktop Menu
              localizeLinks('#mobile-site-navigation'); // Mobile Drawer
            });
            
            observer.observe(document.body, {
              childList: true,
              subtree: true
            });

            // Initial run
            localizeLinks('#site-navigation');
            localizeLinks('#mobile-site-navigation');
          `}
        </Script>
      </body>
    </html>
  );
}
