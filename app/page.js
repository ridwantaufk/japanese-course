import Link from 'next/link';
import { LayoutDashboard, GraduationCap, ArrowRight, Star, Globe } from 'lucide-react';

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white selection:bg-indigo-500/30">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] h-[600px] w-[600px] rounded-full bg-indigo-600/20 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-pink-600/10 blur-[120px]"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
      </div>

      <main className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 py-20 text-center">
        
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium backdrop-blur-md">
          <Star size={14} className="text-yellow-400 fill-yellow-400" />
          <span>Local Development Environment</span>
        </div>

        {/* Hero Text */}
        <h1 className="text-5xl font-black tracking-tight sm:text-7xl lg:text-8xl">
          Nihon<span className="text-indigo-500 italic">Go</span> Pro
        </h1>
        <p className="mt-8 max-w-2xl text-lg text-slate-400 sm:text-xl">
          Sistem manajemen dan pembelajaran Bahasa Jepang terintegrasi. Kelola konten di Admin atau mulai belajar di portal Learning.
        </p>

        {/* Portal Choice */}
        <div className="mt-16 grid w-full gap-8 sm:grid-cols-2">
          
          {/* Learning Portal Card */}
          <Link href="/learning" className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 text-left transition-all hover:bg-white/10 hover:shadow-2xl hover:shadow-indigo-500/20">
            <div className="absolute right-[-20px] top-[-20px] h-32 w-32 rounded-full bg-indigo-500/10 blur-3xl transition-all group-hover:bg-indigo-500/20"></div>
            
            <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
              <GraduationCap size={32} />
            </div>
            <h2 className="text-2xl font-bold">Learning Portal</h2>
            <p className="mt-2 text-slate-400">
              Akses chart Kana, database Kanji, Vocabulary, dan Quiz interaktif.
            </p>
            <div className="mt-8 flex items-center gap-2 font-bold text-indigo-400 group-hover:text-indigo-300">
              Start Learning <ArrowRight size={18} className="transition-transform group-hover:translate-x-2" />
            </div>
          </Link>

          {/* Admin Portal Card */}
          <Link href="/admin" className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 text-left transition-all hover:bg-white/10 hover:shadow-2xl hover:shadow-pink-500/10">
            <div className="absolute right-[-20px] top-[-20px] h-32 w-32 rounded-full bg-pink-500/5 blur-3xl transition-all group-hover:bg-pink-500/10"></div>
            
            <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800 text-white shadow-lg border border-white/10">
              <LayoutDashboard size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-100">Admin Panel</h2>
            <p className="mt-2 text-slate-400">
              Kelola seluruh database, import data massal, dan lihat statistik konten.
            </p>
            <div className="mt-8 flex items-center gap-2 font-bold text-slate-300 group-hover:text-white">
              Open Dashboard <ArrowRight size={18} className="transition-transform group-hover:translate-x-2" />
            </div>
          </Link>

        </div>

        {/* Footer info */}
        <div className="mt-20 flex items-center gap-6 text-xs font-bold uppercase tracking-widest text-slate-600">
          <div className="flex items-center gap-2"><Globe size={14}/> Local Server</div>
          <div className="h-4 w-px bg-slate-800"></div>
          <div className="flex items-center gap-2">PostgreSQL Active</div>
        </div>

      </main>
    </div>
  );
}