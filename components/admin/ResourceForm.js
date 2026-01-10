'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function ResourceForm({ resourceKey, config, initialData = null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(() => {
    if (!initialData) return {};
    return { ...initialData };
  });

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare data for submission
      const submissionData = { ...formData };
      
      // Parse JSON fields
      config.fields.forEach(field => {
        if (field.type === 'json' && typeof submissionData[field.key] === 'string') {
          try {
            submissionData[field.key] = JSON.parse(submissionData[field.key]);
          } catch (e) {
            console.warn(`Failed to parse JSON for ${field.key}`);
          }
        }
      });

      const isNew = !initialData;
      const url = isNew 
        ? `/api/admin/${resourceKey}` 
        : `/api/admin/${resourceKey}/${initialData[config.primaryKey]}`;
      
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || 'Something went wrong');
      }

      router.push(`/admin/${resourceKey}`);
      router.refresh();
      
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Link 
          href={`/admin/${resourceKey}`}
          className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
           <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
             {initialData ? `Edit ${config.label}` : `New ${config.label}`}
           </h1>
           <p className="text-sm text-slate-500 dark:text-slate-400">Fill in the details below.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/40 dark:border-white/5 dark:bg-[#0f172a]/40 dark:backdrop-blur-xl dark:shadow-none">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            {config.fields.map((field) => {
               const isWide = ['textarea', 'json'].includes(field.type);
               return (
                <div key={field.key} className={isWide ? "sm:col-span-2" : ""}>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {renderInput(field, formData[field.key], (val) => handleChange(field.key, val))}
                </div>
               );
            })}
          </div>

          <div className="flex justify-end border-t border-slate-100 pt-6 dark:border-white/5">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all hover:bg-indigo-700 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {initialData ? 'Update Changes' : 'Create Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function renderInput(field, value, onChange) {
  const commonClasses = "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all dark:border-white/10 dark:bg-black/20 dark:text-white dark:focus:border-indigo-500 dark:focus:bg-black/40";

  switch (field.type) {
    case 'textarea':
      return (
        <textarea 
          required={field.required}
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          rows={4}
          className={commonClasses}
          placeholder={`Enter ${field.label}...`}
        />
      );
    case 'select':
      return (
        <div className="relative">
          <select
            required={field.required}
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            className={`${commonClasses} appearance-none cursor-pointer`}
          >
            <option value="">Select Option...</option>
            {field.options.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      );
    case 'checkbox':
      return (
        <label className="inline-flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
          <div className="relative flex items-center">
            <input 
                type="checkbox"
                checked={!!value}
                onChange={e => onChange(e.target.checked)}
                className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 transition-all checked:border-indigo-600 checked:bg-indigo-600 hover:border-indigo-500 dark:border-slate-600 dark:bg-white/5"
            />
            <svg className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100" width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Enabled / Active</span>
        </label>
      );
    case 'json':
      const textVal = typeof value === 'object' && value !== null 
        ? JSON.stringify(value, null, 2) 
        : (value || '');
        
      return (
        <textarea 
          value={textVal}
          onChange={e => onChange(e.target.value)}
          placeholder="{}"
          rows={6}
          className={`${commonClasses} font-mono text-xs`}
        />
      );
    default:
      return (
        <input 
          type={field.type || 'text'}
          required={field.required}
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          className={commonClasses}
          placeholder={field.label}
        />
      );
  }
}