'use client';

import React, { useEffect } from 'react';
import { useTownStore } from '../../store/useTownStore';
import { sfx } from '../../lib/audio/sfx';

export const KeyboardShortcutsModal: React.FC = () => {
  const isKeyboardModalOpen = useTownStore((s) => s.isKeyboardModalOpen);
  const openKeyboardModal = useTownStore((s) => s.openKeyboardModal);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isKeyboardModalOpen) {
        sfx.playPop();
        openKeyboardModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isKeyboardModalOpen, openKeyboardModal]);

  if (!isKeyboardModalOpen) return null;

  const categories = [
    {
      title: '🎮 Điều khiển Camera RTS & 8 Trạm AI',
      icon: '📐',
      shortcuts: [
        { keys: ['0'], desc: 'Bay tới & thanh tra HUB 0 (Claude Code Orchestrator)' },
        { keys: ['1', '…', '7'], desc: 'Bay chuẩn xác tới STATION 1 (PM) ➔ STATION 7 (APM)' },
        { keys: ['8'], desc: 'Đặt lại góc nhìn toàn cảnh đảo 3D (Overview)' },
        { keys: ['[', ']'], desc: 'Lướt chuyển góc nhìn sang trạm trước đó / trạm kế tiếp' },
        { keys: ['R'], desc: 'Bật / Tắt xoay đảo 360° tự động (Auto-Rotate)' },
        { keys: ['F'], desc: 'Bật / Tắt chế độ Đạo diễn bám theo Shipper (Auto-Follow)' },
        { keys: ['+', '-'], desc: 'Phóng to / Thu nhỏ mức zoom camera không gian' },
      ],
    },
    {
      title: '⚡ Điều hành Pipeline & Giám sát',
      icon: '🚀',
      shortcuts: [
        { keys: ['Ctrl', 'K'], desc: 'Mở cửa sổ giao việc cho 8 AI / GitHub PR Audit (hoặc gõ /)' },
        { keys: ['Space'], desc: 'Tạm dừng / Tiếp tục chu kỳ mô phỏng (Play / Pause)' },
        { keys: ['D'], desc: 'Mở bảng chẩn đoán Cluster Telemetry & SRE Golden Signals' },
        { keys: ['L'], desc: 'Bật / Tắt ngăn kéo Nhật ký sự kiện (Log Drawer)' },
        { keys: ['C'], desc: 'Bật / Tắt camera giám sát bàn làm việc (Desk Cam PiP)' },
      ],
    },
    {
      title: '🎨 Môi trường, Âm thanh & Tiện ích',
      icon: '✨',
      shortcuts: [
        { keys: ['T'], desc: 'Chuyển chu kỳ thời gian (Tự động ➔ Ngày ➔ Hoàng hôn ➔ Đêm)' },
        { keys: ['M'], desc: 'Bật / Tắt hiệu ứng âm thanh Synthesizer (Mute / Unmute)' },
        { keys: ['V'], desc: 'Bật / Tắt thuyết minh giọng nói AI Voice (Web Speech TTS)' },
        { keys: ['Esc'], desc: 'Đóng thanh tra hoặc modal đang mở và trở lại đảo 3D' },
        { keys: ['?', 'H'], desc: 'Mở bảng tra cứu phím tắt RTS này bất kỳ lúc nào' },
      ],
    },
  ];

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          sfx.playPop();
          openKeyboardModal(false);
        }
      }}
      className="fixed inset-0 z-[1060] flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overscroll-contain"
      role="dialog"
      aria-modal="true"
      aria-labelledby="keyboard-modal-title"
    >
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/90 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] animate-scale-up ring-1 ring-cyan-500/20">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 bg-slate-950/80 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center text-lg sm:text-xl shadow-lg shadow-cyan-900/40">
              ⌨️
            </div>
            <div className="min-w-0">
              <h2
                id="keyboard-modal-title"
                className="text-sm sm:text-base font-bold text-white tracking-wide flex items-center gap-2"
              >
                <span>Phím tắt Điều khiển RTS</span>
                <span className="px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-full">
                  Game Mode Hotkeys
                </span>
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                Tương tác siêu tốc với đảo 3D và 8 phòng ban không cần rời tay khỏi bàn phím
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sfx.playPop();
              openKeyboardModal(false);
            }}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors border border-slate-700/60 shrink-0"
          >
            <span className="hidden sm:inline">Esc</span>
            <span>✕</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto overscroll-contain">
          {categories.map((cat, idx) => (
            <div key={idx} className="space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                <span>{cat.icon}</span>
                <span>{cat.title}</span>
              </div>

              <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-2 sm:p-3 divide-y divide-slate-800/60">
                {cat.shortcuts.map((item, sIdx) => (
                  <div
                    key={sIdx}
                    className="flex items-center justify-between py-2 px-1 text-xs gap-3 hover:bg-slate-900/50 rounded-lg transition-colors"
                  >
                    <span className="text-slate-300 font-sans text-[11px] sm:text-xs">
                      {item.desc}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      {item.keys.map((k, kIdx) => (
                        <kbd
                          key={kIdx}
                          className="px-2 py-1 text-[10px] sm:text-xs font-mono font-bold bg-slate-800/90 hover:bg-slate-700/90 text-cyan-300 border border-slate-700 border-b-2 border-b-slate-600 rounded-lg shadow-sm min-w-[24px] text-center"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Quick Tip Banner */}
          <div className="p-3 bg-cyan-950/40 border border-cyan-800/40 rounded-2xl flex items-start gap-2.5 text-xs text-cyan-200">
            <span className="text-base shrink-0">💡</span>
            <p className="leading-relaxed text-[11px] sm:text-xs text-cyan-300/90 font-sans">
              <strong>Mẹo điều khiển RTS:</strong> Nhấn số <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700 font-mono">1</kbd> đến <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700 font-mono">8</kbd> để nhảy góc máy cận cảnh vào bàn làm việc của từng Agent, kết hợp phím <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700 font-mono">C</kbd> để ghim màn hình Desk Cam theo dõi trực tiếp dòng sinh mã!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 sm:px-6 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span className="text-[11px] font-mono text-slate-500">
            Agent Town 3D · v1.6.0 Game Engine
          </span>
          <button
            onClick={() => {
              sfx.playPop();
              openKeyboardModal(false);
            }}
            className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition shadow-lg shadow-cyan-950/50"
          >
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  );
};
