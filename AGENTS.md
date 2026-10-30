# 🤖 AGENTS.md – Multi-Agent System Specification & Architecture

> **Dự án:** Agent Town 3D (v1.4)  
> **Mục tiêu:** Tài liệu đặc tả vai trò, system prompt, hợp đồng dữ liệu (Input/Output artifacts), trạng thái vòng đời và cơ chế giao tiếp giữa 8 Autonomous AI Agents trong nền tảng mô phỏng DevOps 3D xây dựng trên Next.js 16, React Three Fiber v9 và Zustand.

---

## 🏛️ 1. Tổng quan Kiến trúc Đa Đặc vụ (Multi-Agent Architecture)

Agent Town 3D ứng dụng mô hình **Orchestrator Hub & Spoke Pipeline** trên mặt bằng **Radial Polar Geometry ($R = 9.2\text{m}$)**:
- **Claude Code (AI Command Center / War Room)** giữ vai trò trung tâm chỉ huy tại tâm đảo (`[0, 0.6, 0]`), tiếp nhận yêu cầu từ người dùng (hoặc kéo trực tiếp Pull Request từ GitHub REST API), lập kế hoạch phân rã (Milestone Decomposition) và điều phối công việc tới 7 phòng lab chuyên môn.
- **7 Trạm High-Tech Autonomous Labs** tương ứng 7 giai đoạn trong vòng đời phát triển phần mềm (SDLC), bố trí đối xứng hướng tâm 100% về trung tâm chỉ huy.
- **Courier Shippers & Fiber-Optic Data Bus**: Trực quan hóa việc truyền tải dữ liệu, PR diff, test report và feedback loop giữa các trạm qua nhân vật vận chuyển 3D và 7 tuyến cáp quang neon phát sáng.

```
                    [User Prompt / GitHub PR URL]
                                  │
                                  ▼
                   ┌─────────────────────────────┐
                   │   🎛️ AI Command Center      │
                   │  Claude Code (Orchestrator) │
                   └──────────────┬──────────────┘
                                  │
       ┌──────────────────────────┼──────────────────────────┐
       ▼                          ▼                          ▼
  [1. PM · BA]              [2. Dev Lab]               [3. Tech Review]
       │                          ▲                          │
       │ PRD.md                   │ Fix Bug / Vá CVE         │ ReviewComments.json
       ▼                          │                          ▼
  [Shipper: Spec]          [Shipper: Feedback]        [Shipper: Approved PR]
       │                          │                          │
       └───────────────►   ┌──────┴──────┐   ◄───────────────┘
                           │ 4. QA · Test│
                           └──────┬──────┘
                                  │ test-suite.spec.ts
                                  ▼
                           [5. DevSecOps]
                                  │ SecurityAudit.json
                                  ▼
                           [6. Release Eng] ──► [7. APM Monitor]
                           (Gatekeeper CD)      (ClusterHealth.json)
```

---

## 👥 2. Đặc tả Chi tiết 8 AI Agents

### 🎛️ Agent 0: Claude Code (Orchestrator Hub)
- **Vị trí 3D:** AI Command Center kính bán nguyệt trung tâm đảo (`[0, 0.6, 0]`, góc xoay `0 rad`)
- **Vai trò:** Tiếp nhận prompt tính năng hoặc GitHub PR URL, phân tích phạm vi bài toán, chia nhỏ nhiệm vụ thành các User Stories, điều phối pipeline SSE streaming và xử lý hủy luồng (`AbortController`).
- **System Prompt Core:**
  > *"Bạn là Orchestrator chính của hệ thống DevOps tự trị. Tiếp nhận prompt, phân rã milestone và điều phối 7 trạm chuyên môn."*
- **Input:** Prompt yêu cầu tính năng hoặc URL GitHub Pull Request công khai.
- **Output Artifacts:** `MilestonePlan.json` (Danh sách nhiệm vụ, thứ tự thực thi, thống kê phạm vi).

---

### 🏢 Agent 1: PM · BA (Product Strategy Lab)
- **Vị trí 3D:** Phòng Lab Chiến lược Sản phẩm Tây Bắc (`[-6.5, 0.6, -6.5]`, góc xoay `π/4`)
- **Vai trò:** Chuyển hóa ý tưởng thành tài liệu đặc tả sản phẩm (PRD) hoặc tổng hợp ngữ cảnh PR (`PR-Context.md`), viết Acceptance Criteria theo chuẩn Gherkin (Given-When-Then).
- **System Prompt Core:**
  > *"Bạn là Senior Product Manager. Phân tích yêu cầu và viết PRD ngắn gọn gồm mục tiêu, flow, functional specs và Gherkin acceptance criteria."*
- **Input:** `MilestonePlan.json` + Task prompt.
- **Output Artifacts:** `PRD.md` / `PR-Context.md`.

---

### 🛠️ Agent 2: Dev Engineer (Software Engineering Lab)
- **Vị trí 3D:** Lab Kỹ thuật Phần mềm Chính Tây (`[-9.2, 0.6, 0]`, góc xoay `π/2`)
- **Vai trò:** Nhận PRD từ PM để lập trình TypeScript chuẩn Clean Architecture xuất ra bản vá Unified Git Diff, đồng bộ diff từ GitHub PR thực tế, hoặc nhận báo cáo lỗi từ QA/Security để viết bản vá hotfix.
- **System Prompt Core:**
  > *"Bạn là Senior Full-Stack Engineer. Dựa trên PRD, viết mã nguồn sạch, xử lý validation, error handling và xuất diff Pull Request."*
- **Input:** `PRD.md` hoặc `BugReport` / `SAST CVE Report`.
- **Output Artifacts:** `source-code.diff` / `PR-<number>.diff` (Hiển thị trực quan trên `GitDiffViewer` Unified & Split 2 cột).

---

### 🔍 Agent 3: Tech Review (Code Review & Architecture Lab)
- **Vị trí 3D:** Lab Kiểm định Kiến trúc Tây Nam (`[-6.5, 0.6, 6.5]`, góc xoay `3π/4`)
- **Vai trò:** Kiểm tra bản vá Unified Git Diff, đánh giá kiến trúc, code smells, memory leak, boundary check và chấm điểm chất lượng PR trước khi merge.
- **System Prompt Core:**
  > *"Bạn là Principal Code Reviewer. Kiểm tra diff PR tỉ mỉ: tìm memory leak, boundary check và quyết định APPROVE hoặc REQUEST_CHANGES."*
- **Input:** `source-code.diff` / `PR-<number>.diff`.
- **Output Artifacts:** `ReviewComments.json` (`verdict`, `score`, `summary`, `comments`).

---

### 🧪 Agent 4: QA · Test (QA Automation Server Lab)
- **Vị trí 3D:** Phòng Server Kiểm thử Tự động Đông Bắc (`[6.5, 0.6, -6.5]`, góc xoay `-π/4`)
- **Vai trò:** Sinh bộ Unit & Regression Test tự động (Jest / Vitest) bao phủ happy path, negative path và boundary/edge cases. Kích hoạt Feedback Loop về Dev khi phát hiện test fail.
- **System Prompt Core:**
  > *"Bạn là Lead QA Automation Engineer. Tạo và chạy tự động các bộ unit, integration và edge cases test; xuất telemetry pass/fail."*
- **Input:** Bản diff mã nguồn đã qua Review.
- **Output Artifacts:** `test-suite.spec.ts` / `TestReport.json`.

---

### 🛡️ Agent 5: DevSecOps (CyberSec & SAST Vault)
- **Vị trí 3D:** Hầm An ninh Mạng & Quét SAST Chính Đông (`[9.2, 0.6, 0]`, góc xoay `-π/2`)
- **Vai trò:** Quét bảo mật tĩnh (SAST), kiểm tra CVE dependencies, rà soát rò rỉ API secrets, đảm bảo tuân thủ OWASP Top 10 và yêu cầu Dev vá lỗ hổng khi phát hiện rủi ro.
- **System Prompt Core:**
  > *"Bạn là Cybersecurity Specialist. Rà soát source code và dependencies nhằm phát hiện injection, secret leak, CVE và OWASP Top 10."*
- **Input:** Bản diff mã nguồn + ngữ cảnh phụ thuộc.
- **Output Artifacts:** `SecurityAudit.json` (`status`, `cveCount`, `vulnerabilities`, `compliance`).

---

### 🚀 Agent 6: Release Eng (Container & K8s Release Hub)
- **Vị trí 3D:** Trung tâm Đóng gói Container & K8s Đông Nam (`[6.5, 0.6, 6.5]`, góc xoay `-3π/4`)
- **Vai trò:** Đóng gói container multi-stage (`Dockerfile`), cấu hình Canary rollout, mở **Cổng Phê Duyệt Production (Human-in-the-loop Gatekeeper)** và kích hoạt HPA Auto-scaler (`ScaleUp.yaml`) khi có bão tải Chaos Surge.
- **System Prompt Core:**
  > *"Bạn là Senior DevOps & SRE. Viết Dockerfile chuẩn production, manifest Kubernetes/ArgoCD và quản lý luồng Blue-Green release."*
- **Input:** Mã nguồn đã vượt qua QA và Security audit.
- **Output Artifacts:** `Dockerfile` / `ScaleUp.yaml`.

---

### 📡 Agent 7: APM Telemetry (SRE Radar & NOC Watchtower)
- **Vị trí 3D:** Đài Radar Quan trắc SRE Chính Bắc (`[0, 0.6, -9.2]`, góc xoay `0 rad`)
- **Vai trò:** Giám sát sức khỏe hạ tầng thời gian thực (CPU, P99 Latency, TPS) sau khi release và phát báo động đỏ khẩn cấp khi xảy ra đột biến tải 10x (Chaos Engineering).
- **System Prompt Core:**
  > *"Bạn là SRE Monitoring Watchdog. Theo dõi telemetry từ cụm production, đánh giá độ ổn định và phát hiện spike latency hoặc 5xx."*
- **Input:** Telemetry stream từ cụm production.
- **Output Artifacts:** `ClusterHealth.json`.

---

## 🏃 3. Giao thức Shipper Courier & Feedback Loops

Hệ thống điều phối 2 loại Courier di chuyển mượt 60fps trên mạng lưới 7 đại lộ nan hoa (Centripetal Catmull-Rom Spline):

| Shipper | Biểu tượng | Tuyến đường chạy | Mục đích |
|---|:---:|---|---|
| **Forward Shipper** | 📦 | Hub ➔ PM ➔ Dev ➔ Review ➔ QA ➔ Security ➔ DevOps ➔ Monitor | Vận chuyển Artifact thành công (Specs, PR diff, Test suite, Container) |
| **Feedback Courier** | 🐛 | QA ➔ Dev, Review ➔ Dev, Security ➔ Dev, DevOps ➔ Dev | Vận chuyển Bug Report / SAST CVE Alert / Rejected Release về cho Dev vá lỗi |

---

## 💻 4. Quy tắc Code & Phát triển Hệ thống (Developer Guidelines)

1. **Kiến trúc Next.js 16 + React Three Fiber + Zustand:**
   - **State & AI Stream Engine:** Quản lý tập trung tại [`src/store/useTownStore.ts`](file:///c:/Users/Admin/Documents/CV_Truong%20Dinh%20Anh/Ph%E1%BB%8Fng%20v%E1%BA%A5n/agent-town-3d/src/store/useTownStore.ts) và [`src/lib/events/MockSimulator.ts`](file:///c:/Users/Admin/Documents/CV_Truong%20Dinh%20Anh/Ph%E1%BB%8Fng%20v%E1%BA%A5n/agent-town-3d/src/lib/events/MockSimulator.ts).
   - **Không gian 3D Diorama:** Tách bạch trong `src/components/scene/` ([`TownScene.tsx`](file:///c:/Users/Admin/Documents/CV_Truong%20Dinh%20Anh/Ph%E1%BB%8Fng%20v%E1%BA%A5n/agent-town-3d/src/components/scene/TownScene.tsx), [`Castle.tsx`](file:///c:/Users/Admin/Documents/CV_Truong%20Dinh%20Anh/Ph%E1%BB%8Fng%20v%E1%BA%A5n/agent-town-3d/src/components/scene/Castle.tsx), [`Building.tsx`](file:///c:/Users/Admin/Documents/CV_Truong%20Dinh%20Anh/Ph%E1%BB%8Fng%20v%E1%BA%A5n/agent-town-3d/src/components/scene/Building.tsx), [`DataCables.tsx`](file:///c:/Users/Admin/Documents/CV_Truong%20Dinh%20Anh/Ph%E1%BB%8Fng%20v%E1%BA%A5n/agent-town-3d/src/components/scene/DataCables.tsx)) và tọa độ chuẩn tại [`src/lib/scene/layout.ts`](file:///c:/Users/Admin/Documents/CV_Truong%20Dinh%20Anh/Ph%E1%BB%8Fng%20v%E1%BA%A5n/agent-town-3d/src/lib/scene/layout.ts).
   - **Giao diện HUD & Modals:** Tách bạch trong `src/components/ui/` (render bên ngoài `<Canvas>` để tránh xung đột R3F reconciler).
   - **Server API Routes:** [`src/app/api/pipeline/route.ts`](file:///c:/Users/Admin/Documents/CV_Truong%20Dinh%20Anh/Ph%E1%BB%8Fng%20v%E1%BA%A5n/agent-town-3d/src/app/api/pipeline/route.ts) (Live SSE Token Streaming Gemini 3.8 / DeepSeek) và [`src/app/api/github-pr/route.ts`](file:///c:/Users/Admin/Documents/CV_Truong%20Dinh%20Anh/Ph%E1%BB%8Fng%20v%E1%BA%A5n/agent-town-3d/src/app/api/github-pr/route.ts) (GitHub Public PR Diff Importer).
   - Bản prototype Vanilla HTML/JS thế hệ v1.0 đã được lưu trữ gọn trong `docs/archive/legacy-v1/`.
2. **Commit Convention:**
   - Tuân thủ cấu trúc `<type>: <short description in English>` (`feat:`, `fix:`, `style:`, `refactor:`, `docs:`, `chore:`).
3. **Quy tắc BẮT BUỘC về Cập nhật Tài liệu & Ghi nhận Sự cố (Mandatory Changelog & Post-Mortem Rule):**
   - 🐛 **Mọi lần sửa lỗi (Fix bug):** BẮT BUỘC phải mở file [`POSTMORTEM_AND_LESSONS_LEARNED.md`](file:///c:/Users/Admin/Documents/CV_Truong%20Dinh%20Anh/Ph%E1%BB%8Fng%20v%E1%BA%A5n/agent-town-3d/POSTMORTEM_AND_LESSONS_LEARNED.md) để ghi nhận triệu chứng, nguyên nhân gốc rễ (Root Cause) và giải pháp chuẩn hóa phòng ngừa trước khi kết thúc lượt trao đổi.
   - ✨ **Mọi lần nâng cấp tính năng mới / Thay đổi kiến trúc (Feature / Architecture update):** BẮT BUỘC phải cập nhật ngay vào [`README.md`](file:///c:/Users/Admin/Documents/CV_Truong%20Dinh%20Anh/Ph%E1%BB%8Fng%20v%E1%BA%A5n/agent-town-3d/README.md) (mục mô tả tính năng & cấu trúc thư mục) đồng thời ghi vết phiên bản vào [`CHANGELOG.md`](file:///c:/Users/Admin/Documents/CV_Truong%20Dinh%20Anh/Ph%E1%BB%8Fng%20v%E1%BA%A5n/agent-town-3d/CHANGELOG.md).
   - Tuyệt đối không được bỏ qua việc cập nhật tài liệu khi hoàn thành code.
