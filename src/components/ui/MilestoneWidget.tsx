'use client';

import React, { useState } from 'react';
import { useTownStore } from '../../store/useTownStore';

export const MilestoneWidget: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Tự động thu gọn danh sách task trên màn hình nhỏ (< 768px) để không che khuất ốc đảo 3D
  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsCollapsed(true);
    }
  }, []);
  const agents = useTownStore((s) => s.agents);
  const tasks = useTownStore((s) => s.tasks);
  const approvals = useTownStore((s) => s.approvals);
  const events = useTownStore((s) => s.events);
  const openApprovalModal = useTownStore((s) => s.openApprovalModal);
  const selectAgent = useTownStore((s) => s.selectAgent);

  // 1. Tính toán 4 chỉ số động
  const agentList = Object.values(agents);
  const runningCount = agentList.filter(
    (a) => a.status === 'working' || a.status === 'debugging'
  ).length;
  const pendingApprovals = approvals.filter((a) => a.status === 'pending');
  const pendingCount = pendingApprovals.length;
  const errorCount = agentList.filter((a) => a.status === 'error').length;
  const successCount =
    tasks.filter((t) => t.state === 'passed').length +
    approvals.filter((a) => a.status === 'approved').length +
    (runningCount === 0 && pendingCount === 0 && errorCount === 0 ? 1 : 0);

  // 2. Danh sách nhiệm vụ mẫu & thực tế
  const displayTasks =
    tasks.length > 0
      ? tasks.slice(0, 4)
      : [
          {
            id: 'task-142',
            refNo: 'TICK-142',
            title: 'Xác thực đăng nhập Google OAuth 2.0 & JWT',
            status: 'đã duyệt',
            badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          },
          {
            id: 'task-143',
            refNo: 'TICK-143',
            title: 'Tối ưu hóa Database query với Redis Caching',
            status: pendingCount > 0 ? 'chờ duyệt' : 'đang chạy',
            badgeClass:
              pendingCount > 0
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse'
                : 'bg-blue-500/20 text-blue-300 border-blue-500/30',
          },
          {
            id: 'task-144',
            refNo: 'TICK-144',
            title: 'Bổ sung thanh toán Stripe Webhook & bảo mật HMAC',
            status: 'sắp làm',
            badgeClass: 'bg-slate-800 text-slate-400 border-slate-700',
          },
          {
            id: 'task-145',
            refNo: 'TICK-145',
            title: 'Xuất báo cáo PDF giao dịch doanh nghiệp',
            status: 'sắp làm',
            badgeClass: 'bg-slate-800 text-slate-400 border-slate-700',
          },
        ];

  return (
    <div className="absolute top-14 left-2 sm:top-16 sm:left-3 z-30 w-60 sm:w-72 max-w-[calc(100vw-16px)] pointer-events-none transition-all duration-300 select-none">
      <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden p-2.5 sm:p-3 space-y-2 sm:space-y-2.5">
        {/* Header Widget */}
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <h2 className="text-sm font-extrabold text-white tracking-wide">
              Tổng quan
            </h2>
            <span className="text-[10px] font-medium text-slate-400">
              Sprint #24 · Dữ liệu thật
            </span>
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-5 h-5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors text-[10px]"
            title={isCollapsed ? 'Mở rộng bảng' : 'Thu gọn bảng'}
          >
            {isCollapsed ? '▼' : '▲'}
          </button>
        </div>

        {/* 4 Ô số liệu (Bento Tiles) */}
        <div className="grid grid-cols-4 gap-1.5">
          {/* Ô 1: Đang chạy */}
          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-amber-500/10 border border-amber-500/25 text-center">
            <span className="text-base font-black text-amber-400 leading-tight">
              {runningCount}
            </span>
            <span className="text-[9px] font-semibold text-amber-300/80 mt-0.5">
              đang chạy
            </span>
          </div>

          {/* Ô 2: Chờ duyệt */}
          <div
            onClick={() => {
              if (pendingCount > 0) openApprovalModal(true);
            }}
            className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
              pendingCount > 0
                ? 'bg-orange-500/20 border-orange-500/40 text-orange-300 cursor-pointer hover:scale-105 shadow-md shadow-orange-950/40'
                : 'bg-slate-800/60 border-slate-700/50 text-slate-400'
            }`}
          >
            <span className="text-base font-black leading-tight">
              {pendingCount}
            </span>
            <span className="text-[9px] font-semibold mt-0.5">
              chờ duyệt
            </span>
          </div>

          {/* Ô 3: Lỗi */}
          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-rose-500/10 border border-rose-500/25 text-center">
            <span className="text-base font-black text-rose-400 leading-tight">
              {errorCount}
            </span>
            <span className="text-[9px] font-semibold text-rose-300/80 mt-0.5">
              lỗi
            </span>
          </div>

          {/* Ô 4: Thành công */}
          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-center">
            <span className="text-base font-black text-emerald-400 leading-tight">
              {successCount}
            </span>
            <span className="text-[9px] font-semibold text-emerald-300/80 mt-0.5">
              hoàn tất
            </span>
          </div>
        </div>

        {/* Danh sách nhiệm vụ (List Tasks) */}
        {!isCollapsed && (
          <div className="space-y-1.5 pt-1 border-t border-slate-800/80 animate-fade-in">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider px-0.5">
              <span>Nhiệm vụ & Cổng duyệt</span>
              <span className="text-slate-500">{displayTasks.length} task</span>
            </div>

            <div className="space-y-1 max-h-48 overflow-y-auto scrollbar-none pr-0.5">
              {displayTasks.map((t: any) => {
                const isPending =
                  t.status === 'chờ duyệt' ||
                  (t.state === 'in_progress' && t.stage === 'devops');
                const isPassed = t.status === 'đã duyệt' || t.state === 'passed';

                return (
                  <div
                    key={t.id || t.refNo}
                    onClick={() => {
                      if (isPending) {
                        openApprovalModal(true);
                      } else {
                        selectAgent(t.stage || 'dev', 'artifact');
                      }
                    }}
                    className="p-2 rounded-xl bg-slate-950/60 hover:bg-slate-800/70 border border-slate-800/80 hover:border-slate-700/80 transition-all cursor-pointer flex items-center justify-between gap-2 group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold text-slate-400 group-hover:text-blue-300">
                          {t.refNo}
                        </span>
                      </div>
                      <p className="text-[11px] font-medium text-slate-200 truncate group-hover:text-white">
                        {t.title}
                      </p>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-md text-[9px] font-bold border whitespace-nowrap ${
                        isPending
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                          : isPassed
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {isPending
                        ? 'chờ duyệt'
                        : isPassed
                        ? 'đã duyệt'
                        : 'đang chạy'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
