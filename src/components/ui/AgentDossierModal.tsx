'use client';

import React, { useState } from 'react';
import { useTownStore } from '../../store/useTownStore';
import { AgentRole, STAGE_ORDER } from '../../lib/pipeline/stages';
import { STATIONS_LAYOUT } from '../../lib/scene/layout';
import { sfx } from '../../lib/audio/sfx';
import { GitDiffViewer } from './GitDiffViewer';

// Danh mục Tech Stack chuyên môn của từng Agent
const AGENT_TECH_STACK: Record<AgentRole, string[]> = {
  orchestrator: ['Claude Code Hub', 'Gemini 3.8 Flash', 'DAG Milestones', 'Orchestrator Hub', 'Multi-Agent Bus'],
  pm: ['Notion Specs', 'Jira Software', 'Gherkin BDD', 'PRD RFC', 'User Story Mapping'],
  dev: ['Next.js 16', 'TypeScript 5.6', 'Tailwind CSS', 'Clean Architecture', 'Git Unified Diff'],
  review: ['GitHub PR Review', 'SonarQube', 'ESLint', 'Code Smells Audit', 'Boundary Safety'],
  qa: ['Playwright', 'Jest / Vitest', 'Coverage 98%', 'Edge Case Suite', 'K6 Load Test'],
  security: ['Trivy Scanner', 'OWASP Top 10', 'SAST Audit', 'Secret Leak Check', 'CVE Watchdog'],
  devops: ['Docker Multi-Stage', 'Kubernetes / K8s', 'ArgoCD GitOps', 'Canary Rollout', 'GitHub Actions'],
  monitor: ['Prometheus APM', 'Grafana Dashboard', 'P99 Latency Watcher', 'SRE Alertmanager', 'SLO / SLI'],
};

export const AgentDossierModal: React.FC = () => {
  const isDossierModalOpen = useTownStore((s) => s.isDossierModalOpen);
  const openDossierModal = useTownStore((s) => s.openDossierModal);
  const openArtifactModal = useTownStore((s) => s.openArtifactModal);
  const selectedAgentRole = useTownStore((s) => s.selectedAgentRole);
  const selectAgent = useTownStore((s) => s.selectAgent);
  const agents = useTownStore((s) => s.agents);
  const realArtifacts = useTownStore((s) => s.realArtifacts);

  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDossierModalOpen) {
        openDossierModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDossierModalOpen, openDossierModal]);

  if (!isDossierModalOpen || !selectedAgentRole) return null;

  const agent = agents[selectedAgentRole];
  const layout = STATIONS_LAYOUT[selectedAgentRole];
  const techStack = AGENT_TECH_STACK[selectedAgentRole] || [];
  const currentArtifact = realArtifacts[selectedAgentRole];
  const hexColor = '#' + layout.accentColor.toString(16).padStart(6, '0');

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    sfx.playPop();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (filename: string, content: string) => {
    sfx.playDeliveryChime();
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) openDossierModal(false);
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm animate-fade-in overflow-hidden overscroll-contain"
    >
      <div className="relative w-full max-w-2xl bg-[#0f172a]/95 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[85vh] text-slate-100 overscroll-contain">
        {/* HEADER BAR */}
        <div
          className="p-3.5 sm:p-5 flex flex-wrap items-center justify-between gap-2.5 border-b border-slate-700/60"
          style={{ backgroundColor: `${hexColor}15` }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-xl flex items-center justify-center text-lg sm:text-xl font-bold shadow-lg"
              style={{ backgroundColor: hexColor, color: '#ffffff' }}
            >
              {layout.tag.split(' ')[0] === 'HUB' ? '🎛️' : '🏢'}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {layout.tag}
                </span>
                <h2 className="text-base sm:text-lg font-bold text-white truncate">{layout.name}</h2>
                <span
                  className={`text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    agent.status === 'working'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : agent.status === 'debugging'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  ● {agent.status.toUpperCase()}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 truncate">{agent.category}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => openArtifactModal(true)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white border border-slate-700 transition whitespace-nowrap"
              title="Chuyển sang trình thanh tra Artifact & Nhật ký sự kiện"
            >
              📦 Xem Artifact & Logs
            </button>
            <button
              onClick={() => {
                openDossierModal(false);
                selectAgent(null);
              }}
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition shrink-0"
            >
              ✕
            </button>
          </div>
        </div>

        {/* BODY CONTENT - SCROLLABLE */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-3.5 sm:p-5 space-y-4 text-xs">
          {/* LỜI THOẠI / SUY NGHĨ HIỆN TẠI */}
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
              💬 Trạng thái & Lời thoại hiện tại:
            </span>
            <p className="text-sm font-medium text-slate-200 italic">
              &ldquo;{agent.speech}&rdquo;
            </p>
          </div>

          {/* TECH STACK CHUYÊN MÔN */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              🛠️ Bộ Công Nghệ & Trách Nhiệm Kỹ Thuật (Tech Stack):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {techStack.map((tech, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-200 border border-slate-700/80 flex items-center gap-1 shadow-sm"
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: hexColor }} />
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* SYSTEM PROMPT CORE */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              🧠 System Prompt Chỉ Đạo (Agent Core):
            </span>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[11px] leading-relaxed select-text">
              {agent.systemPrompt}
            </div>
          </div>

          {/* ARTIFACT GẦN NHẤT */}
          {currentArtifact && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                  📦 Artifact Vừa Tạo ({currentArtifact.filename}):
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopy(currentArtifact.content)}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
                  >
                    {copied ? '✓ Đã chép' : 'Sao chép mã'}
                  </button>
                  <button
                    onClick={() => handleDownload(currentArtifact.filename, currentArtifact.content)}
                    className="px-2.5 py-1 rounded bg-indigo-600/80 hover:bg-indigo-600 text-white transition"
                  >
                    Tải file
                  </button>
                </div>
              </div>
              {currentArtifact.language === 'diff' || currentArtifact.filename.endsWith('.diff') ? (
                <div className="max-h-60 overflow-y-auto overscroll-contain">
                  <GitDiffViewer diffText={currentArtifact.content} filename={currentArtifact.filename} />
                </div>
              ) : (
                <div className="max-h-48 overflow-y-auto overscroll-contain p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-emerald-300/90 whitespace-pre leading-relaxed select-text">
                  {currentArtifact.content}
                </div>
              )}
            </div>
          )}
        </div>

        {/* FOOTER SWITCHER GIỮA CÁC TRẠM */}
        <div className="p-3 sm:p-3.5 bg-slate-900/90 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <span className="text-slate-400 shrink-0">Xem nhanh trạm khác:</span>
          <div className="flex gap-1 overflow-x-auto scrollbar-none pb-0.5">
            {STAGE_ORDER.map((r) => (
              <button
                key={r}
                onClick={() => selectAgent(r, 'dossier')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition ${
                  selectedAgentRole === r
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {r === 'orchestrator' ? 'Hub' : r.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
