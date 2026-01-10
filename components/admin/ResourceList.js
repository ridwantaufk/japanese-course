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