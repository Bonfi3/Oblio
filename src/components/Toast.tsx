'use client';

import React, { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface ToastLink {
  href: string;
  label: string;
}

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  link?: ToastLink;
}

interface ToastProps extends ToastItem {
  onClose: (id: string) => void;
}

const Icon = ({ type }: { type: ToastType }) => {
  if (type === 'loading') {
    return <span className="block h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin motion-reduce:animate-none" />;
  }
  const paths: Record<Exclude<ToastType, 'loading'>, string> = {
    success: 'M5 13l4 4L19 7',
    error: 'M6 18L18 6M6 6l12 12',
    warning: 'M12 8v5m0 3.5v.01',
    info: 'M12 11v6m0-9.5v.01',
  };
  return (
    <svg
      className={`h-4 w-4 ${type === 'error' ? 'text-[#F97066]' : 'text-white'}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.25} d={paths[type]} />
    </svg>
  );
};

export const Toast: React.FC<ToastProps> = ({ id, message, type, duration = 4000, link, onClose }) => {
  useEffect(() => {
    if (!Number.isFinite(duration) || duration <= 0) return;
    const timer = setTimeout(() => onClose(id), duration);
    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      className="animate-toast-in pointer-events-auto flex w-full items-center gap-3 rounded-[4px] bg-ink px-4 py-3 text-sm text-white shadow-[0_12px_32px_rgba(0,0,0,0.2)] sm:w-[360px]"
    >
      <Icon type={type} />
      <p className="min-w-0 flex-1 leading-snug">{message}</p>
      {link && (
        <a
          href={link.href}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 font-medium underline decoration-white/40 underline-offset-4 hover:decoration-white"
        >
          {link.label}
        </a>
      )}
      {type !== 'loading' && (
        <button
          onClick={() => onClose(id)}
          className="-mr-1 shrink-0 rounded-[2px] p-1 text-white/60 hover:text-white"
          aria-label="Dismiss"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

export const ToastContainer: React.FC<{ toasts: ToastItem[]; onRemove: (id: string) => void }> = ({
  toasts,
  onRemove,
}) => (
  <div
    aria-live="polite"
    className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col items-end gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6"
  >
    {toasts.map((toast) => (
      <Toast key={toast.id} {...toast} onClose={onRemove} />
    ))}
  </div>
);
