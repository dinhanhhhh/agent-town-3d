'use client';

import React, { useState, useEffect } from 'react';
import { useTownStore } from '../../store/useTownStore';

export const ApiKeyModal: React.FC = () => {
  const isApiKeyModalOpen = useTownStore((s) => s.isApiKeyModalOpen);
  const openApiKeyModal = useTownStore((s) => s.openApiKeyModal);
  const currentKey = useTownStore((s) => s.apiKey);
  const setApiKey = useTownStore((s) => s.setApiKey);

  const [inputKey, setInputKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isApiKeyModalOpen) {
      setInputKey(currentKey);
      setSavedSuccess(false);
    }
  }, [isApiKeyModalOpen, currentKey]);

  if (!isApiKeyModalOpen) return null;

  const isDeepSeek = inputKey.trim().startsWith('sk-');
  const isGemini = inputKey.trim().startsWith('AIza');

  const handleSave = () => {
    setApiKey(inputKey.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      openApiKeyModal(false);
    }, 800);
  };

  const handleClear = () => {
    setApiKey('');
    setInputKey('');
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/80 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-xl">
              🔑
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Cấu hình AI API Key
              </h2>
              <p className="text-xs text-slate-400">
                Hỗ trợ DeepSeek & Google Gemini
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
        <div className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>DeepSeek hoặc Gemini API Key:</span>
              <span className="text-[10px] text-slate-400">
                {isDeepSeek ? (
                  <span className="text-blue-400 font-bold">🤖 Nhận diện: DeepSeek</span>
                ) : isGemini ? (
                  <span className="text-emerald-400 font-bold">✨ Nhận diện: Gemini</span>
                ) : (
                  <span>Tự động nhận diện</span>
                )}
              </span>
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="sk-... (DeepSeek) hoặc AIzaSy... (Gemini)"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-blue-500 transition-colors pr-10"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs"
              >
                {showKey ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Quick links to get API keys */}
          <div className="flex items-center justify-between text-[11px] px-1 text-slate-400">
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-400 hover:underline flex items-center gap-1 font-medium"
            >
              ✨ Lấy Gemini Key miễn phí 100% ↗
            </a>
            <a
              href="https://platform.deepseek.com"
              target="_blank"
              rel="noreferrer"
              className="text-blue-400 hover:underline flex items-center gap-1 font-medium"
            >
              🤖 Nạp tiền DeepSeek ↗
            </a>
          </div>

          {/* Guide Card */}
          <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2 text-xs text-slate-400">
            <div className="flex items-center gap-2 text-slate-200 font-semibold">
              <span>💡</span>
              <span>Lưu ý về các nhà cung cấp:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400">
              <li>
                <strong className="text-blue-300">DeepSeek (sk-...):</strong> Cần tài khoản có số dư (credit &gt; $0). Nếu tài khoản hết số dư sẽ báo <em>Insufficient Balance</em>.
              </li>
              <li>
                <strong className="text-emerald-300">Google Gemini (AIza...):</strong> Miễn phí hoàn toàn 100%, không cần thẻ visa/nạp tiền.
              </li>
            </ul>
          </div>

          {savedSuccess && (
            <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-semibold text-center animate-fade-in">
              ✅ Đã lưu API Key thành công!
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/50 border-t border-slate-800">
          {currentKey ? (
            <button
              onClick={handleClear}
              className="text-xs text-rose-400 hover:text-rose-300 hover:underline"
            >
              Xóa Key đã lưu
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
              Lưu & Kích hoạt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
