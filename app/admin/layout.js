import Sidebar from '@/components/admin/Sidebar';
import { ToastProvider } from '@/components/admin/ToastProvider';

export default function AdminLayout({ children }) {
  return (
    <ToastProvider>
      <div className="flex h-screen overflow-hidden text-slate-800 dark:text-slate-100 transition-colors duration-500">
        
        {/* --- PREMIUM BACKGROUNDS (FIXED) --- */}
        <div className="fixed inset-0 z-[-1] pointer-events-none transition-all duration-700 bg-gray-50 dark:bg-[#020617]">
          
          {/* LIGHT MODE: Porcelain Gradient */}
          <div className="absolute inset-0 opacity-100 dark:opacity-0 transition-opacity duration-700">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-50/80 via-white to-white"></div>
          </div>

          {/* DARK MODE: Midnight Gradient */}
          <div className="absolute inset-0 opacity-0 dark:opacity-100 transition-opacity duration-700">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0f172a] via-[#020617] to-black"></div>
            {/* Subtle Glow Effects */}
            <div className="absolute top-0 left-1/4 h-[500px] w-[500px] bg-indigo-500/10 blur-[120px] rounded-full mix-blend-screen"></div>
          </div>
        </div>

        <Sidebar />
        
        <main className="relative z-10 flex-1 overflow-y-auto p-4 sm:p-8 scroll-smooth custom-scrollbar">
          {/* Content Container */}
          <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-2 duration-700">
            {children}
          </div>
        </main>
      </div>
    </ToastProvider>
  );
}