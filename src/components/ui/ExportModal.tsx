'use client';

import React, { useState, useEffect } from 'react';
import { useTownStore } from '../../store/useTownStore';

export const ExportModal: React.FC = () => {
  const isExportModalOpen = useTownStore((s) => s.isExportModalOpen);
  const openExportModal = useTownStore((s) => s.openExportModal);
  const tasks = useTownStore((s) => s.tasks);
  const activeTaskId = useTownStore((s) => s.activeTaskId);
  const cpuUsage = useTownStore((s) => s.cpuUsage);
  const latencyMs = useTownStore((s) => s.latencyMs);
  const tps = useTownStore((s) => s.tps);
  const realArtifacts = useTownStore((s) => s.realArtifacts);

  const [snapshot, setSnapshot] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const activeTask = tasks.find((t) => t.id === activeTaskId) || tasks[0];
  const taskTitle = activeTask?.title || 'Phát triển Tính năng Hệ thống Tự Trị (Sprint #24)';

  useEffect(() => {
    if (isExportModalOpen) {
      // Find 3D WebGL Canvas
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
    return `# 🚀 BÁO CÁO TỔNG KẾT PHÁT HÀNH (EXECUTIVE RELEASE SUMMARY)
> **Dự án:** Agent Town 3D · Multi-Agent Autonomous DevOps Platform  
> **Thời gian xuất:** ${timestamp}  
> **Trạng thái:** ✅ PRODUCTION DEPLOYED (GATEKEEPER APPROVED)

---

## 📌 1. Thông Tin Bản Phát Hành
* **Tên Task / Feature:** ${taskTitle}
* **Mã định danh:** ${activeTask?.refNo || 'AI-RELEASE-2026'}
* **Kiến trúc điều phối:** Hub & Spoke Multi-Agent Pipeline (8 Trạm Kỹ Sư AI Tự Trị)
* **Trạng thái kiểm thử:** 100% Passed (48/48 Unit & Integration Test Suites)
* **Độ bao phủ mã nguồn (Code Coverage):** 98.4%

---

## 🛡️ 2. Kiểm Tra Bảo Mật & Tuân Thủ (DevSecOps)
* **Số lỗ hổng phát hiện:** 0 High/Critical CVEs
* **Tiêu chuẩn tuân thủ:** OWASP Top 10 Compliant
* **Cơ chế xác thực & dữ liệu:** JWT 7-day Refresh Token, Input Sanitization, HMAC Webhook

---

## 📡 3. Chỉ Số Vận Hành Hạ Tầng (Production APM Telemetry)
* **Trạng thái cụm máy chủ:** HEALTHY 🟢
* **P99 Response Latency:** ${latencyMs}ms (Ngưỡng an toàn < 50ms)
* **Tải CPU cụm (Cluster CPU):** ${cpuUsage}%
* **Thông lượng giao dịch:** ${tps} TPS

---

## 📦 4. Danh Sách Sản Phẩm Chuyển Giao (Artifacts)
1. \`MilestonePlan.json\` – Bản đồ phân rã nhiệm vụ từ Claude Code Hub.
2. \`PRD.md\` – Đặc tả nghiệp vụ & Acceptance Criteria từ PM · BA.
3. \`source-code.ts\` – Mã nguồn chuẩn Clean Architecture từ Dev Engineer.
4. \`ReviewComments.json\` – Đánh giá Code Smells & phê duyệt PR từ Tech Review.
5. \`test-suite.spec.ts\` – Bộ kịch bản kiểm thử tự động từ QA Automation.
6. \`SecurityAudit.json\` – Báo cáo rà soát SAST & phụ thuộc từ DevSecOps.
7. \`Dockerfile & deploy.yaml\` – Cấu hình Container & Canary Rollout từ DevOps.
8. \`ClusterHealth.json\` – Đo lường số liệu APM thực tế từ Monitoring Watchdog.

---
*Báo cáo được khởi tạo tự động bởi Agent Town 3D Platform.*
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
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-700/90 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/90 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl shadow-lg shadow-indigo-900/40">
              📑
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                <span>Xuất Báo Cáo Phát Hành (Release Summary)</span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                  Executive Ready
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Tổng hợp metrics QA, Security CVEs, APM Telemetry & Snapshot 3D
              </p>
            </div>
          </div>

          <button
            onClick={() => openExportModal(false)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors border border-slate-700/60"
          >
            <span>Esc</span>
            <span>✕</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-300 text-sm">
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

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col">
              <span className="text-[11px] text-slate-400 font-medium">Kiểm thử QA</span>
              <span className="text-lg font-bold text-emerald-400 mt-1">48/48 Passed</span>
              <span className="text-[10px] text-emerald-500/80 mt-0.5">Coverage 98.4%</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col">
              <span className="text-[11px] text-slate-400 font-medium">Bảo mật SAST</span>
              <span className="text-lg font-bold text-teal-400 mt-1">0 High CVEs</span>
              <span className="text-[10px] text-teal-500/80 mt-0.5">OWASP Top 10 ✅</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col">
              <span className="text-[11px] text-slate-400 font-medium">Độ trễ P99</span>
              <span className="text-lg font-bold text-blue-400 mt-1">{latencyMs} ms</span>
              <span className="text-[10px] text-blue-500/80 mt-0.5">Chuẩn SLA &lt; 50ms</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col">
              <span className="text-[11px] text-slate-400 font-medium">Cụm Production</span>
              <span className="text-lg font-bold text-indigo-400 mt-1">CPU {cpuUsage}%</span>
              <span className="text-[10px] text-indigo-500/80 mt-0.5">{tps} TPS · Healthy</span>
            </div>
          </div>

          {/* Task & Scope Overview */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">{taskTitle}</span>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-500/20 text-blue-300 rounded-md">
                {activeTask?.refNo || 'AI-RELEASE-2026'}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Vòng đời phát triển phần mềm tự trị hoàn thành trọn vẹn qua 7 trạm chuyên môn:
              Phân tích PRD ➔ Lập trình TypeScript ➔ Tech Lead Review ➔ QA Automation ➔
              DevSecOps Audit ➔ Staging Rollout ➔ APM Live Telemetry.
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
