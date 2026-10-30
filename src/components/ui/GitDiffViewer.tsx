'use client';

import React, { useState } from 'react';

interface GitDiffViewerProps {
  diffText: string;
  filename?: string;
}

interface DiffLine {
  type: 'add' | 'delete' | 'chunk' | 'meta' | 'normal';
  content: string;
  oldLine?: number;
  newLine?: number;
}

/**
 * Trình xem Diff Git chuẩn GitHub (Interactive Git Diff Viewer):
 * - Tô màu dòng thêm mới (+) màu xanh lá, dòng xóa (-) màu đỏ, header (@@) màu tím.
 * - Đánh số thứ tự dòng chuẩn xác.
 * - Nút chuyển đổi Unified View / Split View và thống kê số dòng thay đổi.
 */
export const GitDiffViewer: React.FC<GitDiffViewerProps> = ({ diffText, filename = 'source-code.diff' }) => {
  const [viewMode, setViewMode] = useState<'unified' | 'split'>('unified');

  // Phân tích cú pháp diff text thành danh sách dòng
  const lines = React.useMemo(() => {
    const rawLines = diffText.split('\n');
    const parsed: DiffLine[] = [];
    let oldNum = 0;
    let newNum = 0;

    for (const line of rawLines) {
      if (line.startsWith('@@')) {
        // Parse chunk header: @@ -14,6 +14,18 @@
        const match = line.match(/@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
        if (match) {
          oldNum = parseInt(match[1], 10);
          newNum = parseInt(match[2], 10);
        }
        parsed.push({ type: 'chunk', content: line });
      } else if (line.startsWith('+') && !line.startsWith('+++')) {
        parsed.push({
          type: 'add',
          content: line,
          newLine: newNum++,
        });
      } else if (line.startsWith('-') && !line.startsWith('---')) {
        parsed.push({
          type: 'delete',
          content: line,
          oldLine: oldNum++,
        });
      } else if (
        line.startsWith('diff --git') ||
        line.startsWith('index ') ||
        line.startsWith('--- ') ||
        line.startsWith('+++ ')
      ) {
        parsed.push({ type: 'meta', content: line });
      } else {
        parsed.push({
          type: 'normal',
          content: line,
          oldLine: oldNum ? oldNum++ : undefined,
          newLine: newNum ? newNum++ : undefined,
        });
      }
    }

    return parsed;
  }, [diffText]);

  // Thống kê số dòng thêm/xóa
  const addCount = lines.filter((l) => l.type === 'add').length;
  const deleteCount = lines.filter((l) => l.type === 'delete').length;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden font-mono text-xs shadow-inner">
      {/* HEADER THANH CÔNG CỤ GIT DIFF */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-2.5 sm:px-3.5 py-2 bg-slate-900/90 border-b border-slate-800 text-[11px] font-sans">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-semibold text-slate-200 flex items-center gap-1.5 truncate">
            <span className="text-sm shrink-0">📄</span>
            <span className="truncate">{filename}</span>
          </span>
          {/* Thống kê Git + / - */}
          <div className="flex items-center gap-1 font-mono text-[10px] font-bold shrink-0">
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              +{addCount}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
              -{deleteCount}
            </span>
          </div>
        </div>

        {/* Nút chuyển đổi Unified / Split View */}
        <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-lg border border-slate-700 shrink-0">
          <button
            onClick={() => setViewMode('unified')}
            className={`px-2 py-0.5 rounded text-[10px] font-medium transition ${
              viewMode === 'unified'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Unified
          </button>
          <button
            onClick={() => setViewMode('split')}
            className={`px-2 py-0.5 rounded text-[10px] font-medium transition ${
              viewMode === 'split'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Split (2 Cột)
          </button>
        </div>
      </div>

      {/* BODY DIFF VIEW */}
      {viewMode === 'unified' ? (
        <div className="overflow-x-auto divide-y divide-slate-900/60 leading-relaxed select-text">
          {lines.map((line, idx) => {
            const isAdd = line.type === 'add';
            const isDel = line.type === 'delete';
            const isChunk = line.type === 'chunk';
            const isMeta = line.type === 'meta';

            return (
              <div
                key={idx}
                className={`flex items-start text-[11px] font-mono px-2 py-0.5 transition-colors ${
                  isAdd
                    ? 'bg-emerald-950/40 text-emerald-300 border-l-2 border-emerald-500'
                    : isDel
                    ? 'bg-rose-950/40 text-rose-300 border-l-2 border-rose-500'
                    : isChunk
                    ? 'bg-indigo-950/50 text-indigo-300 font-bold border-l-2 border-indigo-500'
                    : isMeta
                    ? 'bg-slate-900/40 text-slate-400 font-semibold'
                    : 'text-slate-300 hover:bg-slate-900/40'
                }`}
              >
                {/* Số thứ tự dòng cũ */}
                <span className="w-8 shrink-0 text-right pr-2 text-slate-600 select-none text-[10px]">
                  {line.oldLine || ''}
                </span>
                {/* Số thứ tự dòng mới */}
                <span className="w-8 shrink-0 text-right pr-2.5 text-slate-600 select-none text-[10px] border-r border-slate-800/80 mr-2">
                  {line.newLine || ''}
                </span>
                {/* Ký hiệu + / - */}
                <span className="w-4 shrink-0 text-center font-bold select-none text-slate-500">
                  {isAdd ? '+' : isDel ? '-' : isChunk ? ' ' : ' '}
                </span>
                {/* Nội dung code */}
                <span className="whitespace-pre flex-1 pl-1">{line.content}</span>
              </div>
            );
          })}
        </div>
      ) : (
        /* SPLIT VIEW (2 CỘT BEFORE / AFTER - Tự động xếp 1 cột trên màn hình nhỏ < 768px) */
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800 text-[11px] font-mono select-text overflow-x-auto">
          {/* CỘT BEFORE (BEFORE / DELETE) */}
          <div className="divide-y divide-slate-900/60">
            <div className="px-3 py-1 bg-slate-900/80 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              Trước (Original)
            </div>
            {lines
              .filter((l) => l.type !== 'add')
              .map((line, idx) => (
                <div
                  key={idx}
                  className={`flex px-2 py-0.5 ${
                    line.type === 'delete'
                      ? 'bg-rose-950/40 text-rose-300'
                      : line.type === 'chunk'
                      ? 'bg-indigo-950/40 text-indigo-300 font-bold'
                      : 'text-slate-300'
                  }`}
                >
                  <span className="w-6 shrink-0 text-right pr-2 text-slate-600 select-none text-[10px]">
                    {line.oldLine || ''}
                  </span>
                  <span className="whitespace-pre flex-1 pl-1 truncate">{line.content}</span>
                </div>
              ))}
          </div>

          {/* CỘT AFTER (AFTER / ADD) */}
          <div className="divide-y divide-slate-900/60">
            <div className="px-3 py-1 bg-slate-900/80 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              Sau (Pull Request Patch)
            </div>
            {lines
              .filter((l) => l.type !== 'delete')
              .map((line, idx) => (
                <div
                  key={idx}
                  className={`flex px-2 py-0.5 ${
                    line.type === 'add'
                      ? 'bg-emerald-950/40 text-emerald-300'
                      : line.type === 'chunk'
                      ? 'bg-indigo-950/40 text-indigo-300 font-bold'
                      : 'text-slate-300'
                  }`}
                >
                  <span className="w-6 shrink-0 text-right pr-2 text-slate-600 select-none text-[10px]">
                    {line.newLine || ''}
                  </span>
                  <span className="whitespace-pre flex-1 pl-1 truncate">{line.content}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
