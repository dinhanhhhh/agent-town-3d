'use client';

import React, { useState } from 'react';
import { useTownStore } from '../../store/useTownStore';
import { STATIONS_LAYOUT } from '../../lib/scene/layout';
import { AgentRole } from '../../lib/pipeline/stages';
import { TOKENS } from '../../styles/tokens';
import { GitDiffViewer } from './GitDiffViewer';

const ARTIFACT_PREVIEWS: Record<AgentRole, { filename: string; language: string; content: string }> = {
  orchestrator: {
    filename: 'MilestonePlan.json',
    language: 'json',
    content: `{
  "milestone": "Sprint #24: Auth & Microservices",
  "status": "IN_PROGRESS",
  "orchestrator": "Claude Code 3D Hub",
  "tasks": [
    { "id": "TICK-142", "title": "Google OAuth 2.0 & JWT Auth", "assignedTo": "Dev", "status": "ACTIVE" },
    { "id": "TICK-143", "title": "Redis Caching Layer for DB", "assignedTo": "Dev", "status": "QUEUED" }
  ],
  "pipelineHealth": "HEALTHY",
  "feedbackLoopEnabled": true
}`,
  },
  pm: {
    filename: 'PRD.md',
    language: 'markdown',
    content: `# PRD: Xác thực đăng nhập Google OAuth 2.0 & Phân quyền JWT
**Author:** PM · Business Analyst (Agent 1)  
**Acceptance Criteria (Gherkin):**

Scenario: Người dùng đăng nhập thành công bằng tài khoản Google
  Given người dùng ở trang đăng nhập
  When bấm nút "Sign in with Google" và xác thực consent
  Then hệ thống tạo session JWT kèm refresh token 7 ngày
  And chuyển hướng tới Dashboard với quyền USER

Scenario: Token hết hạn (Edge Case)
  Given refresh token hết hạn hoặc bị thu hồi
  When người dùng gửi request API
  Then hệ thống trả mã lỗi 401 Unauthorized và yêu cầu đăng nhập lại`,
  },
  dev: {
    filename: 'source-code.diff',
    language: 'diff',
    content: `diff --git a/src/auth/oauth.service.ts b/src/auth/oauth.service.ts
index e69de29..4b825dc 100644
--- a/src/auth/oauth.service.ts
+++ b/src/auth/oauth.service.ts
@@ -14,6 +14,18 @@ export class GoogleAuthService {
+  async verifyGoogleToken(idToken: string): Promise<UserSession> {
+    const ticket = await this.googleClient.verifyIdToken({
+      idToken,
+      audience: process.env.GOOGLE_CLIENT_ID,
+    });
+    const payload = ticket.getPayload();
+    if (!payload?.email_verified) {
+      throw new UnauthorizedException('Email not verified by Google');
+    }
+    return this.generateJwtTokens(payload);
+  }
}`,
  },
  review: {
    filename: 'ReviewComments.json',
    language: 'json',
    content: `{
  "pullRequest": 87,
  "reviewer": "Tech Reviewer (Agent 3)",
  "verdict": "APPROVED",
  "score": 9.4,
  "summary": "Clean code architecture. Google token verification properly handles unverified email edge cases. No secrets leaked.",
  "comments": [
    { "file": "oauth.service.ts", "line": 21, "status": "RESOLVED", "note": "LGTM! Exception handling is compliant with OWASP standards." }
  ]
}`,
  },
  qa: {
    filename: 'TestReport.json',
    language: 'json',
    content: `{
  "suite": "Auth & Token Refresh Test Suite",
  "runner": "QA · Test Automation (Agent 4)",
  "totalTests": 48,
  "passed": 48,
  "failed": 0,
  "coverage": "98.4%",
  "durationMs": 1420,
  "testCases": [
    { "name": "Google OAuth happy path exchange", "status": "PASSED", "duration": "42ms" },
    { "name": "Expired token 401 unauthorized boundary", "status": "PASSED", "duration": "18ms" },
    { "name": "CSRF state parameter validation", "status": "PASSED", "duration": "24ms" }
  ]
}`,
  },
  security: {
    filename: 'SecurityScanReport.json',
    language: 'json',
    content: `{
  "scanner": "DevSecOps SAST & Dependency Auditor (Agent 5)",
  "status": "PASSED",
  "vulnerabilities": {
    "critical": 0,
    "high": 0,
    "medium": 0,
    "low": 0
  },
  "secretScanning": "0 API keys / tokens detected in git diff",
  "compliance": [
    { "standard": "OWASP Top 10", "status": "COMPLIANT" },
    { "standard": "JWT Best Practices RFC 8725", "status": "COMPLIANT" }
  ]
}`,
  },
  devops: {
    filename: 'Dockerfile',
    language: 'dockerfile',
    content: `# Production Multi-stage Container Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/main.js"]`,
  },
  monitor: {
    filename: 'ClusterHealth.json',
    language: 'json',
    content: `{
  "cluster": "k8s-prod-us-central",
  "watchdog": "APM Telemetry (Agent 7)",
  "status": "HEALTHY",
  "metrics": {
    "cpuUsage": "24.2%",
    "memoryUsage": "512MB / 2GB",
    "p99Latency": "14ms",
    "errorRate": "0.01%",
    "tps": 342
  },
  "alertsActive": 0,
  "lastCanarySync": "Just now"
}`,
  },
};

export const ArtifactModal: React.FC = () => {
  const isArtifactModalOpen = useTownStore((s) => s.isArtifactModalOpen);
  const openArtifactModal = useTownStore((s) => s.openArtifactModal);
  const selectedAgentRole = useTownStore((s) => s.selectedAgentRole) || 'orchestrator';
  const agents = useTownStore((s) => s.agents);
  const events = useTownStore((s) => s.events);
  const realArtifacts = useTownStore((s) => s.realArtifacts);

  const [activeTab, setActiveTab] = useState<'artifact' | 'prompt' | 'events'>('artifact');
  const [copied, setCopied] = useState(false);

  if (!isArtifactModalOpen) return null;

  const agent = agents[selectedAgentRole];
  const layout = STATIONS_LAYOUT[selectedAgentRole];
  const realArtifact = realArtifacts[selectedAgentRole];
  const artifact = realArtifact || ARTIFACT_PREVIEWS[selectedAgentRole];
  const isReal = Boolean(realArtifact);

  const handleCopy = () => {
    if (!artifact?.content) return;
    navigator.clipboard.writeText(artifact.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!artifact) return;
    const blob = new Blob([artifact.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = artifact.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-hidden overscroll-contain">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[85vh] animate-scale-up overscroll-contain">
        {/* Modal Header */}
        <div className="flex items-center justify-between gap-2 px-4 py-3 sm:px-6 sm:py-4 bg-slate-950/80 border-b border-slate-800">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div
              className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-2xl flex items-center justify-center text-lg sm:text-xl shadow-md"
              style={{ backgroundColor: `${TOKENS.colors['surface-container']}` }}
            >
              {selectedAgentRole === 'orchestrator' ? '🎛️' : '🏢'}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white truncate">{layout?.name}</h2>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                  {layout?.tag}
                </span>
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    agent?.status === 'working'
                      ? 'bg-emerald-400'
                      : agent?.status === 'debugging'
                      ? 'bg-amber-400'
                      : agent?.status === 'error'
                      ? 'bg-rose-500'
                      : agent?.status === 'waiting'
                      ? 'bg-purple-400'
                      : 'bg-slate-400'
                  }`}
                />
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate">{agent?.category}</p>
            </div>
          </div>
          <button
            onClick={() => openArtifactModal(false)}
            className="w-8 h-8 shrink-0 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 pt-2.5 sm:pt-3 bg-slate-950/40 border-b border-slate-800 overflow-x-auto scrollbar-none flex-nowrap">
          <button
            onClick={() => setActiveTab('artifact')}
            className={`px-3 sm:px-4 py-2 text-xs font-bold rounded-t-xl transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'artifact'
                ? 'text-white border-blue-400 bg-slate-800/60'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            📦 Artifact: {artifact?.filename}
          </button>
          <button
            onClick={() => setActiveTab('prompt')}
            className={`px-3 sm:px-4 py-2 text-xs font-bold rounded-t-xl transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'prompt'
                ? 'text-white border-blue-400 bg-slate-800/60'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            🧠 System Prompt
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`px-3 sm:px-4 py-2 text-xs font-bold rounded-t-xl transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'events'
                ? 'text-white border-blue-400 bg-slate-800/60'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            📜 Nhật ký Sự kiện ({events.length})
          </button>
        </div>

        {/* Content Body */}
        <div className="p-3.5 sm:p-6 overflow-y-auto overscroll-contain flex-1 font-mono text-xs">
          {activeTab === 'artifact' && (
            <div className="bg-slate-950 p-3 sm:p-4 rounded-2xl border border-slate-800 overflow-x-auto text-slate-300 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800 text-[11px] text-slate-400 font-sans">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-200">File: {artifact?.filename}</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 font-mono">
                    {artifact?.language}
                  </span>
                  {isReal ? (
                    <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      AI ĐÃ SINH
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-[9px] font-bold bg-slate-800 text-slate-400 rounded-full">
                      MOCK DEMO
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  >
                    <span>{copied ? '✅ Đã chép' : '📋 Sao chép'}</span>
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 hover:text-white border border-blue-500/40 transition-colors"
                  >
                    <span>💾 Tải về máy</span>
                  </button>
                </div>
              </div>

              {artifact?.language === 'diff' || artifact?.filename.endsWith('.diff') ? (
                <GitDiffViewer diffText={artifact.content} filename={artifact.filename} />
              ) : (
                <pre className="whitespace-pre font-mono text-xs leading-relaxed text-emerald-400 select-text overflow-x-auto">
                  {artifact?.content}
                </pre>
              )}
            </div>
          )}

          {activeTab === 'prompt' && (
            <div className="space-y-4 font-sans text-xs">
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                  Trạng thái hiện tại
                </span>
                <p className="text-sm font-semibold text-slate-200">"{agent?.speech}"</p>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                  Core System Prompt
                </span>
                <p className="text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-wrap">
                  {agent?.systemPrompt}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'events' && (
            <div className="space-y-2">
              {events.slice(0, 15).map((evt) => (
                <div
                  key={evt.id}
                  className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start gap-3"
                >
                  <span className="text-sm">
                    {evt.severity === 'error'
                      ? '❌'
                      : evt.severity === 'warn'
                      ? '⚠️'
                      : '✅'}
                  </span>
                  <div className="flex-1">
                    <p className="text-xs text-slate-200 font-sans">{evt.message}</p>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(evt.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 bg-slate-950/70 border-t border-slate-800 text-xs text-slate-400">
          <span>Tọa độ 3D: [{layout?.position.join(', ')}]</span>
          <button
            onClick={() => openArtifactModal(false)}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors font-semibold"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
