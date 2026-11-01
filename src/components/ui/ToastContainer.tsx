'use client';

import React, { useEffect } from 'react';
import { useTownStore, ToastItem } from '../../store/useTownStore';
import { STATIONS_LAYOUT } from '../../lib/scene/layout';

const ToastCard: React.FC<{ toast: ToastItem; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const roleLayout = toast.role ? STATIONS_LAYOUT[toast.role] : null;

  const severityStyles = {
    ok: 'border-emerald-500/60 bg-emerald-950/30 shadow-emerald-950/50 text-emerald-300',
    warn: 'border-amber-500/70 bg-amber-950/35 shadow-amber-950/50 text-amber-300',
    error: 'border-rose-500/70 bg-rose-950/40 shadow-rose-950/60 text-rose-300',
    info: 'border-cyan-500/60 bg-cyan-950/30 shadow-cyan-950/50 text-cyan-300',
  }[toast.severity];

  const barStyles = {
    ok: 'bg-emerald-400',
    warn: 'bg-amber-400',
    error: 'bg-rose-500',
    info: 'bg-cyan-400',
  }[toast.severity];

  return (
    <div
      role="alert"
      className={`pointer-events-auto relative overflow-hidden rounded-2xl border backdrop-blur-xl bg-slate-950/92 shadow-2xl p-3 sm:p-3.5 transition-all duration-300 animate-slide-down flex flex-col gap-1.5 ${severityStyles}`}
    >
      {/* Toast Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base sm:text-lg shrink-0">{toast.icon || '🔔'}</span>
          <div className="flex items-center gap-1.5 min-w-0">
            <h4 className="text-xs sm:text-[13px] font-bold text-white tracking-wide truncate">
              {toast.title}
            </h4>
            {roleLayout && (
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700/80 shrink-0">
                {roleLayout.name}
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          className="w-5 h-5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-xs transition-colors shrink-0"
          title="Đóng thông báo"
        >
          ✕
        </button>
      </div>

      {/* Toast Message */}
      <p className="text-[11px] sm:text-xs text-slate-200 leading-relaxed break-words font-medium pl-6 sm:pl-7">
        {toast.message}
      </p>

      {/* Action Button if present */}
      {toast.actionLabel && toast.onAction && (
        <div className="pl-6 sm:pl-7 pt-0.5 flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              toast.onAction?.();
              onDismiss(toast.id);
            }}
            className="px-2.5 py-1 rounded-xl text-[10px] sm:text-[11px] font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all flex items-center gap-1 shadow-sm"
          >
            <span>{toast.actionLabel}</span>
            <span>➔</span>
          </button>
        </div>
      )}

      {/* Depleting progress bar timer */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-800/60 overflow-hidden">
        <div
          className={`h-full ${barStyles} animate-[shrink_4.5s_linear_forwards]`}
          style={{ width: '100%' }}
        />
      </div>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const toasts = useTownStore((s) => s.toasts);
  const removeToast = useTownStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <aside
      aria-label="Thông báo hệ thống"
      className="fixed top-14 left-2 right-2 sm:top-16 sm:left-auto sm:right-4 z-[999] flex flex-col gap-2 sm:w-[380px] max-w-[calc(100vw-16px)] pointer-events-none select-none transition-all duration-300"
    >
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onDismiss={removeToast} />
      ))}
    </aside>
  );
};
