import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, Info, AlertCircle, X } from 'lucide-react';

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

export default function ToastNotification({ toasts, onDismiss }) {
  return (
    <div className="toast-stack" aria-live="polite" aria-atomic="true">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function Toast({ toast, onDismiss }) {
  const Icon = icons[toast.type] || Info;

  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(toast.id), 4200);
    return () => window.clearTimeout(timer);
  }, [onDismiss, toast.id]);

  return (
    <motion.div
      className={`toast toast-${toast.type || 'info'}`}
      role={toast.type === 'error' ? 'alert' : 'status'}
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      transition={{ duration: 0.28 }}
    >
      <Icon size={17} strokeWidth={2.2} />
      <span>{toast.message}</span>
      <button className="toast-dismiss" onClick={() => onDismiss(toast.id)} aria-label="Dismiss notification">
        <X size={15} />
      </button>
    </motion.div>
  );
}

