"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Edit,
  Trash2,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  CheckSquare,
  Square,
  Download,
  Loader2,
  List,
  ChevronsLeft,
  ChevronsRight,
  FileText,
  FileSpreadsheet,
  Printer,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useReactToPrint } from "react-to-print";
import ImportModal from "./ImportModal";
import BatchEditModal from "./BatchEditModal";
import { useToast } from "./ToastProvider";

export default function ResourceList({ resourceKey, config, data, meta }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tableRef = useRef(null);
  const toast = useToast();

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showBatchEdit, setShowBatchEdit] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [isCustomLimit, setIsCustomLimit] = useState(false);
  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || ""
  );
  const [searchDebounce, setSearchDebounce] = useState(null);
  const customInputRef = useRef(null);

  useEffect(() => {
    setSelectedIds(new Set());
    const currentLimit = parseInt(meta.limit || "10");
    const isAll = currentLimit === meta.total;
    const isPreset = [10, 25, 50, 100].includes(currentLimit) || isAll;
    setIsCustomLimit(!isPreset && currentLimit > 0);
  }, [meta.page, meta.limit, meta.total, resourceKey, searchParams]);

  // --- PRINT LOGIC ---
  const handlePrint = useReactToPrint({
    contentRef: tableRef,
    documentTitle: `${config.label}_Report`,
  });

  // --- EXPORT LOGIC ---
  const handleServerExport = (format) => {
    const params = new URLSearchParams(searchParams);
    params.set("format", format);
    window.open(
      `/api/admin/${resourceKey}/export?${params.toString()}`,
      "_blank"
    );
    setShowExportMenu(false);
  };

  const handleClientExport = async (format) => {
    const exportData = data.filter((d) =>
      selectedIds.has(d[config.primaryKey])
    );
    if (exportData.length === 0) {
      toast.warning("Please select items to export");
      return;
    }

    try {
      const filename = `${resourceKey}_export_${new Date()
        .toISOString()
        .slice(0, 10)}`;

      if (format === "xlsx" || format === "csv") {
        const XLSX = await import("xlsx");
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Data");
        XLSX.writeFile(wb, `${filename}.${format}`);
      } else if (format === "pdf") {
        const jsPDF = (await import("jspdf")).default;
        const autoTable = (await import("jspdf-autotable")).default;
        const doc = new jsPDF();
        const headers = config.columns.map((c) => c.label);
        const body = exportData.map((row) =>
          config.columns.map((c) => String(row[c.key] || ""))
        );
        doc.text(`${config.label} Selection Report`, 14, 15);
        autoTable(doc, { head: [headers], body, startY: 20, theme: "striped" });
        doc.save(`${filename}.pdf`);
      }
      toast.success(`Exported ${exportData.length} items successfully`);
      setShowExportMenu(false);
    } catch (error) {
      toast.error(`Export failed: ${error.message}`);
    }
  };

  // --- ACTIONS ---
  const updateParams = (updates) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") params.delete(key);
      else params.set(key, value);
    });
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;

    const confirmed = confirm(
      `Delete ${selectedIds.size} items? This action cannot be undone.`
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const deletePromises = Array.from(selectedIds).map((id) =>
        fetch(`/api/admin/${resourceKey}/${id}`, { method: "DELETE" })
      );

      await Promise.all(deletePromises);
      toast.success(`Successfully deleted ${selectedIds.size} items`);
      setSelectedIds(new Set());
      router.refresh();
    } catch (e) {
      toast.error("Failed to delete items");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = confirm(
      "Delete this item? This action cannot be undone."
    );
    if (!confirmed) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/${resourceKey}/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");

      toast.success("Item deleted successfully");
      router.refresh();
    } catch (e) {
      toast.error("Failed to delete item");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSort = (column) => {
    const currentSort = searchParams.get("sort");
    const currentOrder = searchParams.get("order") || "asc";

    if (currentSort === column) {
      // Toggle order
      updateParams({
        sort: column,
        order: currentOrder === "asc" ? "desc" : "asc",
      });
    } else {
      // New column, default to asc
      updateParams({ sort: column, order: "asc" });
    }
  };

  const handleSearchChange = (value) => {
    setSearchInput(value);

    // Clear previous timeout
    if (searchDebounce) clearTimeout(searchDebounce);

    // Set new timeout for debounced search
    const timeout = setTimeout(() => {
      updateParams({ search: value, page: "1" });
    }, 500);

    setSearchDebounce(timeout);
  };

  const handleLimitChange = (value) => {
    if (value === "custom") {
      setIsCustomLimit(true);
      setTimeout(() => customInputRef.current?.focus(), 100);
    } else if (value === "all") {
      updateParams({ limit: meta.total, page: "1" });
    } else {
      updateParams({ limit: value, page: "1" });
    }
  };

  const handleCustomLimitSubmit = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= meta.total) {
      updateParams({ limit: value, page: "1" });
      setIsCustomLimit(false);
    } else {
      toast.warning(`Limit must be between 1 and ${meta.total}`);
    }
  };

  const handleSelectRow = (id) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const getPageNumbers = () => {
    const total = meta.totalPages;
    const current = meta.page;
    const range = [];
    for (
      let i = Math.max(1, current - 1);
      i <= Math.min(total, current + 1);
      i++
    )
      range.push(i);
    return range;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32">
      {/* HEADER */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {config.label}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">
            Database Management Panel
          </p>
        </div>

        <div className="flex gap-2">
          {!config.readOnly && (
            <button
              onClick={() => setShowImport(true)}
              className="group flex items-center gap-2 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/10 transition-all"
            >
              <Upload size={18} /> Import
            </button>
          )}

          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/10 transition-all"
            >
              <Download size={18} /> Export
            </button>

            {showExportMenu && (
              <div className="absolute right-0 top-12 z-50 w-56 rounded-2xl bg-white dark:bg-[#1e293b] p-2 shadow-2xl ring-1 ring-black/5 dark:ring-white/10 animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Database (All)
                </div>
                <button
                  onClick={() => handleServerExport("xlsx")}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-white/5 hover:text-indigo-600"
                >
                  <FileSpreadsheet size={16} /> Excel Full
                </button>
                <button
                  onClick={() => handleServerExport("csv")}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-white/5 hover:text-indigo-600"
                >
                  <FileText size={16} /> CSV Full
                </button>
                <div className="my-2 h-px bg-slate-100 dark:bg-white/5"></div>
                <button
                  onClick={handlePrint}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-white/5 hover:text-indigo-600"
                >
                  <Printer size={16} /> Print Table
                </button>
              </div>
            )}
          </div>

          {!config.readOnly && (
            <Link
              href={`/admin/${resourceKey}/new`}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all"
            >
              <Plus size={18} /> Add New
            </Link>
          )}
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-col gap-4 rounded-3xl bg-white/50 dark:bg-white/5 p-2 shadow-xl dark:shadow-none backdrop-blur-xl border border-white/20 dark:border-white/10">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search records..."
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full rounded-2xl border-none bg-transparent pl-12 pr-4 py-3 text-sm font-medium text-slate-700 dark:text-white placeholder:text-slate-400 focus:ring-0"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-bold transition-all",
              showFilters
                ? "bg-indigo-600 text-white shadow-lg"
                : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400"
            )}
          >
            <Filter size={16} /> Filters
          </button>
        </div>

        {showFilters && (
          <div className="grid gap-4 border-t border-slate-100 dark:border-white/5 p-4 sm:grid-cols-2 lg:grid-cols-4">
            {config.columns
              .filter((c) => c.filterable)
              .map((col) => (
                <div key={col.key}>
                  <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {col.label}
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-xl border-none bg-slate-100 dark:bg-black/20 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/50"
                    placeholder="Type to filter..."
                    defaultValue={searchParams.get(col.key) || ""}
                    onBlur={(e) =>
                      updateParams({ [col.key]: e.target.value, page: "1" })
                    }
                  />
                </div>
              ))}
            <div className="flex items-end">
              <button
                onClick={() => router.replace(pathname)}
                className="w-full rounded-xl bg-slate-200 dark:bg-white/10 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-white/20 transition-all"
              >
                Reset All
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DATA TABLE */}
      <div className="rounded-3xl border border-slate-200/50 dark:border-white/10 bg-white/40 dark:bg-[#0f172a]/40 shadow-2xl backdrop-blur-md overflow-hidden">
        <div className="overflow-x-auto" ref={tableRef}>
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50/50 dark:bg-white/5 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-widest">
              <tr>
                <th className="px-6 py-5 w-10">
                  <button
                    onClick={() =>
                      setSelectedIds(
                        selectedIds.size === data.length
                          ? new Set()
                          : new Set(data.map((d) => d[config.primaryKey]))
                      )
                    }
                    className="text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    <CheckSquare size={20} />
                  </button>
                </th>
                <th className="px-6 py-5 w-16 text-center">No.</th>
                {config.columns.map((col) => (
                  <th
                    key={col.key}
                    className="px-6 py-5 cursor-pointer hover:text-indigo-600 transition-colors"
                    onClick={() => handleSort(col.key)}
                  >
                    <div className="flex items-center gap-2">
                      {col.label}{" "}
                      <ArrowUpDown size={12} className="opacity-30" />
                    </div>
                  </th>
                ))}
                {!config.readOnly && (
                  <th className="px-6 py-5 text-right pr-10">Action</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {data.map((row, index) => {
                const rowId = row[config.primaryKey];
                const isSelected = selectedIds.has(rowId);
                return (
                  <tr
                    key={rowId}
                    className={cn(
                      "group transition-all duration-300",
                      isSelected
                        ? "bg-indigo-500/10 dark:bg-indigo-500/20"
                        : "hover:bg-white/60 dark:hover:bg-white/5"
                    )}
                  >
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleSelectRow(rowId)}
                        className={cn(
                          "transition-all duration-300",
                          isSelected
                            ? "text-indigo-600 scale-110"
                            : "text-slate-300 dark:text-slate-700"
                        )}
                      >
                        {isSelected ? (
                          <CheckSquare size={20} />
                        ) : (
                          <Square size={20} />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 font-mono text-[11px] text-slate-400 text-center">
                      {(meta.page - 1) * (meta.limit || 0) + index + 1}
                    </td>
                    {config.columns.map((col) => (
                      <td
                        key={col.key}
                        className="px-6 py-4 text-slate-700 dark:text-slate-300 font-medium truncate max-w-[250px]"
                      >
                        {String(row[col.key] || "-")}
                      </td>
                    ))}
                    {!config.readOnly && (
                      <td className="px-6 py-4 text-right pr-8">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                          <Link
                            href={`/admin/${resourceKey}/${rowId}`}
                            className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
                          >
                            <Edit size={16} />
                          </Link>
                          <button
                            onClick={() => handleDelete(rowId)}
                            className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div className="flex flex-col gap-4 bg-slate-50/50 dark:bg-white/5 px-8 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black uppercase text-slate-400">
                Show:
              </span>
              {isCustomLimit ? (
                <div className="flex items-center gap-1 rounded-xl bg-white dark:bg-black/20 p-1 ring-1 ring-slate-200 dark:ring-white/10 shadow-sm">
                  <input
                    ref={customInputRef}
                    type="number"
                    className="w-12 border-none bg-transparent text-center text-xs font-bold dark:text-white focus:ring-0"
                    defaultValue={meta.limit}
                    onBlur={handleCustomLimitSubmit}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleCustomLimitSubmit(e)
                    }
                  />
                  <button
                    onClick={() => setIsCustomLimit(false)}
                    className="p-1 text-slate-400 hover:text-slate-600"
                  >
                    <List size={12} />
                  </button>
                </div>
              ) : (
                <select
                  className="rounded-xl border-none bg-white dark:bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 shadow-sm focus:ring-2 focus:ring-indigo-500/50"
                  value={meta.limit}
                  onChange={(e) => handleLimitChange(e.target.value)}
                >
                  {[10, 25, 50, 100].map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                  <option value="all">All</option>
                  <option value="custom">...</option>
                </select>
              )}
            </div>
            <span className="text-[10px] font-black uppercase text-slate-400">
              Total:{" "}
              <span className="text-slate-900 dark:text-white">
                {meta.total}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => updateParams({ page: 1 })}
              disabled={meta.page <= 1}
              className="p-2 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 disabled:opacity-30"
            >
              <ChevronsLeft size={16} />
            </button>
            <button
              onClick={() => updateParams({ page: meta.page - 1 })}
              disabled={meta.page <= 1}
              className="p-2 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 disabled:opacity-30"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-black shadow-lg shadow-indigo-600/20">
              PAGE {meta.page} / {meta.totalPages}
            </div>
            <button
              onClick={() => updateParams({ page: meta.page + 1 })}
              disabled={meta.page >= meta.totalPages}
              className="p-2 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 disabled:opacity-30"
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => updateParams({ page: meta.totalPages })}
              disabled={meta.page >= meta.totalPages}
              className="p-2 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 disabled:opacity-30"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* DOCK STYLE SELECT MODAL - FIXED DARK MODE */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-10 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/20 bg-slate-950/90 dark:bg-white/90 p-2.5 pl-8 pr-2.5 text-white dark:text-slate-950 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl animate-in slide-in-from-bottom-10 duration-500 scale-110">
          <span className="text-sm font-black italic tracking-tighter mr-4 underline decoration-indigo-500 decoration-2 underline-offset-4">
            {selectedIds.size} ITEMS SELECTED
          </span>

          <div className="flex gap-1">
            <button
              onClick={() => handleClientExport("pdf")}
              className="group flex items-center gap-2 rounded-full px-5 py-2 text-[10px] font-black uppercase tracking-widest transition-all hover:bg-white/10 dark:hover:bg-black/10"
            >
              <FileText
                size={14}
                className="group-hover:text-red-400 transition-colors"
              />{" "}
              PDF
            </button>
            <button
              onClick={() => handleClientExport("xlsx")}
              className="group flex items-center gap-2 rounded-full px-5 py-2 text-[10px] font-black uppercase tracking-widest transition-all hover:bg-white/10 dark:hover:bg-black/10"
            >
              <FileSpreadsheet
                size={14}
                className="group-hover:text-green-400 transition-colors"
              />{" "}
              XLSX
            </button>
            {!config.readOnly && (
              <button
                onClick={() => setShowBatchEdit(true)}
                className="group flex items-center gap-2 rounded-full px-5 py-2 text-[10px] font-black uppercase tracking-widest transition-all hover:bg-white/10 dark:hover:bg-black/10"
              >
                <Edit
                  size={14}
                  className="group-hover:text-blue-400 transition-colors"
                />{" "}
                BATCH EDIT
              </button>
            )}
          </div>

          {!config.readOnly && (
            <button
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="ml-2 flex items-center gap-2 rounded-full bg-red-600 px-6 py-2 text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-red-600/40 hover:bg-red-500 hover:scale-105 active:scale-95 transition-all"
            >
              {isDeleting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Trash2 size={14} />
              )}{" "}
              Delete All
            </button>
          )}

          <button
            onClick={() => setSelectedIds(new Set())}
            className="ml-2 rounded-full bg-white/10 dark:bg-black/10 p-2.5 hover:rotate-90 transition-all duration-300"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {showImport && (
        <ImportModal
          resourceKey={resourceKey}
          config={config}
          onClose={() => setShowImport(false)}
          onSuccess={() => {
            setShowImport(false);
            router.refresh();
          }}
        />
      )}

      {showBatchEdit && (
        <BatchEditModal
          resourceKey={resourceKey}
          config={config}
          selectedIds={selectedIds}
          onClose={() => setShowBatchEdit(false)}
          onSuccess={() => {
            setShowBatchEdit(false);
            setSelectedIds(new Set());
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

function renderCell(value, type) {
  if (value === null || value === undefined)
    return <span className="text-slate-300 dark:text-slate-700">-</span>;
  switch (type) {
    case "boolean":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest border",
            value
              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
              : "bg-slate-500/10 text-slate-500 border-slate-500/20"
          )}
        >
          {value ? "Enabled" : "Disabled"}
        </span>
      );
    case "date":
      return (
        <span className="font-mono text-[11px] opacity-60 italic">
          {new Date(value).toLocaleDateString()}
        </span>
      );
    default:
      return <span>{String(value)}</span>;
  }
}
