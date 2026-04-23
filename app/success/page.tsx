'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, Suspense, useEffect } from 'react';
import Link from 'next/link';

// Minimalist Checkmark Icon
const CheckIcon = () => (
  <svg 
    width="28" 
    height="28" 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      d="M5 13L9 17L19 7" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug');
  const [copied, setCopied] = useState(false);
  const [clipUrl, setClipUrl] = useState('');

  useEffect(() => {
    if (slug) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://klipt.qzz.io';
      setClipUrl(`${baseUrl}/${slug}`);
    } else {
      router.push('/');
    }
  }, [slug, router]);

  const copyToClipboard = () => {
    if (!clipUrl) return;
    navigator.clipboard.writeText(clipUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-lg bg-white/60 dark:bg-[#1c1c1e]/60 backdrop-blur-3xl border border-white/20 dark:border-white/10 rounded-[3rem] p-10 md:p-14 shadow-[0_32px_64px_-15px_rgba(0,0,0,0.1)] text-center ring-1 ring-inset ring-white/20 dark:ring-white/5 transition-all duration-500">
      
      {/* Refined Success Indicator */}
      <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-500/20">
        <CheckIcon />
      </div>
      
      <h2 className="text-4xl font-black mb-3 tracking-tighter text-black dark:text-white">
        Clip Created!
      </h2>
      <p className="text-black/40 dark:text-white/40 text-sm font-medium mb-12 leading-relaxed">
        Your content is now live at your custom URL.
      </p>

      {/* Shareable Link Area */}
      <div className="relative mb-6 group">
        <input 
          readOnly 
          value={clipUrl}
          className="w-full bg-slate-900/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-[1.25rem] px-6 py-5 text-sm font-semibold outline-none text-blue-600 dark:text-blue-400 transition-all"
        />
      </div>

      {/* Primary Action: Copy (Large Pill) */}
      <button 
        onClick={copyToClipboard}
        className={`w-full py-5 rounded-[1.25rem] text-sm font-bold tracking-widest uppercase transition-all active:scale-[0.98] mb-4 ${
          copied 
            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
            : 'bg-blue-600 text-white hover:bg-blue-500 shadow-xl shadow-blue-600/20'
        }`}
      >
        {copied ? 'Copied to Clipboard' : 'Copy Link'}
      </button>

      {/* Secondary Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link 
          href={`/${slug}`}
          className="py-4 bg-white/80 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 border border-black/5 dark:border-white/10 rounded-[1.25rem] text-xs font-bold uppercase tracking-widest transition-all text-black dark:text-white"
        >
          View Clip
        </Link>
        <Link 
          href="/"
          className="py-4 bg-white/80 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 border border-black/5 dark:border-white/10 rounded-[1.25rem] text-xs font-bold uppercase tracking-widest transition-all text-black dark:text-white"
        >
          New Clip
        </Link>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 min-h-screen">
      <Suspense fallback={
        <div className="text-black/20 dark:text-white/20 font-bold text-xs uppercase tracking-[0.3em] animate-pulse">
          Generating URL...
        </div>
      }>
        <SuccessContent />
      </Suspense>

      <footer className="mt-12 opacity-30">
        <h1 className="text-xl font-black tracking-tighter text-black dark:text-white">
          klipt<span className="text-blue-500">.</span>
        </h1>
      </footer>
    </main>
  );
}