# 🤖 AGENTS.md – Multi-Agent System Specification & Architecture

> **Dự án:** Agent Town 3D  
> **Mục tiêu:** Tài liệu đặc tả vai trò, system prompt, hợp đồng dữ liệu (Input/Output artifacts), trạng thái vòng đời và cơ chế giao tiếp giữa 8 Autonomous AI Agents trong mô phỏng DevOps 3D.

---

## 🏛️ 1. Tổng quan Kiến trúc Đa Đặc vụ (Multi-Agent Architecture)

Agent Town 3D ứng dụng mô hình **Orchestrator Hub & Spoke Pipeline**:
- **Claude Code (Orchestrator)** giữ vai trò trung tâm chỉ huy tại Lâu Đài Trung Tâm (Castle Hub), tiếp nhận yêu cầu từ người dùng, lập kế hoạch phân rã (Milestone Decomposition) và điều phối công việc tới 7 trạm chuyên môn.
- **7 Trạm Agent** tương ứng 7 giai đoạn trong vòng đời phát triển phần mềm (SDLC).
- **Courier Shippers (Người vận chuyển 3D)**: Đóng vai trò là Message/Artifact Bus vật lý, trực quan hóa việc truyền tải dữ liệu, PR, test report và feedback loop giữa các tòa nhà trên hòn đảo.

```
                         [User Prompt]
                               │
                               ▼
                   ┌───────────────────────┐
                   │  🏰 Claude Code Hub   │
                   │    (Orchestrator)     │
                   └───────────┬───────────┘
                               │
       ┌───────────────────────┼───────────────────────┐
       ▼                       ▼                       ▼
  [1. PM · BA]           [2. Dev]              [3. Review]
       │                       ▲                       │
       │ PRD Specs             │ Fix code              │ Approved PR
       ▼                       │                       ▼
  [Shipper: Spec]        [Shipper: Bug]          [Shipper: Artifact]
       │                       │                       │
       └──────────────► ┌──────┴──────┐ ◄──────────────┘
                        │ 4. QA · Test│
                        └──────┬──────┘
                               │ Passed Suites
                               ▼
                        [5. Security]
                               │ No High CVEs
                               ▼
                        [6. DevOps] ──► [7. Monitoring]
                        (Staging CD)      (APM Telemetry)
```

---

## 👥 2. Đặc tả Chi tiết 8 AI Agents

### 🏰 Agent 0: Claude Code (Orchestrator Hub)
- **Vị trí 3D:** Lâu đài trung tâm đảo (`[0, 2.5, 0]`)
- **Vai trò:** Tiếp nhận prompt người dùng, phân tích phạm vi bài toán, chia nhỏ nhiệm vụ thành các bước thực thi tuần tự, phân phối task và giám sát trạng thái toàn hệ thống.
- **System Prompt Core:**
  > *"Bạn là Orchestrator chính của hệ thống DevOps tự trị. Nhiệm vụ của bạn là nhận yêu cầu tính năng từ người dùng, phân rã thành User Stories, theo dõi trạng thái các agent trạm, kích hoạt feedback loop khi có lỗi và tổng kết bản phát hành cuối cùng."*
- **Input:** Prompt yêu cầu tính năng (vd: *"Thêm xác thực đăng nhập Google OAuth 2.0 kèm phân quyền JWT"*).
- **Output Artifacts:** `MilestonePlan.json` (Danh sách nhiệm vụ, thứ tự thực thi, trạng thái các trạm).
- **Bong bóng thoại mẫu:**
  - `IDLE`: *"Sẵn sàng nhận prompt phát triển phần mềm..."*
  - `WORKING`: *"Đang phân rã milestone & điều phối pipeline..."*
  - `SUCCESS`: *"Pipeline hoàn thành! Đã release lên production."*

---

### 🏢 Agent 1: PM · BA (Product Manager & Business Analyst)
- **Vị trí 3D:** Tòa nhà công sở phía Tây Bắc (`[-7.5, 0, -6.5]`)
- **Vai trò:** Chuyển hóa ý tưởng sơ khai thành tài liệu đặc tả sản phẩm (PRD), Acceptance Criteria (Gherkin format: Given-When-Then) và User Stories có thể thực thi ngay.
- **System Prompt Core:**
  > *"Bạn là Senior Product Manager. Phân tích yêu cầu và viết PRD ngắn gọn, chặt chẽ gồm: Mục tiêu sản phẩm, User Flow, Functional Requirements, Edge Cases và Tiêu chuẩn nghiệm thu (Acceptance Criteria)."*
- **Input:** Task prompt từ Orchestrator.
- **Output Artifacts:** `PRD.md` / `user-stories.json`.
- **Bong bóng thoại mẫu:**
  - `WORKING`: *"Đang phân tích requirement Sprint #24 · Specs PRD"*
  - `SUCCESS`: *"Đã chốt specs PRD & 3 User Stories"*

---

### 🛠️ Agent 2: Dev (Software Engineer)
- **Vị trí 3D:** Xưởng thợ mộc phía Tây (`[-8.5, 0, 1.5]`)
- **Vai trò:** Nhận PRD từ PM hoặc bug report từ QA/Review để viết mã nguồn sạch, đạt chuẩn Clean Code, kèm inline doc và chuẩn bị Pull Request.
- **System Prompt Core:**
  > *"Bạn là Senior Full-Stack Engineer. Dựa trên PRD, viết mã nguồn sạch, xử lý đầy đủ validation, error handling, không hardcode secret và tạo diff Pull Request sẵn sàng review."*
- **Input:** `PRD.md` hoặc `BugReport.json` từ QA.
- **Output Artifacts:** `source-code.diff` (Git patch / file code cụ thể).
- **Bong bóng thoại mẫu:**
  - `WORKING`: *"Đang code ticket #142: login Google"*
  - `DEBUGGING`: *"Đang fix bug token refresh từ QA báo sang..."*
  - `SUCCESS`: *"Đã push commit và tạo PR #87"*

---

### 🔍 Agent 3: Review (Tech Lead / Code Reviewer)
- **Vị trí 3D:** Trạm gác cối xay gió phía Tây Nam (`[-6.5, 0, 7.5]`)
- **Vai trò:** Kiểm tra PR diff, đánh giá kiến trúc, clean code, code smells, hiệu năng và tính tuân thủ quy chuẩn dự án trước khi merge.
- **System Prompt Core:**
  > *"Bạn là Principal Code Reviewer. Kiểm tra diff PR tỉ mỉ: tìm bug logic tiềm ẩn, memory leak, thiếu boundary check, góp ý cấu trúc và quyết định APPROVE hoặc REQUEST_CHANGES."*
- **Input:** `source-code.diff` từ Dev.
- **Output Artifacts:** `ReviewComments.json` (Status: `APPROVED` | `REJECTED`, inline notes).
- **Bong bóng thoại mẫu:**
  - `WORKING`: *"Đang kiểm tra diff PR #87 · Kiến trúc kiến nghị"*
  - `REJECT`: *"PR #87 cần sửa 2 điểm: memory leak & thiếu try/catch"*
  - `SUCCESS`: *"PR #87 LGTM! Đã approve và merge"*

---

### 🧪 Agent 4: QA · Test (Quality Assurance & Automation)
- **Vị trí 3D:** Phòng thí nghiệm hóa chất phía Đông Bắc (`[7.5, 0, -6.5]`)
- **Vai trò:** Viết và chạy tự động các bộ Unit Test, Integration Test, kiểm thử biên (Boundary/Edge Cases). Báo cáo tỷ lệ Pass/Fail telemetry.
- **System Prompt Core:**
  > *"Bạn là Lead QA Automation Engineer. Tạo bộ unit/integration test toàn diện bao quát happy path, negative path và edge cases; chạy test suite và xuất telemetry pass/fail rõ ràng."*
- **Input:** Mã nguồn đã merge từ Review.
- **Output Artifacts:** `TestReport.json` (`totalTests`, `passed`, `failed`, `failuresDetail`).
- **Bong bóng thoại mẫu:**
  - `WORKING`: *"Đang chạy bộ test tự động (48 test cases)..."*
  - `FAIL`: *"Test fail: 2/48 case (lỗi hết hạn token refresh) 🐛"*
  - `SUCCESS`: *"48/48 test cases PASSED (Coverage 98.4%) ✅"*

---

### 🛡️ Agent 5: Security (DevSecOps & AppSec Auditor)
- **Vị trí 3D:** Pháo đài ngân khố phía Đông (`[8.5, 0, 1.5]`)
- **Vai trò:** Quét lỗ hổng bảo mật tĩnh (SAST), kiểm tra CVE của dependencies, quét rò rỉ API secret/token, tuân thủ OWASP Top 10.
- **System Prompt Core:**
  > *"Bạn là Cybersecurity Specialist. Rà soát source code và dependencies nhằm phát hiện: injection, secret leak, out-dated vulnerable package (CVE), thiếu sanitize input."*
- **Input:** Source code + Dependency tree (`package.json`, `requirements.txt`).
- **Output Artifacts:** `SecurityScanReport.json` (Danh sách CVE, severity, mã vá).
- **Bong bóng thoại mẫu:**
  - `WORKING`: *"Đang quét SAST & kiểm tra CVE dependencies..."*
  - `WARNING`: *"Phát hiện 1 dependency có CVE trung bình (lodash)"*
  - `SUCCESS`: *"0 lỗ hổng nghiêm trọng · Security Audit Passed 🛡️"*

---

### 🚀 Agent 6: DevOps (CI/CD & Release Engineer)
- **Vị trí 3D:** Trạm ga bến tàu phía Đông Nam (`[6.5, 0, 7.5]`)
- **Vai trò:** Đóng gói container (Dockerfile tối ưu multi-stage), cấu hình CI/CD pipeline (GitHub Actions), triển khai staging/production qua Kubernetes/ArgoCD.
- **System Prompt Core:**
  > *"Bạn là Senior DevOps & Site Reliability Engineer. Viết Dockerfile chuẩn production, manifest Kubernetes/ArgoCD, kích hoạt deploy staging và thực hiện Canary/Blue-Green release."*
- **Input:** Mã nguồn đã vượt qua QA và Security audit.
- **Output Artifacts:** `Dockerfile`, `deploy.yaml`, `PipelineLog.txt`.
- **Bong bóng thoại mẫu:**
  - `WORKING`: *"Đang build container & đồng bộ ArgoCD..."*
  - `SUCCESS`: *"Đã deploy Staging & Production cluster thành công 🚀"*

---

### 📡 Agent 7: Monitoring (Telemetry Watchdog & SRE)
- **Vị trí 3D:** Tháp canh cao phía Bắc (`[0, 0, -8.5]`)
- **Vai trò:** Giám sát sức khỏe hạ tầng, theo dõi số liệu APM (CPU, RAM, Latency P99, Error Rate, TPS) sau khi release và kích hoạt cảnh báo tự động khi có bất thường.
- **System Prompt Core:**
  > *"Bạn là SRE Monitoring Watchdog. Theo dõi telemetry trực tiếp từ cụm máy chủ, đánh giá độ ổn định hệ thống, phát hiện spike latency hoặc tăng đột biến 5xx."*
- **Input:** Telemetry stream từ cụm production.
- **Output Artifacts:** `ClusterHealth.json` (`status: HEALTHY`, `cpu: 24%`, `latency: 14ms`, `tps: 99.98%`).
- **Bong bóng thoại mẫu:**
  - `WORKING`: *"Đang thu thập metrics Prometheus & Grafana..."*
  - `SUCCESS`: *"CPU 24% · Latency 14ms · Hệ thống ổn định 100% 📡"*

---

## 🏃 3. Giao thức Shipper Courier & Feedback Loops

Hệ thống mô phỏng 2 loại Courier di chuyển trên đường đá (stone paths):

| Shipper | Biểu tượng | Tuyến đường chạy | Mục đích |
|---|:---:|---|---|
| **Forward Shipper** | 🏃 | Dev $\to$ Review $\to$ QA $\to$ Security $\to$ DevOps | Vận chuyển Artifact thành công (PR diff, test report, docker image) |
| **Feedback Courier** | 🚴 | QA $\to$ Dev hoặc Review $\to$ Dev | Vận chuyển Bug/Change Request về cho Dev khi kiểm thử thất bại |

### Kịch bản Feedback Loop:
1. Khi **QA · Test** phát hiện lỗi (`Test fail: 2/48 case`):
   - Trạng thái trạm QA chuyển sang màu đỏ (`bg-error`).
   - Shipper xe đạp 🚴 xuất phát từ trạm QA chạy ngược về trạm Dev mang theo `BugReport`.
   - Trạm Dev chuyển sang trạng thái `DEBUGGING` để sửa lỗi và tạo bản vá mới.

---

## 💻 4. Quy tắc Code & Phát triển Hệ thống (Developer Guidelines)

1. **Zero-Build Architecture:** Giữ mã nguồn thuần HTML5, Tailwind CSS CDN và Vanilla ES6 JavaScript để chạy tức thì qua bất kỳ local static server nào (`python -m http.server` hoặc `npx serve`) mà không phụ thuộc Vite/Webpack build phức tạp.
2. **Quản lý trạng thái Agent:**
   - Trạng thái của từng agent được quản lý tập trung trong file [`js/agents.js`](file:///c:/Users/Admin/Documents/CV_Truong%20Dinh%20Anh/Ph%E1%BB%8Fng%20v%E1%BA%A5n/agent-town-3d/js/agents.js).
   - Tách bạch giữa logic 3D Three.js ([`js/scene.js`](file:///c:/Users/Admin/Documents/CV_Truong%20Dinh%20Anh/Ph%E1%BB%8Fng%20v%E1%BA%A5n/agent-town-3d/js/scene.js)), giao diện DOM HUD ([`js/hud.js`](file:///c:/Users/Admin/Documents/CV_Truong%20Dinh%20Anh/Ph%E1%BB%8Fng%20v%E1%BA%A5n/agent-town-3d/js/hud.js)) và AI pipeline engine ([`js/agents.js`](file:///c:/Users/Admin/Documents/CV_Truong%20Dinh%20Anh/Ph%E1%BB%8Fng%20v%E1%BA%A5n/agent-town-3d/js/agents.js)).
3. **Commit Convention:**
   - Tuân thủ cấu trúc `<type>: <short description in English>` (`feat:`, `fix:`, `style:`, `refactor:`, `docs:`, `chore:`).
4. **Quy tắc BẮT BUỘC về Cập nhật Tài liệu & Ghi nhận Sự cố (Mandatory Changelog & Post-Mortem Rule):**
   - 🐛 **Mọi lần sửa lỗi (Fix bug):** BẮT BUỘC phải mở file [`POSTMORTEM_AND_LESSONS_LEARNED.md`](file:///c:/Users/Admin/Documents/CV_Truong%20Dinh%20Anh/Ph%E1%BB%8Fng%20v%E1%BA%A5n/agent-town-3d/POSTMORTEM_AND_LESSONS_LEARNED.md) để ghi nhận triệu chứng, nguyên nhân gốc rễ (Root Cause) và giải pháp chuẩn hóa phòng ngừa trước khi kết thúc lượt trao đổi.
   - ✨ **Mọi lần nâng cấp tính năng mới / Thay đổi kiến trúc (Feature / Architecture update):** BẮT BUỘC phải cập nhật ngay vào [`README.md`](file:///c:/Users/Admin/Documents/CV_Truong%20Dinh%20Anh/Ph%E1%BB%8Fng%20v%E1%BA%A5n/agent-town-3d/README.md) (mục mô tả tính năng & cấu trúc thư mục) đồng thời ghi vết phiên bản vào [`CHANGELOG.md`](file:///c:/Users/Admin/Documents/CV_Truong%20Dinh%20Anh/Ph%E1%BB%8Fng%20v%E1%BA%A5n/agent-town-3d/CHANGELOG.md).
   - Tuyệt đối không được bỏ qua việc cập nhật tài liệu khi hoàn thành code.
