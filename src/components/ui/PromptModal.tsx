'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTownStore } from '../../store/useTownStore';

const SAMPLE_PROMPTS = [
  {
    title: 'Xác thực Google OAuth 2.0 & JWT',
    desc: 'Bao gồm login consent, refresh token 7 ngày và phân quyền JWT',
  },
  {
    title: 'REST API TodoList bằng TypeScript',
    desc: 'CRUD hoàn chỉnh chuẩn Clean Architecture, validation và error handling',
  },
  {
    title: 'Cổng thanh toán Stripe Webhook & HMAC',
    desc: 'Bảo mật chữ ký HMAC SHA256, xử lý payment_intent.succeeded',
  },
  {
    title: 'Phòng chat thời gian thực WebSocket',
    desc: 'Node.js ws, room broadcast, authentication token và Redis adapter',
  },
];

export const PromptModal: React.FC = () => {
  const isPromptModalOpen = useTownStore((s) => s.isPromptModalOpen);
  const openPromptModal = useTownStore((s) => s.openPromptModal);
  const isRealRunning = useTownStore((s) => s.isRealRunning);
  const apiKey = useTownStore((s) => s.apiKey);
  const openApiKeyModal = useTownStore((s) => s.openApiKeyModal);
  const runRealPipeline = useTownStore((s) => s.runRealPipeline);

  const [prompt, setPrompt] = useState('Xác thực Google OAuth 2.0 & JWT');
  const [scenario, setScenario] = useState<'feature' | 'bug' | 'security' | 'chaos'>('feature');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isPromptModalOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isPromptModalOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isPromptModalOpen) {
        openPromptModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPromptModalOpen, openPromptModal]);

  if (!isPromptModalOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || isRealRunning) return;
    runRealPipeline(prompt.trim(), scenario);
    openPromptModal(false);
  };

  const handleSelectSample = (sampleTitle: string) => {
    setPrompt(sampleTitle);
    inputRef.current?.focus();
  };

  return (
    <div className="fixed inset-0 z-[1050] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/90 rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-scale-up">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/80 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-xl shadow-lg shadow-blue-900/40">
              ✨
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                <span>Giao việc cho 8 Autonomous AI Agents</span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full">
                  Gemini Flash
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Orchestrate · PRD · Code · Review · Test · Security · Release
              </p>
            </div>
          </div>

          <button
            onClick={() => openPromptModal(false)}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors border border-slate-700/60"
          >
            <span>Esc</span>
            <span>✕</span>
          </button>
        </div>

        {/* Input Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Scenario Selector Pills */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Chọn Kịch bản Vận hành:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => {
                  setScenario('feature');
                  if (!prompt) setPrompt('Xác thực Google OAuth 2.0 & JWT');
                }}
                className={`p-2.5 rounded-xl text-left border transition-all ${
                  scenario === 'feature'
                    ? 'bg-blue-600/30 border-blue-400 text-blue-200 shadow-md shadow-blue-900/30'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="text-xs font-bold flex items-center gap-1.5">
                  <span>🟢</span>
                  <span>Feature Mới</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                  Happy path 7 trạm
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setScenario('bug');
                  setPrompt('Xử lý ngoại lệ token refresh và retry mechanism');
                }}
                className={`p-2.5 rounded-xl text-left border transition-all ${
                  scenario === 'bug'
                    ? 'bg-rose-600/30 border-rose-400 text-rose-200 shadow-md shadow-rose-900/30'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="text-xs font-bold flex items-center gap-1.5">
                  <span>🐛</span>
                  <span>Bug Loop</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                  QA bắt bug ➔ Sửa mã
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setScenario('security');
                  setPrompt('Quét bảo mật OWASP Top 10 và sanitize input');
                }}
                className={`p-2.5 rounded-xl text-left border transition-all ${
                  scenario === 'security'
                    ? 'bg-teal-600/30 border-teal-400 text-teal-200 shadow-md shadow-teal-900/30'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="text-xs font-bold flex items-center gap-1.5">
                  <span>🛡️</span>
                  <span>AppSec Audit</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                  Quét SAST & CVE
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setScenario('chaos');
                  setPrompt('Thử tải chịu lỗi: Traffic Surge 10x & HPA Auto-scaling');
                }}
                className={`p-2.5 rounded-xl text-left border transition-all ${
                  scenario === 'chaos'
                    ? 'bg-amber-600/30 border-amber-400 text-amber-200 shadow-md shadow-amber-900/30'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="text-xs font-bold flex items-center gap-1.5">
                  <span>🚨</span>
                  <span>Chaos Surge</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                  Bão tải ➔ Auto-scale
                </div>
              </button>
            </div>
          </div>

          {/* Main Prompt Input Box */}
          <div className="space-y-1.5">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Nhập tính năng bạn muốn các AI Agent xây dựng (VD: REST API TodoList bằng TypeScript)..."
                disabled={isRealRunning}
                className="w-full pl-4 pr-10 py-3.5 bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-2xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none transition-colors shadow-inner"
              />
              {prompt && (
                <button
                  type="button"
                  onClick={() => setPrompt('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs w-5 h-5 rounded-full flex items-center justify-center bg-slate-800"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Preset Suggestion Cards */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Hoặc chọn kịch bản mẫu:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SAMPLE_PROMPTS.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSample(sample.title)}
                  className="text-left p-3 rounded-2xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 transition-all group"
                >
                  <div className="text-xs font-bold text-slate-200 group-hover:text-blue-300 transition-colors">
                    {sample.title}
                  </div>
                  <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                    {sample.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Multi-Agent Pipeline Preview Flow */}
          <div className="p-3 bg-slate-950/50 border border-slate-800/80 rounded-2xl flex items-center justify-between text-[11px] text-slate-400 overflow-x-auto gap-1">
            <span className="text-slate-200 font-semibold flex items-center gap-1">
              <span>🏰</span> Hub
            </span>
            <span>➔</span>
            <span>🏢 PM</span>
            <span>➔</span>
            <span>🛠️ Dev</span>
            <span>➔</span>
            <span>🔍 Review</span>
            <span>➔</span>
            <span>🧪 QA</span>
            <span>➔</span>
            <span>🛡️ Sec</span>
            <span>➔</span>
            <span>🚀 DevOps</span>
            <span>➔</span>
            <span>📡 APM</span>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/60 border-t border-slate-800">
          {/* Key Button */}
          <button
            type="button"
            onClick={() => {
              openPromptModal(false);
              openApiKeyModal(true);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800/90 hover:bg-slate-700/90 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          >
            <span className={`w-2 h-2 rounded-full ${apiKey ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
            <span>{apiKey ? 'API Key: Đã kết nối' : 'Cấu hình Gemini API Key'}</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => openPromptModal(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!prompt.trim() || isRealRunning}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-lg ${
                !prompt.trim() || isRealRunning
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-900/40 hover:scale-[1.02]'
              }`}
            >
              <span>🚀 Bắt đầu lập trình</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/30 font-mono text-blue-200">
                Enter ↵
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
