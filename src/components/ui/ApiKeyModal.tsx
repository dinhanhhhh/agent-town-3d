'use client';

import React, { useState, useEffect } from 'react';
import { useTownStore } from '../../store/useTownStore';

export const ApiKeyModal: React.FC = () => {
  const isApiKeyModalOpen = useTownStore((s) => s.isApiKeyModalOpen);
  const openApiKeyModal = useTownStore((s) => s.openApiKeyModal);
  const currentGeminiKey = useTownStore((s) => s.apiKey);
  const currentDeepseekKey = useTownStore((s) => s.deepseekApiKey);
  const setApiKey = useTownStore((s) => s.setApiKey);
  const setDeepseekApiKey = useTownStore((s) => s.setDeepseekApiKey);

  const [geminiKeyInput, setGeminiKeyInput] = useState('');
  const [deepseekKeyInput, setDeepseekKeyInput] = useState('');
  const [showGemini, setShowGemini] = useState(false);
  const [showDeepseek, setShowDeepseek] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isApiKeyModalOpen) {
      setGeminiKeyInput(currentGeminiKey);
      setDeepseekKeyInput(currentDeepseekKey);
      setSavedSuccess(false);
    }
  }, [isApiKeyModalOpen, currentGeminiKey, currentDeepseekKey]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isApiKeyModalOpen) {
        openApiKeyModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isApiKeyModalOpen, openApiKeyModal]);

  if (!isApiKeyModalOpen) return null;

  const handleSave = () => {
    // Tự động phân loại nếu người dùng dán nhầm ô
    let finalGemini = geminiKeyInput.trim();
    let finalDeepseek = deepseekKeyInput.trim();

    if (finalGemini.startsWith('sk-') && !finalDeepseek) {
      finalDeepseek = finalGemini;
      finalGemini = '';
    } else if (finalDeepseek.startsWith('AIza') && !finalGemini) {
      finalGemini = finalDeepseek;
      finalDeepseek = '';
    }

    setApiKey(finalGemini);
    setDeepseekApiKey(finalDeepseek);
    setSavedSuccess(true);
    setTimeout(() => {
      openApiKeyModal(false);
    }, 800);
  };

  const handleClearAll = () => {
    setApiKey('');
    setDeepseekApiKey('');
    setGeminiKeyInput('');
    setDeepseekKeyInput('');
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) openApiKeyModal(false);
      }}
      className="fixed inset-0 z-[1100] flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-hidden overscroll-contain"
    >
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94dvh] animate-scale-up overscroll-contain">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 bg-slate-950/80 border-b border-slate-800">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-lg sm:text-xl">
              🔑
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                Cấu hình Multi-Model AI Keys
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400">
                Google Gemini & DeepSeek Hybrid Architecture
              </p>
            </div>
          </div>
          <button
            onClick={() => openApiKeyModal(false)}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto overscroll-contain">
          {/* Key 1: Google Gemini */}
          <div className="space-y-1.5 p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <span>♊ Google Gemini API Key</span>
                <span className="px-1.5 py-0.5 text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded font-normal">
                  Google AI Studio Free Tier
                </span>
              </label>
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-emerald-400 hover:underline flex items-center gap-0.5 font-medium"
              >
                Lấy key ↗
              </a>
            </div>
            <div className="relative">
              <input
                type={showGemini ? 'text' : 'password'}
                value={geminiKeyInput}
                onChange={(e) => setGeminiKeyInput(e.target.value)}
                placeholder="AIzaSy... (Khuyến nghị cho PM, Review, QA, DevOps)"
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-emerald-500 transition-colors pr-10"
              />
              <button
                type="button"
                onClick={() => setShowGemini(!showGemini)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs"
              >
                {showGemini ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Key 2: DeepSeek */}
          <div className="space-y-1.5 p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                <span>🐋 DeepSeek API Key</span>
                <span className="px-1.5 py-0.5 text-[9px] bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded font-normal">
                  sk-...
                </span>
              </label>
              <a
                href="https://platform.deepseek.com"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-blue-400 hover:underline flex items-center gap-0.5 font-medium"
              >
                Lấy key ↗
              </a>
            </div>
            <div className="relative">
              <input
                type={showDeepseek ? 'text' : 'password'}
                value={deepseekKeyInput}
                onChange={(e) => setDeepseekKeyInput(e.target.value)}
                placeholder="sk-... (Khuyến nghị cho Dev lập trình & DevSecOps quét SAST)"
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-blue-500 transition-colors pr-10"
              />
              <button
                type="button"
                onClick={() => setShowDeepseek(!showDeepseek)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs"
              >
                {showDeepseek ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Note Card */}
          <div className="p-3 bg-slate-950/50 border border-slate-800/80 rounded-2xl space-y-1.5 text-xs text-slate-400">
            <div className="flex items-center gap-1.5 text-slate-200 font-semibold text-[11px]">
              <span>💡</span>
              <span>Cơ chế Multi-Model Hybrid:</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Bạn có thể nhập một trong hai hoặc cả hai key. Trong tab <strong>System Prompt</strong> của từng Agent, bạn có thể tự do gán từng phòng ban dùng model Gemini Flash hoặc DeepSeek Coder riêng biệt!
            </p>
          </div>

          {savedSuccess && (
            <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-semibold text-center animate-fade-in">
              ✅ Đã lưu cấu hình Multi-Model API Keys thành công!
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/50 border-t border-slate-800">
          {currentGeminiKey || currentDeepseekKey ? (
            <button
              onClick={handleClearAll}
              className="text-xs text-rose-400 hover:text-rose-300 hover:underline"
            >
              Xóa tất cả Key
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={() => openApiKeyModal(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-lg shadow-blue-900/30"
            >
              Lưu & Áp dụng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
