"use client";

import { useState, useEffect } from "react";
import { Calendar, Upload, Plus, X, Search } from "lucide-react";

/**
 * DatePicker Component - Advanced date input with calendar UI
 */
export function DatePicker({ value, onChange, required = false }) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [localValue, setLocalValue] = useState(value || "");

  useEffect(() => {
    setLocalValue(value || "");
  }, [value]);

  const handleDateChange = (e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange(newValue);
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="date"
          required={required}
          value={localValue}
          onChange={handleDateChange}
          className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 px-4 py-2.5 pr-10 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white dark:focus:bg-black/40 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
        />
        <Calendar
          size={18}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
      </div>
    </div>
  );
}

/**
 * FilePicker Component - File upload with preview
 */
export function FilePicker({
  value,
  onChange,
  accept = "image/*",
  required = false,
}) {
  const [preview, setPreview] = useState(value || null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      setPreview(result);
      onChange(result);
    };
    reader.readAsDataURL(file);
  };

  const handleClear = () => {
    setPreview(null);
    onChange(null);
  };

  return (
    <div className="space-y-3">
      <label className="flex h-32 cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 transition-colors hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-white/10">
        <Upload size={32} className="text-indigo-500" />
        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
          {preview ? "Change File" : "Upload File"}
        </span>
        <input
          type="file"
          accept={accept}
          required={required && !preview}
          className="hidden"
          onChange={handleFileChange}
        />
      </label>

      {preview && (
        <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-white/10">
          {preview.startsWith("data:image") ? (
            <img
              src={preview}
              alt="Preview"
              className="w-full h-40 object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-40 bg-slate-100 dark:bg-black/20 text-slate-400">
              File uploaded
            </div>
          )}
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-2 right-2 p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * RelationshipPicker Component - Foreign key selector with search
 */
export function RelationshipPicker({
  value,
  onChange,
  resourceKey,
  displayField = "name",
  required = false,
}) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    loadOptions();
  }, [resourceKey, searchQuery]);

  const loadOptions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: "50",
        ...(searchQuery && { search: searchQuery }),
      });

      const res = await fetch(`/api/admin/${resourceKey}?${params}`);
      const json = await res.json();
      setOptions(json.data || []);
    } catch (e) {
      console.error("Failed to load options:", e);
    } finally {
      setLoading(false);
    }
  };

  const selectedOption = options.find((opt) => opt.id === value);

  return (
    <div className="relative">
      <div
        onClick={() => setShowDropdown(!showDropdown)}
        className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 px-4 py-2.5 text-sm text-slate-900 dark:text-white cursor-pointer hover:border-indigo-500 transition-all"
      >
        {selectedOption ? selectedOption[displayField] : "Select..."}
      </div>

      {showDropdown && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 shadow-xl">
          <div className="p-2 border-b border-slate-200 dark:border-white/10">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border-none bg-slate-50 dark:bg-black/20 focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto p-2">
            {loading ? (
              <div className="text-center py-4 text-slate-400 text-sm">
                Loading...
              </div>
            ) : options.length === 0 ? (
              <div className="text-center py-4 text-slate-400 text-sm">
                No options found
              </div>
            ) : (
              options.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    onChange(opt.id);
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                >
                  {opt[displayField]}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      <input type="hidden" required={required && !value} value={value || ""} />
    </div>
  );
}

/**
 * ArrayEditor Component - Manage array/list fields
 */
export function ArrayEditor({
  value,
  onChange,
  placeholder = "Add item...",
  required = false,
}) {
  const [items, setItems] = useState(
    Array.isArray(value) ? value : value ? [value] : []
  );
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    onChange(items);
  }, [items]);

  const handleAdd = () => {
    if (!inputValue.trim()) return;
    setItems([...items, inputValue.trim()]);
    setInputValue("");
  };

  const handleRemove = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="flex-1 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
        >
          <Plus size={18} />
        </button>
      </div>

      {items.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/10 text-sm"
            >
              <span className="text-slate-700 dark:text-slate-300">{item}</span>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="text-slate-400 hover:text-red-500 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <input
        type="hidden"
        required={required && items.length === 0}
        value={JSON.stringify(items)}
      />
    </div>
  );
}

/**
 * TagInput Component - Similar to ArrayEditor but optimized for tags
 */
export function TagInput({
  value,
  onChange,
  suggestions = [],
  required = false,
}) {
  const [tags, setTags] = useState(
    Array.isArray(value)
      ? value
      : value
      ? value.split(",").map((t) => t.trim())
      : []
  );
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    onChange(tags);
  }, [tags]);

  const filteredSuggestions = suggestions.filter(
    (s) =>
      s.toLowerCase().includes(inputValue.toLowerCase()) && !tags.includes(s)
  );

  const handleAdd = (tag) => {
    if (!tag.trim() || tags.includes(tag.trim())) return;
    setTags([...tags, tag.trim()]);
    setInputValue("");
    setShowSuggestions(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd(inputValue);
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="flex flex-wrap gap-2 p-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium"
            >
              {tag}
              <button
                type="button"
                onClick={() => setTags(tags.filter((_, i) => i !== index))}
                className="hover:text-red-500 transition-colors"
              >
                <X size={14} />
              </button>
            </span>
          ))}
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setShowSuggestions(e.target.value.length > 0);
            }}
            onKeyDown={handleKeyPress}
            onFocus={() => setShowSuggestions(inputValue.length > 0)}
            placeholder={tags.length === 0 ? "Type and press Enter..." : ""}
            className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-sm text-slate-900 dark:text-white"
          />
        </div>

        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute z-50 mt-2 w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 shadow-xl p-2 max-h-40 overflow-y-auto">
            {filteredSuggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleAdd(suggestion)}
                className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      <input
        type="hidden"
        required={required && tags.length === 0}
        value={JSON.stringify(tags)}
      />
    </div>
  );
}
