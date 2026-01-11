"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const ToastContext = createContext(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message, type = "info", duration = 5000) => {
      const id = Date.now() + Math.random();
      const newToast = { id, message, type, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [removeToast]
  );

  const toast = {
    success: (message, duration) => addToast(message, "success", duration),
    error: (message, duration) => addToast(message, "error", duration),
    warning: (message, duration) => addToast(message, "warning", duration),
    info: (message, duration) => addToast(message, "info", duration),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function Toast({ id, message, type, onClose }) {
  const config = {
    success: {
      icon: CheckCircle,
      className: "bg-emerald-500 text-white border-emerald-600",
      iconClassName: "text-emerald-100",
    },
    error: {
      icon: AlertCircle,
      className: "bg-red-500 text-white border-red-600",
      iconClassName: "text-red-100",
    },
    warning: {
      icon: AlertTriangle,
      className: "bg-yellow-500 text-white border-yellow-600",
      iconClassName: "text-yellow-100",
    },
    info: {
      icon: Info,
      className: "bg-blue-500 text-white border-blue-600",
      iconClassName: "text-blue-100",
    },
  };

  const { icon: Icon, className, iconClassName } = config[type] || config.info;

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border-2 px-4 py-3 shadow-2xl backdrop-blur-xl pointer-events-auto animate-in slide-in-from-right-full duration-300",
        className
      )}
    >
      <Icon size={20} className={iconClassName} />
      <p className="text-sm font-semibold flex-1 mr-2">{message}</p>
      <button
        onClick={onClose}
        className="rounded-full p-1 hover:bg-white/20 transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
}
