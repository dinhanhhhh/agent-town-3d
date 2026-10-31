'use client';

import React, { useEffect, useRef, useMemo } from 'react';
import { useTownStore } from '../../store/useTownStore';

export const StatusBar: React.FC = () => {
  const latencyMs = useTownStore((s) => s.latencyMs);
  const tps = useTownStore((s) => s.tps);
  const cpuUsage = useTownStore((s) => s.cpuUsage);
  const themeMode = useTownStore((s) => s.themeMode);
  const isChaosRunning = useTownStore((s) => s.isChaosRunning);
  const zoomIn = useTownStore((s) => s.zoomIn);
  const zoomOut = useTownStore((s) => s.zoomOut);
  const resetCamera = useTownStore((s) => s.resetCamera);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sparklineData = useRef<number[]>([18, 22, 25, 20, 24, 28, 22, 26, 30, 24, 28]);

  const weatherDisplay = useMemo(() => {
    if (isChaosRunning) return { icon: '⚡', text: 'Bão tải 10x · Báo động đỏ' };
    if (themeMode === 'night') return { icon: '🌙', text: 'Đêm trăng · 18°C' };
    if (themeMode === 'sunset') return { icon: '🌆', text: 'Hoàng hôn · 23°C' };
    return { icon: '☀️', text: 'Nắng ấm · 26°C' };
  }, [themeMode, isChaosRunning]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const interval = setInterval(() => {
      sparklineData.current.push(latencyMs);
      if (sparklineData.current.length > 20) {
        sparklineData.current.shift();
      }

      // Draw mini sparkline with auto-scaling to prevent overflow during chaos
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.strokeStyle = latencyMs > 100 ? '#f43f5e' : latencyMs > 50 ? '#f59e0b' : '#38bdf8';
      ctx.lineWidth = 1.5;

      const points = sparklineData.current;
      const step = canvas.width / (points.length - 1);
      const min = Math.min(10, ...points);
      const max = Math.max(35, ...points);
      const range = max === min ? 1 : max - min;

      points.forEach((val, i) => {
        const x = i * step;
        const norm = (val - min) / range;
        const clampedNorm = Math.max(0, Math.min(1, norm));
        const y = canvas.height - clampedNorm * (canvas.height - 4) - 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }, 400);

    return () => clearInterval(interval);
  }, [latencyMs]);

  return (
    <footer className="absolute bottom-14 right-2 lg:bottom-3 lg:right-3 z-30 pointer-events-none flex items-center gap-1.5 sm:gap-2.5">
      {/* Zoom Controls */}
      <div className="pointer-events-auto flex items-center gap-1 p-1 bg-slate-900/85 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-xl">
        <button
          onClick={zoomIn}
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center justify-center transition-colors text-sm"
          title="Phóng to"
        >
          +
        </button>
        <button
          onClick={zoomOut}
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center justify-center transition-colors text-sm"
          title="Thu nhỏ"
        >
          −
        </button>
        <button
          onClick={resetCamera}
          className="px-2 sm:px-2.5 h-7 sm:h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold flex items-center justify-center transition-colors text-[11px] sm:text-xs"
          title="Đặt lại góc nhìn"
        >
          Reset
        </button>
      </div>

      {/* APM & Weather Telemetry Bar */}
      <div className="pointer-events-auto flex items-center gap-2 sm:gap-3 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-slate-900/85 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-xl text-xs whitespace-nowrap">
        {/* Weather Dynamic */}
        <div className="hidden xl:flex items-center gap-1.5 text-slate-300">
          <span>{weatherDisplay.icon}</span>
          <span className="font-medium text-slate-300">{weatherDisplay.text}</span>
        </div>

        <div className="hidden xl:block w-[1px] h-4 bg-slate-700" />

        {/* Latency with Sparkline */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="text-[10px] sm:text-[11px] font-mono text-slate-400">
            P99: <span className="text-sky-400 font-bold">{latencyMs}ms</span>
          </div>
          <canvas ref={canvasRef} width={50} height={16} className="hidden sm:block opacity-90" />
        </div>

        <div className="hidden sm:block w-[1px] h-4 bg-slate-700" />

        {/* TPS */}
        <div className="hidden sm:block text-[11px] font-mono text-slate-400">
          TPS: <span className="text-emerald-400 font-bold">{tps}</span>
        </div>

        <div className="w-[1px] h-4 bg-slate-700" />

        {/* CPU Usage */}
        <div className="text-[10px] sm:text-[11px] font-mono text-slate-400">
          CPU:{' '}
          <span
            className={`font-bold ${
              cpuUsage > 70
                ? 'text-rose-400'
                : cpuUsage > 50
                ? 'text-amber-400'
                : 'text-emerald-400'
            }`}
          >
            {cpuUsage}%
          </span>
        </div>
      </div>
    </footer>
  );
};
