'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Edit, Trash2, Plus, Search, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ResourceList({ resourceKey, config, data, meta }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isDeleting, setIsDeleting] = useState(null);

  const handleSearch = (term) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set('search', term);
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    setIsDeleting(id);
    try {
      const res = await fetch(`/api/admin/${resourceKey}/${id}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        router.refresh();
      } else {
        alert('Failed to delete');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting');
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Section */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
           <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 tracking-tight">{config.label}</h1>
           <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">
             {config.readOnly ? 'Analytical reports & view-only data.' : `Manage & organize your ${config.label.toLowerCase()}.`}
           </p>
        </div>
        {!config.readOnly && (
          <Link 
            href={`/admin/${resourceKey}/new`}
            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 ring-1 ring-indigo-500 transition-all hover:bg-indigo-700 hover:shadow-indigo-600/40 hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm"
          >
            <Plus size={18} className="transition-transform group-hover:rotate-90" />
            Add New Record
          </Link>
        )}
      </div>

      {/* Glass Toolbar */}
      <div className="flex items-center gap-3 rounded-2xl bg-white/60 p-1.5 shadow-xl shadow-slate-200/20 backdrop-blur-md dark:bg-white/5 dark:shadow-none dark:ring-1 dark:ring-white/10">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input 
            type="text"
            placeholder="Search database..."
            defaultValue={searchParams.get('search')?.toString()}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full rounded-xl border-none bg-transparent pl-10 pr-4 py-2 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:ring-0 dark:text-slate-200"
          />
        </div>
        <div className="h-6 w-px bg-slate-200 dark:bg-white/10"></div>
        <button className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100/50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white">
            <Filter size={16} />
            Filters
        </button>
      </div>

      {/* Glass Table Card */}
      <div className="rounded-2xl border border-slate-200/50 bg-white/40 shadow-2xl shadow-slate-200/30 backdrop-blur-md overflow-hidden dark:border-white/5 dark:bg-[#0f172a]/40 dark:shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200/60 bg-white/50 dark:border-white/5 dark:bg-white/5">
              <tr>
                {config.columns.map(col => (
                  <th key={col.key} className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {col.label}
                  </th>
                ))}
                {!config.readOnly && <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={config.columns.length + (config.readOnly ? 0 : 1)} className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center justify-center">
                        <div className="mb-4 rounded-full bg-slate-50 p-4 dark:bg-white/5">
                            <Search size={32} className="text-slate-300 dark:text-slate-600" />
                        </div>
                        <p className="text-base font-medium text-slate-900 dark:text-white">No records found</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Try adjusting your search filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((row) => (
                  <tr key={row[config.primaryKey] || Math.random()} className="group transition-colors hover:bg-white/60 dark:hover:bg-white/5">
                    {config.columns.map(col => (
                      <td key={col.key} className="px-6 py-4 text-slate-700 font-medium dark:text-slate-300">
                        {renderCell(row[col.key], col.type)}
                      </td>
                    ))}
                    {!config.readOnly && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <Link 
                            href={`/admin/${resourceKey}/${row[config.primaryKey]}`}
                            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-500/20 dark:hover:text-indigo-400"
                          >
                            <Edit size={16} />
                          </Link>
                          <button 
                            onClick={() => handleDelete(row[config.primaryKey])}
                            disabled={isDeleting === row[config.primaryKey]}
                            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/20 dark:hover:text-red-400"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="flex items-center justify-between border-t border-slate-200/60 bg-slate-50/30 px-6 py-4 dark:border-white/5 dark:bg-white/5">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Page <span className="text-slate-900 dark:text-white">{meta.page}</span> of <span className="text-slate-900 dark:text-white">{meta.totalPages}</span>
          </div>
          <div className="flex gap-2">
            <Link
              href={`${pathname}?${new URLSearchParams({...Object.fromEntries(searchParams), page: meta.page - 1}).toString()}`}
              className={cn(
                "flex items-center justify-center h-8 w-8 rounded-lg border border-slate-200 bg-white transition-all hover:border-indigo-300 hover:text-indigo-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white", 
                meta.page <= 1 && "pointer-events-none opacity-50"
              )}
            >
              <ChevronLeft size={16} />
            </Link>
            <Link
              href={`${pathname}?${new URLSearchParams({...Object.fromEntries(searchParams), page: meta.page + 1}).toString()}`}
              className={cn(
                "flex items-center justify-center h-8 w-8 rounded-lg border border-slate-200 bg-white transition-all hover:border-indigo-300 hover:text-indigo-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white", 
                meta.page >= meta.totalPages && "pointer-events-none opacity-50"
              )}
            >
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function renderCell(value, type) {
  if (value === null || value === undefined) return <span className="text-slate-300 dark:text-slate-600">-</span>;
  
  switch(type) {
    case 'boolean':
      return (
        <span className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide border",
          value 
            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" 
            : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700/30 dark:text-slate-400 dark:border-slate-700/50"
        )}>
          <span className={cn("h-1.5 w-1.5 rounded-full", value ? "bg-emerald-500" : "bg-slate-400")}></span>
          {value ? 'Active' : 'Inactive'}
        </span>
      );
    case 'date':
      return <span className="font-mono text-xs opacity-80">{new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>;
    default:
      if (typeof value === 'object') return JSON.stringify(value).substring(0, 30) + '...';
      return <span>{String(value)}</span>;
  }
}