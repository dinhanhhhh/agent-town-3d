/**
 * Agent Town 3D - Multi-Agent DevOps Pipeline Engine
 * Manages 8 Autonomous Agents, Event Dispatching, Artifacts, Audio SFX, and Simulation Lifecycle.
 */

(function () {
  'use strict';

  // 1. Core Agents Metadata & System Specs (from AGENTS.md)
  const AGENT_DEFINITIONS = {
    orchestrator: {
      id: 'orchestrator',
      name: 'Claude Code',
      role: 'Orchestrator Hub',
      icon: '🏰',
      color: '#7c2d37',
      systemPrompt: 'Bạn là Orchestrator chính của hệ thống DevOps tự trị. Nhiệm vụ của bạn là nhận yêu cầu tính năng từ người dùng, phân rã thành User Stories, theo dõi trạng thái các agent trạm, kích hoạt feedback loop khi có lỗi và tổng kết bản phát hành cuối cùng.',
      defaultSpeech: 'Sẵn sàng nhận prompt phát triển phần mềm...',
      category: 'Pipeline Dispatcher'
    },
    pm: {
      id: 'pm',
      name: 'PM · BA',
      role: 'Product Manager & Business Analyst',
      icon: '🏢',
      color: '#c49a6c',
      systemPrompt: 'Bạn là Senior Product Manager. Phân tích yêu cầu và viết PRD ngắn gọn, chặt chẽ gồm: Mục tiêu sản phẩm, User Flow, Functional Requirements, Edge Cases và Tiêu chuẩn nghiệm thu (Acceptance Criteria).',
      defaultSpeech: 'Sẵn sàng phân tích yêu cầu phần mềm...',
      category: 'Sprint Backlog'
    },
    dev: {
      id: 'dev',
      name: 'Dev',
      role: 'Software Engineer',
      icon: '🛠️',
      color: '#004d6d',
      systemPrompt: 'Bạn là Senior Full-Stack Engineer. Dựa trên PRD, viết mã nguồn sạch, xử lý đầy đủ validation, error handling, không hardcode secret và tạo diff Pull Request sẵn sàng review.',
      defaultSpeech: 'Đang đợi ticket hoặc bug fix...',
      category: 'Feature Branch'
    },
    review: {
      id: 'review',
      name: 'Review',
      role: 'Tech Lead / Code Reviewer',
      icon: '🔍',
      color: '#5f1622',
      systemPrompt: 'Bạn là Principal Code Reviewer. Kiểm tra diff PR tỉ mỉ: tìm bug logic tiềm ẩn, memory leak, thiếu boundary check, góp ý cấu trúc và quyết định APPROVE hoặc REQUEST_CHANGES.',
      defaultSpeech: 'Sẵn sàng rà soát Pull Request...',
      category: 'Code Quality'
    },
    qa: {
      id: 'qa',
      name: 'QA · Test',
      role: 'Quality Assurance & Test Automation',
      icon: '🧪',
      color: '#ba1a1a',
      systemPrompt: 'Bạn là Lead QA Automation Engineer. Tạo bộ unit/integration test toàn diện bao quát happy path, negative path và edge cases; chạy test suite và xuất telemetry pass/fail rõ ràng.',
      defaultSpeech: 'Sẵn sàng chạy bộ test tự động...',
      category: 'Test Suites'
    },
    security: {
      id: 'security',
      name: 'Security',
      role: 'DevSecOps & AppSec Auditor',
      icon: '🛡️',
      color: '#ff9aa2',
      systemPrompt: 'Bạn là Cybersecurity Specialist. Rà soát source code và dependencies nhằm phát hiện: injection, secret leak, out-dated vulnerable package (CVE), thiếu sanitize input.',
      defaultSpeech: 'Hệ thống an ninh đang giám sát...',
      category: 'Vulnerability Scan'
    },
    devops: {
      id: 'devops',
      name: 'DevOps',
      role: 'CI/CD & Release Engineer',
      icon: '🚀',
      color: '#1e6b3f',
      systemPrompt: 'Bạn là Senior DevOps & Site Reliability Engineer. Viết Dockerfile chuẩn production, manifest Kubernetes/ArgoCD, kích hoạt deploy staging và thực hiện Canary/Blue-Green release.',
      defaultSpeech: 'Sẵn sàng build & deploy cụm cluster...',
      category: 'ArgoCD Deployment'
    },
    monitoring: {
      id: 'monitoring',
      name: 'Monitoring',
      role: 'Telemetry Watchdog & SRE',
      icon: '📡',
      color: '#00522b',
      systemPrompt: 'Bạn là SRE Monitoring Watchdog. Theo dõi telemetry trực tiếp từ cụm máy chủ, đánh giá độ ổn định hệ thống, phát hiện spike latency hoặc tăng đột biến 5xx.',
      defaultSpeech: 'APM Telemetry hoạt động ổn định 100%...',
      category: 'Prometheus & Grafana'
    }
  };

  // 2. Pre-configured Simulation Scenarios
  const SCENARIOS = {
    oauth_feature: {
      id: 'oauth_feature',
      title: '🚀 Sprint: Google OAuth 2.0 (Happy Path)',
      description: 'Phát triển tính năng đăng nhập Google OAuth 2.0 từ khâu PRD, code, test, quét CVE đến deploy production.',
      steps: [
        {
          agent: 'orchestrator',
          status: 'WORKING',
          speech: 'Nhận yêu cầu Sprint #24: Thêm đăng nhập Google OAuth 2.0. Đang phân rã milestone...',
          courierMsg: '📋 Chuyển User Story sang PM · BA',
          artifactName: 'MilestonePlan.json',
          artifactType: 'json',
          telemetry: { taskCount: 7, priority: 'HIGH', estimatedTime: '2h' },
          logOutput: '[Orchestrator] Received prompt: "Google OAuth 2.0"\n[Orchestrator] Decomposed 7 DAG milestones.\n[Orchestrator] Dispatched to PM · BA agent station.',
          artifactContent: JSON.stringify({
            feature: "Google OAuth 2.0 Authentication",
            sprint: 24,
            priority: "HIGH",
            milestones: [
              { step: 1, role: "PM", task: "PRD & Gherkin Acceptance Criteria", status: "READY" },
              { step: 2, role: "Dev", task: "Implement GoogleStrategy & JWT Token Exchange", status: "PENDING" },
              { step: 3, role: "Review", task: "Peer Review PR #87 & AST Clean Code Audit", status: "PENDING" },
              { step: 4, role: "QA", task: "Automated Suite (Jest unit + Playwright e2e)", status: "PENDING" },
              { step: 5, role: "Security", task: "SAST & Trivy Dependency Vulnerability Scan", status: "PENDING" },
              { step: 6, role: "DevOps", task: "ArgoCD Staging Sync & Canary Rollout", status: "PENDING" },
              { step: 7, role: "Monitoring", task: "Prometheus Latency & Error Rate Baseline", status: "PENDING" }
            ]
          }, null, 2)
        },
        {
          agent: 'pm',
          status: 'WORKING',
          speech: 'Đã hoàn thiện specs PRD & 3 User Stories với tiêu chuẩn Gherkin.',
          courierMsg: '📦 Chuyển PRD.md sang xưởng Dev',
          artifactName: 'PRD-Google-OAuth.md',
          artifactType: 'markdown',
          telemetry: { userStories: 3, acceptanceCriteria: 8, complexity: 'M' },
          logOutput: '[PM-BA] Analyzing user journeys & OAuth2 PKCE specs.\n[PM-BA] Writing acceptance criteria in Given-When-Then format.\n[PM-BA] Created PRD-Google-OAuth.md successfully.',
          artifactContent: `# 📋 PRD: Google OAuth 2.0 Authentication

## 1. Mục tiêu
Cho phép người dùng đăng nhập 1-click an toàn thông qua tài khoản Google với giao thức OAuth 2.0 + PKCE.

## 2. User Stories & Acceptance Criteria (Gherkin)
- **Scenario 1: Happy Path Login**
  - **Given:** Người dùng chưa đăng nhập bấm nút "Sign in with Google"
  - **When:** Google trả về \`authorization_code\` hợp lệ tại callback endpoint
  - **Then:** Hệ thống sinh Access Token (JWT 15m) & Refresh Token (HTTP-only cookie 7d), điều hướng về Dashboard.

- **Scenario 2: Existing Email Account Linking**
  - **Given:** Email đã đăng ký bằng mật khẩu trước đó
  - **When:** Đăng nhập Google có cùng email
  - **Then:** Tự động liên kết tài khoản an toàn sau khi xác thực 2FA.`
        },
        {
          agent: 'dev',
          status: 'WORKING',
          speech: 'Đang code auth.controller.ts, triển khai GoogleStrategy & JWT exchange.',
          courierMsg: '📦 Mang PR #87 sang Trạm Review',
          artifactName: 'auth.controller.ts',
          artifactType: 'typescript',
          telemetry: { linesOfCode: 148, filesModified: 4, diffScore: 'A+' },
          logOutput: '[Dev] Pulling latest main branch.\n[Dev] Implementing GoogleAuthGuard & TokenSigner.\n[Dev] Formatting with Prettier & ESLint check passed.\n[Dev] Generated Pull Request #87: feat(auth): OAuth2 PKCE.',
          artifactContent: `import { Controller, Post, Body, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './guards/google-oauth.guard';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('google/callback')
  @UseGuards(GoogleAuthGuard)
  async handleGoogleCallback(@Body('code') code: string, @Res() res: Response) {
    // 1. Trao đổi authorization_code lấy Google ID Token
    const googleUser = await this.authService.verifyGoogleCode(code);
    
    // 2. Tìm hoặc tạo user mới trong CSDL
    const user = await this.authService.findOrCreateUser(googleUser);

    // 3. Ký cặp Access Token & HTTP-only Refresh Token
    const { accessToken, refreshToken } = await this.authService.generateTokens(user.id);
    this.authService.setSecureCookie(res, refreshToken);

    return res.status(200).json({ success: true, accessToken, user });
  }
}`
        },
        {
          agent: 'review',
          status: 'SUCCESS',
          speech: 'PR #87 LGTM! Code sạch, bảo mật cookie HttpOnly & Strict SameSite. Đã Merge!',
          courierMsg: '✅ Chuyển Artifact đã Merge sang phòng Lab QA',
          artifactName: 'ReviewComments.json',
          artifactType: 'json',
          telemetry: { reviewScore: '9.8/10', approved: true, commentsCount: 3 },
          logOutput: '[Review] Inspecting PR #87 diff (148 additions, 0 deletions).\n[Review] Checking secret leak & boundary conditions: PASS.\n[Review] Verdict: APPROVED. Merged commit 2984240 into main.',
          artifactContent: JSON.stringify({
            prNumber: 87,
            title: "feat(auth): integrate Google OAuth 2.0 PKCE flow",
            author: "dev-agent",
            reviewer: "tech-lead-review-agent",
            verdict: "APPROVED",
            score: "9.8/10",
            checklist: {
              "No Hardcoded Secrets": "PASS",
              "HttpOnly Secure Cookies": "PASS",
              "Input Validation (Zod Schema)": "PASS",
              "Proper Error Handling": "PASS"
            },
            comment: "Architecture is clean. Token expiration and PKCE verify handled properly. Ready for QA test suites."
          }, null, 2)
        },
        {
          agent: 'qa',
          status: 'SUCCESS',
          speech: '48/48 test cases PASSED! Coverage 98.4% (bao quát edge cases hết hạn code).',
          courierMsg: '🛡️ Chuyển mã nguồn sang Pháo đài Security',
          artifactName: 'TestReport.json',
          artifactType: 'json',
          telemetry: { totalTests: 48, passed: 48, failed: 0, coverage: '98.4%' },
          logOutput: 'PASS src/auth/auth.controller.spec.ts\nPASS src/auth/google.strategy.spec.ts\nPASS test/e2e/oauth2-flow.e2e-spec.ts\nTest Suites: 3 passed, 3 total\nTests: 48 passed, 48 total\nSnapshots: 0 total\nTime: 3.42s\nAll tests passed with 98.4% coverage.',
          artifactContent: JSON.stringify({
            suite: "OAuth2 & JWT Integration Suite",
            totalTests: 48,
            passed: 48,
            failed: 0,
            skipped: 0,
            durationMs: 3420,
            codeCoverage: "98.4%",
            scenariosTested: [
              "OAuth2 Authorization Code Grant",
              "Invalid/Expired Code Rejection",
              "Account Linking Deduplication",
              "Refresh Token Rotation on Expiration",
              "Concurrent Login Race Condition"
            ]
          }, null, 2)
        },
        {
          agent: 'security',
          status: 'SUCCESS',
          speech: 'SAST Audit Passed! 0 CVE High/Critical, Secret Scan đạt chuẩn OWASP Top 10.',
          courierMsg: '🚀 Chuyển Docker artifact sang Trạm DevOps',
          artifactName: 'SecurityScanReport.json',
          artifactType: 'json',
          telemetry: { criticalCVE: 0, highCVE: 0, secretLeaks: 0, owaspPass: '100%' },
          logOutput: '[Security] Running Trivy vulnerability scan...\n[Security] Scanning package-lock.json dependencies: 0 High/Critical.\n[Security] Semgrep SAST rule audit: No CWE-79, No CWE-89 detected.\n[Security] Status: GREEN / COMPLIANT.',
          artifactContent: JSON.stringify({
            scanner: "Trivy + Semgrep Static Analysis",
            target: "release-v1.4.0",
            vulnerabilities: {
              critical: 0,
              high: 0,
              medium: 0,
              low: 1
            },
            secretLeaks: 0,
            owaspCompliance: "100%",
            verdict: "PASSED_SECURE"
          }, null, 2)
        },
        {
          agent: 'devops',
          status: 'SUCCESS',
          speech: 'Đã đóng gói Docker multi-stage & đồng bộ ArgoCD lên Staging & Prod!',
          courierMsg: '📡 Báo telemetry tới Tháp Monitoring',
          artifactName: 'deploy.yaml',
          artifactType: 'yaml',
          telemetry: { imageSize: '48.2MB', replicas: 4, clusterSync: 'HEALTHY' },
          logOutput: '[DevOps] Building multi-stage container image...\n[DevOps] Image digest: sha256:7b2c36a6f4bb... (48.2MB)\n[DevOps] Pushed to production registry.\n[DevOps] ArgoCD sync triggered: 4/4 pods healthy (Canary 25% -> 100%).',
          artifactContent: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: agent-town-auth-service
  namespace: production
spec:
  replicas: 4
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    spec:
      containers:
      - name: auth-service
        image: registry.agenttown.internal/auth:v1.4.0
        ports:
        - containerPort: 3000
        resources:
          limits:
            cpu: "500m"
            memory: "512Mi"
          requests:
            cpu: "100m"
            memory: "128Mi"`
        },
        {
          agent: 'monitoring',
          status: 'SUCCESS',
          speech: 'Telemetry APM: CPU 24% · Latency 14ms · 99.98% TPS · Cụm cluster ổn định!',
          courierMsg: '🎉 Sprint hoàn thành trọn vẹn!',
          artifactName: 'ClusterHealth.json',
          artifactType: 'json',
          telemetry: { p99Latency: '14.2ms', errorRate: '0.001%', tps: 1240, uptime: '99.999%' },
          logOutput: '[Prometheus] Scraping /metrics endpoint from 4 pods.\n[Prometheus] p99_latency_ms: 14.2 (SLA < 100ms: PASS)\n[Prometheus] 5xx_error_rate: 0.001%\n[APM Watchdog] Release v1.4.0 verified stable.',
          artifactContent: JSON.stringify({
            status: "HEALTHY",
            uptime: "99.999%",
            metrics: {
              cpuUsage: "24.2%",
              memoryUsage: "41.6%",
              p99LatencyMs: 14.2,
              errorRate: "0.001%",
              transactionsPerSecond: 1240
            },
            alertsTriggered: 0
          }, null, 2)
        }
      ]
    },

    feedback_loop_bug: {
      id: 'feedback_loop_bug',
      title: '🐛 Hotfix: Token Race Condition (Feedback Loop)',
      description: 'Mô phỏng vòng lặp: QA phát hiện lỗi race condition ➔ Shipper xe đạp chạy ngược về Dev sửa ➔ Re-test ➔ Release.',
      steps: [
        {
          agent: 'orchestrator',
          status: 'WORKING',
          speech: 'Ticket khẩn cấp #142: Fix lỗi Refresh Token khi người dùng mở nhiều tab cùng lúc.',
          courierMsg: '📋 Chuyển ticket sang Dev',
          artifactName: 'MilestonePlan.json',
          artifactType: 'json',
          telemetry: { urgency: 'CRITICAL', type: 'HOTFIX' },
          logOutput: '[Orchestrator] Incident alert received from APM Watchdog.\n[Orchestrator] Opening hotfix branch fix/token-refresh-mutex.',
          artifactContent: JSON.stringify({
            task: "Hotfix: Token Refresh Mutex Lock",
            type: "HOTFIX",
            reporter: "SRE Alert",
            urgency: "CRITICAL"
          }, null, 2)
        },
        {
          agent: 'dev',
          status: 'WORKING',
          speech: 'Đang sửa hàm refreshToken() bản vá #142-v1...',
          courierMsg: '📦 Mang bản vá sang Review & QA',
          artifactName: 'token-patch-v1.diff',
          artifactType: 'diff',
          telemetry: { filesChanged: 1, additions: 2, deletions: 1 },
          logOutput: '[Dev] Created patch v1 without mutex lock for early review.',
          artifactContent: `@@ -42,6 +42,7 @@
- const token = await db.tokens.find(id);
+ // Missing distributed lock here!
+ const token = await db.tokens.findAndInvalidate(id);`
        },
        {
          agent: 'review',
          status: 'WORKING',
          speech: 'Review sơ bộ: Code có cải thiện, chuyển QA test tải đồng thời.',
          courierMsg: '🧪 Chuyển bản vá sang phòng thí nghiệm QA',
          artifactName: 'ReviewComments.json',
          artifactType: 'json',
          telemetry: { verdict: 'PROVISIONAL' },
          logOutput: '[Review] Warning: Concurrency test required at QA laboratory.',
          artifactContent: JSON.stringify({ verdict: "PROVISIONAL_APPROVAL", note: "Needs thorough concurrency test in QA" }, null, 2)
        },
        {
          agent: 'qa',
          status: 'FAIL',
          speech: '⚠️ TEST FAILED! 2/48 test case lỗi: Race condition làm rớt token khi 2 request cùng refresh!',
          courierMsg: '🚴 Mang Bug Report khẩn cấp ngược về xưởng Dev!',
          artifactName: 'BugReport-QA.json',
          artifactType: 'json',
          telemetry: { totalTests: 48, passed: 46, failed: 2, status: 'FAILED' },
          logOutput: 'FAIL test/concurrency/refresh-race.spec.ts\n  ✕ concurrent token refresh with same refresh_token (128ms)\n  ✕ token reuse detection triggers false positive (94ms)\nTests: 2 failed, 46 passed, 48 total\n[QA] TRIGGERING FEEDBACK COURIER TO DEV WORKSHOP!',
          artifactContent: JSON.stringify({
            status: "FAILED",
            failedCases: [
              "test_concurrent_refresh_requests_same_token",
              "test_token_reuse_detection"
            ],
            rootCause: "Database row-lock is missing during token rotation",
            actionRequired: "Implement Redis Mutex or DB SELECT ... FOR UPDATE"
          }, null, 2)
        },
        {
          agent: 'dev',
          status: 'DEBUGGING',
          speech: 'Đã nhận Bug Report từ QA! Đang bổ sung Redis Mutex lock 500ms cho token rotation...',
          courierMsg: '📦 Chuyển bản vá v2 (đã có Mutex Lock) sang Review & QA',
          artifactName: 'token-patch-v2-fixed.diff',
          artifactType: 'diff',
          telemetry: { filesChanged: 2, additions: 14, deletions: 2, fixReady: true },
          logOutput: '[Dev] Bug report received from courier bike 🚴\n[Dev] Implementing Redis Mutex lock with 500ms acquire timeout.\n[Dev] Rebuilt and packaged patch v2.',
          artifactContent: `@@ -45,12 +45,18 @@
+ const lock = await redis.acquireLock(\`token:lock:\${userId}\`, 500);
+ try {
    const token = await db.tokens.findValidToken(userId);
    const newTokens = await generateTokenPair(userId);
    await db.tokens.rotate(token.id, newTokens.refreshToken);
    return newTokens;
+ } finally {
+   await lock.release();
+ }`
        },
        {
          agent: 'review',
          status: 'SUCCESS',
          speech: 'Bản vá v2 chuẩn chỉ! Có try/finally release lock và fallback retry. APPROVED! 🚀',
          courierMsg: '✅ Gửi sang QA chạy lại toàn bộ regression test',
          artifactName: 'Review-V2-Approved.json',
          artifactType: 'json',
          telemetry: { verdict: 'APPROVED', fixVerified: true },
          logOutput: '[Review] Diff inspection: Mutex acquire/release in try-finally verified clean.',
          artifactContent: JSON.stringify({ verdict: "APPROVED", fixVerified: true }, null, 2)
        },
        {
          agent: 'qa',
          status: 'SUCCESS',
          speech: 'Chạy lại bộ test: 48/48 PASSED! Hết sạch lỗi race condition. Tuyệt vời! 🎉',
          courierMsg: '🚀 Chuyển sang DevOps deploy khẩn',
          artifactName: 'TestReport-Fixed.json',
          artifactType: 'json',
          telemetry: { totalTests: 48, passed: 48, failed: 0, coverage: '99.1%' },
          logOutput: 'PASS test/concurrency/refresh-race.spec.ts (all 50 concurrent threads succeeded)\nTests: 48 passed, 48 total.\n[QA] Green light for emergency deployment!',
          artifactContent: JSON.stringify({ total: 48, passed: 48, failed: 0, verdict: "ALL_PASSED" }, null, 2)
        },
        {
          agent: 'devops',
          status: 'SUCCESS',
          speech: 'Đã deploy Hotfix v1.4.1 lên Production cụm toàn cầu!',
          courierMsg: '📡 Giám sát sau khi vá lỗi',
          artifactName: 'Deploy-Hotfix.log',
          artifactType: 'text',
          telemetry: { podsUpdated: 4, downtime: '0s' },
          logOutput: '[DevOps] Hotfix v1.4.1 rolled out with 0 downtime. Pods healthy.',
          artifactContent: "Rollout completed: 4/4 pods healthy. Zero downtime deployment."
        },
        {
          agent: 'monitoring',
          status: 'SUCCESS',
          speech: '0 lỗi 5xx · P99 Latency hạ xuống 12ms · Feedback Loop hoàn tất xuất sắc!',
          courierMsg: '🏆 Hoàn thành hotfix!',
          artifactName: 'ClusterHealth.json',
          artifactType: 'json',
          telemetry: { p99Latency: '12ms', errorRate: '0.000%', status: 'STABLE' },
          logOutput: '[SRE Watchdog] Error rate 0.000%, latency baseline normal. Incident closed.',
          artifactContent: JSON.stringify({ status: "STABLE", p99Latency: "12ms", errorRate: "0.000%" }, null, 2)
        }
      ]
    },

    perf_redis_cache: {
      id: 'perf_redis_cache',
      title: '⚡ Perf: Redis Cache & P99 Latency Tuning (180ms ➔ 14ms)',
      description: 'Tối ưu hóa endpoint bằng Cache-Aside Pattern, nén buffer Snappy và kết nối connection pool.',
      steps: [
        {
          agent: 'orchestrator',
          status: 'WORKING',
          speech: 'Mục tiêu: Tối ưu Feed endpoint đang bị quá tải CPU CSDL. Triển khai Redis Cache Layer.',
          courierMsg: '📋 Gửi KPI latency < 20ms sang PM',
          artifactName: 'PerfMilestone.json',
          artifactType: 'json',
          telemetry: { currentP99: '180ms', targetP99: '20ms', rpsTarget: '10000' },
          logOutput: '[Orchestrator] APM telemetry showed slow queries on PostgreSQL feed table.\n[Orchestrator] Creating task: Implement Redis cluster cache with Cache-Aside strategy.',
          artifactContent: JSON.stringify({ task: "Redis Caching Strategy", targetLatency: "15ms", cacheHitTarget: "95%" }, null, 2)
        },
        {
          agent: 'pm',
          status: 'WORKING',
          speech: 'Thiết kế TTL 300s, cơ chế Invalidation khi có bài viết mới và Stale-While-Revalidate.',
          courierMsg: '📦 Chuyển đặc tả Cache sang Dev',
          artifactName: 'CacheSpec.md',
          artifactType: 'markdown',
          telemetry: { ttlSeconds: 300, invalidationStrategy: 'Event-Driven' },
          logOutput: '[PM-BA] Detailed specification for cache keys, TTL and dogpile effect prevention.',
          artifactContent: `# ⚡ Cache Specification: Newsfeed Service
- **Strategy:** Cache-Aside with Stale-While-Revalidate (SWR)
- **Key Pattern:** \`feed:user:{userId}:page:{pageNum}\`
- **TTL:** 300 seconds + jitter (+/- 30s) to prevent cache stampede`
        },
        {
          agent: 'dev',
          status: 'WORKING',
          speech: 'Triển khai RedisCacheService với ioredis, connection pool & buffer compression.',
          courierMsg: '📦 Mang PR #89 sang Tech Lead Review',
          artifactName: 'redis-cache.service.ts',
          artifactType: 'typescript',
          telemetry: { memorySaved: '40%', throughputIncrease: '8x' },
          logOutput: '[Dev] Implemented ioredis pipeline batching and snappy buffer serialization.',
          artifactContent: `import Redis from 'ioredis';
export class RedisCacheService {
  private client = new Redis({ host: process.env.REDIS_HOST, maxRetriesPerRequest: 3 });
  async getOrSet<T>(key: string, ttl: number, factory: () => Promise<T>): Promise<T> {
    const cached = await this.client.get(key);
    if (cached) return JSON.parse(cached);
    const fresh = await factory();
    await this.client.set(key, JSON.stringify(fresh), 'EX', ttl);
    return fresh;
  }
}`
        },
        {
          agent: 'review',
          status: 'SUCCESS',
          speech: 'Kiến trúc Cache-Aside chuẩn chỉ! Có TTL jitter chống Cache Stampede. APPROVED!',
          courierMsg: '✅ Chuyển sang QA chạy k6 Benchmark',
          artifactName: 'Review-Cache.json',
          artifactType: 'json',
          telemetry: { codeSmells: 0, architectureScore: '10/10' },
          logOutput: '[Review] Verified connection pooling, memory limits and eviction policies.',
          artifactContent: JSON.stringify({ verdict: "APPROVED", perfAudit: "EXCELLENT" }, null, 2)
        },
        {
          agent: 'qa',
          status: 'SUCCESS',
          speech: 'Chạy K6 Load Test 10,000 req/s: P99 Latency giảm từ 180ms xuống 13.8ms!',
          courierMsg: '🛡️ Kiểm tra bảo mật Redis Cluster',
          artifactName: 'K6-Benchmark-Report.json',
          artifactType: 'json',
          telemetry: { p99Latency: '13.8ms', requestsPerSec: 10240, errorCount: 0 },
          logOutput: 'running (1m00.0s), 000/10000 VUs, 614,400 complete requests\np99 latency: 13.8ms (baseline was 180ms - 92.3% faster!)\nhttp_req_failed: 0.00%',
          artifactContent: JSON.stringify({ rps: 10240, p99LatencyMs: 13.8, errorRate: "0.00%" }, null, 2)
        },
        {
          agent: 'security',
          status: 'SUCCESS',
          speech: 'Redis mTLS bật thành công, mật khẩu mã hóa Vault, cấm lệnh nguy hiểm (FLUSHALL).',
          courierMsg: '🚀 Chuyển sang DevOps triển khai Helm',
          artifactName: 'Redis-Security.json',
          artifactType: 'json',
          telemetry: { tlsVersion: 'TLS 1.3', dangerousCommandsDisabled: true },
          logOutput: '[Security] Verified Redis ACLs, CONFIG/FLUSHALL disabled, TLS 1.3 enforced.',
          artifactContent: JSON.stringify({ status: "SECURE", tls: "v1.3", aclEnforced: true }, null, 2)
        },
        {
          agent: 'devops',
          status: 'SUCCESS',
          speech: 'Triển khai cụm Redis 3-node Sentinel HA trên Kubernetes thành công!',
          courierMsg: '📡 Đo lường số liệu Prometheus thực tế',
          artifactName: 'redis-helm-release.yaml',
          artifactType: 'yaml',
          telemetry: { nodes: 3, sentinelQuorum: 2, status: 'RUNNING' },
          logOutput: '[DevOps] Helm install redis-ha bitnami/redis --set sentinel.enabled=true.\n[DevOps] 3/3 pods Ready.',
          artifactContent: "helm release: redis-ha\nstatus: deployed\nrevision: 1"
        },
        {
          agent: 'monitoring',
          status: 'SUCCESS',
          speech: 'P99 Latency 14ms · CPU CSDL giảm 60% · Cache Hit Rate đạt 96.4%!',
          courierMsg: '🎉 Tối ưu hiệu năng xuất sắc!',
          artifactName: 'PerfTelemetry.json',
          artifactType: 'json',
          telemetry: { p99Latency: '14.0ms', cacheHitRate: '96.4%', dbCpuReduction: '60%' },
          logOutput: '[Monitoring] Live telemetry confirms P99 latency stable at 14ms under peak load.',
          artifactContent: JSON.stringify({ p99Latency: "14ms", cacheHitRate: "96.4%", dbCpu: "18%" }, null, 2)
        }
      ]
    }
  };

  // 3. Engine State
  const state = {
    currentScenario: 'oauth_feature',
    currentStepIndex: -1,
    isRunning: false,
    timer: null,
    stepDuration: 2800, // ms per step
    agentsState: {}
  };

  // Initialize agent state maps
  function initAgentStates() {
    Object.keys(AGENT_DEFINITIONS).forEach((id) => {
      state.agentsState[id] = {
        ...AGENT_DEFINITIONS[id],
        status: 'IDLE',
        activeSpeech: AGENT_DEFINITIONS[id].defaultSpeech,
        latestArtifact: null,
        latestTelemetry: null,
        latestLog: null
      };
    });
  }

  // 4. DOM Update Helpers
  function updateSpatialNode(agentId, data) {
    const nodeEl = document.querySelector(`.spatial-node[data-agent="${agentId}"]`);
    if (!nodeEl) return;

    // Update speech bubble text
    const bubbleText = nodeEl.querySelector('.speech-bubble p');
    if (bubbleText && data.activeSpeech) {
      bubbleText.innerHTML = data.activeSpeech;
    }

    // Update category / status badge inside speech bubble
    const categorySpan = nodeEl.querySelector('.speech-bubble span.uppercase');
    if (categorySpan && data.category) {
      categorySpan.textContent = data.category;
    }

    // Ping dot color
    const dotSpan = nodeEl.querySelector('.speech-bubble .flex span:first-child');
    if (dotSpan) {
      dotSpan.className = 'w-2 h-2 rounded-full';
      if (data.status === 'WORKING') dotSpan.classList.add('bg-tertiary-fixed-dim', 'animate-pulse');
      else if (data.status === 'SUCCESS') dotSpan.classList.add('bg-secondary');
      else if (data.status === 'FAIL') dotSpan.classList.add('bg-error', 'animate-ping');
      else if (data.status === 'DEBUGGING') dotSpan.classList.add('bg-tertiary-fixed-dim', 'animate-spin');
      else dotSpan.classList.add('bg-outline');
    }

    // Node wrapper subtle pulse when working
    if (data.status === 'WORKING' || data.status === 'DEBUGGING') {
      nodeEl.classList.add('scale-105', 'z-30');
    } else {
      nodeEl.classList.remove('scale-105', 'z-30');
    }
  }

  function updateBottomDockChip(agentId, data) {
    const chipEl = document.querySelector(`.role-chip[data-agent="${agentId}"]`);
    if (!chipEl) return;

    const dot = chipEl.querySelector('.status-dot');
    if (dot) {
      dot.className = 'status-dot w-2 h-2 rounded-full';
      if (data.status === 'WORKING') {
        dot.classList.add('bg-tertiary-fixed-dim', 'animate-pulse');
      } else if (data.status === 'SUCCESS') {
        dot.classList.add('bg-secondary');
      } else if (data.status === 'FAIL') {
        dot.classList.add('bg-error', 'animate-ping');
      } else if (data.status === 'DEBUGGING') {
        dot.classList.add('bg-tertiary-fixed-dim', 'animate-pulse');
      } else {
        dot.classList.add('bg-outline');
      }
    }

    chipEl.setAttribute('title', `${data.name}: ${data.activeSpeech}`);
  }

  function updateCouriers(msg, isBug = false) {
    const courier1 = document.getElementById('courier-1-label');
    const courier2 = document.getElementById('courier-2-label');

    if (isBug) {
      if (courier2) courier2.textContent = msg || '🚴 Mang bug về Dev';
      const c2Wrap = document.getElementById('courier-2-wrap');
      if (c2Wrap) c2Wrap.classList.remove('hidden');
    } else {
      if (courier1) courier1.textContent = msg || '📦 Đang chuyển Artifact';
    }
  }

  // 5. Artifact Modal Controller with Tabs
  let activeTab = 'artifact';

  function switchModalTab(tabId) {
    activeTab = tabId;
    ['artifact', 'prompt', 'telemetry', 'logs'].forEach((t) => {
      const panel = document.getElementById(`modal-panel-${t}`);
      const tabBtn = document.getElementById(`tab-btn-${t}`);
      if (panel) {
        if (t === tabId) panel.classList.remove('hidden');
        else panel.classList.add('hidden');
      }
      if (tabBtn) {
        if (t === tabId) {
          tabBtn.classList.add('bg-primary-container', 'text-on-primary', 'font-bold');
          tabBtn.classList.remove('bg-surface-container', 'text-on-surface');
        } else {
          tabBtn.classList.remove('bg-primary-container', 'text-on-primary', 'font-bold');
          tabBtn.classList.add('bg-surface-container', 'text-on-surface');
        }
      }
    });
  }

  function openArtifactModal(agentId) {
    const agent = state.agentsState[agentId] || AGENT_DEFINITIONS[agentId];
    if (!agent) return;

    const modal = document.getElementById('agent-artifact-modal');
    if (!modal) return;

    document.getElementById('modal-agent-icon').textContent = agent.icon;
    document.getElementById('modal-agent-name').textContent = agent.name;
    document.getElementById('modal-agent-role').textContent = agent.role;
    document.getElementById('modal-agent-prompt').textContent = agent.systemPrompt;
    document.getElementById('modal-agent-speech').textContent = agent.activeSpeech || agent.defaultSpeech;

    const statusBadge = document.getElementById('modal-agent-status');
    if (statusBadge) {
      statusBadge.textContent = agent.status || 'IDLE';
      statusBadge.className = 'px-space-sm py-0.5 rounded-full text-[11px] font-bold font-label-code';
      if (agent.status === 'SUCCESS') statusBadge.classList.add('bg-secondary-container', 'text-on-secondary-container');
      else if (agent.status === 'WORKING') statusBadge.classList.add('bg-tertiary-fixed', 'text-on-tertiary-fixed');
      else if (agent.status === 'FAIL') statusBadge.classList.add('bg-error-container', 'text-on-error-container');
      else if (agent.status === 'DEBUGGING') statusBadge.classList.add('bg-tertiary-container', 'text-on-tertiary-container');
      else statusBadge.classList.add('bg-surface-container-high', 'text-on-surface-variant');
    }

    // Artifact content
    const artifactBox = document.getElementById('modal-artifact-code');
    const artifactTitle = document.getElementById('modal-artifact-name');
    if (agent.latestArtifact) {
      artifactTitle.textContent = agent.latestArtifact.name;
      artifactBox.textContent = agent.latestArtifact.content;
    } else {
      artifactTitle.textContent = 'Chưa có Artifact trong bước này';
      artifactBox.textContent = `// Agent "${agent.name}" chưa tạo artifact nào trong kịch bản hiện tại.\n// Nhấn "Chạy Pipeline" để xem luồng SDLC tự động sinh ra PRD, Code diff, Test suites...`;
    }

    // Telemetry content
    const telemetryBox = document.getElementById('modal-telemetry-content');
    if (telemetryBox) {
      if (agent.latestTelemetry) {
        telemetryBox.innerHTML = Object.entries(agent.latestTelemetry)
          .map(([k, v]) => `
            <div class="p-space-sm bg-surface-container rounded-xl border border-outline-variant/30 flex flex-col">
              <span class="text-[11px] text-on-surface-variant uppercase font-label-caps">${k}</span>
              <span class="text-headline-md font-bold text-primary font-label-code">${v}</span>
            </div>
          `).join('');
      } else {
        telemetryBox.innerHTML = '<p class="text-body-sm text-on-surface-variant italic">Chưa có số liệu đo lường ở trạng thái IDLE.</p>';
      }
    }

    // Logs content
    const logsBox = document.getElementById('modal-logs-code');
    if (logsBox) {
      logsBox.textContent = agent.latestLog || `[${agent.name}] Agent đang ở trạng thái chờ lệnh từ Orchestrator...`;
    }

    switchModalTab(activeTab);
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }

  function closeArtifactModal() {
    const modal = document.getElementById('agent-artifact-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  // 6. Pipeline Execution Logic
  function executeStep(stepIndex) {
    const scenario = SCENARIOS[state.currentScenario];
    if (!scenario || stepIndex >= scenario.steps.length) {
      // Completed scenario
      pausePipeline();
      const playBtn = document.getElementById('btn-pipeline-play');
      if (playBtn) playBtn.innerHTML = '<span class="material-symbols-outlined text-[16px]">replay</span><span>Chạy lại</span>';
      if (window.AgentTownSFX) window.AgentTownSFX.complete();
      return;
    }

    state.currentStepIndex = stepIndex;
    const step = scenario.steps[stepIndex];

    // Update agent state
    const agent = state.agentsState[step.agent];
    if (agent) {
      agent.status = step.status;
      agent.activeSpeech = step.speech;
      agent.latestArtifact = {
        name: step.artifactName,
        type: step.artifactType,
        content: step.artifactContent
      };
      agent.latestTelemetry = step.telemetry || null;
      agent.latestLog = step.logOutput || null;

      updateSpatialNode(step.agent, agent);
      updateBottomDockChip(step.agent, agent);
    }

    // Synchronize 3D Scene Spotlight & Camera focus
    if (window.dioramaScene) {
      if (typeof window.dioramaScene.highlightStation === 'function') {
        window.dioramaScene.highlightStation(step.agent, step.status);
      }
      if (typeof window.dioramaScene.focusStation === 'function') {
        window.dioramaScene.focusStation(step.agent);
      }
    }

    // Trigger Audio SFX
    if (window.AgentTownSFX) {
      if (step.status === 'FAIL') window.AgentTownSFX.fail();
      else if (step.status === 'SUCCESS') window.AgentTownSFX.success();
      else window.AgentTownSFX.step();
    }

    // Update Courier text & visibility
    const isBug = step.status === 'FAIL' || step.status === 'DEBUGGING';
    updateCouriers(step.courierMsg, isBug);

    // Update progress bar & label
    const progressEl = document.getElementById('pipeline-progress-bar');
    const progressText = document.getElementById('pipeline-progress-text');
    const currentStepText = document.getElementById('pipeline-current-step');
    const pct = Math.round(((stepIndex + 1) / scenario.steps.length) * 100);

    if (progressEl) progressEl.style.width = `${pct}%`;
    if (progressText) progressText.textContent = `${pct}%`;
    if (currentStepText) {
      currentStepText.textContent = `Bước ${stepIndex + 1}/${scenario.steps.length}: ${agent ? agent.name : ''} (${step.status})`;
    }
  }

  function startPipeline() {
    if (state.isRunning) return;
    state.isRunning = true;

    const playBtn = document.getElementById('btn-pipeline-play');
    if (playBtn) {
      playBtn.innerHTML = '<span class="material-symbols-outlined text-[16px]">pause</span><span>Tạm dừng</span>';
      playBtn.classList.remove('bg-secondary-container', 'text-on-secondary-container');
      playBtn.classList.add('bg-primary-container', 'text-on-primary');
    }

    const scenario = SCENARIOS[state.currentScenario];
    if (state.currentStepIndex >= scenario.steps.length - 1) {
      resetPipeline();
    }

    executeStep(state.currentStepIndex + 1);

    state.timer = setInterval(() => {
      const nextIdx = state.currentStepIndex + 1;
      if (nextIdx < scenario.steps.length) {
        executeStep(nextIdx);
      } else {
        pausePipeline();
      }
    }, state.stepDuration);
  }

  function pausePipeline() {
    state.isRunning = false;
    if (state.timer) {
      clearInterval(state.timer);
      state.timer = null;
    }

    const playBtn = document.getElementById('btn-pipeline-play');
    if (playBtn) {
      playBtn.innerHTML = '<span class="material-symbols-outlined text-[16px]">play_arrow</span><span>Tiếp tục</span>';
      playBtn.classList.add('bg-secondary-container', 'text-on-secondary-container');
      playBtn.classList.remove('bg-primary-container', 'text-on-primary');
    }
  }

  function togglePlayPause() {
    if (state.isRunning) {
      pausePipeline();
    } else {
      startPipeline();
    }
  }

  function stepForward() {
    pausePipeline();
    const scenario = SCENARIOS[state.currentScenario];
    if (state.currentStepIndex < scenario.steps.length - 1) {
      executeStep(state.currentStepIndex + 1);
    }
  }

  function resetPipeline() {
    pausePipeline();
    state.currentStepIndex = -1;
    initAgentStates();

    // Reset visual nodes
    Object.keys(state.agentsState).forEach((id) => {
      updateSpatialNode(id, state.agentsState[id]);
      updateBottomDockChip(id, state.agentsState[id]);
    });

    if (window.dioramaScene && typeof window.dioramaScene.resetStationHighlights === 'function') {
      window.dioramaScene.resetStationHighlights();
    }

    const progressEl = document.getElementById('pipeline-progress-bar');
    const progressText = document.getElementById('pipeline-progress-text');
    const currentStepText = document.getElementById('pipeline-current-step');
    if (progressEl) progressEl.style.width = '0%';
    if (progressText) progressText.textContent = '0%';
    if (currentStepText) currentStepText.textContent = 'Sẵn sàng khởi động';

    const playBtn = document.getElementById('btn-pipeline-play');
    if (playBtn) {
      playBtn.innerHTML = '<span class="material-symbols-outlined text-[16px]">play_arrow</span><span>Chạy Pipeline</span>';
    }

    updateCouriers('📦 Chờ kích hoạt pipeline...', false);
  }

  function setScenario(scenarioKey) {
    if (!SCENARIOS[scenarioKey]) return;
    state.currentScenario = scenarioKey;
    resetPipeline();
  }

  // 7. Dynamic AI Custom Scenario Generator
  function createCustomScenario(customPrompt) {
    const slug = 'custom_' + Date.now();
    const title = `🤖 Custom Task: ${customPrompt.slice(0, 32)}...`;

    SCENARIOS[slug] = {
      id: slug,
      title: title,
      description: `Kịch bản tự động phân rã từ prompt: "${customPrompt}"`,
      steps: [
        {
          agent: 'orchestrator',
          status: 'WORKING',
          speech: `Phân tích yêu cầu: "${customPrompt}". Khởi tạo DAG SDLC...`,
          courierMsg: '📋 Chuyển User Stories sang PM',
          artifactName: 'MilestonePlan.json',
          artifactType: 'json',
          telemetry: { promptLength: customPrompt.length, confidence: '99.4%' },
          logOutput: `[Claude Code Hub] Parsing: "${customPrompt}"\n[DAG] Generated 7 continuous stages.`,
          artifactContent: JSON.stringify({ prompt: customPrompt, status: "DISPATCHED", agentsInvolved: 7 }, null, 2)
        },
        {
          agent: 'pm',
          status: 'WORKING',
          speech: `Đã viết specs PRD & Gherkin cho: "${customPrompt.slice(0, 30)}"`,
          courierMsg: '📦 Chuyển PRD sang xưởng Dev',
          artifactName: 'PRD-Custom.md',
          artifactType: 'markdown',
          telemetry: { acceptanceCriteria: 5 },
          logOutput: `[PM · BA] Requirements validated against product roadmap.`,
          artifactContent: `# 📋 PRD: ${customPrompt}\n\n## Acceptance Criteria (Gherkin)\n- Given: User triggers action\n- When: System processes valid input\n- Then: Operation succeeds with 200 OK`
        },
        {
          agent: 'dev',
          status: 'WORKING',
          speech: `Đang lập trình mã nguồn giải quyết "${customPrompt.slice(0, 24)}"`,
          courierMsg: '📦 Mang PR sang Tech Lead Review',
          artifactName: 'feature.implementation.ts',
          artifactType: 'typescript',
          telemetry: { linesOfCode: 92, testCoverageEstimate: '95%' },
          logOutput: `[Dev] Implementing Clean Architecture module.\n[Dev] Zero dependencies leak verified.`,
          artifactContent: `// Implementation for: ${customPrompt}\nexport async function handleFeatureRequest(req: Request) {\n  return { success: true, timestamp: Date.now() };\n}`
        },
        {
          agent: 'review',
          status: 'SUCCESS',
          speech: 'Code sạch, đạt chuẩn Clean Code & TypeScript strict mode. APPROVED!',
          courierMsg: '✅ Chuyển sang phòng Lab QA kiểm thử',
          artifactName: 'ReviewApproval.json',
          artifactType: 'json',
          telemetry: { approval: true, score: '10/10' },
          logOutput: `[Review] Pull request approved with zero warnings.`,
          artifactContent: JSON.stringify({ verdict: "APPROVED", reviewer: "Tech Lead" }, null, 2)
        },
        {
          agent: 'qa',
          status: 'SUCCESS',
          speech: 'Chạy 48 test case tự động: 48/48 PASSED!',
          courierMsg: '🛡️ Quét an ninh SAST & Secret',
          artifactName: 'CustomTestReport.json',
          artifactType: 'json',
          telemetry: { totalTests: 48, passed: 48, failed: 0 },
          logOutput: `PASS test/unit/feature.spec.ts\nAll 48 test assertions passed!`,
          artifactContent: JSON.stringify({ passed: 48, failed: 0, coverage: "98.7%" }, null, 2)
        },
        {
          agent: 'security',
          status: 'SUCCESS',
          speech: 'SAST Audit Passed! 0 lỗ hổng nghiêm trọng, đạt chuẩn OWASP Top 10.',
          courierMsg: '🚀 Chuyển sang trạm DevOps đóng gói',
          artifactName: 'SecurityAudit.json',
          artifactType: 'json',
          telemetry: { vulnerabilities: 0, compliance: 'PASSED' },
          logOutput: `[Security] Clean audit for release.`,
          artifactContent: JSON.stringify({ cve: 0, audit: "CLEAN" }, null, 2)
        },
        {
          agent: 'devops',
          status: 'SUCCESS',
          speech: 'Đã đóng gói Docker multi-stage & deploy cụm Kubernetes!',
          courierMsg: '📡 Báo telemetry tới Tháp Monitoring',
          artifactName: 'k8s-deploy.yaml',
          artifactType: 'yaml',
          telemetry: { pods: 4, cluster: 'production' },
          logOutput: `[DevOps] Canary release deployed to production cluster.`,
          artifactContent: `apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: custom-feature`
        },
        {
          agent: 'monitoring',
          status: 'SUCCESS',
          speech: 'Hệ thống vận hành trơn tru · Latency 14ms · Telemetry xanh mướt! 🎉',
          courierMsg: '🏆 Hoàn thành release!',
          artifactName: 'APMReport.json',
          artifactType: 'json',
          telemetry: { latency: '14ms', status: 'HEALTHY' },
          logOutput: `[Monitoring] Metric stream nominal.`,
          artifactContent: JSON.stringify({ latency: "14ms", status: "HEALTHY" }, null, 2)
        }
      ]
    };

    // Add to scenario dropdown
    const select = document.getElementById('scenario-select');
    if (select) {
      const opt = document.createElement('option');
      opt.value = slug;
      opt.textContent = title;
      select.prepend(opt);
      select.value = slug;
    }

    setScenario(slug);
    startPipeline();
  }

  // 8. Event Wire-up & Initialization
  function initEngine() {
    initAgentStates();

    // Bind click to open Artifact Modal on spatial nodes & chips
    document.querySelectorAll('.spatial-node[data-agent]').forEach((node) => {
      node.addEventListener('click', () => {
        const agentId = node.getAttribute('data-agent');
        if (agentId) {
          if (window.AgentTownSFX) window.AgentTownSFX.click();
          openArtifactModal(agentId);
        }
      });
    });

    document.querySelectorAll('.role-chip[data-agent]').forEach((chip) => {
      chip.addEventListener('click', () => {
        const agentId = chip.getAttribute('data-agent');
        if (agentId) {
          if (window.AgentTownSFX) window.AgentTownSFX.click();
          openArtifactModal(agentId);
        }
      });
    });

    // Tab buttons in modal
    ['artifact', 'prompt', 'telemetry', 'logs'].forEach((t) => {
      const btn = document.getElementById(`tab-btn-${t}`);
      if (btn) {
        btn.addEventListener('click', () => {
          if (window.AgentTownSFX) window.AgentTownSFX.click();
          switchModalTab(t);
        });
      }
    });

    // Modal close buttons
    const closeBtn = document.getElementById('btn-close-artifact-modal');
    if (closeBtn) closeBtn.addEventListener('click', closeArtifactModal);

    const modalBackdrop = document.getElementById('agent-artifact-modal');
    if (modalBackdrop) {
      modalBackdrop.addEventListener('click', (e) => {
        if (e.target === modalBackdrop) closeArtifactModal();
      });
    }

    // Copy artifact button
    const copyBtn = document.getElementById('btn-copy-artifact');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const codeText = document.getElementById('modal-artifact-code').textContent;
        navigator.clipboard.writeText(codeText).then(() => {
          if (window.AgentTownSFX) window.AgentTownSFX.click();
          const original = copyBtn.innerHTML;
          copyBtn.innerHTML = '<span class="material-symbols-outlined text-[14px]">check</span><span>Đã chép!</span>';
          setTimeout(() => { copyBtn.innerHTML = original; }, 1800);
        });
      });
    }

    // Pipeline Controls
    const playBtn = document.getElementById('btn-pipeline-play');
    if (playBtn) playBtn.addEventListener('click', togglePlayPause);

    const stepBtn = document.getElementById('btn-pipeline-step');
    if (stepBtn) stepBtn.addEventListener('click', stepForward);

    const resetBtn = document.getElementById('btn-pipeline-reset');
    if (resetBtn) resetBtn.addEventListener('click', resetPipeline);

    const scenarioSelect = document.getElementById('scenario-select');
    if (scenarioSelect) {
      scenarioSelect.addEventListener('change', (e) => {
        setScenario(e.target.value);
      });
    }

    // Custom prompt form dispatch
    const promptForm = document.getElementById('custom-prompt-form');
    const promptInput = document.getElementById('custom-prompt-input');
    if (promptForm && promptInput) {
      promptForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const val = promptInput.value.trim();
        if (val) {
          createCustomScenario(val);
          promptInput.value = '';
          const modalPrompt = document.getElementById('prompt-dispatcher-modal');
          if (modalPrompt) modalPrompt.classList.add('hidden');
        }
      });
    }
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEngine);
  } else {
    initEngine();
  }

  // Expose clean global API
  window.AgentTownEngine = {
    start: startPipeline,
    pause: pausePipeline,
    reset: resetPipeline,
    step: stepForward,
    setScenario: setScenario,
    openArtifact: openArtifactModal,
    dispatchCustomPrompt: createCustomScenario,
    getAgents: () => state.agentsState
  };
})();
