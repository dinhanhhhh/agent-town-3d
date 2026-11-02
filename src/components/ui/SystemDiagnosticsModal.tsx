'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useTownStore } from '../../store/useTownStore';
import { AgentRole, STAGE_ORDER } from '../../lib/pipeline/stages';
import { STATIONS_LAYOUT } from '../../lib/scene/layout';
import { sfx } from '../../lib/audio/sfx';
import { simulator } from '../../lib/events/MockSimulator';

export const SystemDiagnosticsModal: React.FC = () => {
  const isDiagnosticsModalOpen = useTownStore((s) => s.isDiagnosticsModalOpen);
  const openDiagnosticsModal = useTownStore((s) => s.openDiagnosticsModal);
  const latencyMs = useTownStore((s) => s.latencyMs);
  const tps = useTownStore((s) => s.tps);
  const cpuUsage = useTownStore((s) => s.cpuUsage);
  const passedCount = useTownStore((s) => s.passedCount);
  const failedCount = useTownStore((s) => s.failedCount);
  const isChaosRunning = useTownStore((s) => s.isChaosRunning);
  const isRollingBack = useTownStore((s) => s.isRollingBack);
  const runChaosSimulation = useTownStore((s) => s.runChaosSimulation);
  const triggerRollback = useTownStore((s) => s.triggerRollback);
  const agents = useTownStore((s) => s.agents);
  const couriers = useTownStore((s) => s.couriers);
  const stageMetrics = useTownStore((s) => s.stageMetrics);
  const agentModelProviders = useTownStore((s) => s.agentModelProviders);
  const weather = useTownStore((s) => s.weather);

  const [measuredFps, setMeasuredFps] = useState<number>(60);
  const [memoryHeapMb, setMemoryHeapMb] = useState<number | null>(null);
  const latencyHistory = useRef<number[]>([18, 22, 25, 20, 24, 28, 22, 26, 30, 24, 28]);

  // Đo đạc FPS thực tế qua requestAnimationFrame
  useEffect(() => {
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

        // Cập nhật bộ nhớ Heap nếu trình duyệt hỗ trợ (Chromium)
        if (typeof window !== 'undefined' && (performance as any).memory) {
          const used = (performance as any).memory.usedJSHeapSize;
          setMemoryHeapMb(Math.round(used / (1024 * 1024)));
        }
      }
      animId = requestAnimationFrame(measure);
    };

    animId = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Cập nhật lịch sử độ trễ cho biểu đồ SVG
  useEffect(() => {
    if (!isDiagnosticsModalOpen) return;
    latencyHistory.current.push(latencyMs);
    if (latencyHistory.current.length > 24) {
      latencyHistory.current.shift();
    }
  }, [latencyMs, isDiagnosticsModalOpen]);

  // Phím tắt Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDiagnosticsModalOpen) {
        sfx.playPop();
        openDiagnosticsModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDiagnosticsModalOpen, openDiagnosticsModal]);

  // Phân tích tỷ lệ lỗi
  const totalTasks = passedCount + failedCount;
  const errorRatePercent = totalTasks > 0 ? ((failedCount / totalTasks) * 100).toFixed(1) : '0.0';

  // SVG Sparkline path calculation
  const sparklineSvgPath = useMemo(() => {
    const points = latencyHistory.current;
    if (points.length < 2) return '';
    const width = 280;
    const height = 48;
    const min = Math.min(10, ...points);
    const max = Math.max(35, ...points);
    const range = max === min ? 1 : max - min;
    const step = width / (points.length - 1);

    return points
      .map((val, idx) => {
        const x = idx * step;
        const norm = (val - min) / range;
        const y = height - Math.max(0, Math.min(1, norm)) * (height - 8) - 4;
        return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  }, [latencyMs]);

  if (!isDiagnosticsModalOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          sfx.playPop();
          openDiagnosticsModal(false);
        }
      }}
      className="fixed inset-0 z-[1060] flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overscroll-contain"
      role="dialog"
      aria-modal="true"
      aria-labelledby="diagnostics-modal-title"
    >
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-700/90 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94dvh] animate-scale-up ring-1 ring-blue-500/20">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 bg-slate-950/90 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-lg sm:text-xl shadow-lg shadow-blue-900/40">
              📊
            </div>
            <div className="min-w-0">
              <h2
                id="diagnostics-modal-title"
                className="text-sm sm:text-base font-bold text-white tracking-wide flex items-center gap-2"
              >
                <span>Chẩn đoán Cụm & Telemetry Hệ thống</span>
                <span className="px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                  SRE 4 Golden Signals
                </span>
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                Quan trắc hiệu năng 3D WebGL, tải lượng mạng, mô hình AI và tàu vận chuyển
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sfx.playPop();
              openDiagnosticsModal(false);
            }}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors border border-slate-700/60 shrink-0"
          >
            <span className="hidden sm:inline">Esc</span>
            <span>✕</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto overscroll-contain">
          {/* ==================== 1. GOOGLE SRE 4 GOLDEN SIGNALS ==================== */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <span>⚡</span>
                <span>4 Tín Hiệu Vàng của Google SRE</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono normal-case">
                Cập nhật mỗi chu kỳ ticker
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Latency Signal */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Latency P99</span>
                  <span className="text-cyan-400 font-mono">1.0x</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold font-mono text-cyan-300 mt-1">
                  {latencyMs} <span className="text-xs font-normal text-slate-400">ms</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1 truncate">
                  P50: {Math.max(8, Math.round(latencyMs * 0.45))}ms · P95: {Math.round(latencyMs * 0.85)}ms
                </div>
              </div>

              {/* Traffic TPS Signal */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Traffic (TPS)</span>
                  <span className="text-emerald-400">● Live</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-300 mt-1">
                  {tps} <span className="text-xs font-normal text-slate-400">req/s</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1 truncate">
                  {isChaosRunning ? '⚠️ Bão tải 10x đang kích hoạt' : 'Bình thường (SLO > 99.9%)'}
                </div>
              </div>

              {/* Errors Signal */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Error Rate</span>
                  <span className="text-rose-400 font-mono">{errorRatePercent}%</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold font-mono text-white mt-1">
                  <span className="text-emerald-400">{passedCount}</span>
                  <span className="text-slate-600 mx-1">/</span>
                  <span className="text-rose-400">{failedCount}</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1 truncate">
                  {passedCount} thành công, {failedCount} cảnh báo
                </div>
              </div>

              {/* Saturation Signal */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Độ bão hòa CPU</span>
                  <span className="text-amber-400 font-mono">{cpuUsage}%</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold font-mono text-amber-300 mt-1">
                  {cpuUsage}%
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      cpuUsage > 80 ? 'bg-rose-500' : cpuUsage > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, cpuUsage)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Live SVG Latency Waveform */}
            <div className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs space-y-1 text-center sm:text-left">
                <div className="font-bold text-slate-200">Sóng Độ Trễ Mạng Cluster (Real-time Latency Wave)</div>
                <div className="text-[11px] text-slate-400">
                  Mô phỏng phản hồi từ 7 tuyến cáp quang neon và cụm Kubernetes Pods
                </div>
              </div>
              <div className="w-full sm:w-[280px] h-[48px] bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden px-1 py-0.5 flex items-center">
                <svg width="100%" height="48" viewBox="0 0 280 48" className="overflow-visible">
                  <path
                    d={sparklineSvgPath}
                    fill="none"
                    stroke={latencyMs > 100 ? '#f43f5e' : latencyMs > 50 ? '#f59e0b' : '#38bdf8'}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* ==================== 2. WEBGL & HARDWARE DIAGNOSTICS ==================== */}
          <div className="space-y-2.5">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>🎮</span>
              <span>Đồ họa 3D Three.js & Phần cứng Trình duyệt</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-center">
                <div className="text-[11px] text-slate-400">Tốc độ khung hình (FPS)</div>
                <div
                  className={`text-xl sm:text-2xl font-bold font-mono mt-1 ${
                    measuredFps >= 50
                      ? 'text-emerald-400'
                      : measuredFps >= 30
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                >
                  {measuredFps} <span className="text-xs font-normal text-slate-400">fps</span>
                </div>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-center">
                <div className="text-[11px] text-slate-400">Bộ nhớ Heap JS</div>
                <div className="text-xl sm:text-2xl font-bold font-mono text-cyan-300 mt-1">
                  {memoryHeapMb ? `${memoryHeapMb} MB` : 'N/A'}
                </div>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-center">
                <div className="text-[11px] text-slate-400">Cáp quang & Trạm</div>
                <div className="text-xl sm:text-2xl font-bold font-mono text-purple-300 mt-1">
                  7 <span className="text-xs font-normal text-slate-400">cáp / 8 trạm</span>
                </div>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-center">
                <div className="text-[11px] text-slate-400">Thời tiết Môi trường</div>
                <div className="text-xs sm:text-sm font-bold text-slate-200 mt-2 truncate">
                  {weather}
                </div>
              </div>
            </div>
          </div>

          {/* ==================== 3. MULTI-MODEL ENGINE FINOPS MATRIX ==================== */}
          <div className="space-y-2.5">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>🤖</span>
              <span>Ma trận Mô hình Đa Trí tuệ (Gemini & DeepSeek Hybrid Engine)</span>
            </div>

            <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl overflow-x-auto">
              <table className="w-full text-left text-xs font-sans min-w-[500px]">
                <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800 font-mono text-[10px] uppercase">
                  <tr>
                    <th className="py-2 px-3">Trạm AI</th>
                    <th className="py-2 px-3">Phòng Ban</th>
                    <th className="py-2 px-3">Engine Chỉ Định</th>
                    <th className="py-2 px-3">Trạng Thái</th>
                    <th className="py-2 px-3 text-right">Tokens / Thời gian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {STAGE_ORDER.map((role) => {
                    const agent = agents[role];
                    const layout = STATIONS_LAYOUT[role];
                    const prov = agentModelProviders[role] || 'auto';
                    const metric = stageMetrics[role];
                    const isWorking = agent?.status === 'working';
                    const isDebugging = agent?.status === 'debugging';

                    return (
                      <tr key={role} className="hover:bg-slate-900/40 transition-colors">
                        <td className="py-2 px-3 font-bold text-white flex items-center gap-1.5">
                          <span className="font-mono text-[10px] px-1 rounded bg-slate-800 text-cyan-300">
                            {layout?.tag || role}
                          </span>
                          <span>{layout?.name || role}</span>
                        </td>
                        <td className="py-2 px-3 text-slate-400 text-[11px]">
                          {agent?.category || 'Chỉ huy'}
                        </td>
                        <td className="py-2 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                              prov === 'gemini'
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                                : prov === 'deepseek'
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                                : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                            }`}
                          >
                            {prov === 'gemini' ? '♊ Gemini 3.8' : prov === 'deepseek' ? '🐳 DeepSeek V3' : '⚡ Auto'}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.2 rounded-full ${
                              isWorking
                                ? 'bg-amber-500/20 text-amber-300'
                                : isDebugging
                                ? 'bg-rose-500/20 text-rose-300'
                                : 'bg-emerald-500/20 text-emerald-300'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isWorking ? 'bg-amber-400 animate-ping' : isDebugging ? 'bg-rose-400' : 'bg-emerald-400'
                              }`}
                            />
                            {isWorking ? 'WORKING' : isDebugging ? 'DEBUG' : 'READY'}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-[11px] text-slate-400">
                          {metric ? (
                            <span>
                              {metric.tokens} tok · {(metric.durationMs / 1000).toFixed(1)}s
                            </span>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ==================== 4. ACTIVE COURIERS IN TRANSIT ==================== */}
          <div className="space-y-2.5">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span>📦</span>
                <span>Đội Tàu Shipper Vận Chuyển Đang Lưu Thông ({couriers.length})</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono normal-case">
                Mạng lưới 7 đại lộ nan hoa
              </span>
            </div>

            {couriers.length === 0 ? (
              <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-4 text-center text-xs text-slate-500">
                Hiện tại không có Shipper nào đang di chuyển trên đường.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {couriers.map((c) => (
                  <div
                    key={c.id}
                    className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="font-bold text-white flex items-center gap-1">
                        <span>{c.type === 'feedback' ? '🐛' : '📦'}</span>
                        <span>
                          {c.fromRole} ➔ {c.toRole}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-cyan-300 px-1.5 py-0.2 rounded bg-slate-800">
                        {Math.round(c.progress * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          c.type === 'feedback' ? 'bg-rose-500' : 'bg-cyan-500'
                        }`}
                        style={{ width: `${Math.round(c.progress * 100)}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {c.label || `Kiện hàng ${c.boxType}`}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ==================== 5. EMERGENCY SRE ACTIONS ==================== */}
          <div className="space-y-2.5">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>🛠️</span>
              <span>Bảng Điều Khiển Khẩn Cấp (SRE Emergency Operations)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                onClick={() => {
                  sfx.playPop();
                  runChaosSimulation();
                }}
                disabled={isChaosRunning}
                className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                  isChaosRunning
                    ? 'bg-rose-950/60 border-rose-500/50 text-rose-300 animate-pulse'
                    : 'bg-slate-950/80 hover:bg-rose-950/40 border-slate-800 hover:border-rose-500/50 text-slate-200'
                }`}
              >
                <span className="text-2xl shrink-0">⚡</span>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Thử Tải Chaos Surge 10x</span>
                    {isChaosRunning && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-600 text-white font-bold">
                        ĐANG CHẠY
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Kích hoạt bão tải 1000 TPS, kiểm thử tự động phục hồi HPA Auto-scaler
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  sfx.playPop();
                  triggerRollback('Người vận hành kích hoạt Rollback thủ công từ SRE Telemetry');
                }}
                disabled={isRollingBack}
                className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                  isRollingBack
                    ? 'bg-amber-950/60 border-amber-500/50 text-amber-300 animate-pulse'
                    : 'bg-slate-950/80 hover:bg-amber-950/40 border-slate-800 hover:border-amber-500/50 text-slate-200'
                }`}
              >
                <span className="text-2xl shrink-0">🚨</span>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Kích Hoạt Rollback Khẩn Cấp</span>
                    {isRollingBack && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-600 text-white font-bold">
                        ROLLING BACK
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Hủy bản build lỗi, điều phối shipper khẩn phục hồi phiên bản Stable
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  sfx.playBugAlert();
                  simulator.triggerRandomIncident();
                }}
                className="p-3 rounded-2xl border text-left flex items-start gap-3 transition-all bg-slate-950/80 hover:bg-purple-950/40 border-slate-800 hover:border-purple-500/50 text-slate-200"
              >
                <span className="text-2xl shrink-0">⚠️</span>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Bắn Sự Cố Tự Trị</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Sinh ngẫu nhiên lỗ hổng CVE, test fail hoặc spike latency để kiểm tra tự phục hồi
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 sm:px-6 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span className="text-[11px] font-mono text-slate-500">
            Telemetry Feed · SRE Google Architecture
          </span>
          <button
            onClick={() => {
              sfx.playPop();
              openDiagnosticsModal(false);
            }}
            className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-lg shadow-blue-950/50"
          >
            Đóng bảng
          </button>
        </div>
      </div>
    </div>
  );
};
