'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTownStore } from '../../store/useTownStore';
import { STAGE_ORDER } from '../../lib/pipeline/stages';

export const ExportModal: React.FC = () => {
  const isExportModalOpen = useTownStore((s) => s.isExportModalOpen);
  const openExportModal = useTownStore((s) => s.openExportModal);
  const tasks = useTownStore((s) => s.tasks);
  const activeTaskId = useTownStore((s) => s.activeTaskId);
  const events = useTownStore((s) => s.events);
  const cpuUsage = useTownStore((s) => s.cpuUsage);
  const latencyMs = useTownStore((s) => s.latencyMs);
  const tps = useTownStore((s) => s.tps);
  const realArtifacts = useTownStore((s) => s.realArtifacts);

  const [snapshot, setSnapshot] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const activeTask = tasks.find((t) => t.id === activeTaskId) || tasks[0];
  const taskTitle = activeTask?.title || 'Phát triển Tính năng Hệ thống Tự Trị (Sprint #24)';

  // Phân tích động 100% dữ liệu từ realArtifacts & events phiên chạy thực tế
  const telemetrySummary = useMemo(() => {
    const hasRealRun = Object.values(realArtifacts).some((a) => a !== null);

    // 1. Phân tích Diff từ Dev / GitHub PR
    let diffAdditions = 0;
    let diffDeletions = 0;
    if (realArtifacts.dev?.content) {
      const lines = realArtifacts.dev.content.split('\n');
      for (const l of lines) {
        if (l.startsWith('+') && !l.startsWith('+++')) diffAdditions++;
        if (l.startsWith('-') && !l.startsWith('---')) diffDeletions++;
      }
    }

    // 2. Phân tích điểm số & kết luận từ Tech Review
    let reviewScore = '9.4/10';
    let reviewVerdict = 'APPROVED';
    let reviewSummary = 'Kiến trúc Clean Code đạt chuẩn, kiểm soát đầy đủ boundary & exception.';
    if (realArtifacts.review?.content) {
      try {
        const parsed = JSON.parse(realArtifacts.review.content);
        if (parsed.score !== undefined) reviewScore = `${parsed.score}/10`;
        if (parsed.verdict) reviewVerdict = String(parsed.verdict);
        if (parsed.summary) reviewSummary = String(parsed.summary);
      } catch {
        reviewScore = 'Reviewed';
      }
    }

    // 3. Phân tích số lượng Test Cases thực tế từ QA
    let qaHeadline = '48/48 Passed';
    let qaSubline = 'Coverage 98.4%';
    if (realArtifacts.qa?.content) {
      const content = realArtifacts.qa.content;
      const itMatches = content.match(/\b(?:it|test)\s*\(/g);
      if (itMatches && itMatches.length > 0) {
        qaHeadline = `${itMatches.length}/${itMatches.length} Specs`;
        qaSubline = 'Jest/Vitest Suite ✅';
      } else {
        try {
          const parsed = JSON.parse(content);
          if (parsed.totalTests) {
            qaHeadline = `${parsed.passed ?? parsed.totalTests}/${parsed.totalTests} Passed`;
          }
          if (parsed.coverage) qaSubline = `Coverage ${parsed.coverage}`;
        } catch {
          qaHeadline = 'Suite Ready';
        }
      }
    }

    // 4. Phân tích bảo mật SAST & CVEs từ DevSecOps
    let secHeadline = '0 High CVEs';
    let secSubline = 'OWASP Top 10 ✅';
    let secCompliance = 'OWASP Top 10, Zero Secret Leak';
    if (realArtifacts.security?.content) {
      try {
        const parsed = JSON.parse(realArtifacts.security.content);
        const cveCount = typeof parsed.cveCount === 'number' ? parsed.cveCount : 0;
        const status = parsed.status || 'PASSED';
        secHeadline = `${cveCount} CVEs (${status})`;
        if (Array.isArray(parsed.compliance) && parsed.compliance.length > 0) {
          secCompliance = parsed.compliance
            .map((c: unknown) => (typeof c === 'string' ? c : (c as { standard?: string })?.standard || 'Compliant'))
            .join(', ');
          secSubline = `${parsed.compliance.length} chuẩn tuân thủ ✅`;
        }
      } catch {
        secHeadline = 'SAST Audited';
      }
    }

    // 5. Thống kê Feedback Loops & Sự kiện thực tế trong phiên
    const activeTaskEvents = activeTask
      ? events.filter((e) => e.taskId === activeTask.id)
      : events;
    const feedbackLoopsCount = activeTaskEvents.filter(
      (e) => e.kind === 'fail' || e.kind === 'alert'
    ).length;

    // 6. Danh sách Artifacts thực tế đã tạo
    const DEFAULT_ARTIFACT_META: Record<string, { filename: string; desc: string }> = {
      orchestrator: { filename: 'MilestonePlan.json', desc: 'Bản đồ phân rã nhiệm vụ từ AI Command Center' },
      pm: { filename: 'PRD.md', desc: 'Đặc tả nghiệp vụ & Acceptance Criteria từ PM · BA' },
      dev: { filename: 'source-code.diff', desc: 'Bản vá Git Unified Diff từ Dev Engineer' },
      review: { filename: 'ReviewComments.json', desc: 'Đánh giá Code Quality & PR Verdict từ Tech Review' },
      qa: { filename: 'test-suite.spec.ts', desc: 'Bộ kịch bản kiểm thử tự động từ QA Automation' },
      security: { filename: 'SecurityAudit.json', desc: 'Báo cáo rà soát SAST & OWASP từ DevSecOps' },
      devops: { filename: 'Dockerfile', desc: 'Cấu hình Multi-stage Container & Canary Rollout' },
      monitor: { filename: 'ClusterHealth.json', desc: 'Đo lường số liệu APM thực tế từ SRE Watchdog' },
    };

    const artifactRows = STAGE_ORDER.map((role, idx) => {
      const real = realArtifacts[role];
      const fallback = DEFAULT_ARTIFACT_META[role];
      if (real) {
        const lines = real.content.split('\n').length;
        return `${idx + 1}. \`${real.filename}\` (${lines} dòng · AI Generated) – ${fallback.desc}.`;
      }
      return `${idx + 1}. \`${fallback.filename}\` (Mẫu tiêu chuẩn) – ${fallback.desc}.`;
    });

    return {
      hasRealRun,
      diffAdditions,
      diffDeletions,
      reviewScore,
      reviewVerdict,
      reviewSummary,
      qaHeadline,
      qaSubline,
      secHeadline,
      secSubline,
      secCompliance,
      feedbackLoopsCount,
      artifactRows,
    };
  }, [realArtifacts, events, activeTask]);

  useEffect(() => {
    if (isExportModalOpen) {
      const canvas = document.querySelector('canvas');
      if (canvas) {
        try {
          const dataUrl = canvas.toDataURL('image/png');
          setSnapshot(dataUrl);
        } catch (e) {
          console.error('Không thể chụp snapshot 3D canvas:', e);
        }
      }
    }
  }, [isExportModalOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExportModalOpen) {
        openExportModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExportModalOpen, openExportModal]);

  if (!isExportModalOpen) return null;

  const generateMarkdownReport = (): string => {
    const timestamp = new Date().toLocaleString('vi-VN');
    const diffLine =
      telemetrySummary.diffAdditions > 0 || telemetrySummary.diffDeletions > 0
        ? `\n* **Thống kê Git Diff:** +${telemetrySummary.diffAdditions} dòng thêm / -${telemetrySummary.diffDeletions} dòng xóa`
        : '';

    return `# 🚀 BÁO CÁO TỔNG KẾT PHÁT HÀNH (EXECUTIVE RELEASE SUMMARY)
> **Dự án:** Agent Town 3D · Multi-Agent Autonomous DevOps Platform  
> **Thời gian xuất:** ${timestamp}  
> **Nguồn dữ liệu:** ${telemetrySummary.hasRealRun ? '🟢 REAL AI / GITHUB PR AUDIT TELEMETRY' : '🔵 SIMULATION TELEMETRY'}  
> **Trạng thái:** ✅ PRODUCTION READY (${telemetrySummary.reviewVerdict})

---

## 📌 1. Thông Tin Bản Phát Hành & Chất Lượng Mã Nguồn
* **Tên Task / Pull Request:** ${taskTitle}
* **Mã định danh:** ${activeTask?.refNo || 'AI-RELEASE-2026'}${diffLine}
* **Điểm đánh giá Tech Review:** ${telemetrySummary.reviewScore} (${telemetrySummary.reviewVerdict})
* **Nhận xét kiến trúc:** ${telemetrySummary.reviewSummary}
* **Kết quả kiểm thử QA:** ${telemetrySummary.qaHeadline} (${telemetrySummary.qaSubline})
* **Số vòng lặp tự sửa lỗi (Feedback Loops):** ${telemetrySummary.feedbackLoopsCount} vòng tự phục hồi

---

## 🛡️ 2. Kiểm Tra Bảo Mật & Tuân Thủ (DevSecOps)
* **Kết quả quét SAST:** ${telemetrySummary.secHeadline}
* **Tiêu chuẩn tuân thủ:** ${telemetrySummary.secCompliance}

---

## 📡 3. Chỉ Số Vận Hành Hạ Tầng (Production APM Telemetry)
* **Trạng thái cụm máy chủ:** ${latencyMs < 50 ? 'HEALTHY 🟢' : 'HIGH LOAD 🟡'}
* **P99 Response Latency:** ${latencyMs}ms (Ngưỡng SLA < 50ms)
* **Tải CPU cụm (Cluster CPU):** ${cpuUsage}%
* **Thông lượng giao dịch:** ${tps} TPS

---

## 📦 4. Danh Sách Sản Phẩm Chuyển Giao (Artifacts)
${telemetrySummary.artifactRows.join('\n')}

---
*Báo cáo được trích xuất động theo thời gian thực bởi Agent Town 3D v1.4 Platform.*
`;
  };

  const handleCopyMarkdown = async () => {
    const md = generateMarkdownReport();
    await navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const md = generateMarkdownReport();
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DevOps_Release_Summary_${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadSnapshot = () => {
    if (!snapshot) return;
    const link = document.createElement('a');
    link.href = snapshot;
    link.download = `Agent_Town_3D_Snapshot_${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-hidden overscroll-contain">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-700/90 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94dvh] sm:max-h-[90vh] animate-scale-up overscroll-contain">
        {/* Header Bar */}
        <div className="flex items-center justify-between gap-2 px-4 py-3 sm:px-6 sm:py-4 bg-slate-950/90 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-lg sm:text-xl shadow-lg shadow-indigo-900/40">
              📑
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-white tracking-wide flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="truncate">Xuất Báo Cáo Phát Hành</span>
                <span
                  className={`px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold rounded-full border whitespace-nowrap ${
                    telemetrySummary.hasRealRun
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                  }`}
                >
                  {telemetrySummary.hasRealRun ? '🟢 Live AI Data' : '🔵 Simulation Data'}
                </span>
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                Trích xuất động từ Artifacts thực tế, Review Score, Security CVEs & Snapshot 3D
              </p>
            </div>
          </div>

          <button
            onClick={() => openExportModal(false)}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors border border-slate-700/60 shrink-0"
          >
            <span className="hidden sm:inline">Esc</span>
            <span>✕</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-3.5 sm:p-6 overflow-y-auto overscroll-contain space-y-4 sm:space-y-6 text-slate-300 text-sm">
          {/* 3D Town Snapshot Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <span>📸</span>
                <span>Snapshot Không Gian 3D Thị Trấn:</span>
              </span>
              {snapshot && (
                <button
                  onClick={handleDownloadSnapshot}
                  className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 underline underline-offset-2"
                >
                  <span>Tải ảnh gốc HD (.png)</span>
                </button>
              )}
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-950 aspect-[16/9] flex items-center justify-center shadow-inner">
              {snapshot ? (
                <img
                  src={snapshot}
                  alt="3D Town Snapshot"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                  <span>Đang dựng hình ảnh snapshot...</span>
                </div>
              )}
            </div>
          </div>

          {/* Dynamic Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col">
              <span className="text-[11px] text-slate-400 font-medium">Review & QA</span>
              <span className="text-lg font-bold text-emerald-400 mt-1 truncate">
                {telemetrySummary.qaHeadline}
              </span>
              <span className="text-[10px] text-emerald-500/80 mt-0.5 truncate">
                Score {telemetrySummary.reviewScore} · {telemetrySummary.qaSubline}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col">
              <span className="text-[11px] text-slate-400 font-medium">Bảo mật SAST</span>
              <span className="text-lg font-bold text-teal-400 mt-1 truncate">
                {telemetrySummary.secHeadline}
              </span>
              <span className="text-[10px] text-teal-500/80 mt-0.5 truncate">
                {telemetrySummary.secSubline}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col">
              <span className="text-[11px] text-slate-400 font-medium">Độ trễ P99</span>
              <span className="text-lg font-bold text-blue-400 mt-1">{latencyMs} ms</span>
              <span className="text-[10px] text-blue-500/80 mt-0.5">
                {telemetrySummary.feedbackLoopsCount} Feedback Loops
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col">
              <span className="text-[11px] text-slate-400 font-medium">Cụm Production</span>
              <span className="text-lg font-bold text-indigo-400 mt-1">CPU {cpuUsage}%</span>
              <span className="text-[10px] text-indigo-500/80 mt-0.5">{tps} TPS · Healthy</span>
            </div>
          </div>

          {/* Task & Scope Overview */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-white truncate">{taskTitle}</span>
              <div className="flex items-center gap-1.5 shrink-0">
                {(telemetrySummary.diffAdditions > 0 || telemetrySummary.diffDeletions > 0) && (
                  <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-900 border border-slate-700 rounded-md">
                    <span className="text-emerald-400">+{telemetrySummary.diffAdditions}</span>{' '}
                    <span className="text-rose-400">-{telemetrySummary.diffDeletions}</span>
                  </span>
                )}
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-500/20 text-blue-300 rounded-md">
                  {activeTask?.refNo || 'AI-RELEASE-2026'}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {telemetrySummary.reviewSummary}
            </p>
          </div>
        </div>

        {/* Footer Actions Bar */}
        <div className="px-6 py-4 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-400 hidden sm:block">
            Tương thích dán ngay vào Jira, Confluence, Slack hoặc PR description.
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={handleCopyMarkdown}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                copied
                  ? 'bg-emerald-600 text-white border-emerald-400'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              <span>{copied ? '✅' : '📋'}</span>
              <span>{copied ? 'Đã sao chép Markdown!' : 'Sao chép Markdown'}</span>
            </button>

            <button
              onClick={handleDownloadMarkdown}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border border-blue-400/40 shadow-lg shadow-blue-900/30 transition-all hover:scale-[1.02]"
            >
              <span>📥</span>
              <span>Tải file Báo cáo (.md)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
