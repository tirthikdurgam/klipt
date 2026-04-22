'use client';

import { useEffect, useState, use } from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css'; 
import Link from 'next/link';

export default function ViewClip({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [clip, setClip] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchClip() {
      try {
        const res = await fetch(`/api/clips/${slug}`, { cache: 'no-store' });
        if (res.status === 410) {
          setError("This clip has expired or does not exist.");
          return;
        }
        const data = await res.json();
        setClip(data);
      } catch (err) {
        setError("Network connection failed.");
      }
    }
    fetchClip();
  }, [slug]);

  useEffect(() => {
    if (clip) hljs.highlightAll();
  }, [clip]);

  const copyContent = () => {
    navigator.clipboard.writeText(clip.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (error) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <div className="bg-white/10 backdrop-blur-3xl p-12 rounded-[2.5rem] text-center border border-white/10 shadow-2xl">
          <h1 className="text-6xl font-bold opacity-10 mb-4 tracking-tighter">410</h1>
          <p className="text-white/40 mb-10 font-medium">{error}</p>
          <Link href="/" className="px-10 py-3 bg-blue-600 text-white rounded-2xl font-bold">Back Home</Link>
        </div>
      </main>
    );
  }

  if (!clip) return (
    <div className="flex items-center justify-center min-h-screen font-mono text-white/20 animate-pulse uppercase tracking-[0.3em] text-xs">
      Decrypting Clip Data...
    </div>
  );

  return (
    <main className="flex-1 flex flex-col p-6 md:p-12 max-w-6xl mx-auto w-full min-h-screen">
      
      {/* Header & Meta */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
        <div>
          <div className="flex items-center gap-3 mb-3">
             <h1 className="text-4xl font-mono font-bold tracking-tighter lowercase">
              <span className="text-blue-500">#</span>
              <span className="text-black dark:text-white ml-1">{clip.slug}</span>
            </h1>
            <span className="px-4 py-1.5 bg-blue-500/10 text-blue-500 rounded-full text-[10px] font-bold uppercase tracking-widest border border-blue-500/20">
              {clip.language || 'Plain Text'}
            </span>
          </div>
          
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-bold uppercase tracking-[0.2em] text-black/30 dark:text-white/20 ml-1">
            <span>Created: {new Date(clip.createdAt).toLocaleDateString()}</span>
            <span>Views: {clip.viewCount}</span>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Link 
            href={`/${clip.slug}/raw`}
            className="px-6 py-3.5 bg-white/60 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl text-[11px] font-bold tracking-widest uppercase hover:bg-white dark:hover:bg-white/10 transition-all ring-1 ring-inset ring-white/20 dark:ring-white/5 shadow-sm"
          >
            Raw View
          </Link>
          <button 
            onClick={copyContent}
            className={`px-8 py-3.5 rounded-2xl text-[11px] font-bold tracking-widest uppercase transition-all shadow-xl active:scale-95 ${
              copied ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white'
            }`}
          >
            {copied ? 'Copied!' : 'Copy Content'}
          </button>
        </div>
      </div>

      {/* The Liquid Glass Code Block */}
      <div className="flex-1 rounded-[2.5rem] overflow-hidden border border-white/20 dark:border-white/10 shadow-[0_32px_64px_-15px_rgba(0,0,0,0.3)] bg-[#0d1117] relative ring-1 ring-inset ring-white/10">
        {/* Traffic Lights */}
        <div className="absolute top-0 left-0 right-0 h-12 bg-white/5 border-b border-white/5 flex items-center px-8 gap-2 z-10 backdrop-blur-md">
           <div className="w-3 h-3 rounded-full bg-red-500/40" />
           <div className="w-3 h-3 rounded-full bg-amber-500/40" />
           <div className="w-3 h-3 rounded-full bg-emerald-500/40" />
        </div>
        
        <pre className="h-full pt-12 overflow-auto">
          <code className={`language-${clip.language || 'plaintext'} block p-10 font-mono text-[16px] leading-relaxed outline-none h-full`}>
            {clip.content}
          </code>
        </pre>
      </div>
      
      <footer className="mt-12 text-center opacity-20">
        <Link href="/" className="font-mono text-xl font-bold tracking-tighter lowercase">klipt_</Link>
      </footer>
    </main>
  );
}