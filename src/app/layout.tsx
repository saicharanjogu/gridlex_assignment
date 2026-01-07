import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gridlex - Unified CRM & Data Management Platform",
  description: "Manage your contacts, opportunities, organizations, and tasks with powerful multi-view capabilities",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {/* Skip link for keyboard navigation - WCAG AAA requirement */}
        <a 
          href="#main-content" 
          className="skip-link"
          tabIndex={0}
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}