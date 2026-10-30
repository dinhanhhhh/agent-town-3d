'use client';

import React from 'react';
import { useTownStore } from '../../store/useTownStore';
import { simulator } from '../../lib/events/MockSimulator';

export const Topbar: React.FC = () => {
  const themeMode = useTownStore((s) => s.themeMode);
  const setThemeMode = useTownStore((s) => s.setThemeMode);
  const isSoundEnabled = useTownStore((s) => s.isSoundEnabled);
  const toggleSound = useTownStore((s) => s.toggleSound);
  const isLogDrawerOpen = useTownStore((s) => s.isLogDrawerOpen);
  const toggleLogDrawer = useTownStore((s) => s.toggleLogDrawer);

  const isRotating = useTownStore((s) => s.isRotating);
  const toggleRotating = useTownStore((s) => s.toggleRotating);
  const showLabels = useTownStore((s) => s.showLabels);
  const toggleLabels = useTownStore((s) => s.toggleLabels);
  const showBubbles = useTownStore((s) => s.showBubbles);
  const toggleBubbles = useTownStore((s) => s.toggleBubbles);
  const isSimulating = useTownStore((s) => s.isSimulating);
  const toggleSimulating = useTownStore((s) => s.toggleSimulating);
  const simSpeed = useTownStore((s) => s.simSpeed);
  const cycleSimSpeed = useTownStore((s) => s.cycleSimSpeed);
  const cameraPreset = useTownStore((s) => s.cameraPreset);
  const setCameraPreset = useTownStore((s) => s.setCameraPreset);
  const approvals = useTownStore((s) => s.approvals);
  const openApprovalModal = useTownStore((s) => s.openApprovalModal);
  const isRealRunning = useTownStore((s) => s.isRealRunning);
  const abortPipeline = useTownStore((s) => s.abortPipeline);
  const openPromptModal = useTownStore((s) => s.openPromptModal);
  const isChaosRunning = useTownStore((s) => s.isChaosRunning);
  const runChaosSimulation = useTownStore((s) => s.runChaosSimulation);
  const openExportModal = useTownStore((s) => s.openExportModal);

  const pendingApprovals = approvals.filter((a) => a.status === 'pending');

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openPromptModal(true);
      } else if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        openPromptModal(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openPromptModal]);

  return (
    <header className="absolute top-3 left-3 right-3 z-30 pointer-events-none flex items-center justify-between gap-3 flex-nowrap overflow-x-auto">
      {/* Brand & AI Prompt Opener Button */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 bg-slate-900/85 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-xl">
          <span className="text-base">🏢</span>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xs font-bold text-white tracking-wide uppercase">
                Thị trấn DevOps
              </h1>
              <span className="px-1.5 py-0.2 text-[9px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-md">
                v1.4
              </span>
            </div>
          </div>
        </div>

        {/* AI Action Trigger Button (Spotlight / Raycast opener) */}
        <button
          onClick={() => openPromptModal(true)}
          className={`pointer-events-auto flex items-center gap-2 px-3.5 py-2 rounded-2xl font-bold text-xs shadow-xl transition-all border ${
            isRealRunning
              ? 'bg-amber-600/30 text-amber-200 border-amber-500/50 hover:bg-amber-600/40 animate-pulse'
              : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 text-white border-blue-400/40 shadow-blue-900/40 hover:scale-[1.02]'
          }`}
          title="Bấm để giao việc cho 8 AI Agents hoặc Audit GitHub PR (Phím tắt: Ctrl+K hoặc /)"
        >
          {isRealRunning ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-amber-300 border-t-transparent rounded-full animate-spin" />
              <span>AI Đang chạy stream...</span>
            </>
          ) : (
            <>
              <span>✨ Giao việc AI</span>
              <span className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-black/25 text-[10px] text-blue-200 border border-white/15 font-mono">
                Ctrl K
              </span>
            </>
          )}
        </button>

        {isRealRunning && (
          <button
            onClick={abortPipeline}
            className="pointer-events-auto flex items-center gap-1.5 px-3 py-2 rounded-2xl font-bold text-xs bg-rose-600/85 hover:bg-rose-500 text-white border border-rose-400/60 shadow-lg shadow-rose-950/50 transition-all"
            title="Dừng ngay luồng AI Pipeline đang chạy"
          >
            <span>⏹</span>
            <span>Dừng</span>
          </button>
        )}
      </div>

      {/* Control Buttons Group (Clean, single-line, non-wrapping toolbar) */}
      <div className="pointer-events-auto flex items-center gap-1.5 p-1 bg-slate-900/85 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-xl shrink-0">
        {/* Theme Mode Switcher: Ngày / Hoàng hôn / Đêm */}
        <div className="flex items-center bg-slate-800/90 p-0.5 rounded-xl border border-slate-700" title="Đổi chu kỳ Ngày / Hoàng hôn / Đêm">
          <button
            onClick={() => setThemeMode('day')}
            className={`px-2 py-1 text-xs rounded-lg transition-all ${
              themeMode === 'day'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Ban ngày (Nắng ấm)"
          >
            ☀️
          </button>
          <button
            onClick={() => setThemeMode('sunset')}
            className={`px-2 py-1 text-xs rounded-lg transition-all ${
              themeMode === 'sunset'
                ? 'bg-orange-500 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Hoàng hôn (Nắng chiều)"
          >
            🌆
          </button>
          <button
            onClick={() => setThemeMode('night')}
            className={`px-2 py-1 text-xs rounded-lg transition-all ${
              themeMode === 'night'
                ? 'bg-indigo-600 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Ban đêm (Huyền ảo & Đèn lồng)"
          >
            🌙
          </button>
        </div>

        <div className="w-[1px] h-4 bg-slate-700 mx-0.5" />

        {/* Rotation Toggle */}
        <button
          onClick={toggleRotating}
          className={`px-2.5 py-1 text-xs font-semibold rounded-xl border transition-colors ${
            isRotating
              ? 'bg-blue-600/30 text-blue-300 border-blue-500/50'
              : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700/80'
          }`}
          title="Bật/Tắt tự động xoay camera toàn cảnh"
        >
          {isRotating ? '🔄 Xoay' : '▶️ Xoay'}
        </button>

        {/* Speed Multiplier Button (1x / 2x / 4x) */}
        <button
          onClick={cycleSimSpeed}
          className="px-2 py-1 text-xs font-bold rounded-xl border border-amber-500/40 bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 transition-all shadow-sm"
          title="Tốc độ di chuyển Shipper & Animation: 1x, 2x, 4x"
        >
          ⚡ {simSpeed}x
        </button>

        {/* Names Toggle */}
        <button
          onClick={toggleLabels}
          className={`px-2.5 py-1 text-xs font-semibold rounded-xl border transition-colors ${
            showLabels
              ? 'bg-blue-600/30 text-blue-300 border-blue-500/50'
              : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-700/80'
          }`}
          title="Ẩn/Hiện nhãn tên trạm"
        >
          🏷️ Tên
        </button>

        {/* Speech Bubbles Toggle */}
        <button
          onClick={toggleBubbles}
          className={`px-2.5 py-1 text-xs font-semibold rounded-xl border transition-colors ${
            showBubbles
              ? 'bg-blue-600/30 text-blue-300 border-blue-500/50'
              : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-700/80'
          }`}
          title="Ẩn/Hiện bong bóng thoại"
        >
          💬 Thoại
        </button>

        {/* Sound FX Toggle */}
        <button
          onClick={toggleSound}
          className={`px-2 py-1 text-xs font-semibold rounded-xl border transition-colors ${
            isSoundEnabled
              ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50'
              : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-700/80'
          }`}
          title={isSoundEnabled ? 'Tắt âm thanh hiệu ứng' : 'Bật âm thanh hiệu ứng (SFX)'}
        >
          {isSoundEnabled ? '🔔' : '🔕'}
        </button>

        <div className="w-[1px] h-4 bg-slate-700 mx-0.5" />

        {/* Chaos Engineering Simulator Button */}
        <button
          onClick={() => runChaosSimulation()}
          disabled={isChaosRunning}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-xl border transition-all ${
            isChaosRunning
              ? 'bg-rose-600/40 text-rose-200 border-rose-500/60 animate-pulse cursor-not-allowed'
              : 'bg-slate-800/80 text-amber-300 border-amber-500/40 hover:bg-amber-600/20'
          }`}
          title="Kích hoạt kịch bản Chaos Engineering: Bão request 10x ➔ APM Alert ➔ Auto-scale HPA"
        >
          <span>{isChaosRunning ? '🔥' : '🚨'}</span>
          <span className="hidden md:inline">{isChaosRunning ? 'Bão tải...' : 'Chaos'}</span>
        </button>

        {/* Executive Release Export Button */}
        <button
          onClick={() => openExportModal(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-xl border transition-all bg-slate-800/80 text-indigo-300 border-indigo-500/40 hover:bg-indigo-600/20 shadow-sm"
          title="Xuất báo cáo phát hành kèm Snapshot 3D và Telemetry"
        >
          <span>📑</span>
          <span className="hidden md:inline">Báo cáo</span>
        </button>

        {/* Log Drawer Toggle */}
        <button
          onClick={() => toggleLogDrawer()}
          className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-xl border transition-all ${
            isLogDrawerOpen
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-400 shadow-md shadow-purple-900/30'
              : 'bg-slate-800/80 text-slate-200 border-slate-700 hover:bg-slate-700/80'
          }`}
          title="Mở nhật ký công việc thực tế của các AI Agents"
        >
          <span>📋</span>
          <span>Nhật ký việc</span>
        </button>

        {/* Production Approval Notification Badge */}
        {pendingApprovals.length > 0 && (
          <button
            onClick={() => openApprovalModal(true)}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-amber-500 text-slate-950 border border-amber-300 rounded-xl shadow-lg shadow-amber-500/30 animate-bounce transition-transform hover:scale-105"
          >
            <span>⚠️</span>
            <span>{pendingApprovals.length} duyệt</span>
          </button>
        )}
      </div>
    </header>
  );
};
