'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useTownStore } from '../../store/useTownStore';
import { STATIONS_LAYOUT } from '../../lib/scene/layout';

/**
 * Màn hình Terminal Live Token Stream (SSE):
 * Tự động xuất hiện gọn gàng ở góc phải màn hình khi AI đang sinh mã / đặc tả thời gian thực,
 * tích hợp nút ⏹ Dừng khẩn cấp (AbortController).
 */
export const LiveStreamConsole: React.FC = () => {
  const isRealRunning = useTownStore((s) => s.isRealRunning);
  const streamingStage = useTownStore((s) => s.streamingStage);
  const streamingFilename = useTownStore((s) => s.streamingFilename);
  const streamingContent = useTownStore((s) => s.streamingContent);
  const isLogDrawerOpen = useTownStore((s) => s.isLogDrawerOpen);
  const abortPipeline = useTownStore((s) => s.abortPipeline);

  const [isMinimized, setIsMinimized] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [elapsedSec, setElapsedSec] = useState<number>(0);
  const scrollRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    setStartTime(Date.now());
    setElapsedSec(0);
  }, [streamingStage]);

  useEffect(() => {
    if (!isRealRunning || !streamingStage) return;
    const interval = setInterval(() => {
      setElapsedSec((Date.now() - startTime) / 1000);
    }, 200);
    return () => clearInterval(interval);
  }, [isRealRunning, streamingStage, startTime]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [streamingContent]);

  if (!isRealRunning || !streamingStage) return null;

  const layout = STATIONS_LAYOUT[streamingStage];
  const lineCount = streamingContent ? streamingContent.split('\n').length : 0;
  const estimatedTokens = Math.max(1, Math.round(streamingContent.length / 3.8));
  const tokenSpeed = elapsedSec > 0.5 ? (estimatedTokens / elapsedSec).toFixed(1) : '--';

  return (
    <div
      className={`fixed right-2 sm:right-3 z-30 w-[390px] max-w-[calc(100vw-16px)] pointer-events-auto transition-all duration-300 ${
        isLogDrawerOpen ? 'top-14 sm:top-16' : 'bottom-24 lg:bottom-14'
      }`}
    >
      <div className="bg-slate-950/95 backdrop-blur-md border border-cyan-500/40 rounded-2xl shadow-2xl shadow-cyan-950/50 overflow-hidden flex flex-col">
        {/* Console Header */}
        <div className="flex items-center justify-between px-3.5 py-2 bg-slate-900/95 border-b border-slate-800">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-300 shrink-0">
              LIVE STREAM
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-[11px] font-bold text-white truncate">
              {layout?.name || streamingStage}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-amber-300 border border-slate-700 truncate">
              {streamingFilename}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={abortPipeline}
              className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-rose-600/25 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 transition-colors flex items-center gap-1"
              title="Dừng ngay luồng AI đang chạy (AbortController)"
            >
              <span>⏹</span>
              <span>Dừng</span>
            </button>
            <button
              type="button"
              onClick={() => setIsMinimized(!isMinimized)}
              className="w-5 h-5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-[10px] transition-colors"
              title={isMinimized ? 'Mở rộng khung stream' : 'Thu gọn'}
            >
              {isMinimized ? '▲' : '▼'}
            </button>
          </div>
        </div>

        {/* Live Token Output Body */}
        {!isMinimized && (
          <>
            <pre
              ref={scrollRef}
              className="p-3 max-h-44 min-h-[84px] overflow-y-auto overscroll-contain font-mono text-[11px] leading-relaxed text-emerald-300/95 whitespace-pre-wrap break-words select-text"
            >
              {streamingContent || 'Đang khởi tạo luồng suy luận AI...'}
              <span className="inline-block w-1.5 h-3.5 ml-0.5 align-middle bg-cyan-400 animate-pulse" />
            </pre>

            <div className="px-3.5 py-1.5 bg-slate-900/80 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span className="flex items-center gap-1.5 truncate">
                <span className="text-emerald-400 font-bold">~{estimatedTokens} tokens</span>
                <span>·</span>
                <span className="text-cyan-300 font-semibold">{tokenSpeed} tok/s</span>
                <span>·</span>
                <span>{elapsedSec.toFixed(1)}s</span>
              </span>
              <span className="text-cyan-400 shrink-0">SSE Active ⚡</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
