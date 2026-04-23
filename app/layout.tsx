import type { Metadata } from "next";
import { Work_Sans } from "next/font/google";
import "./globals.css";

// Unified brand font - Work Sans
const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work-sans",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "klipt",
  description: "A lightweight, globally accessible cloud clipboard for text and code.",
  
  // This replaces your <link> tags
  icons: {
    icon: [
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  
  // This replaces your <meta> and manifest tags
  manifest: "/site.webmanifest",
  appleWebApp: {
    title: "klipt",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html 
      lang="en" 
      className="h-full antialiased scroll-smooth" 
      data-scroll-behavior="smooth" 
      suppressHydrationWarning
    >
      <body
        className={`${workSans.className} min-h-full flex flex-col 
        bg-[#F2F2F7] dark:bg-black text-black dark:text-white transition-colors duration-500`}
      >
        {/* Subtle background glows to create the depth needed for 'liquid glass' components */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[140px] dark:bg-blue-600/5" />
          <div className="absolute bottom-[0%] -right-[10%] w-[45%] h-[45%] rounded-full bg-indigo-500/10 blur-[140px] dark:bg-indigo-600/5" />
        </div>
        
        {children}
      </body>
    </html>
  );
}