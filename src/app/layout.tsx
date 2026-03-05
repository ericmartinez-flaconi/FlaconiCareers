import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Flaconi Careers",
  description: "Join flaconi and engineer beautiful shopping experiences.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
