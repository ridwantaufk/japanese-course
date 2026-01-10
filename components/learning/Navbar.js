'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { BookOpen, GraduationCap, Languages, BrainCircuit, Home, LayoutGrid } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function LearningNavbar() {
  const pathname = usePathname();

  const links = [
    { href: '/learning', label: 'Dashboard', icon: Home },
    { href: '/learning/kana', label: 'Kana', icon: Languages },
    { href: '/learning/kanji', label: 'Kanji', icon: LayoutGrid },
    { href: '/learning/vocabulary', label: 'Vocabulary', icon: BookOpen },
    { href: '/learning/grammar', label: 'Grammar', icon: GraduationCap },
    { href: '/learning/conversations', label: 'Conversations', icon: BookOpen },
    { href: '/learning/reading', label: 'Reading', icon: Languages },
    { href: '/learning/quiz', label: 'Quiz', icon: BrainCircuit },
    { href: '/learning/jlpt', label: 'JLPT Exams', icon: GraduationCap },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/20 bg-white/60 backdrop-blur-xl dark:bg-[#0f172a]/60 dark:border-white/5 transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo */}
        <Link href="/learning" className="flex items-center gap-2 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/30 transition-transform group-hover:scale-110">
            <span className="font-black text-xl">JP</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">
            Nihon<span className="text-pink-500">Go!</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== '/learning');
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300",
                  isActive
                    ? "bg-slate-900 text-white shadow-md dark:bg-white dark:text-slate-900"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                )}
              >
                <Icon size={16} />
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {/* Mobile Menu Button could go here */}
        </div>
      </div>
    </nav>
  );
}