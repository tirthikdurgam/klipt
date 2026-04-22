'use client';

import { useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react'; // Added Suspense
import Link from 'next/link';

// 1. Create a component for the actual content
function SuccessContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug');
  // Use a fallback for the URL if the env variable isn't set yet
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://klipt.qzz.io';
  const fullUrl = `${baseUrl}/${slug}`;
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-md bg-white/60 dark:bg-[#1c1c1e]/60 backdrop-blur-3xl border border-white/20 dark:border-white/10 rounded-[2.5rem] p-10 shadow-[0_32px_64px_-15px_rgba(0,0,0,0.2)] text-center ring-1 ring-inset ring-white/20 dark:ring-white/5">
      {/* Success Indicator */}
      <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8 relative">
        <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full animate-pulse" />
        <div className="w-10 h-10 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/40 z-10" />
      </div>
      
      <h2 className="text-3xl font-bold mb-3 tracking-tight text-black dark:text-white">Clip Created!</h2>
      <p className="text-black/40 dark:text-white/40 text-sm font-medium mb-10 leading-relaxed">
        Your clip is live and ready to be shared.
      </p>

      {/* Shareable Link */}
      <div className="relative mb-8 group">
        <input 
          readOnly 
          value={fullUrl}
          className="w-full bg-white/50 dark:bg-black/20 border border-black/5 dark:border-white/10 rounded-2xl px-5 py-4 text-sm font-mono outline-none pr-28 text-black dark:text-white"
        />
        <button 
          onClick={copyToClipboard}
          className={`absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 rounded-xl text-[11px] font-bold tracking-widest uppercase transition-all active:scale-[0.95] ${
            copied 
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' 
              : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20'
          }`}
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-4">
        <Link 
          href={`/${slug}`}
          className="w-full py-4 bg-white/80 dark:bg-white/5 hover:scale-[1.02] active:scale-[0.98] border border-black/5 dark:border-white/10 rounded-2xl text-sm font-semibold transition-all shadow-sm text-black dark:text-white"
        >
          View Clip
        </Link>
        <Link 
          href="/"
          className="text-[11px] font-bold text-black/30 dark:text-white/30 hover:text-blue-500 transition-colors uppercase tracking-[0.2em] mt-2"
        >
          Create Another
        </Link>
      </div>
    </div>
  );
}

// 2. The main page component wraps the content in Suspense
export default function SuccessPage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 min-h-screen">
      <Suspense fallback={
        <div className="text-white/20 font-mono text-xs uppercase tracking-widest animate-pulse">
          Finalizing clip...
        </div>
      }>
        <SuccessContent />
      </Suspense>

      <footer className="mt-12 opacity-20">
        <h1 className="font-mono text-xl font-bold tracking-tighter lowercase text-black dark:text-white">
          klipt_
        </h1>
      </footer>
    </main>
  );
}