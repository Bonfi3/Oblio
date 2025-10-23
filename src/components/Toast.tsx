'use client';

import React, { useState, useEffect } from 'react';

export interface ToastProps {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'loading';
  duration?: number;
  copyText?: string;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({
  id,
  message,
  type,
  duration = 4000,
  copyText,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Animate in
    setIsVisible(true);

    // Auto close after duration if finite and > 0
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (Number.isFinite(duration) && (duration as number) > 0) {
      timer = setTimeout(() => {
        handleClose();
      }, duration);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(id);
    }, 200); // Match the CSS transition duration
  };

  // Don't animate individual toasts since the container handles staggered entry
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const getTypeStyles = () => {
    switch (type) {
      case 'loading':
        return {
          borderColor: 'rgba(153, 69, 255, 0.4)',
          bgGradient: 'from-[rgba(153,69,255,0.1)] to-[rgba(20,241,149,0.05)]',
          textGradient: 'from-[#9945FF] to-[#14F195]',
          icon: '',
        };
      case 'success':
        return {
          borderColor: 'rgba(20, 241, 149, 0.4)',
          bgGradient: 'from-[rgba(20,241,149,0.1)] to-[rgba(153,69,255,0.05)]',
          textGradient: 'from-[#14F195] to-[#9945FF]',
          icon: '✓',
        };
      case 'error':
        return {
          borderColor: 'rgba(239, 68, 68, 0.4)',
          bgGradient: 'from-[rgba(239,68,68,0.1)] to-[rgba(153,69,255,0.05)]',
          textGradient: 'from-[#ef4444] to-[#9945FF]',
          icon: '✕',
        };
      case 'warning':
        return {
          borderColor: 'rgba(245, 158, 11, 0.4)',
          bgGradient: 'from-[rgba(245,158,11,0.1)] to-[rgba(153,69,255,0.05)]',
          textGradient: 'from-[#f59e0b] to-[#9945FF]',
          icon: '⚠',
        };
      default:
        return {
          borderColor: 'rgba(153, 69, 255, 0.4)',
          bgGradient: 'from-[rgba(153,69,255,0.1)] to-[rgba(20,241,149,0.05)]',
          textGradient: 'from-[#9945FF] to-[#14F195]',
          icon: 'ℹ',
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div
      className={`relative bg-black/90 backdrop-blur-sm border border-white/20 rounded-xl px-3 shadow-2xl transition-all duration-300 transform ${
        isExiting
          ? 'md:animate-slide-out-right animate-slide-out-bottom'
          : ''
      }`}
      style={{
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        animationFillMode: 'forwards',
        height: '48px',
        maxWidth: '320px',
      }}
    >
      {/* Animated background gradient */}
      {/* <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-50"></div> */}

      {/* Close button - positioned in top right */}
      {/* <button
        onClick={handleClose}
        className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/20 backdrop-blur-sm border border-white/10 flex items-center justify-center hover:bg-black/40 hover:border-white/20 transition-all duration-200 group z-10"
      >
        <svg
          className="w-2 h-2 text-white/60 group-hover:text-white transition-colors"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button> */}

      <div className="relative flex items-center gap-2 h-full">
        {/* Icon */}
        <div className="flex-shrink-0 w-4 h-4 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center">
          {type === 'loading' ? (
            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <span className="text-xs font-bold text-white">{styles.icon}</span>
          )}
        </div>

        {/* Message */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-white leading-tight truncate">
            {message}
          </p>
        </div>

        {/* Copy button */}
        {copyText && (
          <button
            onClick={async (e) => {
              e.stopPropagation();
              try {
                await navigator.clipboard.writeText(copyText);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              } catch (_) {}
            }}
            className={`ml-2 p-1 rounded-md border text-white transition-colors ${
              copied
                ? 'bg-[rgba(20,241,149,0.15)] border-[rgba(20,241,149,0.5)]'
                : 'bg-white/5 hover:bg-white/10 border-white/10'
            }`}
            aria-label={copied ? 'Copied' : 'Copy'}
            title={copied ? 'Copied' : 'Copy'}
          >
            {copied ? (
              <svg className="w-3.5 h-3.5 text-[#14F195]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export interface ToastContainerProps {
  toasts: Array<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info' | 'loading';
    duration?: number;
    copyText?: string;
  }>;
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed bottom-4 right-auto md:right-4 left-1/2 md:left-auto -translate-x-1/2 md:translate-x-0 z-50 space-y-2 pointer-events-none">
      <div className="space-y-2 pointer-events-auto">
        {toasts.map((toast, index) => (
          <div
            key={toast.id}
            className="animate-slide-in-bottom"
            style={{
              animationDelay: `${index * 80}ms`,
              animationFillMode: 'both',
            }}
          >
            <Toast
              id={toast.id}
              message={toast.message}
              type={toast.type}
              duration={toast.duration}
              copyText={toast.copyText}
              onClose={onRemove}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
