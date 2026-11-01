import { AgentRole } from './stages';

/**
 * Danh mục Tech Stack & công cụ chuyên môn của 8 AI Agents
 */
export const AGENT_TECH_STACK: Record<AgentRole, string[]> = {
  orchestrator: ['Claude Code Hub', 'Gemini 3.8 Flash', 'DAG Milestones', 'Orchestrator Hub', 'Multi-Agent Bus'],
  pm: ['Notion Specs', 'Jira Software', 'Gherkin BDD', 'PRD RFC', 'User Story Mapping'],
  dev: ['Next.js 16', 'TypeScript 5.6', 'Tailwind CSS', 'Clean Architecture', 'Git Unified Diff'],
  review: ['GitHub PR Review', 'SonarQube', 'ESLint', 'Code Smells Audit', 'Boundary Safety'],
  qa: ['Playwright', 'Jest / Vitest', 'Coverage 98%', 'Edge Case Suite', 'K6 Load Test'],
  security: ['Trivy Scanner', 'OWASP Top 10', 'SAST Audit', 'Secret Leak Check', 'CVE Watchdog'],
  devops: ['Docker Multi-Stage', 'Kubernetes / K8s', 'ArgoCD GitOps', 'Canary Rollout', 'GitHub Actions'],
  monitor: ['Prometheus APM', 'Grafana Dashboard', 'P99 Latency Watcher', 'SRE Alertmanager', 'SLO / SLI'],
};

/**
 * Bản mẫu Artifact dự phòng (Mock Previews) cho 8 phòng ban
 */
export const ARTIFACT_PREVIEWS: Record<AgentRole, { filename: string; language: string; content: string }> = {
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
