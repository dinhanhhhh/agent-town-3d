'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTownStore } from '../../store/useTownStore';
import { AgentRole, STAGE_ORDER } from '../../lib/pipeline/stages';
import { STATIONS_LAYOUT } from '../../lib/scene/layout';
import { STAGE_PROMPT_CONFIGS } from '../../lib/pipeline/prompts';
import { AGENT_TECH_STACK, ARTIFACT_PREVIEWS } from '../../lib/pipeline/contracts';
import { GitDiffViewer } from './GitDiffViewer';
import { sfx } from '../../lib/audio/sfx';

const ROLE_ICONS: Record<AgentRole, string> = {
  orchestrator: '🎛️',
  pm: '📋',
  dev: '💻',
  review: '🔍',
  qa: '🧪',
  security: '🛡️',
  devops: '🚀',
  monitor: '📡',
};

const ROLE_SHORT_NAMES: Record<AgentRole, string> = {
  orchestrator: '0 · Hub',
  pm: '1 · PM',
  dev: '2 · Dev',
  review: '3 · Review',
  qa: '4 · QA',
  security: '5 · Sec',
  devops: '6 · Ops',
  monitor: '7 · APM',
};

/**
 * Trình Thanh Tra Trạm AI Chuẩn Game RTS (Station Inspector Panel):
 * - Không chặn mờ màn hình (Không dùng dark backdrop overlay).
 * - Focus camera 3D trực tiếp vào tọa độ trạm tương ứng.
 * - Trực quan hóa mã nguồn, PR diff, JSON báo cáo, SOP quy trình & prompt tùy chỉnh.
 * - Điều hướng lướt camera qua 8 phòng ban mượt mà theo chuỗi DAG.
 */
export const StationInspectorPanel: React.FC = () => {
  const selectedAgentRole = useTownStore((s) => s.selectedAgentRole);
  const selectAgent = useTownStore((s) => s.selectAgent);
  const agents = useTownStore((s) => s.agents);
  const realArtifacts = useTownStore((s) => s.realArtifacts);
  const isRealRunning = useTownStore((s) => s.isRealRunning);
  const streamingStage = useTownStore((s) => s.streamingStage);
  const streamingContent = useTownStore((s) => s.streamingContent);
  const abortPipeline = useTownStore((s) => s.abortPipeline);
  const updateAgentSystemPrompt = useTownStore((s) => s.updateAgentSystemPrompt);
  const resetAgentSystemPrompt = useTownStore((s) => s.resetAgentSystemPrompt);
  const rerunStage = useTownStore((s) => s.rerunStage);
  const agentModelProviders = useTownStore((s) => s.agentModelProviders);
  const setAgentModelProvider = useTownStore((s) => s.setAgentModelProvider);
  const openArtifactModal = useTownStore((s) => s.openArtifactModal);

  // Ẩn inspector khi có bất kỳ modal toàn màn hình nào đang mở
  const isApprovalModalOpen = useTownStore((s) => s.isApprovalModalOpen);
  const isPromptModalOpen = useTownStore((s) => s.isPromptModalOpen);
  const isApiKeyModalOpen = useTownStore((s) => s.isApiKeyModalOpen);
  const isDossierModalOpen = useTownStore((s) => s.isDossierModalOpen);
  const isArtifactModalOpen = useTownStore((s) => s.isArtifactModalOpen);
  const isExportModalOpen = useTownStore((s) => s.isExportModalOpen);

  const [activeTab, setActiveTab] = useState<'artifact' | 'prompt' | 'telemetry'>('artifact');
  const [copied, setCopied] = useState(false);
  const [promptSaved, setPromptSaved] = useState(false);
  const [promptText, setPromptText] = useState('');
  const [showRawJson, setShowRawJson] = useState(false);

  // Cập nhật nội dung promptText mỗi khi đổi trạm được chọn
  useEffect(() => {
    if (selectedAgentRole && agents[selectedAgentRole]) {
      setPromptText(agents[selectedAgentRole].systemPrompt || '');
      setShowRawJson(false);
      setPromptSaved(false);
    }
  }, [selectedAgentRole, agents]);

  // Phím tắt Escape để đóng thanh tra và trở về góc nhìn tổng quan
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedAgentRole && !isApprovalModalOpen && !isArtifactModalOpen && !isDossierModalOpen) {
        sfx.playPop();
        selectAgent(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedAgentRole, isApprovalModalOpen, isArtifactModalOpen, isDossierModalOpen, selectAgent]);

  // Phân tích review comments luôn đặt TRƯỚC early return để tuân thủ tuyệt đối React Rules of Hooks (tránh React Error #310/#300)
  const reviewArtifactSource =
    isRealRunning && streamingStage === 'review'
      ? streamingContent
      : realArtifacts.review?.content || ARTIFACT_PREVIEWS.review?.content || '';

  const reviewData = useMemo(() => {
    if (!reviewArtifactSource) return null;
    try {
      return JSON.parse(reviewArtifactSource);
    } catch {
      return null;
    }
  }, [reviewArtifactSource]);

  // Nếu không chọn trạm nào hoặc đang mở modal toàn màn hình khác thì không render
  if (
    !selectedAgentRole ||
    isApprovalModalOpen ||
    isPromptModalOpen ||
    isApiKeyModalOpen ||
    isDossierModalOpen ||
    isArtifactModalOpen ||
    isExportModalOpen
  ) {
    return null;
  }

  const agent = agents[selectedAgentRole];
  const layout = STATIONS_LAYOUT[selectedAgentRole];
  const techStack = AGENT_TECH_STACK[selectedAgentRole] || [];
  const realArtifact = realArtifacts[selectedAgentRole];
  const defaultArtifact = ARTIFACT_PREVIEWS[selectedAgentRole];
  const isStreamingHere = isRealRunning && streamingStage === selectedAgentRole;
  const artifactContent = isStreamingHere
    ? streamingContent
    : realArtifact?.content || defaultArtifact?.content || '';
  const artifactFilename = realArtifact?.filename || defaultArtifact?.filename || 'output.txt';
  const hexColor = '#' + (layout?.accentColor?.toString(16).padStart(6, '0') || '38bdf8');
  const currentIndex = STAGE_ORDER.indexOf(selectedAgentRole);

  const handleCopy = () => {
    if (!artifactContent) return;
    navigator.clipboard.writeText(artifactContent);
    sfx.playPop();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!artifactContent) return;
    sfx.playDeliveryChime();
    const blob = new Blob([artifactContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = artifactFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSavePrompt = () => {
    updateAgentSystemPrompt(selectedAgentRole, promptText);
    sfx.playPop();
    setPromptSaved(true);
    setTimeout(() => setPromptSaved(false), 2500);
  };

  const handleResetPrompt = () => {
    resetAgentSystemPrompt(selectedAgentRole);
    const defaultSop = STAGE_PROMPT_CONFIGS[selectedAgentRole]?.defaultRolePrompt || '';
    setPromptText(defaultSop);
    sfx.playPop();
    setPromptSaved(true);
    setTimeout(() => setPromptSaved(false), 2500);
  };

  const navigateStation = (direction: 'prev' | 'next') => {
    const nextIdx =
      direction === 'next'
        ? (currentIndex + 1) % STAGE_ORDER.length
        : (currentIndex - 1 + STAGE_ORDER.length) % STAGE_ORDER.length;
    sfx.playPop();
    selectAgent(STAGE_ORDER[nextIdx]);
  };

  return (
    <aside
      aria-label="Station Inspector"
      className="fixed top-14 sm:top-16 right-2 sm:right-3 bottom-11 sm:bottom-12 z-30 w-[420px] max-w-[calc(100vw-16px)] pointer-events-auto flex flex-col transition-all duration-300 animate-in fade-in slide-in-from-right-4"
    >
      <div className="flex-1 flex flex-col bg-slate-950/90 sm:bg-slate-950/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl shadow-slate-950/80 overflow-hidden ring-1 ring-cyan-500/20">
        {/* ==================== 1. TOP HEADER BAR ==================== */}
        <div
          className="p-3 sm:p-3.5 flex items-center justify-between gap-2 border-b border-slate-700/60 relative overflow-hidden shrink-0"
          style={{
            background: `linear-gradient(90deg, ${hexColor}25 0%, rgba(15, 23, 42, 0.9) 100%)`,
          }}
        >
          {/* Accent Line Glow */}
          <div
            className="absolute top-0 left-0 right-0 h-[2px]"
            style={{ backgroundColor: hexColor }}
          />

          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-xl flex items-center justify-center text-lg sm:text-xl font-bold shadow-lg ring-1 ring-white/20"
              style={{ backgroundColor: hexColor, color: '#ffffff' }}
            >
              {ROLE_ICONS[selectedAgentRole]}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-900/90 text-cyan-300 border border-slate-700">
                  {layout?.tag || `STATION ${currentIndex}`}
                </span>
                <h2 className="text-sm sm:text-base font-bold text-white truncate">
                  {layout?.name || selectedAgentRole}
                </h2>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.2 rounded-full ${
                    agent?.status === 'working'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : agent?.status === 'debugging'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      agent?.status === 'working'
                        ? 'bg-amber-400 animate-ping'
                        : agent?.status === 'debugging'
                        ? 'bg-rose-400 animate-pulse'
                        : 'bg-emerald-400'
                    }`}
                  />
                  {agent?.status === 'working'
                    ? 'ĐANG THỰC THI'
                    : agent?.status === 'debugging'
                    ? 'ĐANG DEBUG'
                    : 'SẴN SÀNG'}
                </span>
                <span className="text-[11px] text-slate-400 truncate hidden xs:inline">
                  · {agent?.category}
                </span>
              </div>
            </div>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Fly to Station Button */}
            <button
              onClick={() => {
                sfx.playPop();
                selectAgent(selectedAgentRole);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800/80 transition"
              title="Bay camera 3D zoom gần vào vị trí trạm này"
            >
              🎯
            </button>

            {/* Maximize to Full Modal */}
            <button
              onClick={() => {
                sfx.playPop();
                openArtifactModal(true);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition"
              title="Mở toàn màn hình để xem rộng hơn"
            >
              ⛶
            </button>

            {/* Close Button */}
            <button
              onClick={() => {
                sfx.playPop();
                selectAgent(null);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 transition font-bold"
              title="Đóng thanh tra & Trở về góc nhìn toàn cảnh (Esc)"
            >
              ✕
            </button>
          </div>
        </div>

        {/* ==================== 2. SUBHEADER: SPEECH & LIVE STREAM ==================== */}
        {agent?.speech && (
          <div className="px-3 pt-2 pb-1.5 bg-slate-900/60 border-b border-slate-800/60 shrink-0">
            <div className="flex items-start gap-2 p-2 rounded-xl bg-slate-950/70 border border-slate-800/90 text-xs">
              <span className="text-sm shrink-0">💬</span>
              <p className="italic text-slate-300 leading-relaxed font-sans line-clamp-2">
                {agent.speech}
              </p>
            </div>
          </div>
        )}

        {isStreamingHere && (
          <div className="px-3 py-1.5 bg-cyan-950/80 border-b border-cyan-500/40 flex items-center justify-between text-xs text-cyan-200 shrink-0 animate-pulse">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shrink-0" />
              <span className="font-bold truncate">Đang sinh mã AI trực tiếp...</span>
            </div>
            <button
              onClick={abortPipeline}
              className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] transition shrink-0"
            >
              ⏹ Dừng
            </button>
          </div>
        )}

        {/* ==================== 3. TOOLBAR: MODEL & ACTIONS ==================== */}
        <div className="px-3 py-2 bg-slate-900/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-1.5 shrink-0 text-xs">
          {/* Model Engine Selector */}
          <div className="flex items-center gap-1 bg-slate-950/80 p-0.5 rounded-lg border border-slate-800">
            {(['auto', 'gemini', 'deepseek'] as const).map((prov) => {
              const currentProv = agentModelProviders[selectedAgentRole] || 'auto';
              const isProvActive = currentProv === prov;
              return (
                <button
                  key={prov}
                  onClick={() => {
                    sfx.playPop();
                    setAgentModelProvider(selectedAgentRole, prov);
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition uppercase ${
                    isProvActive
                      ? 'bg-cyan-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                  title={`Chỉ định engine cho trạm này: ${prov}`}
                >
                  {prov === 'auto' ? '⚡ Auto' : prov === 'gemini' ? '♊ Gemini' : '🐳 DeepSeek'}
                </button>
              );
            })}
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1 ml-auto">
            <button
              onClick={() => {
                sfx.playPop();
                rerunStage(selectedAgentRole);
              }}
              disabled={isRealRunning}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold border transition flex items-center gap-1 ${
                isRealRunning
                  ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
                  : 'bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border-blue-500/40'
              }`}
              title="Chạy lại trạm AI này với prompt hiện tại"
            >
              <span>⚡</span> Chạy lại
            </button>

            <button
              onClick={handleCopy}
              className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition flex items-center gap-1"
              title="Sao chép toàn bộ nội dung sang bộ nhớ tạm"
            >
              <span>📋</span> {copied ? 'Đã chép!' : 'Chép'}
            </button>

            <button
              onClick={handleDownload}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title={`Tải xuống file ${artifactFilename}`}
            >
              💾
            </button>
          </div>
        </div>

        {/* ==================== 4. NAVIGATION TABS ==================== */}
        <div className="flex items-center border-b border-slate-800 bg-slate-900/40 px-2 shrink-0">
          <button
            onClick={() => {
              sfx.playPop();
              setActiveTab('artifact');
            }}
            className={`flex-1 py-2 px-1 text-center text-xs font-bold transition border-b-2 flex items-center justify-center gap-1.5 ${
              activeTab === 'artifact'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <span>💻</span>
            <span>Mã nguồn / Artifact</span>
          </button>

          <button
            onClick={() => {
              sfx.playPop();
              setActiveTab('prompt');
            }}
            className={`flex-1 py-2 px-1 text-center text-xs font-bold transition border-b-2 flex items-center justify-center gap-1.5 ${
              activeTab === 'prompt'
                ? 'border-purple-400 text-purple-300 bg-purple-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <span>📝</span>
            <span>SOP & Prompt</span>
          </button>

          <button
            onClick={() => {
              sfx.playPop();
              setActiveTab('telemetry');
            }}
            className={`flex-1 py-2 px-1 text-center text-xs font-bold transition border-b-2 flex items-center justify-center gap-1.5 ${
              activeTab === 'telemetry'
                ? 'border-emerald-400 text-emerald-300 bg-emerald-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <span>📊</span>
            <span>Chỉ số</span>
          </button>
        </div>

        {/* ==================== 5. TAB CONTENT BODY ==================== */}
        <div className="flex-1 overflow-y-auto p-3 text-slate-200 text-xs font-mono scrollbar-thin scrollbar-thumb-slate-700">
          {/* TAB 1: ARTIFACT & CODE VIEW */}
          {activeTab === 'artifact' && (
            <div className="space-y-3">
              {/* File Info Bar */}
              <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm">📄</span>
                  <span className="font-bold text-white truncate">{artifactFilename}</span>
                  {realArtifact ? (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      LIVE AI
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                      MOCK
                    </span>
                  )}
                </div>

                {selectedAgentRole === 'review' && (
                  <button
                    onClick={() => setShowRawJson(!showRawJson)}
                    className="text-[10px] text-cyan-300 hover:underline shrink-0"
                  >
                    {showRawJson ? 'Xem thẻ Review' : 'Xem Raw JSON'}
                  </button>
                )}
              </div>

              {/* Dev Lab: Interactive Unified / Split Git Diff Viewer */}
              {selectedAgentRole === 'dev' && (
                <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
                  <GitDiffViewer
                    diffText={artifactContent}
                    filename={artifactFilename}
                    reviewComments={
                      reviewData?.comments && Array.isArray(reviewData.comments)
                        ? reviewData.comments
                        : []
                    }
                  />
                </div>
              )}

              {/* Tech Review: Interactive Cards or JSON */}
              {selectedAgentRole === 'review' && !showRawJson && reviewData && (
                <div className="space-y-2.5">
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400">KẾT LUẬN KIỂM ĐỊNH</span>
                      <h4
                        className={`text-base font-bold ${
                          reviewData.verdict === 'APPROVED' ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {reviewData.verdict === 'APPROVED' ? '✅ LGTM · APPROVED' : '⚠️ CHANGES REQUESTED'}
                      </h4>
                    </div>
                    {typeof reviewData.score === 'number' && (
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400">ĐIỂM ĐÁNH GIÁ</span>
                        <p className="text-base font-bold text-cyan-300">{reviewData.score} / 10</p>
                      </div>
                    )}
                  </div>

                  {reviewData.summary && (
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Tổng quan kiến trúc:
                      </span>
                      <p className="text-xs text-slate-300 font-sans leading-relaxed">
                        {reviewData.summary}
                      </p>
                    </div>
                  )}

                  {Array.isArray(reviewData.comments) && reviewData.comments.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Nhận xét trực tiếp ({reviewData.comments.length} dòng):
                      </span>
                      {reviewData.comments.map((cm: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-xs"
                        >
                          <div className="flex items-center justify-between gap-1 text-[10px] text-slate-400 mb-1">
                            <span className="font-bold text-cyan-300">
                              {cm.file || 'oauth.service.ts'}:{cm.line || idx + 1}
                            </span>
                            <span className="px-1.5 py-0.2 rounded bg-slate-800 text-amber-300 border border-slate-700">
                              {cm.status || 'LGTM'}
                            </span>
                          </div>
                          <p className="text-slate-300 font-sans">{cm.note}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Other Roles: Formatted Code Block */}
              {(selectedAgentRole !== 'dev' && (selectedAgentRole !== 'review' || showRawJson)) && (
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 overflow-x-auto">
                  <pre className="text-slate-300 leading-relaxed font-mono whitespace-pre-wrap word-break">
                    {artifactContent || '(Chưa có dữ liệu sinh ra từ trạm này)'}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SOP & SYSTEM PROMPT EDIT */}
          {activeTab === 'prompt' && (
            <div className="space-y-3">
              <div className="p-2.5 rounded-xl bg-purple-950/20 border border-purple-500/30 text-xs text-purple-200">
                <span className="font-bold block mb-0.5">Quy trình chuẩn SOP & Vai trò chuyên môn:</span>
                <p className="text-slate-300 font-sans leading-relaxed">
                  {STAGE_PROMPT_CONFIGS[selectedAgentRole]?.defaultRolePrompt?.split('\n')?.[0] ||
                    'Tiếp nhận input liên phòng ban và thực thi trách nhiệm chuyên môn.'}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold text-slate-300">
                    System Prompt Tùy Chỉnh:
                  </label>
                  <button
                    onClick={handleResetPrompt}
                    className="text-[10px] text-slate-400 hover:text-rose-300 hover:underline transition"
                  >
                    ↺ Khôi phục mặc định
                  </button>
                </div>

                <textarea
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  rows={12}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-slate-200 font-mono text-xs leading-relaxed resize-none outline-none"
                  placeholder="Nhập System Prompt chuyên biệt cho trạm này..."
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <span className="text-[10px] text-slate-400">
                  {promptSaved ? (
                    <span className="text-emerald-400 font-bold">✓ Đã lưu Prompt thành công!</span>
                  ) : (
                    'Thay đổi sẽ áp dụng ngay cho lần chạy AI tiếp theo.'
                  )}
                </span>
                <button
                  onClick={handleSavePrompt}
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition shadow-lg shadow-purple-900/30"
                >
                  💾 Lưu Thay Đổi
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: TELEMETRY & TECH STACK */}
          {activeTab === 'telemetry' && (
            <div className="space-y-3">
              {/* Tech Stack Badges */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Công Nghệ & Công Cụ Sử Dụng:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {techStack.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-1 rounded-lg bg-slate-800/90 text-slate-200 border border-slate-700 text-[11px] font-sans font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* 3D Geometry & Map Info */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Tọa Độ 3D & Bố Cục Đảo:
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-sans">
                  <div className="p-2 rounded bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Vị trí 3D [X, Y, Z]</span>
                    <span className="font-mono text-cyan-300 font-bold">
                      [{layout?.position.join(', ')}]
                    </span>
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Kiểu Kiến Trúc</span>
                    <span className="capitalize font-bold text-white">
                      {layout?.buildingType || 'Phòng Lab'}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Góc Xoay Hướng Tâm</span>
                    <span className="font-mono text-amber-300 font-bold">
                      {((layout?.rotationY || 0) * (180 / Math.PI)).toFixed(0)}°
                    </span>
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Mã Màu Nhận Diện</span>
                    <span className="font-mono font-bold" style={{ color: hexColor }}>
                      {hexColor}
                    </span>
                  </div>
                </div>
              </div>

              {/* DAG Pipeline Flow */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Vị Trí Trong Chuỗi DAG:
                </span>
                <div className="flex items-center justify-between text-xs font-sans p-2 rounded bg-slate-950 border border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Trạm Phía Trước</span>
                    <span className="font-bold text-slate-300">
                      {currentIndex === 0 ? 'User Prompt / GitHub' : ROLE_SHORT_NAMES[STAGE_ORDER[currentIndex - 1]]}
                    </span>
                  </div>
                  <span className="text-cyan-400 font-bold">➔</span>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Trạm Kế Tiếp</span>
                    <span className="font-bold text-cyan-300">
                      {currentIndex === STAGE_ORDER.length - 1 ? 'Production Cluster' : ROLE_SHORT_NAMES[STAGE_ORDER[currentIndex + 1]]}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ==================== 6. FOOTER: STATION CAROUSEL NAVIGATOR ==================== */}
        <div className="p-2 sm:p-2.5 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between gap-1 shrink-0">
          <button
            onClick={() => navigateStation('prev')}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition text-xs font-bold shrink-0"
            title="Bay camera tới trạm trước đó (‹)"
          >
            ‹ Trước
          </button>

          {/* Quick 8-Station Strip */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none px-1">
            {STAGE_ORDER.map((role) => {
              const isThisSelected = selectedAgentRole === role;
              return (
                <button
                  key={role}
                  onClick={() => {
                    sfx.playPop();
                    selectAgent(role);
                  }}
                  className={`px-1.5 py-1 rounded-md text-[10px] font-bold transition whitespace-nowrap flex items-center gap-1 ${
                    isThisSelected
                      ? 'bg-cyan-500 text-slate-950 shadow-md ring-1 ring-cyan-300'
                      : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                  }`}
                  title={STATIONS_LAYOUT[role]?.name}
                >
                  <span>{ROLE_ICONS[role]}</span>
                  <span className="hidden xs:inline">{ROLE_SHORT_NAMES[role].split(' · ')[1]}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => navigateStation('next')}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition text-xs font-bold shrink-0"
            title="Bay camera tới trạm tiếp theo (›)"
          >
            Sau ›
          </button>
        </div>
      </div>
    </aside>
  );
};
