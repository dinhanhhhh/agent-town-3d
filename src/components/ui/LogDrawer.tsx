'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useTownStore } from '../../store/useTownStore';
import { STATIONS_LAYOUT } from '../../lib/scene/layout';
import { AgentRole, STAGE_ORDER } from '../../lib/pipeline/stages';

export const LogDrawer: React.FC = () => {
  const isLogDrawerOpen = useTownStore((s) => s.isLogDrawerOpen);
  const toggleLogDrawer = useTownStore((s) => s.toggleLogDrawer);
  const events = useTownStore((s) => s.events);
  const tasks = useTownStore((s) => s.tasks);
  const activeTaskId = useTownStore((s) => s.activeTaskId);
  const selectAgent = useTownStore((s) => s.selectAgent);

  const [filterType, setFilterType] = useState<'all' | 'errors' | AgentRole>('all');
  const [copied, setCopied] = useState(false);

  const listRef = useRef<HTMLDivElement>(null);

  // Tự động cuộn mượt lên dòng sự kiện mới nhất (events[0])
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [events.length]);

  const getAgentRole = (agentId: string): AgentRole => {
    const role = agentId.replace('agent-', '') as AgentRole;
    return STATIONS_LAYOUT[role] ? role : 'orchestrator';
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
  };

  const filteredEvents = useMemo(() => {
    if (filterType === 'all') return events;
    if (filterType === 'errors') {
      return events.filter((e) => e.kind === 'fail' || e.kind === 'alert' || e.severity === 'error' || e.severity === 'warn');
    }
    return events.filter((e) => getAgentRole(e.agentId) === filterType);
  }, [events, filterType]);

  if (!isLogDrawerOpen) {
    return null;
  }

  const handleCopyAll = async () => {
    const text = events.map((e) => `[${formatTime(e.createdAt)}] ${e.agentId}: ${e.message}`).join('\n');
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <aside
      aria-label="Nhật ký công việc thực tế"
      className="fixed bottom-24 lg:bottom-14 right-2 sm:right-4 z-40 w-[440px] max-w-[calc(100vw-16px)] h-[380px] sm:h-[420px] max-h-[65vh] bg-slate-950/95 backdrop-blur-xl border border-slate-700/80 rounded-3xl shadow-2xl shadow-black/60 flex flex-col overflow-hidden text-slate-200 pointer-events-auto select-none overscroll-contain animate-scale-up"
    >
      {/* Header bar Dark Glassmorphism */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-sm">
            📋
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold tracking-wider uppercase text-white">
                Nhật ký việc (Live Audit Logs)
              </h2>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[10px] text-slate-400 font-medium">
              Theo dõi telemetry & feedback loop giữa 8 AI Agents
            </p>
          </div>
        </div>

        <button
          onClick={() => toggleLogDrawer(false)}
          className="w-7 h-7 flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white font-bold text-xs transition-colors"
          title="Đóng bảng nhật ký"
        >
          ✕
        </button>
      </div>

      {/* Filter Tabs & Task info */}
      <div className="px-3 py-2 bg-slate-900/60 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-1.5 shrink-0 text-[11px]">
        {/* Bộ lọc nhanh */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
          <button
            onClick={() => setFilterType('all')}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-colors ${
              filterType === 'all'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            Tất cả ({events.length})
          </button>
          <button
            onClick={() => setFilterType('errors')}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-colors flex items-center gap-1 ${
              filterType === 'errors'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-rose-300 hover:text-white'
            }`}
          >
            <span>⚠️</span>
            <span>Lỗi / Feedback</span>
          </button>

          {/* Quick station selector */}
          <select
            value={STAGE_ORDER.includes(filterType as AgentRole) ? filterType : ''}
            onChange={(e) => {
              if (e.target.value) setFilterType(e.target.value as AgentRole);
            }}
            className="px-1.5 py-0.5 rounded-lg text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700 focus:outline-none"
          >
            <option value="">Lọc theo Trạm...</option>
            {STAGE_ORDER.map((role) => (
              <option key={role} value={role}>
                {STATIONS_LAYOUT[role]?.name || role}
              </option>
            ))}
          </select>
        </div>

        {activeTaskId && (
          <span className="text-[10px] text-amber-300 font-mono font-medium truncate max-w-[150px]">
            {tasks.find((t) => t.id === activeTaskId)?.title || 'Task'}
          </span>
        )}
      </div>

      {/* Bảng danh sách nhật ký (Newest first, click to fly camera) */}
      <div
        ref={listRef}
        className="flex-1 min-h-0 overflow-y-auto divide-y divide-slate-800/70 text-xs"
      >
        {filteredEvents.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            Không có sự kiện nào phù hợp bộ lọc.
          </div>
        ) : (
          filteredEvents.map((evt) => {
            const role = getAgentRole(evt.agentId);
            const layout = STATIONS_LAYOUT[role];

            return (
              <div
                key={evt.id}
                onClick={() => {
                  selectAgent(role, 'none');
                }}
                className="p-3 hover:bg-slate-900/80 transition-colors flex items-start gap-2.5 cursor-pointer group"
                title="Bấm để đưa camera bay tới vị trí trạm này"
              >
                {/* Thời gian */}
                <div className="font-mono text-[10px] text-slate-500 font-semibold pt-0.5 shrink-0">
                  {formatTime(evt.createdAt)}
                </div>

                {/* Agent Tag */}
                <div className="shrink-0">
                  <span
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold text-white shadow-sm"
                    style={{ backgroundColor: `#${layout.accentColor.toString(16).padStart(6, '0')}` }}
                  >
                    {layout.tag || layout.name}
                  </span>
                </div>

                {/* Nội dung việc */}
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-medium text-slate-300 group-hover:text-white leading-snug break-words">
                    {evt.message}
                  </div>
                </div>

                {/* Trạng thái tag */}
                <div className="shrink-0 pt-0.5">
                  {evt.kind === 'pass' && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      ✓ Đạt
                    </span>
                  )}
                  {evt.kind === 'fail' && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse">
                      ⚠ Lỗi
                    </span>
                  )}
                  {evt.kind === 'start' && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      ▶ Chạy
                    </span>
                  )}
                  {evt.kind === 'approve_needed' && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 animate-pulse">
                      ⏱ Chờ duyệt
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer bar */}
      <div className="px-4 py-2.5 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-medium shrink-0">
        <span>
          Hiển thị: {filteredEvents.length} / {events.length} sự kiện
        </span>
        <button
          onClick={handleCopyAll}
          className="hover:text-white text-indigo-400 font-semibold underline underline-offset-2 flex items-center gap-1"
        >
          <span>{copied ? '✅ Đã chép!' : '📋 Sao chép tất cả'}</span>
        </button>
      </div>
    </aside>
  );
};
