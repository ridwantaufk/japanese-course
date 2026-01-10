import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 text-white">
      <div className="text-center">
        <h1 className="mb-4 text-5xl font-bold text-indigo-400">Japanese Learning App</h1>
        <p className="mb-8 text-xl text-slate-400">Welcome to the administration portal.</p>
        
        <Link 
          href="/admin" 
          className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-8 py-3 text-lg font-semibold transition-transform hover:scale-105 hover:bg-indigo-500"
        >
          Go to Admin Dashboard
          <ArrowRight />
        </Link>
      </div>
    </div>
  );
}