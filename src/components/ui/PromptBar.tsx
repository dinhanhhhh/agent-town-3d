'use client';

import React, { useState } from 'react';
import { useTownStore } from '../../store/useTownStore';

const SAMPLE_PROMPTS = [
  'Xác thực đăng nhập Google OAuth 2.0 & JWT',
  'REST API TodoList chuẩn Clean Code bằng TypeScript',
  'Tích hợp cổng thanh toán Stripe Webhook & bảo mật HMAC',
  'Phòng chat đa người dùng qua WebSocket & Redis Pub/Sub',
];

export const PromptBar: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isRealRunning = useTownStore((s) => s.isRealRunning);
  const apiKey = useTownStore((s) => s.apiKey);
  const openApiKeyModal = useTownStore((s) => s.openApiKeyModal);
  const runRealPipeline = useTownStore((s) => s.runRealPipeline);
  const isSimulating = useTownStore((s) => s.isSimulating);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || isRealRunning) return;
    runRealPipeline(prompt.trim());
  };

  const handleSelectSample = (sample: string) => {
    setPrompt(sample);
  };

  return (
    <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-40 w-[94vw] max-w-2xl pointer-events-none transition-all duration-300">
      <div className="pointer-events-auto bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-2.5 shadow-2xl space-y-2">
        {/* Main Input Form */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Nhập tính năng bạn muốn 8 AI Agents lập trình (VD: REST API TodoList TypeScript)..."
              disabled={isRealRunning}
              className="w-full pl-9 pr-8 py-2 bg-slate-950/90 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-400 text-xs focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-60"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
              ✨
            </span>
            {prompt && !isRealRunning && (
              <button
                type="button"
                onClick={() => setPrompt('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs w-4 h-4 rounded-full flex items-center justify-center bg-slate-800"
              >
                ✕
              </button>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!prompt.trim() || isRealRunning}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md whitespace-nowrap ${
              isRealRunning
                ? 'bg-amber-600/50 text-amber-200 border border-amber-500/50 cursor-wait'
                : !prompt.trim()
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-900/40'
            }`}
          >
            {isRealRunning ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-amber-300 border-t-transparent rounded-full animate-spin" />
                <span>AI Đang làm...</span>
              </>
            ) : (
              <span>🚀 Chạy AI Thật</span>
            )}
          </button>

          {/* Key Settings Button */}
          <button
            type="button"
            onClick={() => openApiKeyModal(true)}
            className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap ${
              apiKey
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/50 hover:bg-emerald-900/40'
                : 'bg-amber-950/40 text-amber-300 border-amber-500/50 hover:bg-amber-900/40 animate-pulse'
            }`}
            title={apiKey ? 'API Key đã thiết lập' : 'Bấm để cấu hình Gemini API Key'}
          >
            <span className={`w-2 h-2 rounded-full ${apiKey ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <span>{apiKey ? 'Key OK' : 'Nhập Key'}</span>
          </button>

          {/* Collapse/Expand Toggle */}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-7 h-7 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors text-xs"
            title={isCollapsed ? 'Mở rộng bảng gợi ý' : 'Thu gọn bảng gợi ý'}
          >
            {isCollapsed ? '▲' : '▼'}
          </button>
        </form>

        {/* Suggestion Chips & Pipeline Status Indicator (Collapsible) */}
        {!isCollapsed && (
          <div className="flex flex-wrap items-center justify-between gap-1.5 pt-0.5 text-[11px] animate-fade-in border-t border-slate-800/80">
            <div className="flex flex-wrap items-center gap-1 text-slate-400">
              <span className="font-semibold text-slate-300 text-[10px] uppercase tracking-wide mr-0.5">
                Gợi ý:
              </span>
              {SAMPLE_PROMPTS.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSample(sample)}
                  disabled={isRealRunning}
                  className="px-2 py-0.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60 transition-colors disabled:opacity-40 text-[11px]"
                >
                  {sample}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              {isRealRunning ? (
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
                  Gemini Pipeline Live
                </span>
              ) : isSimulating ? (
                <span className="text-slate-400">
                  <strong className="text-amber-400">Mô phỏng Demo</strong> (Nhập prompt & bấm Chạy để AI thật lập trình)
                </span>
              ) : (
                <span className="text-slate-400">
                  <strong className="text-slate-200">Sẵn sàng nhận prompt</strong>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
