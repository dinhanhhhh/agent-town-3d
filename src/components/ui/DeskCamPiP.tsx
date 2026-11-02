'use client';

import React, { useState } from 'react';
import { useTownStore } from '../../store/useTownStore';
import { AgentRole, STAGE_ORDER } from '../../lib/pipeline/stages';
import { STATIONS_LAYOUT } from '../../lib/scene/layout';
import { sfx } from '../../lib/audio/sfx';

export const DeskCamPiP: React.FC = () => {
  const isDeskCamOpen = useTownStore((s) => s.isDeskCamOpen);
  const toggleDeskCam = useTownStore((s) => s.toggleDeskCam);
  const streamingStage = useTownStore((s) => s.streamingStage);
  const streamingContent = useTownStore((s) => s.streamingContent);
  const selectedAgentRole = useTownStore((s) => s.selectedAgentRole);
  const deskCamPinnedRole = useTownStore((s) => s.deskCamPinnedRole);
  const setDeskCamPinnedRole = useTownStore((s) => s.setDeskCamPinnedRole);
  const selectAgent = useTownStore((s) => s.selectAgent);
  const setCameraZoom = useTownStore((s) => s.setCameraZoom);
  const agents = useTownStore((s) => s.agents);
  const realArtifacts = useTownStore((s) => s.realArtifacts);
  const latencyMs = useTownStore((s) => s.latencyMs);

  const [isMinimized, setIsMinimized] = useState(false);
  const [measuredFps, setMeasuredFps] = useState<number>(60);

  React.useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animId: number;

    const measure = (now: number) => {
      frameCount++;
      const delta = now - lastTime;
      if (delta >= 1000) {
        setMeasuredFps(Math.min(120, Math.round((frameCount * 1000) / delta)));
        frameCount = 0;
        lastTime = now;
      }
      animId = requestAnimationFrame(measure);
    };

    animId = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(animId);
  }, []);

  if (!isDeskCamOpen) return null;

  // Xác định trạm mà Desk Cam đang hướng tới
  const activeRole: AgentRole =
    deskCamPinnedRole ||
    streamingStage ||
    selectedAgentRole ||
    'dev';

  const layout = STATIONS_LAYOUT[activeRole];
  const agent = agents[activeRole];
  const artifact = realArtifacts[activeRole];
  const isWorking = agent?.status === 'working' || agent?.status === 'debugging';
  const roleIndex = STAGE_ORDER.indexOf(activeRole);

  const handleFlyToStation = () => {
    sfx.playPop();
    selectAgent(activeRole, 'none');
    setCameraZoom(42);
  };

  const handleTogglePin = () => {
    sfx.playPop();
    if (deskCamPinnedRole === activeRole) {
      setDeskCamPinnedRole(null);
    } else {
      setDeskCamPinnedRole(activeRole);
    }
  };

  const handleCycleCam = (direction: 'prev' | 'next') => {
    sfx.playPop();
    const curIdx = STAGE_ORDER.indexOf(activeRole);
    const nextIdx =
      direction === 'next'
        ? (curIdx + 1) % STAGE_ORDER.length
        : (curIdx - 1 + STAGE_ORDER.length) % STAGE_ORDER.length;
    setDeskCamPinnedRole(STAGE_ORDER[nextIdx]);
  };

  return (
    <div className="fixed bottom-16 left-2 sm:bottom-16 sm:left-3 z-30 pointer-events-auto transition-all animate-scale-up">
      <div className="w-[300px] sm:w-[350px] bg-slate-950/90 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden flex flex-col text-xs font-mono">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-3 py-2 bg-slate-900/90 border-b border-slate-800 text-slate-300">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="flex items-center gap-1 text-[10px] text-rose-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
              REC
            </span>
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => handleCycleCam('prev')}
                className="px-1 py-0.2 rounded hover:bg-slate-800 text-slate-400 hover:text-white text-[10px]"
                title="Chuyển sang Camera trạm trước đó"
              >
                ‹
              </button>
              <span className="text-[11px] font-bold text-white truncate font-sans max-w-[130px] sm:max-w-[160px]">
                CAM-{roleIndex}: {layout?.name || activeRole}
              </span>
              <button
                onClick={() => handleCycleCam('next')}
                className="px-1 py-0.2 rounded hover:bg-slate-800 text-slate-400 hover:text-white text-[10px]"
                title="Chuyển sang Camera trạm kế tiếp"
              >
                ›
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Pin Button */}
            <button
              onClick={handleTogglePin}
              className={`px-1.5 py-0.5 rounded text-[10px] transition-colors ${
                deskCamPinnedRole === activeRole
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
              title={
                deskCamPinnedRole === activeRole
                  ? 'Bỏ ghim trạm này (Tự động theo dõi trạm đang làm việc)'
                  : 'Ghim camera cố định vào trạm này'
              }
            >
              📌
            </button>

            {/* Minimize / Expand Button */}
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="px-1.5 py-0.5 rounded text-[10px] text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={isMinimized ? 'Mở rộng cửa sổ' : 'Thu nhỏ cửa sổ'}
            >
              {isMinimized ? '▲' : '▼'}
            </button>

            {/* Close Button */}
            <button
              onClick={() => toggleDeskCam(false)}
              className="px-1.5 py-0.5 rounded text-[10px] text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
              title="Đóng Desk Cam"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body View */}
        {!isMinimized && (
          <div className="flex flex-col space-y-2 p-2.5 bg-slate-950/70">
            {/* Monitor Glass Screen (CCTV Style) */}
            <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-black/90 p-2.5 h-[140px] flex flex-col justify-between select-none">
              {/* Scanlines Effect Overlay */}
              <div
                className="absolute inset-0 pointer-events-none opacity-15"
                style={{
                  background:
                    'repeating-linear-gradient(0deg, rgba(0,0,0,0.4) 0px, rgba(0,0,0,0.4) 1px, transparent 1px, transparent 2px)',
                }}
              />

              {/* Top HUD Info in Camera */}
              <div className="flex items-center justify-between text-[9px] text-slate-400 z-10 font-mono">
                <span className="text-cyan-400">
                  POS: [{layout?.position.join(', ')}]
                </span>
                <span className="flex items-center gap-1.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isWorking ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                    }`}
                  />
                  <span className={isWorking ? 'text-emerald-300' : 'text-slate-400'}>
                    {agent?.status.toUpperCase() || 'IDLE'}
                  </span>
                  <span>· {measuredFps} FPS</span>
                </span>
              </div>

              {/* Desk Live Work Display */}
              <div className="z-10 my-auto overflow-hidden">
                {streamingStage === activeRole ? (
                  <div className="space-y-1">
                    <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                      LIVE AI STREAMING...
                    </span>
                    <pre className="text-[9px] text-emerald-400 whitespace-pre-wrap line-clamp-3 leading-relaxed opacity-90 overflow-hidden font-mono">
                      {streamingContent || '// Đang tải tokens...'}
                    </pre>
                  </div>
                ) : artifact?.content ? (
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 flex items-center justify-between">
                      <span className="text-cyan-300 font-bold">📄 {artifact.filename}</span>
                      <span className="text-slate-500 font-mono">{artifact.language}</span>
                    </span>
                    <pre className="text-[9px] text-emerald-400/80 whitespace-pre-wrap line-clamp-3 leading-relaxed overflow-hidden font-mono">
                      {artifact.content.slice(0, 200)}
                    </pre>
                  </div>
                ) : (
                  <div className="text-center py-4 space-y-1">
                    <div className="text-xl">🪑 💻</div>
                    <p className="text-[10px] text-slate-500">
                      Bàn làm việc sẵn sàng nhận nhiệm vụ
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom Lời thoại tóm tắt */}
              <div className="z-10 flex items-center justify-between text-[9px] text-slate-400 border-t border-slate-900 pt-1">
                <span className="italic truncate text-slate-300 max-w-[210px] font-sans">
                  &ldquo;{agent?.speech || 'Sẵn sàng.'}&rdquo;
                </span>
                <span className="text-slate-500 font-mono">{latencyMs}ms</span>
              </div>
            </div>

            {/* Quick Switch Bar */}
            <div className="flex items-center justify-between gap-1 pt-0.5">
              <div className="flex gap-1 overflow-x-auto scrollbar-none flex-nowrap">
                {STAGE_ORDER.map((role) => (
                  <button
                    key={role}
                    onClick={() => {
                      setDeskCamPinnedRole(role);
                      sfx.playPop();
                    }}
                    className={`px-1.5 py-0.5 text-[9px] rounded font-semibold transition-all shrink-0 ${
                      activeRole === role
                        ? 'bg-cyan-600 text-white font-bold'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {role === 'orchestrator' ? 'Hub' : role.slice(0, 3).toUpperCase()}
                  </button>
                ))}
              </div>

              <button
                onClick={handleFlyToStation}
                className="px-2 py-0.5 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 hover:text-white border border-blue-500/40 rounded text-[10px] font-bold transition-colors whitespace-nowrap flex items-center gap-1 shrink-0"
                title="Bay camera chính tới trạm này"
              >
                <span>🔭</span>
                <span className="hidden sm:inline">Bay tới</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
