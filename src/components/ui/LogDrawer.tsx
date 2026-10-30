'use client';

import React from 'react';
import { useTownStore } from '../../store/useTownStore';
import { STATIONS_LAYOUT } from '../../lib/scene/layout';
import { AgentRole } from '../../lib/pipeline/stages';

export const LogDrawer: React.FC = () => {
  const isLogDrawerOpen = useTownStore((s) => s.isLogDrawerOpen);
  const toggleLogDrawer = useTownStore((s) => s.toggleLogDrawer);
  const events = useTownStore((s) => s.events);
  const tasks = useTownStore((s) => s.tasks);
  const activeTaskId = useTownStore((s) => s.activeTaskId);

  const listRef = React.useRef<HTMLDivElement>(null);

  // Tự động cuộn xuống dòng mới nhất khi có sự kiện phát sinh
  React.useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [events.length]);

  if (!isLogDrawerOpen) {
    return null;
  }

  const getAgentRole = (agentId: string): AgentRole => {
    const role = agentId.replace('agent-', '') as AgentRole;
    return STATIONS_LAYOUT[role] ? role : 'orchestrator';
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
  };

  return (
    <aside
      aria-label="Nhật ký công việc thực tế"
      className="fixed bottom-24 lg:bottom-14 right-2 sm:right-4 z-40 w-[420px] max-w-[calc(100vw-16px)] h-[340px] sm:h-[380px] max-h-[60vh] bg-[#fbf6ea] border-2 border-[#d97706]/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-800 pointer-events-auto select-none overscroll-contain"
      style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
    >
      {/* Header bar phong cách giấy da retro Solomi */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#f5ebd6] border-b border-[#e6d6b8] shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-base">📋</span>
          <div>
            <h2 className="text-xs font-black tracking-wider uppercase text-[#78350f]">
              Nhật ký việc (Nhật ký thật)
            </h2>
            <p className="text-[10px] text-amber-800/80 font-medium">
              Theo dõi telemetry & feedback loop giữa 8 AI Agents
            </p>
          </div>
        </div>

        <button
          onClick={() => toggleLogDrawer(false)}
          className="w-7 h-7 flex items-center justify-center rounded-xl bg-amber-200/60 hover:bg-amber-300 text-amber-900 font-bold text-xs transition-colors"
          title="Đóng bảng nhật ký"
        >
          ✕
        </button>
      </div>

      {/* Task tóm tắt đang chạy */}
      {activeTaskId && (
        <div className="px-4 py-2 bg-amber-50/80 border-b border-amber-200/50 flex items-center justify-between text-[11px] shrink-0">
          <span className="font-semibold text-amber-950 truncate max-w-[300px]">
            ⚡ Task: {tasks.find((t) => t.id === activeTaskId)?.title || 'Đang thực thi...'}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
            Realtime
          </span>
        </div>
      )}

      {/* Bảng danh sách nhật ký cuộn mượt (Kích thước cố định, nội dung cuộn bên trong) */}
      <div
        ref={listRef}
        className="flex-1 min-h-0 overflow-y-auto divide-y divide-amber-200/60 text-xs"
      >
        {events.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            Chưa có sự kiện nào. Hãy bấm "✨ Giao việc AI" để khởi chạy pipeline!
          </div>
        ) : (
          events.map((evt) => {
            const role = getAgentRole(evt.agentId);
            const layout = STATIONS_LAYOUT[role];

            return (
              <div
                key={evt.id}
                className="p-3 hover:bg-[#fef9ee] transition-colors flex items-start gap-3"
              >
                {/* Thời gian */}
                <div className="font-mono text-[10px] text-amber-900/60 font-semibold pt-0.5 shrink-0">
                  {formatTime(evt.createdAt)}
                </div>

                {/* Agent Tag */}
                <div className="shrink-0">
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold text-white shadow-sm"
                    style={{ backgroundColor: `#${layout.accentColor.toString(16).padStart(6, '0')}` }}
                  >
                    {layout.name}
                  </span>
                </div>

                {/* Nội dung việc */}
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-medium text-slate-800 leading-snug break-words">
                    {evt.message}
                  </div>
                </div>

                {/* Trạng thái tag */}
                <div className="shrink-0 pt-0.5">
                  {evt.kind === 'pass' && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      ✓ Đạt
                    </span>
                  )}
                  {evt.kind === 'fail' && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                      ⚠ Lỗi
                    </span>
                  )}
                  {evt.kind === 'start' && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                      ▶ Bắt đầu
                    </span>
                  )}
                  {evt.kind === 'approve_needed' && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-100 text-purple-800 border border-purple-300 animate-pulse">
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
      <div className="px-4 py-2 bg-[#f5ebd6] border-t border-[#e6d6b8] flex items-center justify-between text-[10px] text-amber-900/70 font-medium shrink-0">
        <span>Tổng cộng: {events.length} sự kiện</span>
        <button
          onClick={() => {
            const text = events.map((e) => `[${formatTime(e.createdAt)}] ${e.agentId}: ${e.message}`).join('\n');
            navigator.clipboard.writeText(text);
            alert('Đã sao chép nhật ký sự kiện vào clipboard!');
          }}
          className="hover:text-amber-950 font-bold underline"
        >
          Sao chép tất cả
        </button>
      </div>
    </aside>
  );
};
