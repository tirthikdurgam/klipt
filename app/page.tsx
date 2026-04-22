'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Expiry options as defined in Section 6.0 [cite: 61]
const EXPIRY_OPTIONS = [
  { label: '1 hour', value: 3600 },
  { label: '6 hours', value: 21600 },
  { label: '12 hours', value: 43200 },
  { label: '1 day', value: 86400 },
  { label: '3 days', value: 259200 },
  { label: '7 days', value: 604800 },
  { label: '14 days', value: 1209600 },
  { label: '30 days', value: 2592000 },
];

const LANGUAGES = [
  'plain text', 'javascript', 'typescript', 'python', 'bash', 'sql', 'json', 'html', 'css'
];

export default function Home() {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [slug, setSlug] = useState('');
  const [language, setLanguage] = useState('plain text');
  const [expiry, setExpiry] = useState(86400); // Default: 1 day [cite: 50]
  
  // Status states
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Slug availability check with 400ms debounce [cite: 54, 55]
  useEffect(() => {
    // Slugs must be 3-60 characters [cite: 50, 67]
    if (slug.length < 3) {
      setIsAvailable(null);
      return;
    }

    const checkTimeout = setTimeout(async () => {
      setIsChecking(true);
      try {
        const res = await fetch(`/api/check-slug?slug=${slug}`);
        const data = await res.json();
        setIsAvailable(data.available);
      } catch (err) {
        setIsAvailable(null);
      } finally {
        setIsChecking(false);
      }
    }, 400);

    return () => clearTimeout(checkTimeout);
  }, [slug]);

  const handleSave = async () => {
    // Content check: max 500,000 characters [cite: 66, 153]
    if (!content.trim() || content.length > 500000 || isSaving) return;
    
    setIsSaving(true);
    try {
      const response = await fetch('/api/clips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content, 
          slug: slug || undefined, 
          language, 
          expirySeconds: expiry 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Redirect to success screen [cite: 50, 113]
        router.push(`/success?slug=${data.slug}`); 
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Something went wrong.");
      }
    } catch (err) {
      alert("Critical server error.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col p-6 md:p-12 max-w-6xl mx-auto w-full">
      
      {/* iOS-Tech Hybrid Header [cite: 121] */}
      <header className="flex items-center justify-between mb-10">
        <div className="group cursor-default">
          <h1 className="text-4xl font-mono font-bold tracking-tighter lowercase transition-all duration-300">
            <span className="text-black dark:text-white">klipt</span>
            <span className="text-blue-500 animate-pulse">_</span>
          </h1>
          <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-black/40 dark:text-white/30 mt-1">
            Cloud Clipboard v1.0.stable
          </p>
        </div>
      </header>

      {/* Main Glass Editor [cite: 50, 122] */}
      <div className="flex-1 flex flex-col bg-white/60 dark:bg-[#1c1c1e]/60 backdrop-blur-3xl border border-white/20 dark:border-white/10 rounded-[2.5rem] shadow-[0_32px_64px_-15px_rgba(0,0,0,0.15)] overflow-hidden ring-1 ring-inset ring-white/20 dark:ring-white/5 transition-all duration-500">
        
        {/* Monospace content area [cite: 118] */}
        <textarea
          autoFocus
          placeholder="Paste your text or code here..."
          className="flex-1 p-8 md:p-10 bg-transparent font-mono text-[16px] leading-relaxed resize-none outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400/40"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        {/* Controls Bar [cite: 122, 123] */}
        <div className="p-6 md:p-8 bg-white/30 dark:bg-black/20 backdrop-blur-md border-t border-white/20 dark:border-white/10 flex flex-col md:flex-row gap-4 items-center">
          
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
            
            {/* Slug Input with Availability Indicator [cite: 53, 56] */}
            <div className="relative">
              <input
                type="text"
                placeholder="Custom URL (optional)"
                className="w-full bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl px-5 py-3.5 text-sm outline-none focus:ring-2 ring-blue-500/30 transition-all placeholder:text-slate-400"
                value={slug}
                // Slug rules: lowercase, numbers, hyphens [cite: 50, 67]
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))}
              />
              {slug.length >= 3 && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {isChecking ? (
                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  ) : (
                    <div className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-red-500 shadow-red-500/50'} shadow-sm`} />
                  )}
                </div>
              )}
            </div>

            {/* Language Selection [cite: 50] */}
            <select
              className="bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl px-5 py-3.5 text-sm outline-none cursor-pointer hover:bg-white/80 dark:hover:bg-white/10 transition-colors appearance-none"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              {LANGUAGES.map(lang => (
                <option key={lang} value={lang} className="dark:bg-[#1c1c1e]">{lang.toUpperCase()}</option>
              ))}
            </select>

            {/* Expiry Selection [cite: 50, 60] */}
            <select
              className="bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl px-5 py-3.5 text-sm outline-none cursor-pointer hover:bg-white/80 dark:hover:bg-white/10 transition-colors appearance-none"
              value={expiry}
              onChange={(e) => setExpiry(Number(e.target.value))}
            >
              {EXPIRY_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value} className="dark:bg-[#1c1c1e]">{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Action Button [cite: 50, 124] */}
          <button
            onClick={handleSave}
            disabled={!content.trim() || isSaving || (slug.length >= 3 && isAvailable === false)}
            className="w-full md:w-auto px-12 py-4 bg-blue-600 dark:bg-blue-500 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30 disabled:hover:scale-100 text-white font-semibold rounded-[1.5rem] transition-all shadow-xl shadow-blue-500/25 text-sm"
          >
            {isSaving ? 'Saving...' : 'Save Clip'}
          </button>
        </div>
      </div>

      {/* Footer*/}
      <footer className="mt-10 flex flex-col sm:flex-row justify-between items-center px-4 gap-4">
        <p className="text-[11px] font-semibold tracking-widest text-black/30 dark:text-white/20 uppercase">
          Zero-Cost • Secure • Instant
        </p>
        <a 
          href="https://github.com" 
          className="text-[11px] font-semibold text-black/30 dark:text-white/20 hover:text-blue-500 dark:hover:text-blue-400 transition-colors underline underline-offset-4 uppercase tracking-widest"
        >
          View Source
        </a>
      </footer>
    </main>
  );
}