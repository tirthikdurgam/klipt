import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

// JetBrains Mono for clip content as specified in the PRD 
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "klipt | Zero-cost Cloud Clipboard", // [cite: 1, 3]
  description: "A lightweight, globally accessible cloud clipboard for text and code.", // [cite: 10]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased scroll-smooth" suppressHydrationWarning>
      <body
        className={`${jetbrainsMono.variable} min-h-full flex flex-col 
        bg-[#F2F2F7] dark:bg-black text-black dark:text-white transition-colors duration-500`}
        style={{
          // The "San Francisco" system font stack used by Apple
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Icons", "Helvetica Neue", Helvetica, Arial, sans-serif'
        }}
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