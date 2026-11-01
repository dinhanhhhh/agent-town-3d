'use client';

import React, { useState } from 'react';
import { useTownStore } from '../../store/useTownStore';
import { STATIONS_LAYOUT } from '../../lib/scene/layout';
import { AgentRole } from '../../lib/pipeline/stages';
import { TOKENS } from '../../styles/tokens';
import { GitDiffViewer } from './GitDiffViewer';
import { ARTIFACT_PREVIEWS } from '../../lib/pipeline/contracts';
export { ARTIFACT_PREVIEWS };

export const ArtifactModal: React.FC = () => {
  const isArtifactModalOpen = useTownStore((s) => s.isArtifactModalOpen);
  const openArtifactModal = useTownStore((s) => s.openArtifactModal);
  const selectedAgentRole = useTownStore((s) => s.selectedAgentRole) || 'orchestrator';
  const agents = useTownStore((s) => s.agents);
  const events = useTownStore((s) => s.events);
  const realArtifacts = useTownStore((s) => s.realArtifacts);
  const isRealRunning = useTownStore((s) => s.isRealRunning);
  const streamingStage = useTownStore((s) => s.streamingStage);
  const updateAgentSystemPrompt = useTownStore((s) => s.updateAgentSystemPrompt);
  const resetAgentSystemPrompt = useTownStore((s) => s.resetAgentSystemPrompt);
  const rerunStage = useTownStore((s) => s.rerunStage);
  const agentModelProviders = useTownStore((s) => s.agentModelProviders);
  const setAgentModelProvider = useTownStore((s) => s.setAgentModelProvider);

  const [activeTab, setActiveTab] = useState<'artifact' | 'prompt' | 'events'>('artifact');
  const [copied, setCopied] = useState(false);

  const reviewComments = React.useMemo(() => {
    if (!realArtifacts.review?.content) return [];
    try {
      const parsed = JSON.parse(realArtifacts.review.content);
      if (Array.isArray(parsed.comments)) return parsed.comments;
    } catch {}
    return [];
  }, [realArtifacts.review]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isArtifactModalOpen) {
        openArtifactModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isArtifactModalOpen, openArtifactModal]);

  if (!isArtifactModalOpen) return null;

  const agent = agents[selectedAgentRole];
  const layout = STATIONS_LAYOUT[selectedAgentRole];
  const realArtifact = realArtifacts[selectedAgentRole];
  const artifact = realArtifact || ARTIFACT_PREVIEWS[selectedAgentRole];
  const isReal = Boolean(realArtifact);

  const handleCopy = () => {
    if (!artifact?.content) return;
    navigator.clipboard.writeText(artifact.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!artifact) return;
    const blob = new Blob([artifact.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = artifact.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) openArtifactModal(false);
      }}
      className="fixed inset-0 z-[1000] flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-hidden overscroll-contain"
    >
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[85vh] animate-scale-up overscroll-contain">
        {/* Modal Header */}
        <div className="flex items-center justify-between gap-2 px-4 py-3 sm:px-6 sm:py-4 bg-slate-950/80 border-b border-slate-800">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div
              className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-2xl flex items-center justify-center text-lg sm:text-xl shadow-md"
              style={{ backgroundColor: `${TOKENS.colors['surface-container']}` }}
            >
              {selectedAgentRole === 'orchestrator' ? '🎛️' : '🏢'}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white truncate">{layout?.name}</h2>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                  {layout?.tag}
                </span>
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    agent?.status === 'working'
                      ? 'bg-emerald-400'
                      : agent?.status === 'debugging'
                      ? 'bg-amber-400'
                      : agent?.status === 'error'
                      ? 'bg-rose-500'
                      : agent?.status === 'waiting'
                      ? 'bg-purple-400'
                      : 'bg-slate-400'
                  }`}
                />
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate">{agent?.category}</p>
            </div>
          </div>
          <button
            onClick={() => openArtifactModal(false)}
            className="w-8 h-8 shrink-0 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 pt-2.5 sm:pt-3 bg-slate-950/40 border-b border-slate-800 overflow-x-auto scrollbar-none flex-nowrap">
          <button
            onClick={() => setActiveTab('artifact')}
            className={`px-3 sm:px-4 py-2 text-xs font-bold rounded-t-xl transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'artifact'
                ? 'text-white border-blue-400 bg-slate-800/60'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            📦 Artifact: {artifact?.filename}
          </button>
          <button
            onClick={() => setActiveTab('prompt')}
            className={`px-3 sm:px-4 py-2 text-xs font-bold rounded-t-xl transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'prompt'
                ? 'text-white border-blue-400 bg-slate-800/60'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            🧠 System Prompt
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`px-3 sm:px-4 py-2 text-xs font-bold rounded-t-xl transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'events'
                ? 'text-white border-blue-400 bg-slate-800/60'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            📜 Nhật ký Sự kiện ({events.length})
          </button>
        </div>

        {/* Content Body */}
        <div className="p-3.5 sm:p-6 overflow-y-auto overscroll-contain flex-1 font-mono text-xs">
          {activeTab === 'artifact' && (
            <div className="bg-slate-950 p-3 sm:p-4 rounded-2xl border border-slate-800 overflow-x-auto text-slate-300 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800 text-[11px] text-slate-400 font-sans">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-200">File: {artifact?.filename}</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 font-mono">
                    {artifact?.language}
                  </span>
                  {isReal ? (
                    <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      AI ĐÃ SINH
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-[9px] font-bold bg-slate-800 text-slate-400 rounded-full">
                      MOCK DEMO
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  >
                    <span>{copied ? '✅ Đã chép' : '📋 Sao chép'}</span>
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 hover:text-white border border-blue-500/40 transition-colors"
                  >
                    <span>💾 Tải về máy</span>
                  </button>
                </div>
              </div>

              {artifact?.language === 'diff' || artifact?.filename.endsWith('.diff') ? (
                <GitDiffViewer
                  diffText={artifact.content}
                  filename={artifact.filename}
                  reviewComments={reviewComments}
                />
              ) : (
                <pre className="whitespace-pre font-mono text-xs leading-relaxed text-emerald-400 select-text overflow-x-auto">
                  {artifact?.content}
                </pre>
              )}
            </div>
          )}

          {activeTab === 'prompt' && (
            <div className="space-y-4 font-sans text-xs">
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                  Trạng thái hiện tại
                </span>
                <p className="text-sm font-semibold text-slate-200">"{agent?.speech}"</p>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                    Department Role SOP (AI Playground)
                  </span>
                  <button
                    onClick={() => resetAgentSystemPrompt(selectedAgentRole)}
                    className="text-[10px] font-semibold text-slate-400 hover:text-white underline underline-offset-2 transition-colors"
                    title="Khôi phục prompt mặc định của hệ thống"
                  >
                    ↩️ Khôi phục mặc định
                  </button>
                </div>

                <textarea
                  value={agent?.systemPrompt || ''}
                  onChange={(e) => updateAgentSystemPrompt(selectedAgentRole, e.target.value)}
                  rows={8}
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 font-mono text-xs leading-relaxed focus:outline-none focus:border-cyan-500 transition-colors resize-y"
                  placeholder="Nhập System Prompt tùy chỉnh cho Agent này..."
                />

                {/* Multi-Model Engine Selector */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-slate-900/90 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-300 font-semibold">
                    <span>🤖 Mô hình AI đảm nhiệm:</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {(['auto', 'gemini', 'deepseek'] as const).map((prov) => (
                      <button
                        key={prov}
                        type="button"
                        onClick={() => setAgentModelProvider(selectedAgentRole, prov)}
                        className={`px-2.5 py-1 text-[11px] font-medium rounded-lg border transition-all ${
                          (agentModelProviders[selectedAgentRole] || 'auto') === prov
                            ? prov === 'deepseek'
                              ? 'bg-blue-600 text-white border-blue-400 font-bold shadow-sm'
                              : prov === 'gemini'
                              ? 'bg-emerald-600 text-white border-emerald-400 font-bold shadow-sm'
                              : 'bg-indigo-600 text-white border-indigo-400 font-bold shadow-sm'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                        }`}
                      >
                        {prov === 'auto' ? '⚡ Auto' : prov === 'gemini' ? '♊ Gemini Flash' : '🐋 DeepSeek V3'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                  <span className="text-[10px] text-slate-400 font-sans">
                    🛡️ Output Contract (<code className="text-cyan-400">{artifact?.filename}</code> schema & thẻ thoại 3D) luôn được Server khóa bảo vệ tự động.
                  </span>
                  <button
                    onClick={() => rerunStage(selectedAgentRole)}
                    disabled={isRealRunning}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                      isRealRunning && streamingStage === selectedAgentRole
                        ? 'bg-amber-600/30 text-amber-300 border border-amber-500/50 cursor-not-allowed animate-pulse'
                        : isRealRunning
                        ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border border-blue-400/40 shadow-md shadow-blue-900/30'
                    }`}
                    title="Chạy lại khâu này với System Prompt mới"
                  >
                    {isRealRunning && streamingStage === selectedAgentRole ? (
                      <>
                        <div className="w-3 h-3 border-2 border-amber-300 border-t-transparent rounded-full animate-spin" />
                        <span>Đang chạy lại...</span>
                      </>
                    ) : (
                      <>
                        <span>🔄</span>
                        <span>Chạy lại trạm này</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'events' && (
            <div className="space-y-2">
              {events.slice(0, 15).map((evt) => (
                <div
                  key={evt.id}
                  className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start gap-3"
                >
                  <span className="text-sm">
                    {evt.severity === 'error'
                      ? '❌'
                      : evt.severity === 'warn'
                      ? '⚠️'
                      : '✅'}
                  </span>
                  <div className="flex-1">
                    <p className="text-xs text-slate-200 font-sans">{evt.message}</p>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(evt.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 bg-slate-950/70 border-t border-slate-800 text-xs text-slate-400">
          <span>Tọa độ 3D: [{layout?.position.join(', ')}]</span>
          <button
            onClick={() => openArtifactModal(false)}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors font-semibold"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
