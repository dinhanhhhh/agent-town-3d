'use client';

import React from 'react';
import { useTownStore } from '../../store/useTownStore';
import { STAGE_ORDER } from '../../lib/pipeline/stages';
import { sfx } from '../../lib/audio/sfx';
import { simulator } from '../../lib/events/MockSimulator';

export const Topbar: React.FC = () => {
  const themeMode = useTownStore((s) => s.themeMode);
  const resolvedTheme = useTownStore((s) => s.resolvedTheme);
  const setThemeMode = useTownStore((s) => s.setThemeMode);
  const isSoundEnabled = useTownStore((s) => s.isSoundEnabled);
  const toggleSound = useTownStore((s) => s.toggleSound);
  const isVoiceEnabled = useTownStore((s) => s.isVoiceEnabled);
  const toggleVoice = useTownStore((s) => s.toggleVoice);
  const isDeskCamOpen = useTownStore((s) => s.isDeskCamOpen);
  const toggleDeskCam = useTownStore((s) => s.toggleDeskCam);
  const isLogDrawerOpen = useTownStore((s) => s.isLogDrawerOpen);
  const toggleLogDrawer = useTownStore((s) => s.toggleLogDrawer);

  const isRotating = useTownStore((s) => s.isRotating);
  const toggleRotating = useTownStore((s) => s.toggleRotating);
  const isAutoFollow = useTownStore((s) => s.isAutoFollow);
  const toggleAutoFollow = useTownStore((s) => s.toggleAutoFollow);
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
  const openKeyboardModal = useTownStore((s) => s.openKeyboardModal);
  const openDiagnosticsModal = useTownStore((s) => s.openDiagnosticsModal);
  const selectAgent = useTownStore((s) => s.selectAgent);
  const resetCamera = useTownStore((s) => s.resetCamera);
  const zoomIn = useTownStore((s) => s.zoomIn);
  const zoomOut = useTownStore((s) => s.zoomOut);
  const toggleThemeMode = useTownStore((s) => s.toggleThemeMode);
  const initClientStorage = useTownStore((s) => s.initClientStorage);

  const pendingApprovals = approvals.filter((a) => a.status === 'pending');

  React.useEffect(() => {
    initClientStorage();
  }, [initClientStorage]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openPromptModal(true);
        return;
      }

      if (isInput) return;

      if (e.key === '/') {
        e.preventDefault();
        openPromptModal(true);
        return;
      }

      // Hotkeys 1-8: Bay camera & thanh tra 8 trạm AI
      if (e.key >= '1' && e.key <= '8') {
        const index = parseInt(e.key, 10) - 1;
        const role = STAGE_ORDER[index];
        if (role) {
          e.preventDefault();
          sfx.playWarp();
          selectAgent(role);
        }
        return;
      }

      // 0: Reset camera về toàn cảnh đảo 3D
      if (e.key === '0') {
        e.preventDefault();
        sfx.playWarp();
        selectAgent(null);
        resetCamera();
        return;
      }

      // Space: Play / Pause mô phỏng
      if (e.code === 'Space') {
        e.preventDefault();
        sfx.playPop();
        toggleSimulating();
        return;
      }

      // T: Đổi chu kỳ Ngày / Hoàng hôn / Đêm
      if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        sfx.playPop();
        toggleThemeMode();
        return;
      }

      // M: Bật / Tắt âm thanh
      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleSound();
        return;
      }

      // V: Bật / Tắt giọng nói TTS
      if (e.key === 'v' || e.key === 'V') {
        e.preventDefault();
        toggleVoice();
        return;
      }

      // [ : Trạm trước đó
      if (e.key === '[') {
        e.preventDefault();
        sfx.playWarp();
        const curRole = useTownStore.getState().selectedAgentRole || 'orchestrator';
        const curIdx = STAGE_ORDER.indexOf(curRole);
        const prevRole = STAGE_ORDER[(curIdx - 1 + STAGE_ORDER.length) % STAGE_ORDER.length];
        selectAgent(prevRole);
        return;
      }

      // ] : Trạm kế tiếp
      if (e.key === ']') {
        e.preventDefault();
        sfx.playWarp();
        const curRole = useTownStore.getState().selectedAgentRole || 'orchestrator';
        const curIdx = STAGE_ORDER.indexOf(curRole);
        const nextRole = STAGE_ORDER[(curIdx + 1) % STAGE_ORDER.length];
        selectAgent(nextRole);
        return;
      }

      // C: Bật / Tắt Desk Cam PiP
      if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        sfx.playPop();
        toggleDeskCam();
        return;
      }

      // L: Bật / Tắt Nhật ký
      if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        sfx.playPop();
        toggleLogDrawer();
        return;
      }

      // R: Bật / Tắt xoay đảo
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        sfx.playPop();
        toggleRotating();
        return;
      }

      // F: Bật / Tắt đạo diễn Auto-follow
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        sfx.playPop();
        toggleAutoFollow();
        return;
      }

      // D: Bảng chẩn đoán SRE & Telemetry
      if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        sfx.playPop();
        openDiagnosticsModal(true);
        return;
      }

      // ? hoặc H: Bảng tra cứu phím tắt RTS
      if (e.key === '?' || e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        sfx.playPop();
        openKeyboardModal(true);
        return;
      }

      // + / =: Zoom in
      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        zoomIn();
        return;
      }

      // - / _: Zoom out
      if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        zoomOut();
        return;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    openPromptModal,
    openKeyboardModal,
    openDiagnosticsModal,
    selectAgent,
    resetCamera,
    toggleSimulating,
    toggleThemeMode,
    toggleSound,
    toggleVoice,
    toggleDeskCam,
    toggleLogDrawer,
    toggleRotating,
    toggleAutoFollow,
    zoomIn,
    zoomOut,
  ]);

  return (
    <header className="absolute top-2 left-2 right-2 sm:top-3 sm:left-3 sm:right-3 z-30 pointer-events-none flex items-center justify-between gap-1.5 sm:gap-2.5 flex-nowrap">
      {/* Brand & AI Prompt Opener Button */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        <div className="pointer-events-auto flex items-center gap-1.5 px-2 sm:px-3 py-1.5 bg-slate-900/85 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-xl">
          <span className="text-sm sm:text-base">🏢</span>
          <div className="hidden xs:block">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <h1 className="text-[10px] sm:text-xs font-bold text-white tracking-wide uppercase whitespace-nowrap">
                <span className="hidden md:inline">Thị trấn </span>DevOps
              </h1>
              <span className="px-1 sm:px-1.5 py-0.2 text-[8px] sm:text-[9px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-md">
                v1.6
              </span>
            </div>
          </div>
        </div>

        {/* AI Action Trigger Button (Spotlight / Raycast opener) */}
        <button
          onClick={() => openPromptModal(true)}
          className={`pointer-events-auto flex items-center gap-1 sm:gap-2 px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-2xl font-bold text-xs shadow-xl transition-all border whitespace-nowrap ${
            isRealRunning
              ? 'bg-amber-600/30 text-amber-200 border-amber-500/50 hover:bg-amber-600/40 animate-pulse'
              : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 text-white border-blue-400/40 shadow-blue-900/40 hover:scale-[1.02]'
          }`}
          title="Bấm để giao việc cho 8 AI Agents hoặc Audit GitHub PR (Phím tắt: Ctrl+K hoặc /)"
        >
          {isRealRunning ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-amber-300 border-t-transparent rounded-full animate-spin" />
              <span className="hidden sm:inline">AI Đang chạy...</span>
              <span className="sm:hidden text-[11px]">AI...</span>
            </>
          ) : (
            <>
              <span>✨</span>
              <span className="hidden sm:inline">Giao việc AI</span>
              <span className="sm:hidden text-[11px]">AI</span>
              <span className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-black/25 text-[10px] text-blue-200 border border-white/15 font-mono">
                Ctrl K
              </span>
            </>
          )}
        </button>

        {isRealRunning && (
          <button
            onClick={abortPipeline}
            className="pointer-events-auto flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-2xl font-bold text-xs bg-rose-600/85 hover:bg-rose-500 text-white border border-rose-400/60 shadow-lg shadow-rose-950/50 transition-all whitespace-nowrap"
            title="Dừng ngay luồng AI Pipeline đang chạy"
          >
            <span>⏹</span>
            <span className="hidden sm:inline">Dừng</span>
          </button>
        )}
      </div>

      {/* Control Buttons Group (Clean, single-line, responsive toolbar with horizontal scroll safety) */}
      <div className="pointer-events-auto flex items-center gap-1 sm:gap-1.5 p-1 bg-slate-900/85 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-xl overflow-x-auto scrollbar-none max-w-[calc(100vw-110px)] sm:max-w-none shrink-0">
        {/* Theme Mode Switcher: Auto / Ngày / Hoàng hôn / Đêm */}
        <div
          className="flex items-center bg-slate-800/90 p-0.5 rounded-xl border border-slate-700 shrink-0"
          title={`Đổi chu kỳ Ngày / Hoàng hôn / Đêm (Hiện tại: ${
            themeMode === 'auto'
              ? `Auto ⏱️ (${resolvedTheme === 'night' ? 'Ban đêm 🌙' : resolvedTheme === 'sunset' ? 'Hoàng hôn 🌆' : 'Ban ngày ☀️'})`
              : themeMode === 'night'
              ? 'Ban đêm 🌙'
              : themeMode === 'sunset'
              ? 'Hoàng hôn 🌆'
              : 'Ban ngày ☀️'
          })`}
        >
          <button
            onClick={() => setThemeMode('auto')}
            className={`px-1.5 sm:px-2 py-1 text-xs rounded-lg transition-all flex items-center gap-1 ${
              themeMode === 'auto'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title={`Tự động theo thời gian thực (Hiện đang là ${
              resolvedTheme === 'night' ? 'Ban đêm 🌙' : resolvedTheme === 'sunset' ? 'Hoàng hôn 🌆' : 'Ban ngày ☀️'
            })`}
          >
            <span>⏱️</span>
            <span className="hidden 2xl:inline text-[10px]">Auto</span>
          </button>
          <button
            onClick={() => setThemeMode('day')}
            className={`px-1.5 sm:px-2 py-1 text-xs rounded-lg transition-all ${
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
            className={`px-1.5 sm:px-2 py-1 text-xs rounded-lg transition-all ${
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
            className={`px-1.5 sm:px-2 py-1 text-xs rounded-lg transition-all ${
              themeMode === 'night'
                ? 'bg-indigo-600 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Ban đêm (Huyền ảo & Đèn lồng)"
          >
            🌙
          </button>
        </div>

        <div className="w-[1px] h-4 bg-slate-700 mx-0.5 hidden sm:block shrink-0" />

        {/* Rotation Toggle */}
        <button
          onClick={toggleRotating}
          className={`px-2 py-1 text-xs font-semibold rounded-xl border transition-colors whitespace-nowrap shrink-0 ${
            isRotating
              ? 'bg-blue-600/30 text-blue-300 border-blue-500/50'
              : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700/80'
          }`}
          title="Bật/Tắt tự động xoay camera toàn cảnh"
        >
          <span>{isRotating ? '🔄' : '▶️'}</span>
        </button>

        {/* Director Auto-Follow Toggle */}
        <button
          onClick={toggleAutoFollow}
          className={`px-2 py-1 text-xs font-semibold rounded-xl border transition-colors whitespace-nowrap shrink-0 ${
            isAutoFollow
              ? 'bg-cyan-600/30 text-cyan-300 border-cyan-500/50'
              : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-700/80'
          }`}
          title="Bật/Tắt chế độ Đạo diễn: Camera tự động lia mượt bám theo Shipper di chuyển và Trạm AI"
        >
          <span>🎥</span>
        </button>

        {/* Speed Multiplier Button (1x / 2x / 4x) */}
        <button
          onClick={cycleSimSpeed}
          className="px-2 py-1 text-xs font-bold rounded-xl border border-amber-500/40 bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 transition-all shadow-sm whitespace-nowrap shrink-0"
          title="Tốc độ di chuyển Shipper & Animation: 1x, 2x, 4x"
        >
          ⚡ {simSpeed}x
        </button>

        {/* Auto-Demo Simulator Toggle Button */}
        <button
          onClick={() => {
            if (isSimulating) {
              simulator.pause();
            } else {
              simulator.start();
            }
          }}
          className={`px-2 py-1 text-xs font-semibold rounded-xl border transition-all whitespace-nowrap shrink-0 ${
            isSimulating
              ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50 animate-pulse'
              : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700/80'
          }`}
          title={isSimulating ? 'Tạm dừng Auto-Demo mô phỏng' : 'Bật Auto-Demo mô phỏng tự động không tốn token'}
        >
          <span>{isSimulating ? '⏸️' : '🎬'}</span>
        </button>

        {/* Names Toggle */}
        <button
          onClick={toggleLabels}
          className={`px-2 py-1 text-xs font-semibold rounded-xl border transition-colors whitespace-nowrap shrink-0 ${
            showLabels
              ? 'bg-blue-600/30 text-blue-300 border-blue-500/50'
              : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-700/80'
          }`}
          title="Ẩn/Hiện nhãn tên trạm"
        >
          <span>🏷️</span>
        </button>

        {/* Speech Bubbles Toggle */}
        <button
          onClick={toggleBubbles}
          className={`px-2 py-1 text-xs font-semibold rounded-xl border transition-colors whitespace-nowrap shrink-0 ${
            showBubbles
              ? 'bg-blue-600/30 text-blue-300 border-blue-500/50'
              : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-700/80'
          }`}
          title="Ẩn/Hiện bong bóng thoại"
        >
          <span>💬</span>
        </button>

        {/* Sound FX Toggle */}
        <button
          onClick={toggleSound}
          className={`px-2 py-1 text-xs font-semibold rounded-xl border transition-colors shrink-0 ${
            isSoundEnabled
              ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50'
              : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-700/80'
          }`}
          title={isSoundEnabled ? 'Tắt âm thanh hiệu ứng (SFX)' : 'Bật âm thanh hiệu ứng (SFX)'}
        >
          {isSoundEnabled ? '🔔' : '🔕'}
        </button>

        <div className="w-[1px] h-4 bg-slate-700 mx-0.5 hidden sm:block shrink-0" />

        {/* AI Voice TTS Toggle */}
        <button
          onClick={() => toggleVoice()}
          className={`px-2 sm:px-2.5 py-1 text-xs font-semibold rounded-xl border transition-colors whitespace-nowrap shrink-0 ${
            isVoiceEnabled
              ? 'bg-purple-600/40 text-purple-200 border-purple-400/60 shadow-sm shadow-purple-900/40 animate-pulse'
              : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-700/80'
          }`}
          title={isVoiceEnabled ? 'Tắt giọng nói AI (TTS Web Speech)' : 'Bật giọng nói AI thời gian thực (TTS Web Speech)'}
        >
          <span>{isVoiceEnabled ? '🗣️' : '🔇'}</span>
          <span className="hidden 2xl:inline ml-1">{isVoiceEnabled ? 'Voice On' : 'Voice'}</span>
        </button>

        {/* Picture-in-Picture Desk Cam Toggle */}
        <button
          onClick={() => toggleDeskCam()}
          className={`px-2 sm:px-2.5 py-1 text-xs font-semibold rounded-xl border transition-colors whitespace-nowrap shrink-0 ${
            isDeskCamOpen
              ? 'bg-cyan-600/40 text-cyan-200 border-cyan-400/60 shadow-sm shadow-cyan-900/40'
              : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-700/80'
          }`}
          title={isDeskCamOpen ? 'Đóng cửa sổ Mini Desk Cam' : 'Mở cửa sổ Mini Desk Cam (Góc nhìn cận cảnh bàn làm việc)'}
        >
          <span>📹</span>
          <span className="hidden 2xl:inline ml-1">Desk Cam</span>
        </button>

        {/* Chaos Engineering Simulator Button */}
        <button
          onClick={() => runChaosSimulation()}
          disabled={isChaosRunning}
          className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 text-xs font-semibold rounded-xl border transition-all whitespace-nowrap shrink-0 ${
            isChaosRunning
              ? 'bg-rose-600/40 text-rose-200 border-rose-500/60 animate-pulse cursor-not-allowed'
              : 'bg-slate-800/80 text-amber-300 border-amber-500/40 hover:bg-amber-600/20'
          }`}
          title="Kích hoạt kịch bản Chaos Engineering: Bão request 10x ➔ APM Alert ➔ Auto-scale HPA"
        >
          <span>{isChaosRunning ? '🔥' : '🚨'}</span>
          <span className="hidden 2xl:inline">{isChaosRunning ? 'Bão tải...' : 'Chaos'}</span>
        </button>

        {/* System SRE Diagnostics Modal Button */}
        <button
          onClick={() => {
            sfx.playPop();
            openDiagnosticsModal(true);
          }}
          className="flex items-center gap-1 px-2 sm:px-2.5 py-1 text-xs font-semibold rounded-xl border transition-all bg-slate-800/80 text-cyan-300 border-cyan-500/40 hover:bg-cyan-600/20 shadow-sm whitespace-nowrap shrink-0"
          title="Mở Bảng Chẩn đoán SRE & Telemetry Hệ thống (Phím tắt: D)"
        >
          <span>📊</span>
          <span className="hidden 2xl:inline">SRE</span>
        </button>

        {/* Keyboard Shortcuts Guide Button */}
        <button
          onClick={() => {
            sfx.playPop();
            openKeyboardModal(true);
          }}
          className="flex items-center gap-1 px-2 sm:px-2.5 py-1 text-xs font-semibold rounded-xl border transition-all bg-slate-800/80 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-700/80 shadow-sm whitespace-nowrap shrink-0"
          title="Xem bảng tra cứu phím tắt RTS (Phím tắt: ? hoặc H)"
        >
          <span>⌨️</span>
          <span className="hidden 2xl:inline">Phím tắt</span>
        </button>

        {/* Executive Release Export Button */}
        <button
          onClick={() => openExportModal(true)}
          className="flex items-center gap-1 px-2 sm:px-2.5 py-1 text-xs font-semibold rounded-xl border transition-all bg-slate-800/80 text-indigo-300 border-indigo-500/40 hover:bg-indigo-600/20 shadow-sm whitespace-nowrap shrink-0"
          title="Xuất báo cáo phát hành kèm Snapshot 3D và Telemetry"
        >
          <span>📑</span>
          <span className="hidden 2xl:inline">Báo cáo</span>
        </button>

        {/* Log Drawer Toggle */}
        <button
          onClick={() => toggleLogDrawer()}
          className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 text-xs font-semibold rounded-xl border transition-all whitespace-nowrap shrink-0 ${
            isLogDrawerOpen
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-400 shadow-md shadow-purple-900/30'
              : 'bg-slate-800/80 text-slate-200 border-slate-700 hover:bg-slate-700/80'
          }`}
          title="Mở nhật ký công việc thực tế của các AI Agents"
        >
          <span>📋</span>
          <span className="hidden xl:inline">Nhật ký</span>
        </button>

        {/* Production Approval Notification Badge */}
        {pendingApprovals.length > 0 && (
          <button
            onClick={() => openApprovalModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold bg-amber-500 text-slate-950 border border-amber-300 rounded-xl shadow-lg shadow-amber-500/30 animate-bounce transition-transform hover:scale-105 shrink-0"
          >
            <span>⚠️</span>
            <span>{pendingApprovals.length} duyệt</span>
          </button>
        )}
      </div>
    </header>
  );
};
