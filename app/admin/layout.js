import Sidebar from '@/components/admin/Sidebar';

export default function AdminLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden text-slate-800 dark:text-slate-100 transition-colors duration-500">
      
      {/* --- PREMIUM BACKGROUNDS --- */}
      <div className="fixed inset-0 z-[-1] transition-opacity duration-700">
        
        {/* LIGHT THEME: Clean Porcelain with Subtle Mesh */}
        <div className="absolute inset-0 bg-white dark:opacity-0 transition-opacity duration-700">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-indigo-50/60 via-white to-white"></div>
          <div className="absolute bottom-0 right-0 h-[500px] w-[500px] bg-blue-50/40 blur-[100px] rounded-full mix-blend-multiply"></div>
        </div>

        {/* DARK THEME: Deep Ocean / Midnight */}
        <div className="absolute inset-0 opacity-0 dark:opacity-100 transition-opacity duration-700 bg-[#020617]">
          {/* Top light source */}
          <div className="absolute top-[-10%] left-[20%] h-[500px] w-[500px] rounded-full bg-indigo-900/20 blur-[120px]"></div>
          
          {/* Main Gradient */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0f172a] via-[#020617] to-black"></div>
          
          {/* Bottom subtle glow */}
          <div className="absolute bottom-[-10%] right-[10%] h-[400px] w-[400px] rounded-full bg-blue-900/10 blur-[100px]"></div>
        </div>
      </div>

      <Sidebar />
      
      <main className="relative z-10 flex-1 overflow-y-auto p-4 sm:p-8 scroll-smooth">
        {/* Content Container */}
        <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-2 duration-700">
          {children}
        </div>
      </main>
    </div>
  );
}