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
      </body>
    </html>
  );
}
