"use client";

import { useState } from "react";
import { X, Save, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "./ToastProvider";
import { validateField } from "@/lib/validators";

export default function BatchEditModal({
  resourceKey,
  config,
  selectedIds,
  onClose,
  onSuccess,
}) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedField, setSelectedField] = useState("");
  const [fieldValue, setFieldValue] = useState("");
  const [errors, setErrors] = useState({});

  const editableFields = config.fields.filter(
    (f) => !f.readOnly && f.type !== "json" && f.key !== config.primaryKey
  );

  const selectedFieldConfig = editableFields.find(
    (f) => f.key === selectedField
  );

  const handleFieldChange = (field) => {
    setSelectedField(field);
    setFieldValue("");
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedField) {
      toast.error("Please select a field to edit");
      return;
    }

    // Validate field value
    const validation = validateField(selectedFieldConfig, fieldValue);
    if (!validation.valid) {
      setErrors({ [selectedField]: validation.error });
      toast.error("Invalid value");
      return;
    }

    setLoading(true);

    try {
      // Process updates
      let successCount = 0;
      let failCount = 0;
      const updatePromises = [];

      for (const id of selectedIds) {
        const promise = fetch(`/api/admin/${resourceKey}/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ [selectedField]: fieldValue }),
        })
          .then((res) => {
            if (res.ok) successCount++;
            else failCount++;
          })
          .catch(() => failCount++);

        updatePromises.push(promise);
      }

      await Promise.all(updatePromises);

      if (successCount > 0) {
        toast.success(`Successfully updated ${successCount} record(s)`);
      }
      if (failCount > 0) {
        toast.warning(`Failed to update ${failCount} record(s)`);
      }

      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Batch update failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-2xl animate-in fade-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 px-6 py-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Batch Edit
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Update {selectedIds.size} selected record(s)
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Field Selector */}
          <div>
            <label className="mb-2 block text-sm font-bold uppercase tracking-wider text-slate-400">
              Select Field to Update
            </label>
            <select
              value={selectedField}
              onChange={(e) => handleFieldChange(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
            >
              <option value="">Choose a field...</option>
              {editableFields.map((field) => (
                <option key={field.key} value={field.key}>
                  {field.label}
                </option>
              ))}
            </select>
          </div>

          {/* Value Input */}
          {selectedField && (
            <div>
              <label className="mb-2 block text-sm font-bold uppercase tracking-wider text-slate-400">
                New Value
              </label>
              {renderInput(selectedFieldConfig, fieldValue, setFieldValue)}
              {errors[selectedField] && (
                <div className="flex items-center gap-2 mt-2 text-xs text-red-600 dark:text-red-400">
                  <AlertCircle size={14} />
                  <span>{errors[selectedField]}</span>
                </div>
              )}
            </div>
          )}

          {/* Warning */}
          <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle
                size={20}
                className="text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0"
              />
              <div className="text-sm text-amber-700 dark:text-amber-300">
                <p className="font-semibold mb-1">Warning</p>
                <p>
                  This will update <strong>{selectedIds.size} record(s)</strong>
                  . This action cannot be undone.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-slate-200 dark:border-white/10 pt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedField}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 transition-all disabled:opacity-50"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              Update All
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function renderInput(field, value, onChange) {
  const commonClasses =
    "w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white dark:focus:bg-black/40 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all";

  switch (field?.type) {
    case "textarea":
      return (
        <textarea
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          className={commonClasses}
          placeholder={`Enter ${field.label}...`}
        />
      );

    case "select":
      return (
        <select
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={commonClasses}
        >
          <option value="">Select...</option>
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );

    case "number":
      return (
        <input
          type="number"
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={commonClasses}
          placeholder={`Enter ${field.label}...`}
          min={field.min}
          max={field.max}
          step={field.step || 1}
        />
      );

    case "boolean":
      return (
        <select
          required
          value={value}
          onChange={(e) => onChange(e.target.value === "true")}
          className={commonClasses}
        >
          <option value="">Select...</option>
          <option value="true">True</option>
          <option value="false">False</option>
        </select>
      );

    case "date":
      return (
        <input
          type="date"
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={commonClasses}
        />
      );

    default:
      return (
        <input
          type="text"
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={commonClasses}
          placeholder={`Enter ${field?.label || "value"}...`}
        />
      );
  }
}
