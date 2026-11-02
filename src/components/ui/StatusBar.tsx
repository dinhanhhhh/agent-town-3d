'use client';

import React, { useEffect, useRef, useMemo, useState } from 'react';
import { useTownStore } from '../../store/useTownStore';

export const StatusBar: React.FC = () => {
  const latencyMs = useTownStore((s) => s.latencyMs);
  const tps = useTownStore((s) => s.tps);
  const cpuUsage = useTownStore((s) => s.cpuUsage);
  const themeMode = useTownStore((s) => s.themeMode);
  const resolvedTheme = useTownStore((s) => s.resolvedTheme);
  const isChaosRunning = useTownStore((s) => s.isChaosRunning);
  const zoomIn = useTownStore((s) => s.zoomIn);
  const zoomOut = useTownStore((s) => s.zoomOut);
  const resetCamera = useTownStore((s) => s.resetCamera);
  const openDiagnosticsModal = useTownStore((s) => s.openDiagnosticsModal);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sparklineData = useRef<number[]>([18, 22, 25, 20, 24, 28, 22, 26, 30, 24, 28]);
  const [timeStr, setTimeStr] = useState<string>('');

  // Cập nhật đồng hồ thời gian thực mỗi giây
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const weatherDisplay = useMemo(() => {
    if (isChaosRunning) {
      return {
        icon: '⚡',
        shortText: 'Bão tải 10x',
        fullText: 'Bão tải 10x · Báo động đỏ',
      };
    }
    if (resolvedTheme === 'night') {
      return {
        icon: '🌙',
        shortText: 'Đêm · 18°C',
        fullText: 'Đêm thanh mát · 18°C',
      };
    }
    if (resolvedTheme === 'sunset') {
      return {
        icon: '🌆',
        shortText: 'Hoàng hôn · 23°C',
        fullText: 'Hoàng hôn dịu mát · 23°C',
      };
    }
    return {
      icon: '☀️',
      shortText: 'Nắng ấm · 26°C',
      fullText: 'Nắng ấm trong lành · 26°C',
    };
  }, [resolvedTheme, isChaosRunning]);

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

      // Vẽ sparkline tự co giãn thang đo
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
    <footer className="absolute bottom-12 right-2 sm:bottom-12 sm:right-3 lg:bottom-3 lg:right-3 z-30 pointer-events-none flex items-center gap-1 sm:gap-2">
      {/* Zoom Controls (Chỉ hiển thị trên màn hình có chuột/desktop sm:, ẩn trên mobile vì đã có cảm ứng pinch-to-zoom 2 ngón) */}
      <div className="hidden sm:flex pointer-events-auto items-center gap-0.5 sm:gap-1 p-0.5 sm:p-1 bg-slate-900/85 backdrop-blur-md border border-slate-700/80 rounded-xl sm:rounded-2xl shadow-xl">
        <button
          onClick={zoomIn}
          className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center justify-center transition-colors text-xs sm:text-sm"
          title="Phóng to"
        >
          +
        </button>
        <button
          onClick={zoomOut}
          className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center justify-center transition-colors text-xs sm:text-sm"
          title="Thu nhỏ"
        >
          −
        </button>
        <button
          onClick={resetCamera}
          className="px-1.5 sm:px-2 h-6 sm:h-7 rounded-lg sm:rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold flex items-center justify-center transition-colors text-[10px] sm:text-xs"
          title="Đặt lại góc nhìn"
        >
          Reset
        </button>
      </div>

      {/* APM, Dynamic Weather & Real-Time Clock Telemetry Bar */}
      <div
        onClick={() => {
          openDiagnosticsModal(true);
        }}
        className="pointer-events-auto cursor-pointer hover:border-cyan-500/80 hover:bg-slate-900/95 transition-all flex items-center gap-1.5 sm:gap-2.5 px-2 sm:px-3.5 py-1 sm:py-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl sm:rounded-2xl shadow-xl text-[10px] sm:text-xs whitespace-nowrap group"
        title="Bấm để mở Bảng Chẩn đoán SRE & Telemetry Hệ thống (Phím tắt: D)"
      >
        {/* Weather & Real-Time Clock (Responsive across all screens) */}
        <div className="flex items-center gap-1 sm:gap-1.5 text-slate-300">
          <span className="text-xs sm:text-sm">{weatherDisplay.icon}</span>
          <span className="hidden md:inline font-medium text-slate-200">
            {weatherDisplay.fullText}
          </span>
          <span className="md:hidden font-medium text-slate-200 text-[10px] sm:text-[11px]">
            {weatherDisplay.shortText}
          </span>
          {timeStr && (
            <span className="text-slate-400 font-mono text-[9px] sm:text-xs hidden xs:inline">
              <span className="hidden sm:inline">· </span>
              {timeStr}
            </span>
          )}
          {themeMode === 'auto' && (
            <span
              className="hidden lg:inline-block px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[9px] font-bold"
              title="Đang đồng bộ chu kỳ ánh sáng tự động theo giờ thực tế của bạn"
            >
              ⏱️ Giờ thực
            </span>
          )}
        </div>

        <div className="w-[1px] h-3.5 sm:h-4 bg-slate-700" />

        {/* Latency with Sparkline */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          <div className="text-[10px] sm:text-[11px] font-mono text-slate-400">
            P99: <span className="text-sky-400 font-bold">{latencyMs}ms</span>
          </div>
          <canvas ref={canvasRef} width={40} height={14} className="hidden md:block opacity-90" />
        </div>

        <div className="hidden md:block w-[1px] h-3.5 sm:h-4 bg-slate-700" />

        {/* TPS */}
        <div className="hidden md:block text-[11px] font-mono text-slate-400">
          TPS: <span className="text-emerald-400 font-bold">{tps}</span>
        </div>

        <div className="w-[1px] h-3.5 sm:h-4 bg-slate-700" />

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
