import React, { useEffect } from "react";
import { CheckCircle, AlertCircle, X } from "lucide-react";

export interface ToastMessage {
  id: string;
  text: string;
  type: "success" | "error" | "info";
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full sm:w-auto">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} removeToast={removeToast} />
      ))}
    </div>
  );
};

interface ToastItemProps {
  toast: ToastMessage;
  removeToast: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, removeToast }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      removeToast(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, removeToast]);

  return (
    <div
      id={`toast-${toast.id}`}
      className={`flex items-center justify-between gap-3 p-4 rounded-xl shadow-lg border backdrop-blur-md transition-all duration-300 animate-slide-in
        ${
          toast.type === "success"
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
            : toast.type === "error"
            ? "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400"
            : "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400"
        }`}
    >
      <div className="flex items-center gap-2">
        {toast.type === "success" && <CheckCircle className="h-5 w-5 flex-shrink-0" />}
        {toast.type === "error" && <AlertCircle className="h-5 w-5 flex-shrink-0" />}
        {toast.type === "info" && <AlertCircle className="h-5 w-5 flex-shrink-0" />}
        <p className="text-sm font-medium">{toast.text}</p>
      </div>
      <button
        onClick={() => removeToast(toast.id)}
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-0.5 rounded-lg"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};
