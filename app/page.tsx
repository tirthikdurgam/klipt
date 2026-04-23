'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
  'Plain Text', 'JavaScript', 'TypeScript', 'Python', 'Bash', 'SQL', 'JSON', 'HTML', 'CSS'
];

export default function Home() {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [slug, setSlug] = useState('');
  const [language, setLanguage] = useState('Plain Text');
  const [expiry, setExpiry] = useState(86400); 
  
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
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
    if (!content.trim() || content.length > 500000 || isSaving) return;
    
    setIsSaving(true);
    try {
      const response = await fetch('/api/clips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content, 
          slug: slug || undefined, 
          language: language.toLowerCase(), 
          expirySeconds: expiry 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // --- NEW: THE COAT CHECK TICKET ---
        // Save the delete token to localStorage so this specific browser 
        // is remembered as the creator of this clip.
        if (data.deleteToken) {
          localStorage.setItem(`klipt_token_${data.slug}`, data.deleteToken);
        }

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
    <main className="flex-1 flex flex-col p-4 md:p-12 max-w-6xl mx-auto w-full min-h-[100dvh]">
      
      <header className="flex items-center justify-between mb-6 md:mb-10">
        <div className="group cursor-default">
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter transition-all duration-300">
            <span className="text-black dark:text-white">klipt</span>
            <span className="text-blue-500 animate-pulse">.</span>
          </h1>
        </div>
      </header>

      {/* Main Glass Editor */}
      <div className="flex-1 flex flex-col bg-white/60 dark:bg-[#1c1c1e]/60 backdrop-blur-3xl border border-white/20 dark:border-white/10 rounded-[1.5rem] md:rounded-[2.5rem] shadow-[0_32px_64px_-15px_rgba(0,0,0,0.15)] overflow-hidden ring-1 ring-inset ring-white/20 dark:ring-white/5 transition-all duration-500">
        
        <textarea
          autoFocus
          placeholder="Paste your text or code here..."
          className="flex-1 p-6 md:p-10 bg-transparent text-[16px] leading-relaxed resize-none outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400/40 min-h-[300px]"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        {/* Controls Bar */}
        <div className="p-4 md:p-8 bg-white/30 dark:bg-black/20 backdrop-blur-md border-t border-white/20 dark:border-white/10 flex flex-col gap-4 items-center">
          
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
            
            <div className="relative">
              <input
                type="text"
                placeholder="Custom URL (optional)"
                className="w-full bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl md:rounded-2xl px-5 py-4 md:py-3.5 text-base md:text-sm outline-none focus:ring-2 ring-blue-500/30 transition-all placeholder:text-slate-400"
                value={slug}
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

            <select
              className="w-full bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl md:rounded-2xl px-5 py-4 md:py-3.5 text-base md:text-sm outline-none cursor-pointer hover:bg-white/80 dark:hover:bg-white/10 transition-colors appearance-none"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              {LANGUAGES.map(lang => (
                <option key={lang} value={lang} className="dark:bg-[#1c1c1e] text-black dark:text-white">
                  {lang}
                </option>
              ))}
            </select>

            <select
              className="w-full bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl md:rounded-2xl px-5 py-4 md:py-3.5 text-base md:text-sm outline-none cursor-pointer hover:bg-white/80 dark:hover:bg-white/10 transition-colors appearance-none"
              value={expiry}
              onChange={(e) => setExpiry(Number(e.target.value))}
            >
              {EXPIRY_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value} className="dark:bg-[#1c1c1e] text-black dark:text-white">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSave}
            disabled={!content.trim() || isSaving || (slug.length >= 3 && isAvailable === false)}
            className="w-full md:w-auto px-12 py-4 md:py-4 bg-blue-600 dark:bg-blue-500 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30 disabled:hover:scale-100 text-white font-semibold rounded-xl md:rounded-[1.5rem] transition-all shadow-xl shadow-blue-500/25 text-base md:text-sm"
          >
            {isSaving ? 'Saving...' : 'Save Clip'}
          </button>
        </div>
      </div>

      <footer className="mt-8 md:mt-10 flex flex-col sm:flex-row justify-between items-center px-2 gap-4 pb-4">
        <p className="text-[10px] font-semibold tracking-widest text-black/30 dark:text-white/20 uppercase">
          Secure & Instant
        </p>
        <a 
          href="https://github.com/tirthikdurgam/klipt" 
          className="text-[10px] font-semibold text-black/30 dark:text-white/20 hover:text-blue-500 dark:hover:text-blue-400 transition-colors underline underline-offset-4 uppercase tracking-widest"
        >
          View Source
        </a>
      </footer>
    </main>
  );
}