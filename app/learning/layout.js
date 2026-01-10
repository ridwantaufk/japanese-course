import LearningNavbar from '@/components/learning/Navbar';

export default function LearningLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#fdf2f8] dark:bg-[#020617] transition-colors duration-500">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Light: Sakura Theme */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-pink-100/40 via-[#fff0f5] to-white dark:opacity-0 transition-opacity duration-700"></div>
        
        {/* Dark: Cyber Night */}
        <div className="absolute inset-0 opacity-0 dark:opacity-100 transition-opacity duration-700">
           <div className="absolute top-[-20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-indigo-500/10 blur-[120px]"></div>
           <div className="absolute bottom-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-pink-500/10 blur-[120px]"></div>
        </div>
      </div>

      <LearningNavbar />
      
      <main className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}