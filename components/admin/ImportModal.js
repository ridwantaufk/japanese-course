'use client';

import { useState } from 'react';
import { Upload, X, FileSpreadsheet, Check, AlertCircle, Loader2, Download, AlertTriangle } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function ImportModal({ resourceKey, config, onClose, onSuccess }) {
  const [step, setStep] = useState(1); // 1: Upload, 2: Preview, 3: Result
  const [fileData, setFileData] = useState([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);

  // --- ACTIONS ---

  const handleDownloadTemplate = () => {
    const headers = {};
    config.fields.forEach(f => headers[f.key] = f.label + (f.required ? ' *' : ''));
    
    // Example row
    const example = {};
    config.fields.forEach(f => {
        example[f.key] = f.type === 'boolean' ? 'true' : f.type === 'number' ? 123 : 'example';
    });

    const ws = XLSX.utils.json_to_sheet([example]);
    XLSX.utils.sheet_add_json(ws, [headers], { skipHeader: true, origin: "A1" });
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, `${resourceKey}_template.xlsx`);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      setFileData(data);
      setStep(2);
    };
    reader.readAsBinaryString(file);
  };

  const handleImport = async () => {
    setImporting(true);
    try {
      const res = await fetch(`/api/admin/${resourceKey}/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: fileData }),
      });
      const json = await res.json();
      setResult(json);
      setStep(3);
      if (json.success > 0) onSuccess(); // Trigger refresh on parent
    } catch (err) {
      alert('Import failed: ' + err.message);
    } finally {
      setImporting(false);
    }
  };

  // --- RENDERERS ---

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl dark:bg-[#0f172a] dark:border dark:border-white/10 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4 dark:border-white/5">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Import {config.label}</h2>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-slate-100 dark:hover:bg-white/10">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* STEP 1: UPLOAD */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 text-sm text-blue-700 dark:bg-blue-900/20 dark:border-blue-800/50 dark:text-blue-200">
                <p className="font-semibold flex items-center gap-2 mb-1"><AlertCircle size={16} /> Instructions</p>
                <ul className="list-disc list-inside space-y-1 ml-1">
                  <li>Use the template to ensure correct column names.</li>
                  <li>Required fields are marked with (*).</li>
                  <li>Duplicates ({config.uniqueKey || 'ID'}) will be skipped automatically.</li>
                </ul>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <button 
                  onClick={handleDownloadTemplate}
                  className="flex h-32 flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 transition-colors hover:border-indigo-400 hover:bg-indigo-50 dark:bg-white/5 dark:border-white/10 dark:hover:bg-white/10"
                >
                  <FileSpreadsheet size={32} className="text-indigo-500" />
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Download Template</span>
                </button>

                <label className="flex h-32 cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 transition-colors hover:border-indigo-400 hover:bg-indigo-50 dark:bg-white/5 dark:border-white/10 dark:hover:bg-white/10">
                  <Upload size={32} className="text-indigo-500" />
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Upload Excel / CSV</span>
                  <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>
            </div>
          )}

          {/* STEP 2: PREVIEW */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">Preview (First 5 rows):</span>
                <span className="text-xs rounded-full bg-indigo-100 px-2 py-1 font-bold text-indigo-700">{fileData.length} rows found</span>
              </div>
              
              <div className="overflow-x-auto rounded-lg border dark:border-white/10">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 font-bold uppercase">
                    <tr>
                      {Object.keys(fileData[0] || {}).slice(0, 5).map(key => (
                        <th key={key} className="px-3 py-2 border-b dark:border-white/5">{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-white/5">
                    {fileData.slice(0, 5).map((row, i) => (
                      <tr key={i}>
                        {Object.values(row).slice(0, 5).map((val, j) => (
                          <td key={j} className="px-3 py-2 text-slate-700 dark:text-slate-300 truncate max-w-[150px]">{String(val)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-slate-400 text-center">...and {Math.max(0, fileData.length - 5)} more rows.</p>
            </div>
          )}

          {/* STEP 3: RESULT */}
          {step === 3 && result && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="rounded-xl bg-green-50 p-4 dark:bg-green-900/20">
                  <p className="text-2xl font-bold text-green-600">{result.success}</p>
                  <p className="text-xs font-bold uppercase text-green-500">Success</p>
                </div>
                <div className="rounded-xl bg-amber-50 p-4 dark:bg-amber-900/20">
                  <p className="text-2xl font-bold text-amber-600">{result.skipped}</p>
                  <p className="text-xs font-bold uppercase text-amber-500">Skipped</p>
                </div>
                <div className="rounded-xl bg-red-50 p-4 dark:bg-red-900/20">
                  <p className="text-2xl font-bold text-red-600">{result.failed}</p>
                  <p className="text-xs font-bold uppercase text-red-500">Failed</p>
                </div>
              </div>

              {/* Log Details */}
              <div className="rounded-xl border bg-slate-50 p-4 max-h-60 overflow-y-auto dark:bg-black/20 dark:border-white/10">
                <h4 className="text-sm font-bold mb-3 text-slate-700 dark:text-slate-300">Detailed Logs:</h4>
                <div className="space-y-2">
                  {result.details.map((log, i) => (
                    <div key={i} className={cn(
                      "flex items-start gap-3 text-xs p-2 rounded border",
                      log.status === 'success' ? 'bg-green-50 border-green-100 text-green-800 dark:bg-green-900/10 dark:border-green-900/30 dark:text-green-300' :
                      log.status === 'skipped' ? 'bg-amber-50 border-amber-100 text-amber-800 dark:bg-amber-900/10 dark:border-amber-900/30 dark:text-amber-300' :
                      'bg-red-50 border-red-100 text-red-800 dark:bg-red-900/10 dark:border-red-900/30 dark:text-red-300'
                    )}>
                      {log.status === 'success' ? <Check size={14} className="mt-0.5" /> : 
                       log.status === 'skipped' ? <AlertTriangle size={14} className="mt-0.5" /> : 
                       <X size={14} className="mt-0.5" />}
                      <div>
                        <span className="font-bold">Row {log.row}: </span>
                        {log.message}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="border-t bg-slate-50 px-6 py-4 flex justify-end gap-3 dark:bg-white/5 dark:border-white/5">
          {step === 1 && (
            <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-white/10">Cancel</button>
          )}
          {step === 2 && (
            <>
              <button onClick={() => setStep(1)} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-white/10">Back</button>
              <button 
                onClick={handleImport} 
                disabled={importing}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {importing && <Loader2 size={16} className="animate-spin" />}
                Run Import
              </button>
            </>
          )}
          {step === 3 && (
            <button onClick={onClose} className="rounded-lg bg-slate-900 px-6 py-2 text-sm font-bold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900">Done</button>
          )}
        </div>
      </div>
    </div>
  );
}