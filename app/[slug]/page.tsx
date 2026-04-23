'use client';

import { useEffect, useState, use } from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css'; 
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ViewClip({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter(); // Added for redirecting after deletion

  const [clip, setClip] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // New states for the Creator Token deletion logic
  const [isCreator, setIsCreator] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    async function fetchClip() {
      try {
        const res = await fetch(`/api/clips/${slug}`, { cache: 'no-store' });
        if (res.status === 404 || res.status === 410) {
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

  // Check localStorage for the creator token once the clip is loaded
  useEffect(() => {
    if (typeof window !== 'undefined' && clip?.slug) {
      const token = localStorage.getItem(`klipt_token_${clip.slug}`);
      if (token) {
        setIsCreator(true);
      }
    }
  }, [clip]);

  // Trigger highlight.js whenever the clip data is loaded
  useEffect(() => {
    if (clip) {
      hljs.highlightAll();
    }
  }, [clip]);

  const copyContent = () => {
    if (!clip) return;
    navigator.clipboard.writeText(clip.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // The secure deletion handler
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const token = localStorage.getItem(`klipt_token_${clip.slug}`);
      
      const res = await fetch(`/api/clips/${slug}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deleteToken: token }),
      });
      
      if (res.ok) {
        // Clean up the local token and go back home
        localStorage.removeItem(`klipt_token_${clip.slug}`);
        router.push('/');
      } else {
        alert("Failed to delete clip. Unauthorized.");
        setIsDeleting(false);
        setDeleteConfirm(false);
      }
    } catch (err) {
      alert("Network error while deleting.");
      setIsDeleting(false);
      setDeleteConfirm(false);
    }
  };

  if (error) {
    return (
      <main className="flex items-center justify-center min-h-[100dvh] p-6">
        <div className="bg-white/60 dark:bg-[#1c1c1e]/60 backdrop-blur-3xl p-12 rounded-[3rem] text-center border border-white/20 dark:border-white/10 shadow-2xl max-w-md w-full">
          <h1 className="text-8xl font-black opacity-10 mb-4 tracking-tighter text-black dark:text-white">410</h1>
          <p className="text-black/50 dark:text-white/40 mb-10 font-bold uppercase tracking-widest text-xs">{error}</p>
          <Link href="/" className="inline-block px-10 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-600/20 active:scale-95 transition-all">
            Back Home
          </Link>
        </div>
      </main>
    );
  }

  if (!clip) return (
    <div className="flex items-center justify-center min-h-[100dvh] text-black/20 dark:text-white/20 font-black uppercase tracking-[0.4em] text-[10px] animate-pulse">
      Decrypting Clip...
    </div>
  );

  return (
    <main className="flex-1 flex flex-col p-4 md:p-12 max-w-6xl mx-auto w-full min-h-[100dvh]">
      
      {/* Header & Meta */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6 px-2">
        <div>
          <div className="flex items-center gap-3 mb-3">
             <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-black dark:text-white">
              <span className="text-blue-500">#</span>{clip.slug}
            </h1>
            <span className="px-4 py-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-500/20 backdrop-blur-md">
              {clip.language || 'Plain Text'}
            </span>
          </div>
          
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-black uppercase tracking-[0.25em] text-black/30 dark:text-white/30">
            <span>Created: {new Date(clip.createdAt || clip.created_at).toLocaleDateString()}</span>
            <span>Views: {clip.viewCount || clip.views_count || 0}</span>
          </div>
        </div>
        
        {/* Buttons wrapper updated to flex-wrap in case it gets squished on tiny mobile screens */}
        <div className="flex flex-wrap gap-3">
          
          {/* THE BOUNCER: Only render this button if they are the verified creator */}
          {isCreator && (
            <button 
              onClick={() => deleteConfirm ? handleDelete() : setDeleteConfirm(true)}
              onMouseLeave={() => setDeleteConfirm(false)} // Cancels if they mouse away
              disabled={isDeleting}
              className={`flex-1 md:flex-none text-center px-6 py-4 rounded-2xl text-[11px] font-bold tracking-widest uppercase transition-all shadow-sm active:scale-95 border ${
                deleteConfirm 
                  ? 'bg-red-500 text-white border-red-500 shadow-red-500/20' 
                  : 'bg-white/50 dark:bg-red-500/5 border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500/10'
              }`}
            >
              {isDeleting ? '...' : deleteConfirm ? 'Sure?' : 'Delete'}
            </button>
          )}

          <Link 
            href={`/${clip.slug}/raw`}
            target="_blank"
            className="flex-1 md:flex-none text-center px-6 py-4 bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl text-[11px] font-bold tracking-widest uppercase hover:bg-white dark:hover:bg-white/10 transition-all ring-1 ring-inset ring-white/20 dark:ring-white/5 shadow-sm text-black dark:text-white"
          >
            Raw View
          </Link>

          <button 
            onClick={copyContent}
            className={`flex-1 md:flex-none px-8 py-4 rounded-2xl text-[11px] font-bold tracking-widest uppercase transition-all shadow-xl active:scale-95 ${
              copied ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-blue-600 text-white shadow-blue-600/20 hover:bg-blue-500'
            }`}
          >
            {copied ? 'Copied!' : 'Copy Content'}
          </button>
        </div>
      </div>

      {/* The edge-to-edge Navy Blue code editor */}
      <div className="flex-1 flex flex-col bg-[#0d1117] rounded-[2.5rem] md:rounded-[3.5rem] shadow-[0_32px_64px_-15px_rgba(0,0,0,0.3)] overflow-hidden ring-1 ring-inset ring-white/10 transition-all duration-500 relative">
        
        <div className="px-8 py-5 border-b border-white/5 flex items-center gap-2.5 bg-white/5">
          <div className="w-3 h-3 rounded-full bg-red-500/40" />
          <div className="w-3 h-3 rounded-full bg-amber-500/40" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/40" />
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar">
          <pre className="m-0 h-full">
            <code className={`language-${clip.language?.toLowerCase() || 'plaintext'} block p-8 md:p-14 text-[15px] md:text-[16px] leading-relaxed outline-none h-full font-medium text-slate-300`}>
              {clip.content}
            </code>
          </pre>
        </div>
      </div>
      
      <footer className="mt-12 text-center opacity-30 pb-6">
        <Link href="/" className="text-xl font-black tracking-tighter text-black dark:text-white transition-all hover:text-blue-500">
          klipt<span className="text-blue-500">.</span>
        </Link>
      </footer>
    </main>
  );
}