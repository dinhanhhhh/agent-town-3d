'use client';

import React, { useState } from 'react';
import { useTownStore } from '../../store/useTownStore';
import { simulator } from '../../lib/events/MockSimulator';
import { AgentRole } from '../../lib/pipeline/stages';
import { GitDiffViewer } from './GitDiffViewer';

const BUILDING_NAMES: Record<AgentRole, string> = {
  orchestrator: 'AI Command Center (Trung tâm)',
  pm: 'Product Strategy Lab (Tây Bắc)',
  dev: 'Software Engineering Lab (Chính Tây)',
  review: 'Code Review & Architecture Lab (Tây Nam)',
  qa: 'QA Automation Server Lab (Đông Bắc)',
  security: 'CyberSec & SAST Vault (Chính Đông)',
  devops: 'Container & K8s Release Hub (Đông Nam)',
  monitor: 'SRE Radar & NOC Watchtower (Chính Bắc)',
};

const DEFAULT_ARTIFACTS: Record<
  'dev' | 'review' | 'qa' | 'security' | 'devops' | 'pm',
  {
    role: AgentRole;
    agentName: string;
    icon: string;
    badgeStatus: string;
    filename: string;
    language: string;
    summary: string;
    content: string;
  }
> = {
  review: {
    role: 'review',
    agentName: 'Tech Reviewer (Agent 3)',
    icon: '🔍',
    badgeStatus: 'PR #87 LGTM & Approved',
    filename: 'ReviewComments.json',
    language: 'json',
    summary: 'Đã rà soát Clean Code, kiểm tra rò rỉ bộ nhớ, boundary checks và xử lý lỗi theo chuẩn OWASP.',
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
    role: 'qa',
    agentName: 'QA Automation (Agent 4)',
    icon: '🧪',
    badgeStatus: '48/48 Test Cases Passed (Coverage 98.4%)',
    filename: 'auth.spec.ts',
    language: 'typescript',
    summary: 'Bộ 48 kịch bản kiểm thử tự động: Happy Path SSO, Token Expiration 401, Invalid Signature và CSRF State check.',
    content: `describe('GoogleAuthService Integration & Unit Tests (48 Test Cases)', () => {
  let service: GoogleAuthService;

  beforeEach(async () => {
    service = new GoogleAuthService(mockJwtService);
  });

  describe('Happy Path: Google OAuth Login', () => {
    it('Xác thực idToken hợp lệ và cấp cặp JWT access/refresh token', async () => {
      const result = await service.verifyGoogleToken('valid-mock-token');
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.user.email).toBe('engineer@devops.town');
    });
  });

  describe('Negative & Edge Cases', () => {
    it('Ném lỗi 401 Unauthorized khi email chưa được verify từ Google', async () => {
      await expect(service.verifyGoogleToken('unverified-email-token'))
        .rejects.toThrow('Email chưa được xác thực từ Google');
    });

    it('Từ chối token hết hạn hoặc giả mạo chữ ký (Tampered HMAC)', async () => {
      await expect(service.verifyGoogleToken('expired-google-token'))
        .rejects.toThrow();
    });
  });
});`,
  },
  security: {
    role: 'security',
    agentName: 'DevSecOps SAST (Agent 5)',
    icon: '🛡️',
    badgeStatus: '0 Lỗ hổng nghiêm trọng · No Secret Leaks',
    filename: 'SecurityScanReport.json',
    language: 'json',
    summary: 'Quét tĩnh SAST và Dependency Auditor. Kiểm tra OWASP Top 10 và khuyến nghị bảo mật JWT RFC 8725.',
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
    role: 'devops',
    agentName: 'Canary Deploy (Agent 6)',
    icon: '🚀',
    badgeStatus: 'Sẵn sàng điều phối 10% traffic Production',
    filename: 'Dockerfile',
    language: 'dockerfile',
    summary: 'Dockerfile multi-stage tối ưu hóa image size dưới 85MB và chuẩn bị rollout 10% traffic qua ArgoCD.',
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
  dev: {
    role: 'dev',
    agentName: 'Dev Engineer (Agent 2)',
    icon: '💻',
    badgeStatus: 'Đã hoàn thành mã nguồn',
    filename: 'oauth.service.ts',
    language: 'typescript',
    summary: 'Triển khai GoogleAuthService NestJS xác thực Google OAuth2 và cấp phát cặp token JWT.',
    content: `import { Injectable, UnauthorizedException } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { JwtService } from '@nestjs/jwt';

export interface UserSession {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

@Injectable()
export class GoogleAuthService {
  private googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  constructor(private readonly jwtService: JwtService) {}

  async verifyGoogleToken(idToken: string): Promise<UserSession> {
    const ticket = await this.googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload?.email_verified) {
      throw new UnauthorizedException('Email chưa được xác thực từ Google');
    }

    const user = {
      id: payload.sub,
      email: payload.email || '',
      name: payload.name || '',
      role: 'USER',
    };

    const accessToken = this.jwtService.sign(user, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign({ sub: user.id }, { expiresIn: '7d' });

    return { accessToken, refreshToken, user };
  }
}`,
  },
  pm: {
    role: 'pm',
    agentName: 'PM · BA (Agent 1)',
    icon: '📄',
    badgeStatus: 'PRD Specs Chốt',
    filename: 'PRD.md',
    language: 'markdown',
    summary: 'Tài liệu đặc tả sản phẩm & Acceptance Criteria Gherkin.',
    content: `# PRD: Xác thực đăng nhập Google OAuth 2.0 & Phân quyền JWT
**Ticket:** TICK-142 | **Branch:** main | **Sprint:** #24  
**Tác giả:** PM · Business Analyst (Agent 1)  

---

## 1. Mục tiêu Sản phẩm
Cung cấp giải pháp đăng nhập Single Sign-On (SSO) an toàn và tiện lợi cho người dùng qua Google OAuth 2.0, cấp phiên làm việc bằng cặp JWT tokens (Access Token 15 phút, Refresh Token 7 ngày).

## 2. Tiêu chuẩn nghiệm thu (Acceptance Criteria - Gherkin)
\`\`\`gherkin
Scenario: Đăng nhập thành công bằng tài khoản Google
  Given người dùng ở trang đăng nhập
  When bấm nút "Sign in with Google" và xác thực consent
  Then backend xác minh chữ ký Google ID token
  And phát hành cặp token JWT vào Cookie HttpOnly
  And điều hướng người dùng vào Dashboard với quyền USER

Scenario: Token hết hạn (Edge Case)
  Given Access Token 15 phút đã hết hạn
  When người dùng thực hiện API request
  Then interceptor tự động dùng Refresh Token 7 ngày để lấy token mới
  And tiếp tục thực thi request mà không làm gián đoạn trải nghiệm người dùng
\`\`\`

## 3. Rủi ro & Giải pháp Bảo mật (DevSecOps)
- Chặn replay attacks bằng Nonce validation.
- Lưu trữ refresh token mã hóa trong Redis có TTL tự hủy.`,
  },
};

type TabType = 'checklist' | 'dev' | 'review' | 'qa' | 'security' | 'devops' | 'pm' | 'prd';

export const ApprovalModal: React.FC = () => {
  const isApprovalModalOpen = useTownStore((s) => s.isApprovalModalOpen);
  const openApprovalModal = useTownStore((s) => s.openApprovalModal);
  const approvals = useTownStore((s) => s.approvals);
  const tasks = useTownStore((s) => s.tasks);
  const activeTaskId = useTownStore((s) => s.activeTaskId);
  const isRealRunning = useTownStore((s) => s.isRealRunning);
  const realArtifacts = useTownStore((s) => s.realArtifacts);
  const resolveApproval = useTownStore((s) => s.resolveApproval);
  const selectAgent = useTownStore((s) => s.selectAgent);
  const setCameraZoom = useTownStore((s) => s.setCameraZoom);

  const [activeTab, setActiveTab] = useState<TabType>('checklist');
  const [expandedStation, setExpandedStation] = useState<AgentRole | null>('review');
  const [copied, setCopied] = useState(false);

  if (!isApprovalModalOpen) return null;

  const currentApproval = approvals.find((a) => a.status === 'pending');
  const activeTask = tasks.find((t) => t.id === (currentApproval?.taskId || activeTaskId));

  const handleApprove = () => {
    if (currentApproval) {
      if (isRealRunning) {
        resolveApproval(currentApproval.id, 'approved');
      } else {
        simulator.resolveApproval(currentApproval.id, 'approved');
      }
    } else {
      openApprovalModal(false);
    }
  };

  const handleReject = () => {
    if (currentApproval) {
      if (isRealRunning) {
        resolveApproval(currentApproval.id, 'rejected');
      } else {
        simulator.resolveApproval(currentApproval.id, 'rejected');
      }
    } else {
      openApprovalModal(false);
    }
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Fly 3D Camera directly to the agent's work station without opening Dossier modal
  const flyToStation = (role: AgentRole) => {
    openApprovalModal(false);
    selectAgent(role, 'none');
    setCameraZoom(38);
  };

  // Get active artifact content for a role
  const getArtifact = (role: 'dev' | 'review' | 'qa' | 'security' | 'devops' | 'pm') => {
    const fallback = DEFAULT_ARTIFACTS[role];
    const real = realArtifacts[role];
    return {
      ...fallback,
      filename: real?.filename || fallback.filename,
      language: real?.language || fallback.language,
      content: real?.content || fallback.content,
      isReal: Boolean(real),
    };
  };

  const reviewArtifact = getArtifact('review');
  const qaArtifact = getArtifact('qa');
  const securityArtifact = getArtifact('security');
  const devopsArtifact = getArtifact('devops');
  const devArtifact = getArtifact('dev');
  const pmArtifact = getArtifact('pm');

  const checklistItems = [
    { role: 'review' as AgentRole, artifact: reviewArtifact, isDone: true },
    { role: 'qa' as AgentRole, artifact: qaArtifact, isDone: true },
    { role: 'security' as AgentRole, artifact: securityArtifact, isDone: true },
    { role: 'devops' as AgentRole, artifact: devopsArtifact, isDone: false },
  ];

  const currentTabArtifact =
    activeTab === 'dev'
      ? devArtifact
      : activeTab === 'review'
      ? reviewArtifact
      : activeTab === 'qa'
      ? qaArtifact
      : activeTab === 'security'
      ? securityArtifact
      : activeTab === 'devops'
      ? devopsArtifact
      : activeTab === 'pm' || activeTab === 'prd'
      ? pmArtifact
      : null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-hidden overscroll-contain">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94dvh] sm:max-h-[92vh] animate-scale-up overscroll-contain">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 px-4 py-3 sm:px-6 sm:py-4 bg-gradient-to-r from-amber-950/50 via-slate-900 to-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-lg sm:text-xl">
              🛡️
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-white tracking-wide flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="truncate">Cổng Phê Duyệt Production</span>
                <span className="px-2 py-0.5 text-[9px] sm:text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 whitespace-nowrap">
                  ✨ 4/4 Trạm Đã Sẵn Sàng
                </span>
              </h2>
              <p className="text-[11px] sm:text-xs text-amber-400 font-medium truncate">
                Production Release Gatekeeper · Rà soát mã nguồn & tiêu chuẩn chất lượng
              </p>
            </div>
          </div>
          <button
            onClick={() => openApprovalModal(false)}
            className="w-8 h-8 shrink-0 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 px-3 sm:px-6 pt-2.5 sm:pt-3 bg-slate-950/60 border-b border-slate-800 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('checklist')}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'checklist'
                ? 'text-white border-amber-400 bg-slate-800/80 shadow-sm'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            📋 Tiêu chuẩn Kiểm duyệt
          </button>

          <button
            onClick={() => setActiveTab('dev')}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-colors border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'dev'
                ? 'text-white border-blue-400 bg-slate-800/80 shadow-sm'
                : 'text-blue-300 border-transparent hover:text-white'
            }`}
          >
            <span>💻 Code Dev ({devArtifact.filename})</span>
          </button>

          <button
            onClick={() => setActiveTab('review')}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-colors border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'review'
                ? 'text-white border-sky-400 bg-slate-800/80 shadow-sm'
                : 'text-sky-300 border-transparent hover:text-white'
            }`}
          >
            <span>🔍 Review ({reviewArtifact.filename})</span>
          </button>

          <button
            onClick={() => setActiveTab('qa')}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-colors border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'qa'
                ? 'text-white border-purple-400 bg-slate-800/80 shadow-sm'
                : 'text-purple-300 border-transparent hover:text-white'
            }`}
          >
            <span>🧪 Unit Tests ({qaArtifact.filename})</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-colors border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'security'
                ? 'text-white border-emerald-400 bg-slate-800/80 shadow-sm'
                : 'text-emerald-300 border-transparent hover:text-white'
            }`}
          >
            <span>🛡️ Security ({securityArtifact.filename})</span>
          </button>

          <button
            onClick={() => setActiveTab('devops')}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-colors border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'devops'
                ? 'text-white border-amber-400 bg-slate-800/80 shadow-sm'
                : 'text-amber-300 border-transparent hover:text-white'
            }`}
          >
            <span>🚀 Canary ({devopsArtifact.filename})</span>
          </button>

          <button
            onClick={() => setActiveTab('prd')}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-colors border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'prd'
                ? 'text-white border-teal-400 bg-slate-800/80 shadow-sm'
                : 'text-teal-300 border-transparent hover:text-white'
            }`}
          >
            <span>📄 PRD ({pmArtifact.filename})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-3.5 sm:p-6 overflow-y-auto overscroll-contain flex-1 text-sm text-slate-300 space-y-4">
          {/* Target Task Details Header */}
          <div className="p-3 sm:p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs">
                <span className="font-bold text-amber-400">
                  {activeTask?.refNo || 'TICK-142'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Branch: main
                </span>
                <span className="hidden sm:inline text-slate-400">·</span>
                <span className="text-[11px] font-mono text-emerald-400 truncate">
                  registry.devops.town/api:latest
                </span>
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-100 truncate">
                {activeTask?.title || 'Xác thực đăng nhập Google OAuth 2.0 & JWT'}
              </div>
            </div>

            <button
              onClick={() => setActiveTab('dev')}
              className="px-3 py-1.5 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 hover:text-white border border-blue-500/40 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 shrink-0"
            >
              <span>💻 Xem Code Dev</span>
              <span>➔</span>
            </button>
          </div>

          {/* TAB 1: CHECKLIST WITH ACCORDION & 3D FLY-TO */}
          {activeTab === 'checklist' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Kết quả kiểm thử từ các AI Station (Bấm vào để xem chỗ làm & chi tiết)
                </h3>
                <span className="text-[11px] text-amber-400 font-medium">
                  💡 Nhấn vào trạm để xem code/báo cáo hoặc bay camera 3D
                </span>
              </div>

              <div className="space-y-2.5">
                {checklistItems.map(({ role, artifact, isDone }) => {
                  const isExpanded = expandedStation === role;
                  const building = BUILDING_NAMES[role];

                  return (
                    <div
                      key={role}
                      className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                        isExpanded
                          ? 'bg-slate-950 border-amber-500/60 shadow-lg'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {/* Clickable Header Row */}
                      <div
                        onClick={() => setExpandedStation(isExpanded ? null : role)}
                        className="flex items-center justify-between p-3.5 cursor-pointer select-none"
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-base mt-0.5">
                            {isDone ? '✅' : '⏳'}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-100 text-sm">
                                {artifact.agentName}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                                📍 {building}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {artifact.badgeStatus}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              flyToStation(role);
                            }}
                            className="px-2.5 py-1 text-[11px] font-bold text-amber-300 hover:text-white bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 rounded-xl transition-all flex items-center gap-1 shadow-sm"
                            title="Đóng modal và bay camera 3D tới trạm làm việc của agent"
                          >
                            <span>🔭 Bay tới trạm 3D</span>
                          </button>
                          <span className="text-slate-500 text-xs transition-transform duration-200">
                            {isExpanded ? '▲' : '▼'}
                          </span>
                        </div>
                      </div>

                      {/* Expanded Work Place & Artifact Preview */}
                      {isExpanded && (
                        <div className="px-4 pb-4 pt-1 border-t border-slate-800/80 space-y-3 animate-fade-in">
                          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                            <span className="text-slate-300 italic">
                              {artifact.summary}
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleCopyCode(artifact.content)}
                                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs transition-colors flex items-center gap-1"
                              >
                                <span>{copied ? '✅ Đã chép' : '📋 Sao chép'}</span>
                              </button>
                              <button
                                onClick={() => setActiveTab(role as TabType)}
                                className="px-2.5 py-1 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 hover:text-white border border-blue-500/40 rounded-lg text-xs transition-colors flex items-center gap-1"
                              >
                                <span>📖 Mở tab toàn màn hình</span>
                              </button>
                            </div>
                          </div>

                          {/* Code Preview Box */}
                          <div className="relative">
                            <div className="absolute top-2 right-3 text-[10px] font-mono text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
                              {artifact.filename} ({artifact.language})
                            </div>
                            <pre className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-emerald-400 leading-relaxed overflow-x-auto max-h-48 select-text">
                              {artifact.content}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2 TO 7: DEDICATED FULL-SCREEN WORK ARTIFACT VIEW */}
          {activeTab !== 'checklist' && currentTabArtifact && (
            <div className="space-y-3 animate-fade-in">
              {/* Station Work Place Banner */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 shrink-0 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-lg">
                    {currentTabArtifact.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <span className="font-bold text-white text-xs sm:text-sm">
                        {currentTabArtifact.agentName}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 truncate">
                        📍 {BUILDING_NAMES[currentTabArtifact.role]}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate">
                      File làm việc: <span className="font-mono text-amber-300">{currentTabArtifact.filename}</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <button
                    onClick={() => flyToStation(currentTabArtifact.role)}
                    className="px-2.5 sm:px-3 py-1.5 text-xs font-bold text-amber-300 hover:text-white bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <span>🔭 Bay tới trạm 3D</span>
                  </button>
                  <button
                    onClick={() => handleCopyCode(currentTabArtifact.content)}
                    className="px-2.5 sm:px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs transition-colors flex items-center gap-1.5"
                  >
                    <span>{copied ? '✅ Đã chép' : '📋 Sao chép'}</span>
                  </button>
                  <button
                    onClick={() =>
                      handleDownload(currentTabArtifact.filename, currentTabArtifact.content)
                    }
                    className="px-2.5 sm:px-3 py-1.5 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 hover:text-white border border-blue-500/40 rounded-xl text-xs transition-colors flex items-center gap-1.5"
                  >
                    <span>💾 Tải về máy</span>
                  </button>
                </div>
              </div>

              {/* Code / Git Diff Block */}
              {currentTabArtifact.language === 'diff' ||
              currentTabArtifact.filename.endsWith('.diff') ? (
                <div className="max-h-[50vh] overflow-y-auto overscroll-contain">
                  <GitDiffViewer
                    diffText={currentTabArtifact.content}
                    filename={currentTabArtifact.filename}
                  />
                </div>
              ) : (
                <pre className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-mono text-emerald-400 leading-relaxed overflow-x-auto max-h-[50vh] overscroll-contain select-text">
                  {currentTabArtifact.content}
                </pre>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons Footer */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 px-4 py-3 sm:px-6 sm:py-4 bg-slate-950/70 border-t border-slate-800">
          <div className="flex items-center gap-2">
            {activeTab !== 'checklist' && (
              <button
                onClick={() => setActiveTab('checklist')}
                className="w-full sm:w-auto px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all"
              >
                ← Quay lại Tiêu chuẩn Kiểm duyệt
              </button>
            )}
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              onClick={handleReject}
              className="flex-1 sm:flex-initial px-3.5 sm:px-4 py-2 text-xs font-bold text-rose-300 hover:text-white bg-rose-950/50 hover:bg-rose-900/60 border border-rose-800/70 rounded-xl transition-all shadow-md"
            >
              ❌ Từ chối (Trả về Dev)
            </button>
            <button
              onClick={handleApprove}
              className="flex-1 sm:flex-initial px-4 sm:px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl transition-all shadow-lg shadow-emerald-900/30"
            >
              🚀 Duyệt Release Production
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
