'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Edit, Trash2, Plus, Search, ChevronLeft, ChevronRight, Filter, ArrowUpDown, ArrowUp, ArrowDown, X, CheckSquare, Square, Download, Loader2, List } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ResourceList({ resourceKey, config, data, meta }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [isCustomLimit, setIsCustomLimit] = useState(false);
  const customInputRef = useRef(null);

  useEffect(() => {
    setSelectedIds(new Set());
    const currentLimit = meta.limit;
    const isAll = currentLimit === meta.total;
    const isPreset = [25, 50, 100].includes(currentLimit) || isAll;
    if (!isPreset && currentLimit > 0) setIsCustomLimit(true);
    else setIsCustomLimit(false);
  }, [meta.page, meta.limit, meta.total, resourceKey, searchParams]);

  const handleSearch = (term) => updateParams({ search: term, page: '1' });
  const handleSort = (colKey) => {
    const currentSort = searchParams.get('sort');
    const currentOrder = searchParams.get('order');
    let newOrder = 'asc';
    if (currentSort === colKey && currentOrder === 'asc') newOrder = 'desc';
    updateParams({ sort: colKey, order: newOrder });
  };
  const handleFilterChange = (key, value) => updateParams({ [key]: value, page: '1' });
  const handleLimitChange = (val) => {
    if (val === 'custom') {
        setIsCustomLimit(true);
        setTimeout(() => customInputRef.current?.focus(), 100);
        return;
    }
    setIsCustomLimit(false);
    updateParams({ limit: val, page: '1' });
  };
  const handleCustomLimitSubmit = (e) => {
      const val = e.target.value;
      if (val && !isNaN(val) && parseInt(val) > 0) updateParams({ limit: val, page: '1' });
  };
  const updateParams = (updates) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '') params.delete(key);
      else params.set(key, value);
    });
    router.replace(`${pathname}?${params.toString()}`);
  };
  const clearFilters = () => { router.replace(pathname); setShowFilters(false); };
  const handleSelectAll = () => {
    if (selectedIds.size === data.length && data.length > 0) setSelectedIds(new Set());
    else setSelectedIds(new Set(data.map(d => d[config.primaryKey])));
  };
  const handleSelectRow = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id); else newSelected.add(id);
    setSelectedIds(newSelected);
  };
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/${resourceKey}/${id}`, { method: 'DELETE' });
      if (res.ok) router.refresh(); else alert('Failed to delete');
    } catch (err) { alert('Error deleting'); } finally { setDeletingId(null); }
  };
  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedIds.size} items?`)) return;
    setIsDeleting(true);
    try {
      await Promise.all(Array.from(selectedIds).map(id => fetch(`/api/admin/${resourceKey}/${id}`, { method: 'DELETE' })));
      router.refresh(); setSelectedIds(new Set());
    } catch (err) { alert('Error during bulk delete'); } finally { setIsDeleting(false); }
  };
    const handleExportCSV = () => {
      const rowsToExport = data.filter(d => selectedIds.has(d[config.primaryKey]));
      if (rowsToExport.length === 0) return;
      const headers = config.columns.map(c => c.label).join(',');
      const csv = [headers, ...rowsToExport.map(r => config.columns.map(c => `"${String(r[c.key] || '').replace(/"/g, '""')}"`).join(','))].join('\n');
      const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
          const a = document.createElement('a'); a.href = url; a.download = `${resourceKey}.csv`; a.click();
        };
      
        const getSortIcon = (colKey) => {
          const sort = searchParams.get('sort');
          const order = searchParams.get('order');
          if (sort !== colKey) return <ArrowUpDown size={14} className="opacity-30" />;
          return order === 'asc' ? <ArrowUp size={14} className="text-indigo-600 dark:text-indigo-400" /> : <ArrowDown size={14} className="text-indigo-600 dark:text-indigo-400" />;
        };
      
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 relative">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                 <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 tracking-tight">{config.label}</h1>
                 <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">
                   {config.readOnly ? 'View-only analytical data.' : `Manage ${config.label.toLowerCase()}.`}
                 </p>
              </div>
              {!config.readOnly && (
                <Link href={`/admin/${resourceKey}/new`} className="group inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 ring-1 ring-indigo-500 transition-all hover:bg-indigo-700 hover:shadow-indigo-600/40 hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm">
                  <Plus size={18} className="transition-transform group-hover:rotate-90" /> Add New Record
                </Link>
              )}
            </div>
      
            <div className="flex flex-col gap-4 rounded-2xl bg-white/60 p-2 shadow-xl shadow-slate-200/20 backdrop-blur-md dark:bg-white/5 dark:shadow-none dark:ring-1 dark:ring-white/10">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                  <input type="text" placeholder="Search database..." defaultValue={searchParams.get('search')?.toString()} onChange={(e) => handleSearch(e.target.value)} className="w-full rounded-xl border-none bg-transparent pl-10 pr-4 py-2 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:ring-0 dark:text-slate-200" />
                </div>
                <div className="h-6 w-px bg-slate-200 dark:bg-white/10"></div>
                <button onClick={() => setShowFilters(!showFilters)} className={cn("flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors", showFilters ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white")}><Filter size={16} /> Filters</button>
              </div>
              {showFilters && (
                <div className="grid gap-4 border-t border-slate-200/50 p-4 sm:grid-cols-2 lg:grid-cols-4 dark:border-white/5 animate-in slide-in-from-top-2 duration-300">
                  {config.columns.filter(col => col.filterable).map(col => (
                    <div key={col.key}>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">{col.label}</label>
                      {col.type === 'select' || col.type === 'boolean' ? (
                        <select className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none dark:border-white/10 dark:bg-[#1e293b] dark:text-slate-200" value={searchParams.get(col.key) || ''} onChange={(e) => handleFilterChange(col.key, e.target.value)}>
                          <option value="">All</option>
                          {col.type === 'boolean' && (<><option value="true">Yes</option><option value="false">No</option></>)}
                          {col.options?.map(opt => (<option key={opt} value={opt}>{opt}</option>))}
                        </select>
                      ) : (
                        <input type="text" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none dark:border-white/10 dark:bg-[#1e293b] dark:text-slate-200 placeholder:text-slate-500" placeholder={`Filter ${col.label}...`} defaultValue={searchParams.get(col.key) || ''} onBlur={(e) => handleFilterChange(col.key, e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleFilterChange(col.key, e.currentTarget.value)} />
                      )}
                    </div>
                  ))}
                  <div className="flex items-end"><button onClick={clearFilters} className="w-full rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-300 dark:hover:bg-white/20">Clear Filters</button></div>
                </div>
              )}
            </div>
            <div className="rounded-2xl border border-slate-200/60 bg-white/40 shadow-2xl shadow-slate-200/40 backdrop-blur-md overflow-hidden dark:border-white/5 dark:bg-[#1e293b]/30 dark:shadow-none">
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200/60 bg-slate-50/50 dark:border-white/5 dark:bg-white/5">
              <tr>
                <th className="w-10 px-6 py-4"><button onClick={handleSelectAll} className="flex items-center text-slate-400 hover:text-indigo-600 dark:text-slate-500 dark:hover:text-indigo-400 transition-colors">{selectedIds.size === data.length && data.length > 0 ? <CheckSquare size={18} /> : <Square size={18} />}</button></th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-16">No.</th>
                {config.columns.map(col => (
                  <th key={col.key} className="group cursor-pointer px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 hover:bg-slate-100/50 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-indigo-300 transition-colors" onClick={() => handleSort(col.key)}>
                    <div className="flex items-center gap-2">{col.label}{getSortIcon(col.key)}</div>
                  </th>
                ))}
                {!config.readOnly && <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {data.length === 0 ? (
                <tr><td colSpan={config.columns.length + 3} className="px-6 py-24 text-center"><div className="flex flex-col items-center justify-center opacity-50"><Search size={32} className="mb-4" /><p className="text-base font-medium">No records found</p></div></td></tr>
              ) : (
                data.map((row, index) => {
                  const rowId = row[config.primaryKey];
                  const isSelected = selectedIds.has(rowId);
                  const rowNum = (meta.page - 1) * (meta.limit || 0) + index + 1;
                  const isRowDeleting = deletingId === rowId;
                  return (
                    <tr key={rowId || Math.random()} className={cn("group transition-colors", isSelected ? "bg-indigo-50/50 dark:bg-indigo-500/10" : "hover:bg-white/60 dark:hover:bg-white/5")}>
                      <td className="px-6 py-4"><button onClick={() => handleSelectRow(rowId)} className={cn("flex items-center transition-colors", isSelected ? "text-indigo-600 dark:text-indigo-400" : "text-slate-300 hover:text-slate-500 dark:text-slate-600 dark:hover:text-slate-400")}>{isSelected ? <CheckSquare size={18} /> : <Square size={18} />}</button></td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-400 dark:text-slate-500">{rowNum}</td>
                      {config.columns.map(col => (<td key={col.key} className="px-6 py-4 text-slate-700 font-medium dark:text-slate-300">{renderCell(row[col.key], col.type)}</td>))}
                      {!config.readOnly && (
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                            <Link href={`/admin/${resourceKey}/${rowId}`} className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-500/20 dark:hover:text-indigo-400"><Edit size={16} /></Link>
                            <button onClick={() => handleDelete(rowId)} disabled={isRowDeleting} className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/20 dark:hover:text-red-400">{isRowDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}</button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col gap-4 border-t border-slate-200/60 bg-slate-50/30 px-6 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/5 dark:bg-white/5">
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                <span>Show:</span>
                {isCustomLimit ? (
                   <div className="flex items-center gap-1 rounded-md bg-white p-0.5 ring-1 ring-slate-200 dark:bg-[#1e293b] dark:ring-white/10">
                     <input ref={customInputRef} type="number" min="1" className="w-16 rounded border-none bg-transparent px-2 py-1 text-center text-xs font-semibold text-slate-700 focus:ring-0 dark:text-slate-200" defaultValue={meta.limit} onBlur={handleCustomLimitSubmit} onKeyDown={(e) => e.key === 'Enter' && handleCustomLimitSubmit(e)} />
                     <button onClick={() => setIsCustomLimit(false)} className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/10 dark:hover:text-slate-200" title="Back to list"><List size={12} /></button>
                   </div>
                ) : (
                  <select className="rounded border border-slate-200 bg-white px-2 py-1 text-slate-700 focus:outline-none dark:border-white/10 dark:bg-[#1e293b] dark:text-slate-300" value={meta.limit === meta.total ? 'all' : meta.limit} onChange={(e) => handleLimitChange(e.target.value)}>
                    <option value="25">25</option><option value="50">50</option><option value="100">100</option><option value="all">All</option><option value="custom">Custom...</option>
                  </select>
                )}
             </div>
             <div className="h-4 w-px bg-slate-300 dark:bg-white/10"></div>
             <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total: <span className="text-slate-900 dark:text-white">{meta.total}</span> records</span>
          </div>
          <div className="flex gap-2">
            <Link href={`${pathname}?${new URLSearchParams({...Object.fromEntries(searchParams), page: meta.page - 1}).toString()}`} className={cn("flex items-center justify-center h-8 w-8 rounded-lg border border-slate-200 bg-white transition-all hover:border-indigo-300 hover:text-indigo-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white", meta.page <= 1 && "pointer-events-none opacity-50")}><ChevronLeft size={16} /></Link>
            <div className="flex items-center justify-center px-3 h-8 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700 dark:bg-white/5 dark:border-white/10 dark:text-slate-300">Page {meta.page} of {meta.totalPages}</div>
            <Link href={`${pathname}?${new URLSearchParams({...Object.fromEntries(searchParams), page: meta.page + 1}).toString()}`} className={cn("flex items-center justify-center h-8 w-8 rounded-lg border border-slate-200 bg-white transition-all hover:border-indigo-300 hover:text-indigo-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white", meta.page >= meta.totalPages && "pointer-events-none opacity-50")}><ChevronRight size={16} /></Link>
          </div>
        </div>
      </div>

      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-2xl bg-slate-900/90 p-2 px-4 text-white shadow-2xl backdrop-blur-md dark:bg-white/90 dark:text-slate-900 animate-in slide-in-from-bottom-6 fade-in duration-300">
            <span className="text-sm font-medium ml-2">{selectedIds.size} selected</span>
            <div className="h-4 w-px bg-white/20 dark:bg-black/10 mx-2"></div>
            <button onClick={handleExportCSV} className="flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-indigo-500"><Download size={14} /> Export CSV</button>
            {!config.readOnly && (<button onClick={handleBulkDelete} disabled={isDeleting} className="flex items-center gap-2 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50">{isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} Delete</button>)}
            <button onClick={() => setSelectedIds(new Set())} className="rounded-lg p-1.5 hover:bg-white/10 dark:hover:bg-black/5 ml-1"><X size={16} /></button>
        </div>
      )}
    </div>
  );
}

function renderCell(value, type) {
  if (value === null || value === undefined) return <span className="text-slate-300 dark:text-slate-600">-</span>;
  switch(type) {
    case 'boolean':
      return (<span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide border", value ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700/30 dark:text-slate-400 dark:border-slate-700/50")}><span className={cn("h-1.5 w-1.5 rounded-full", value ? "bg-emerald-500" : "bg-slate-400")}></span>{value ? 'Yes' : 'No'}</span>);
    case 'date':
      return <span className="font-mono text-xs opacity-80">{new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>;
    default:
      if (typeof value === 'object') return <span className="text-xs opacity-50 italic">JSON Data</span>;
      return <span className="truncate block max-w-[200px]">{String(value)}</span>;
  }
}