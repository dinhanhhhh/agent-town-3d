'use client';

import React, { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Router Caught Error:', error);
  }, [error]);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950 text-slate-100 p-6 text-center font-sans">
      <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center text-3xl mb-4 shadow-xl shadow-rose-950/50">
        ⚠️
      </div>
      <h2 className="text-xl font-bold mb-2">Đã xảy ra sự cố giao diện</h2>
      <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
        {error?.message || 'Một lỗi không mong muốn đã xảy ra trên giao diện thị trấn 3D.'}
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => reset()}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition shadow-lg shadow-blue-950/50"
        >
          🔄 Thử lại
        </button>
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-sm transition border border-slate-700"
        >
          Tải lại trang
        </button>
      </div>
    </div>
  );
}
