# 🤖 AGENTS.md – Multi-Agent System Specification & Architecture

> **Dự án:** Agent Town 3D (v1.5.0)  
> **Mục tiêu:** Tài liệu đặc tả vai trò, quy trình SOP phòng ban, hợp đồng dữ liệu (Input/Output Contracts), trạng thái vòng đời, kiến trúc đa mô hình (Gemini & DeepSeek Hybrid) và cơ chế giao tiếp DAG giữa 8 Autonomous AI Agents trong nền tảng mô phỏng DevOps 3D xây dựng trên Next.js 16, React Three Fiber v9 và Zustand.

---

## 🏛️ 1. Tổng quan Kiến trúc Đa Đặc vụ (Multi-Agent Architecture)

Agent Town 3D ứng dụng mô hình **Orchestrator Hub & Spoke + DAG Parallel Pipeline** trên mặt bằng **Radial Polar Geometry ($R = 9.2\text{m}$)**:
- **Claude Code (AI Command Center / War Room)** giữ vai trò trung tâm chỉ huy tại tâm đảo (`[0, 0.6, 0]`), tiếp nhận yêu cầu từ người dùng (hoặc kéo trực tiếp Pull Request từ GitHub REST API), lập kế hoạch phân rã chuẩn INVEST (Milestone Decomposition) và điều phối công việc tới 7 phòng lab chuyên môn.
- **7 Trạm High-Tech Autonomous Labs** tương ứng 7 phòng ban trong vòng đời phát triển phần mềm thực tế (SDLC), bố trí đối xứng hướng tâm 100% về trung tâm chỉ huy.
- **Kiến Trúc Đa Mô Hình (Gemini 3.8 Flash & DeepSeek V3 Hybrid Engine)**: Tách bạch và hỗ trợ linh hoạt 2 API key độc lập (`AGENT_TOWN_GEMINI_KEY` & `AGENT_TOWN_DEEPSEEK_KEY`), cho phép chỉ định mô hình suy luận cho từng phòng ban (`auto` | `gemini` | `deepseek`) và thống kê chi phí FinOps theo model engine.
- **Hệ Thống Tổng Hợp Giọng Nói (Web Speech API AI Voice TTS)**: Mỗi Agent sở hữu một hồ sơ giọng nói riêng biệt (tùy biến pitch và rate), tự động thuyết minh các bước thực thi từ bong bóng thoại 3D.
- **Immutable Output Contract & Editable Role SOP (`src/lib/pipeline/prompts.ts`)**: Tách biệt quy trình nghiệp vụ của từng phòng ban (`defaultRolePrompt`, cho phép tùy chỉnh trực tiếp trên AI Playground) với hợp đồng định dạng đầu ra (`outputContract`, khóa cố định trên Server) và hồ sơ bàn giao liên phòng ban (`PipelineContext`).
- **Courier Shippers, Rollback Emergency & Dynamic Photon Heatmap**: Trực quan hóa việc truyền tải dữ liệu, PR diff, test report, feedback loop và quy trình Rollback khẩn cấp giữa các trạm qua nhân vật vận chuyển 3D và 7 tuyến cáp quang neon đổi màu nhiệt độ theo tải lượng.

```
                    [User Prompt / GitHub PR URL]
                                  │
                                  ▼
                   ┌─────────────────────────────┐
                   │   🎛️ AI Command Center      │
                   │  Claude Code (Orchestrator) │
                   └──────────────┬──────────────┘
                                  │ MilestonePlan.json
                                  ▼
                            [1. PM · BA]
                                  │ PRD.md (Gherkin + NFRs)
                                  ▼
                            [2. Dev Lab] ◄───────────────┐
                                  │ source-code.diff     │ Feedback Loop:
                                  ▼                      │ Fix Bug / Vá CVE /
                           [3. Tech Review]              │ Tech Lead Reject
                                  │ ReviewComments.json  │
                     ┌────────────┴────────────┐         │
                     ▼ (DAG Fork Song Song)    ▼         │
               [4. QA · Test]            [5. DevSecOps] ─┤
              test-suite.spec.ts       SecurityAudit.json│
                     └────────────┬────────────┘         │
                                  ▼ (DAG Join)           │
                           [6. Release Eng] ─────────────┘
                         (Dockerfile & Gatekeeper)
                                  │ Approved Canary
                                  ▼
                           [7. APM Monitor]
                     (ClusterHealth.json · 4 Golden Signals)
```

---

## 👥 2. Đặc tả Chi tiết 8 AI Agents

### 🎛️ Agent 0: Claude Code (Orchestrator Hub)
- **Vị trí 3D:** AI Command Center kính bán nguyệt trung tâm đảo (`[0, 0.6, 0]`, góc xoay `0 rad`)
- **Vai trò:** Engineering Manager & Technical Program Orchestrator — xác định phạm vi kiến trúc, nhận diện rủi ro kỹ thuật, chia nhỏ yêu cầu thành các User Stories chuẩn INVEST (`P0/P1/P2`, Story Points, Acceptance Gate), điều phối SSE streaming và xử lý hủy luồng (`AbortController`).
- **Input:** Prompt yêu cầu tính năng hoặc URL GitHub Pull Request công khai.
- **Output Artifacts:** `MilestonePlan.json` (`milestone`, `goal`, `technicalScope`, `risks`, `userStories`, `speech`).

---

### 🏢 Agent 1: PM · BA (Product Strategy Lab)
- **Vị trí 3D:** Phòng Lab Chiến lược Sản phẩm Tây Bắc (`[-6.5, 0.6, -6.5]`, góc xoay `π/4`)
- **Vai trò:** Senior Product Manager & BA — biên soạn PRD 5 phần chuẩn thực chiến (Business Metrics, User Flows & Functional Specs, Gherkin BDD Given-When-Then, Non-Functional Requirements SLA/Security, Out of Scope) hoặc tổng hợp ngữ cảnh PR (`PR-Context.md`).
- **Input:** `MilestonePlan.json` + Task prompt.
- **Output Artifacts:** `PRD.md` / `PR-Context.md`.

---

### 🛠️ Agent 2: Dev Engineer (Software Engineering Lab)
- **Vị trí 3D:** Lab Kỹ thuật Phần mềm Chính Tây (`[-9.2, 0.6, 0]`, góc xoay `π/2`)
- **Vai trò:** Senior Full-Stack Engineer — lập trình Strict TypeScript theo Clean Architecture & SOLID, Defensive Input Validation, Error Handling bảo mật dựa trên PRD & NFRs, xuất bản vá Unified Git Diff hoặc viết bản vá hotfix từ Feedback Loop.
- **Input:** `PRD.md` (hoặc `feedbackNote` từ QA / DevSecOps / Tech Lead + `source-code.diff` hiện tại).
- **Output Artifacts:** `source-code.diff` / `PR-<number>.diff` (Hiển thị trực quan trên `GitDiffViewer` Unified & Split 2 cột).

---

### 🔍 Agent 3: Tech Review (Code Review & Architecture Lab)
- **Vị trí 3D:** Lab Kiểm định Kiến trúc Tây Nam (`[-6.5, 0.6, 6.5]`, góc xoay `3π/4`)
- **Vai trò:** Principal Engineer & Tech Lead Reviewer — đối chiếu chéo PR Diff với PRD theo 5 trụ cột (Spec Compliance, Boundary Safety, Clean Architecture, Memory/Resource Safety, Security Hygiene), gắn nhận xét trực tiếp vào số dòng `+newStart` của diff.
- **Input:** `PRD.md` + `source-code.diff` / `PR-<number>.diff`.
- **Output Artifacts:** `ReviewComments.json` (`verdict`, `score`, `summary`, `comments[{ file, line, status, note }]`).

---

### 🧪 Agent 4: QA · Test (QA Automation Server Lab)
- **Vị trí 3D:** Phòng Server Kiểm thử Tự động Đông Bắc (`[6.5, 0.6, -6.5]`, góc xoay `-π/4`)
- **Vai trò:** Lead QA Automation & SDET — chạy song song với DevSecOps (`QA` ∥ `Security`), đối chiếu độc lập cả Gherkin Acceptance Criteria trong `PRD.md` lẫn `source-code.diff` để sinh bộ test Vitest/Jest 4 tầng (Happy Path, Negative 400/401/403, Boundary/Timeout, Mocking). Kích hoạt Feedback Loop về Dev khi test fail.
- **Input:** `PRD.md` + `source-code.diff` + `ReviewComments.json`.
- **Output Artifacts:** `test-suite.spec.ts`.

---

### 🛡️ Agent 5: DevSecOps (CyberSec & SAST Vault)
- **Vị trí 3D:** Hầm An ninh Mạng & Quét SAST Chính Đông (`[9.2, 0.6, 0]`, góc xoay `-π/2`)
- **Vai trò:** Principal AppSec & DevSecOps Specialist — chạy song song với QA, thực hiện SAST, Threat Modeling theo NFRs trong `PRD.md`, kiểm tra rò rỉ Secret/PII, SCA dependencies và tuân thủ OWASP Top 10. Yêu cầu Dev vá lỗ hổng khi phát hiện rủi ro.
- **Input:** `PRD.md` (Security NFRs) + `source-code.diff` + `ReviewComments.json`.
- **Output Artifacts:** `SecurityAudit.json` (`status`, `cveCount`, `vulnerabilities`, `compliance`).

---

### 🚀 Agent 6: Release Eng (Container & K8s Release Hub)
- **Vị trí 3D:** Trung tâm Đóng gói Container & K8s Đông Nam (`[6.5, 0.6, 6.5]`, góc xoay `-3π/4`)
- **Vai trò:** Senior DevOps & Release Engineer — nhận bàn giao hội tụ (DAG Join) từ QA và DevSecOps, đóng gói multi-stage `node:20-alpine` (`Dockerfile`) chạy non-root `USER` kèm `HEALTHCHECK` & chiến lược ArgoCD Canary Rollout, mở **Cổng Phê Duyệt Production (Human-in-the-loop Gatekeeper)** và kích hoạt HPA Auto-scaler (`ScaleUp.yaml`) khi có bão tải Chaos Surge.
- **Input:** `source-code.diff` + `ReviewComments.json` + `test-suite.spec.ts` + `SecurityAudit.json`.
- **Output Artifacts:** `Dockerfile` / `ScaleUp.yaml`.

---

### 📡 Agent 7: APM Telemetry (SRE Radar & NOC Watchtower)
- **Vị trí 3D:** Đài Radar Quan trắc SRE Chính Bắc (`[0, 0.6, -9.2]`, góc xoay `0 rad`)
- **Vai trò:** Principal SRE & APM Watchdog — stream trực tiếp báo cáo hậu phát hành dựa trên **4 Tín Hiệu Vàng của Google SRE** (Latency P99, Traffic TPS, Error Rate, Saturation CPU/Memory/Pods), đánh giá SLO Error Budget và phát báo động đỏ khi xảy ra đột biến tải 10x (Chaos Engineering).
- **Input:** `PRD.md` (SLA targets) + `Dockerfile` (Canary config) + `SecurityAudit.json`.
- **Output Artifacts:** `ClusterHealth.json`.

---

## 🏃 3. Giao thức Shipper Courier & Feedback Loops

Hệ thống điều phối các Courier di chuyển mượt 60fps trên mạng lưới 7 đại lộ nan hoa (Centripetal Catmull-Rom Spline):

| Shipper | Biểu tượng | Tuyến đường chạy | Mục đích |
|---|:---:|---|---|
| **Forward Shipper** | 📦 | Hub ➔ PM ➔ Dev ➔ Review ➔ QA ➔ Security ➔ DevOps ➔ Monitor | Vận chuyển Artifact thành công (Specs, PR diff, Test suite, Container) |
| **Feedback Courier** | 🐛 | QA ➔ Dev, Review ➔ Dev, Security ➔ Dev, DevOps ➔ Dev | Vận chuyển Bug Report / SAST CVE Alert / Tech Lead Review feedback về cho Dev vá lỗi |
| **Rollback Courier** | 🚨 | Monitor ➔ DevOps | Vận chuyển tín hiệu Rollback khẩn cấp khi phát hiện sự cố Production nghiêm trọng (dùng feedback shipper gắn nhãn Rollback Stable Image) |

---

## 💻 4. Quy tắc Code & Phát triển Hệ thống (Developer Guidelines)

1. **Kiến trúc Next.js 16 + React Three Fiber + Zustand:**
   - **State, Department SOP Prompts & AI Stream Engine:** Quản lý tập trung tại [`src/store/useTownStore.ts`](file:///c:/Users/Admin/Documents/CV_Truong%20Dinh%20Anh/Ph%E1%BB%8Fng%20v%E1%BA%A5n/agent-town-3d/src/store/useTownStore.ts), [`src/lib/pipeline/prompts.ts`](file:///c:/Users/Admin/Documents/CV_Truong%20Dinh%20Anh/Ph%E1%BB%8Fng%20v%E1%BA%A5n/agent-town-3d/src/lib/pipeline/prompts.ts) và [`src/lib/events/MockSimulator.ts`](file:///c:/Users/Admin/Documents/CV_Truong%20Dinh%20Anh/Ph%E1%BB%8Fng%20v%E1%BA%A5n/agent-town-3d/src/lib/events/MockSimulator.ts).
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
