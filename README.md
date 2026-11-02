# 🏰 Thị trấn DevOps 3D (Agent Town 3D) v1.6.0

> **Mô phỏng Hệ thống 8 Autonomous AI Agents & DevOps SDLC Pipeline trên Hòn đảo bay 3D Isometric Diorama**  
> Xây dựng với **Next.js 16 (Turbopack)**, **React 19**, **Three.js / React Three Fiber v9**, **Google Gemini API**, **DeepSeek V3**, **Zustand**, và **Web Speech & Audio API**.

[![Next.js](https://img.shields.io/badge/Next.js-16.4-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3-blue?logo=react)](https://react.dev/)
[![React Three Fiber](https://img.shields.io/badge/R3F-v9-blue?logo=three.js)](https://docs.pmnd.rs/react-three-fiber)
[![Gemini & DeepSeek](https://img.shields.io/badge/AI_Engine-Gemini_3.8_|_DeepSeek_V3-orange?logo=google)](https://ai.google.dev/)
[![Version](https://img.shields.io/badge/Release-v1.6.0-emerald)](CHANGELOG.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

<p align="center">
  <img src="screenshot.png" alt="Thị trấn DevOps 3D Screenshot" width="100%" />
</p>

---

## 🌟 1. Tổng quan Dự án (Overview)

**Agent Town 3D** là nền tảng trực quan hóa sinh động quy trình phát triển và vận hành phần mềm hiện đại (SDLC). Toàn bộ chu trình từ tiếp nhận yêu cầu, viết specs PRD, lập trình mã nguồn, review code, kiểm thử tự động, quét bảo mật, đóng gói container cho đến giám sát APM telemetry đều được tự trị hóa bởi **8 Autonomous AI Agents** theo mô hình **Orchestrator Hub & Spoke**:

- 🏢 **Trung Tâm Chỉ Huy AI (AI Command Center / War Room - Claude Code)**: Tòa nhà điều hành kính trong suốt tại tâm hòn đảo, sở hữu Bàn Hologram 3D phát sáng và Dàn màn hình NOC giám sát, nhận prompt từ người dùng, phân rã milestone và điều phối luồng làm việc tới các trạm.
- 🏢 **7 Trạm Chuyên Môn Bố Cục Đối Xứng Hướng Tâm (Radial Polar Layout)**: Các phòng làm việc cắt lát (Cutaway Dollhouse) với đầy đủ nội thất, màn hình máy tính nhấp nháy, đèn lồng và radar xoay.
- 🏃 **Người Vận Chuyển 3D (Courier Shippers)**: Trực quan hóa việc truyền tải Artifacts (PR diff, Test report, Docker image) chạy trên hệ thống đường đá 7 nan hoa và vòng xuyến trung tâm.
- 🚴 **Vòng Lặp Phản Hồi Tự Động (Feedback Loop)**: Khi QA bắt lỗi hoặc Tech Review từ chối, Shipper đạp xe ngược về xưởng Dev để kỹ sư viết bản vá lỗi (hotfix patch).
- 🛡️ **Cổng Phê Duyệt Triển Khai (Production Approval Gate)**: Cơ chế Human-in-the-loop an toàn yêu cầu Tech Lead / Con người bấm duyệt trước khi triển khai lên Production.
- 🗣️ **Giọng Nói Trí Tuệ Nhân Tạo Thời Gian Thực (Web Speech API TTS)**: Tích hợp âm thanh giọng nói tự nhiên với ngữ điệu riêng biệt cho 8 AI Agents, lọc sạch thẻ code và công tắc bật/tắt `🗣️ Voice` trên Topbar.
- 📹 **Màn Hình Giám Sát Bàn Làm Việc PiP (Desk Cam CCTV HUD)**: Cửa sổ CCTV scanlines thu nhỏ ở góc màn hình, truyền hình trực tiếp mã nguồn AI streaming, bộ đo FPS thời gian thực (`requestAnimationFrame`), nút ghim bàn làm việc và chuyển góc nhìn 3D tức thì.
- 🌐 **Kiến Trúc Đa Mô Hình Hybrid (Gemini 3.8 Flash & DeepSeek V3)**: Quản lý 2 API Key độc lập, lựa chọn Model Provider linh hoạt cho từng phòng ban trong AI Playground và thống kê chi phí FinOps chi tiết.
- 🚀 **Ma Trận CI/CD Đa Môi Trường & Cổng Khẩn Cấp Rollback Gate**: Kiểm thử Staging song song (Node 18/20/22), tiến trình ArgoCD Canary (10% ➔ 50% ➔ 100%) và nút Emergency Rollback điều phối Shipper quay đầu giải cứu hệ thống.
- ⚡ **Bản Đồ Nhiệt Cáp Quang Dữ Liệu (Photon Heatmap)**: Cáp quang tự động đổi màu phản ứng theo tải lượng (Cyan ➔ Amber ➔ Red Glow) và gia tốc hạt photon theo TPS thời gian thực.
- 🎮 **Trình Thanh Tra Trạm Chuẩn Game RTS (Game-Style Station Inspector & Multi-Agent Dashboards)**: Bấm vào bất kỳ trạm nào trong không gian 3D hoặc dock điều khiển, camera tự động lướt và zoom cận cảnh vào trạm làm việc, đồng thời trượt mở ngăn Inspector cạnh phải màn hình không dùng backdrop che phủ, giữ trọn 70% không gian 3D sống động. Tích hợp bộ thẻ báo cáo đồ họa chuyên biệt (Git Diff Viewer cho Dev, Bảng điểm SAST AppSec cho DevSecOps, 4 Tín hiệu vàng APM cho Monitor, Kế hoạch Sprint INVEST cho Claude Code Hub), chuyển đổi nhanh Raw JSON, chỉnh sửa lưu SOP/System Prompt, thống kê Telemetry và thanh lướt 8 trạm liên hoàn (phím `[` và `]`).
- 🔮 **Vành Hologram Trạng Thái 3D & Khối Artifact Phát Quang (`StationHoloBeacon`)**: Lắp đặt thiết bị holographic status beacon trên nóc 7 trạm chuyên môn và Sky Command Holo Crown trên nóc Lâu đài trung tâm. Trực quan hóa tức thì trạng thái AI (kim cương đỏ cảnh báo lỗi, lăng kính hổ phách gỡ lỗi, khối xanh ngọc Data-Cube khi bàn giao artifact) cùng âm thanh tương tác xúc giác 3D.
- ⛈️ **Thời Tiết Bão Tải Kỹ Thuật Số & Cây Cối Đung Đưa Trong Gió**: Khi xảy ra bão tải Chaos Surge 10x, bầu trời đổ 90 vệt mưa neon kỹ thuật số, sấm chớp giật sáng kèm tiếng sấm rền sfx (`playThunder()`), tán cây và hoa anh đào đung đưa theo sức gió vật lý.
- ⌨️ **Hệ Thống Phím Tắt Điều Khiển Chuẩn RTS Game (RTS Game Engine Hotkeys & Modal)**: Phím `0` focus Hub 0 (hoặc bật/tắt góc nhìn toàn cảnh), `1-7` bay tới tương ứng Station 1-7, `8` reset toàn cảnh, `Space` play/pause mô phỏng, `T` chu kỳ thời gian, `M` âm thanh, `V` voice TTS, `C` desk cam, `L` nhật ký, `R` xoay đảo, `F` đạo diễn auto-follow, `D` bảng chẩn đoán SRE, `?` hoặc `H` mở bảng tra cứu phím tắt RTS.
- 📊 **Trung Tâm Chẩn Đoán Cụm & Telemetry Chuẩn SRE Google (SRE Golden Signals & Hardware Diagnostics)**: Theo dõi 4 Tín hiệu Vàng của Google SRE (Latency P99 sóng động SVG, Traffic TPS, Error Rate %, Saturation CPU/RAM Heap), đo FPS thực tế, bảng ma trận đa mô hình FinOps, hàng đợi Shipper đang chạy và cụm nút kích hoạt Chaos Surge 10x & Rollback khẩn cấp.
- 🧪 **Thử Nghiệm Sinh Mã Riêng Từng Trạm (Quick Station Sandbox Run)**: Lưu prompt và chạy thử nghiệm AI độc lập cho từng trạm trực tiếp từ Station Inspector Panel mà không cần nạp lại 7 trạm còn lại.
- 🛡️ **Ngân Hàng 12 User Stories & Bộ Tiêm Sự Cố Tự Trị (12 SDLC Tasks & Chaos Incidents)**: Thư viện 12 tác vụ kỹ thuật thực chiến (gRPC, Redis caching, Stripe HMAC, pgvector, Distroless Docker...) kèm cơ chế tự động tiêm sự cố SAST CVE, Vitest fail, P99 spike.
- 🔍 **Bộ Kiểm Thử Toàn Vẹn Hệ Thống Tự Động (`npm test`)**: 64 ca kiểm thử tự động xác nhận tính toàn vẹn của bố cục Polar 8 trạm, tính liên tục của hệ thống Waypoints nan hoa và feedback loops.
- ⏱️ **Chu Kỳ Thời Gian Thực Tự Động & Đồng Hồ Telemetry (`themeMode: 'auto'`)**: Tự động đồng bộ ánh sáng 3D theo giờ thực của bạn (Ban ngày ☀️, Hoàng hôn 🌆, Ban đêm 🌙 kèm đom đóm & đèn lồng phát sáng), hiển thị thời tiết và đồng hồ số nhịp giây trên mọi kích cỡ màn hình.
- 🔔 **Hệ Thống Toast Notification & Bong Bóng Thoại 3D Kẹp Biên**: Tự động đẩy thẻ thông báo kính mờ khi có sự kiện quan trọng (Cảnh báo CVE, Cổng duyệt, Bão tải SRE) và kẹp biên 100% tọa độ hiển thị chống tràn màn hình di động.
- 🤖 **Ba Chế Độ Vận Hành Chuyên Nghiệp**:
  1. **Live AI Token Streaming (Gemini 3.8 Flash / DeepSeek SSE)**: Truyền trực tiếp từng dòng code, PRD, Git Diff và báo cáo lên màn hình Terminal nổi thời gian thực kèm nút **`⏹ Dừng`** (`AbortController`).
  2. **Kiểm Toán GitHub Pull Request Thật (Public GitHub PR Audit)**: Dán URL một PR công khai bất kỳ trên GitHub (`https://github.com/owner/repo/pull/123`) để kéo diff thật về thị trấn và điều phối các trạm Review, QA, DevSecOps chấm điểm trực tiếp.
  3. **Giả lập Kịch bản Tự Trị & Chaos Engineering**: Mô phỏng tức thì các nhánh nghiệp vụ (Feature mới, Bug feedback loop, SAST/CVE OWASP patch, bão tải 10x HPA Auto-scaling).

---

## 👥 2. Đặc tả 8 Autonomous AI Agents & Artifacts

| # | Trạm & Agent | Icon | Tòa nhà 3D (High-Tech Lab) | Tọa độ & Góc xoay | Vai trò & Trách nhiệm | Artifact Đầu Ra |
|---|---|:---:|---|:---:|---|---|
| **0** | **Claude Code** | 🎛️ | AI Command Center (War Room) | `[0, 0.6, 0]`, $0^\circ$ | Orchestrator Hub: Phân tích prompt / GitHub PR, phân rã milestone & điều phối SSE | `MilestonePlan.json` |
| **1** | **PM · BA** | 🏢 | Product Strategy Lab (Tây Bắc) | `[-6.5, 0.6, -6.5]`, $45^\circ$ | Đặc tả PRD, ngữ cảnh PR, tiêu chuẩn nghiệm thu Gherkin Given-When-Then | `PRD.md` / `PR-Context.md` |
| **2** | **Dev Engineer** | 🛠️ | Software Engineering Lab (Chính Tây) | `[-9.2, 0.6, 0]`, $90^\circ$ | Lập trình TypeScript Clean Architecture, đồng bộ & tạo bản vá Unified Git Diff | `source-code.diff` |
| **3** | **Tech Review** | 🔍 | Code Review & Arch Lab (Tây Nam) | `[-6.5, 0.6, 6.5]`, $135^\circ$ | Principal Reviewer: Rà soát diff, boundary check, chấm điểm Approve/Reject | `ReviewComments.json` |
| **4** | **QA · Test** | 🧪 | QA Automation Server Lab (Đông Bắc) | `[6.5, 0.6, -6.5]`, $-45^\circ$ | Sinh bộ Unit & Regression Test tự động (Jest/Vitest) & kiểm thử biên | `test-suite.spec.ts` |
| **5** | **DevSecOps** | 🛡️ | CyberSec & SAST Vault (Chính Đông) | `[9.2, 0.6, 0]`, $-90^\circ$ | Quét SAST, kiểm tra CVE dependencies, phòng chống rò rỉ secret & OWASP Top 10 | `SecurityAudit.json` |
| **6** | **Release Eng** | 🚀 | Container & K8s Hub (Đông Nam) | `[6.5, 0.6, 6.5]`, $-135^\circ$ | Đóng gói Docker multi-stage, cổng duyệt Gatekeeper & HPA Auto-scaler | `Dockerfile` / `ScaleUp.yaml` |
| **7** | **APM Monitor** | 📡 | SRE Radar & NOC Tower (Chính Bắc) | `[0, 0.6, -9.2]`, $0^\circ$ | Watchdog SRE giám sát CPU, Latency P99, TPS Production & cảnh báo bão tải | `ClusterHealth.json` |

---

## 📐 3. Kiến Trúc Hình Học 3D & Mạng Lưới Giao Thông (Road Network)

Hệ thống ứng dụng mô hình **Kiến trúc Đối xứng Hướng tâm (Radial Polar Geometry)** để triệt tiêu 100% lỗi va chạm và đi xuyên tường:

```
                                [North: APM Monitor]
                                         │ (Avenue 7)
                                         ▼
                 [PM · BA] ───►  ╔═══════════════╗  ◄─── [QA · Test]
                (Avenue 1)       ║ Central Plaza ║       (Avenue 4)
                                 ║ Promenade Ring║
      [Dev Engineer] ─────────►  ║    (R = 4.4m) ║  ◄───────── [DevSecOps]
        (Avenue 2)               ║  Command Center ║             (Avenue 5)
                                 ╚═══════════════╝
               [Tech Review] ──►         │         ◄── [Release Eng]
                (Avenue 3)               │ (Avenue 6)   (Avenue 6)
                                         ▼
                                [South Royal Boulevard]
```

1. **Bán kính đồng nhất ($R = 9.2\text{m}$)**: Toàn bộ 7 trạm chuyên môn nằm trên cùng một đường tròn bán kính chuẩn, khoảng cách giữa các trạm liền kề đều tăm tắp ($\approx 4.7\text{m}$ khoảng trống thoáng đãng).
2. **Mặt trước mở 100% hướng về Lâu đài trung tâm**: Mọi căn phòng đều có góc quay $\text{rotY} = \text{atan2}(-x, -z)$. Mặt mở đối diện trực tiếp với lâu đài, còn vách tường sau quay ra biển ngoài rìa đảo.
3. **Mạng lưới 7 đại lộ nan hoa (7 Radial Avenues)**: Mỗi trạm sở hữu một đại lộ lát đá hoa cương trắng ngà (`0xf8fafc`) có gờ đá vỉa hè sẫm màu (`Curbs` `0x64748b`) nối thẳng tắp từ thềm cửa vào Vòng xuyến trung tâm.
4. **Centripetal Catmull-Rom Spline**: Thuật toán dẫn đường với tham số `centripetal` loại bỏ hoàn toàn hiện tượng vồng cong góc nhọn (overshoot), đảm bảo Shipper di chuyển 100% trên tim đường đá.

---

## 🎨 4. Điểm Nhấn Đồ Họa & Trải Nghiệm Người Dùng (Visual & UX)

- 🏢 **Bộ Quy Trình SOP 8 Phòng Ban Thực Chiến & Bảo Vệ Hợp Đồng Đầu Ra (`prompts.ts`)**: Thiết lập Single Source of Truth chuẩn hóa nghiệp vụ doanh nghiệp cho cả 8 phòng ban (INVEST User Stories, PRD 5 phần kèm Gherkin & NFRs, Clean Architecture Diff, Code Review 5 trụ cột khớp dòng `+newStart`, Vitest/Jest đối chiếu chéo PRD + Diff, OWASP Top 10 SAST, Multi-stage non-root Alpine Dockerfile + ArgoCD Canary, và Google SRE 4 Golden Signals & SLO). Cơ chế tách biệt `Role SOP` (tùy biến tự do trên Playground) khỏi `Output Contract` (khóa cố định trên Server) cùng luồng bàn giao liên phòng ban toàn diện (`PipelineContext`) và Live SSE Stream trọn vẹn 8/8 trạm FinOps.
- 🔀 **Mô Hình Thực Thi Song Song DAG Pipeline (`QA` ∥ `DevSecOps`) & FinOps Telemetry**: Sau khâu Tech Review, hệ thống đồng thời phóng 2 Shipper và kích hoạt cả 2 trạm QA Automation và DevSecOps chạy suy luận song song qua `Promise.all`. Thời gian thực thi (`durationMs`), ước tính token và tốc độ (`tok/s`) được đo lường chính xác cho cả 8 trạm và xuất ra bảng FinOps trong `ExportModal`.
- 🎥 **Chế Độ Đạo Diễn Camera 3D Tự Động (`Auto-Follow Director Mode`)**: Bổ sung nút bấm `🎥 Đạo diễn / Tự do` trên Topbar. Camera tự động lia mượt mà bám sát tọa độ 3D của nhân vật Shipper đang chạy trên nan hoa đại lộ hoặc trạm AI đang trực tiếp suy luận; tự động nhường quyền khi người dùng kéo chuột và bám lại khi thả tay.
- 🧪 **AI Agent Playground & Re-run Stage Cô Lập (`ArtifactModal`)**: Cho phép người dùng chỉnh sửa trực tiếp `systemPrompt` của từng Agent ngay trên UI và bấm nút `🔄 Chạy lại trạm này` để sinh lại artifact riêng biệt với ngữ cảnh hiện có mà không phải khởi động lại toàn bộ pipeline.
- 🔍 **Trình Xem Git Diff Nâng Cao, Inline Review Comments & Tải Bundle 8 Artifacts**: Triệt tiêu lỗi nhân đôi dấu `+`/`-`, cuộn ngang Split View 2 cột không bị cắt chữ, tự động hiển thị nhận xét từ `ReviewComments.json` dưới dạng thẻ bình luận inline trực tiếp dưới đúng dòng code; nút `📦 Tải Bundle 8 Artifacts` cho phép tải toàn bộ 8 tài liệu đã tạo về 1 file Markdown duy nhất.
- 📋 **Log Drawer Dark Glassmorphism & Auto-Scale Sparkline**: Giao diện nhật ký công việc Dark Glassmorphism với bộ lọc nhanh (`Tất cả`, `Lỗi & Cảnh báo`, `Lọc theo Trạm`), click dòng log để bay camera tới trạm phát sinh sự kiện, đồ thị Sparkline tự động co dãn trục Y khi bão tải 168ms và hiển thị thời tiết động theo chu kỳ Ngày / Hoàng hôn / Đêm.
- ⏱️ **Lưu Trữ & Khôi Phục Lịch Sử Phiên Chạy (Session History & Persistence)**: Tự động lưu vết tối đa 5 phiên chạy gần nhất vào `localStorage` (`AGENT_TOWN_SESSIONS`), cho phép người dùng mở lại trong `PromptModal` để xem lại mã nguồn, báo cáo QA, và SAST Security của các phiên trước mà không tốn thêm token AI.
- 🛡️ **Cổng Duyệt Production Tương Tác Kèm Góp Ý Kỹ Thuật (Interactive Tech Lead Rejection with Feedback Notes)**: Khi từ chối tại Cổng Phê Duyệt Production, Tech Lead có thể chọn gợi ý nhanh hoặc nhập phản hồi kỹ thuật cụ thể; kỹ sư Dev tự động nhận shipper feedback và dùng real AI stream tạo bản vá hotfix `source-code.diff` xử lý triệt để góp ý.
- 🎬 **Huy Hiệu Tiến Độ Trực Quan & Nút Bật/Tắt Auto-Demo Nhanh Trên Topbar**: Nút `🎬 Demo / ⏸️ Demo On` trên Topbar hỗ trợ trình diễn chu trình DevOps tuần hoàn tự động không tốn token; thanh `RoleChips` gắn huy hiệu `✓` cho các trạm đã xong artifact và viền phát sáng xanh dương nhấp nháy cho trạm đang stream dữ liệu.
- ⌨️ **Chuẩn Hóa Phím Tắt Escape & Click-Outside Cho Toàn Bộ 6 Modals**: Hỗ trợ nhấn phím `Esc` và click ra ngoài backdrop mờ để đóng nhanh tất cả modal (`PromptModal`, `ApprovalModal`, `ArtifactModal`, `AgentDossierModal`, `ExportModal`, `ApiKeyModal`).
- ⚡ **Live AI Token Streaming (SSE) & Nút Dừng Khẩn Cấp (`LiveStreamConsole`)**: Truyền trực tiếp từng cụm token mã nguồn / đặc tả đang sinh từ AI lên màn hình Terminal nổi thời gian thực kèm con trỏ nhấp nháy và nút **`⏹ Dừng`** (`AbortController`).
- 📱 **Tối Ưu Responsive Đa Thiết Bị Toàn Diện (Full-Project Responsive System)**:
  - Tự động co giãn tỷ lệ Orthographic Camera trong `CameraRig.tsx` theo chiều rộng màn hình (`size.width / 1200`), đảm bảo ốc đảo 3D luôn nằm trọn vẹn trong khung nhìn mà không bị cắt lề trên mọi độ phân giải.
  - Tự động tách tầng giao diện giữa thanh `RoleChips` và `StatusBar` trên màn hình tablet/mobile (`< 1024px`), tự động thu gọn danh sách task của `MilestoneWidget` trên màn hình `< 768px`.
  - Toàn bộ 6 Modals (`PromptModal`, `ApprovalModal`, `ArtifactModal`, `AgentDossierModal`, `ExportModal`, `ApiKeyModal`) và trình xem `GitDiffViewer` (hỗ trợ chuyển từ 2 cột sang 1 cột) co giãn mượt mà với chiều cao `100dvh`.
- 🪑 **Tư Thế Ngồi Ghế Công Thái Học & Bầu Trời Ban Ngày Dịu Mắt**:
  - Cân bằng lại độ phơi sáng ACES Filmic ban ngày (`toneMappingExposure: 0.96`), thay nền trắng xám cũ bằng dải gradient bầu trời xanh Azure tươi mát kết hợp thảm cỏ xanh ngọc lục bảo nổi khối.
  - Đưa toàn bộ 8 kỹ sư AI vào **ngồi ngay ngắn trên ghế công thái học** trước bàn làm việc (chân gập trên đệm ghế, hai tay vươn ra gõ bàn phím cơ Tenkeyless LED liên hồi khi trạm ở trạng thái `working`).
- 📦 **Luồng Giao Nhận Kiện Hàng Liền Mạch (Persistent Courier Lifecycle)**:
  - Shipper bước qua bậc thềm cửa kính vào tận bàn làm việc (`handover`) để giao nhận hàng trực tiếp với kỹ sư thay vì dừng ngoài đường.
  - Kiện hàng Artifact được đặt ngay ngắn trên góc bàn làm việc trong suốt thời gian kỹ sư đang xử lý.
  - Nhân vật Shipper (`StandbyCourier`) đứng chờ bàn giao ngay cạnh bàn làm việc, xóa bỏ hoàn toàn hiện tượng Shipper bị biến mất đột ngột sau khi giao hàng.
- 🔗 **Chế Độ Audit GitHub Pull Request Thực Tế**: Nhập trực tiếp URL của bất kỳ Public GitHub PR nào (`https://github.com/owner/repo/pull/123`), tự động kéo metadata và bản vá `.diff` thật lên `GitDiffViewer` để dàn AI Agents kiểm toán Code Quality, Regression Tests và SAST Security.
- 🎮 **Điều Khiển Camera Tự Do Bằng Chuột (Interactive OrbitControls)**: Kéo chuột trái xoay 360° quanh đảo, chuột phải pan di chuyển góc nhìn mượt mà, con lăn chuột zoom vô cấp không giật; đồng bộ hai chiều với thanh trượt zoom của HUD.
- ⚡ **Dải Cáp Quang Dữ Liệu Phát Sáng (Glowing Neon Data Cables)**: 7 đường cáp ngầm phát quang neon chạy dọc theo 7 đại lộ nan hoa với các hạt xung photon (Data Stream Pulse) phóng dọc dây cáp theo trạng thái làm việc của từng trạm.
- 🔍 **Trình Xem Git Diff Chuẩn GitHub (Interactive Git Diff Viewer)**: Đánh số dòng, tô màu cú pháp trực quan (dòng thêm `+` xanh lá, dòng xóa `-` đỏ, chunk `@@` tím) và hỗ trợ chuyển đổi linh hoạt giữa `Unified View` và `Split View` 2 cột.
- 🚨 **Giả Lập Thử Tải Chịu Lỗi (Chaos Engineering & Load Surge 10x)**: Mô phỏng bão request đột biến khiến TPS tăng vọt 2,500, Latency vượt 168ms; APM Watchdog kích hoạt báo động đỏ và DevOps tự động kích hoạt HPA Auto-scaler (`ScaleUp.yaml`) để hạ nhiệt hệ thống về ngưỡng an toàn.
- 📑 **Xuất Báo Cáo Phát Hành Động Kèm Snapshot 3D (Dynamic Executive Release Export)**: Tự động chụp ảnh snapshot 3D từ WebGL Canvas và trích xuất động 100% số liệu thật từ phiên chạy (điểm Review, số kịch bản test `it()`, thống kê `+additions/-deletions`, số lượng CVEs, số vòng Feedback Loops) ra file `.md` / `.png`.
- 🏢 **7 Trạm Chuyên Môn Công Nghệ Cao (High-Tech Autonomous Labs)**: Thiết kế đồng bộ hoàn hảo với AI Command Center: Vách kính cường lực mờ khung nhôm graphite, sàn cleanroom trắng bóng tương phản, bàn nâng công thái học (Smart Standing Desk) viền LED neon phát sáng theo màu accent, đèn ray treo trần thông minh rọi sáng khi làm việc và trang bị đạo cụ độc bản (Triple monitor, Docker containers, Cyber vault, Server racks...).
- 🏢 **Trung Tâm Chỉ Huy AI (AI Command Center / War Room)**: Thay thế lâu đài cổ tích cũ bằng tòa nhà điều hành kính bán nguyệt trong suốt hiện đại, sở hữu **Bàn Hologram 3D lơ lửng phát sáng**, dàn màn hình NOC giám sát cong và ghế xoay thuyền trưởng.
- 🌸 **Tiểu Cảnh Hạt Môi Trường Sống Động (Particles Ambience)**:
  - `Ban ngày & Hoàng hôn`: 45 cánh hoa anh đào Sakura hồng pastel nhẹ nhàng bay lượn theo làn gió.
  - `Ban đêm`: 35 hạt đom đóm vàng ấm lung linh lượn sóng quanh các tán cây và đèn lồng cổ tích.
- ⚡ **Bộ Điều Tốc Pipeline (Speed Controller: 1x ➔ 2x ➔ 4x)**: Chuyển đổi tốc độ di chuyển của Shipper và nhún nhảy của Agent nhanh gấp đôi hoặc gấp 4 lần khi cần trình diễn/demo nhanh.
- 📇 **Hồ Sơ Kỹ Sư AI Chuyên Nghiệp (Agent Dossier Modal)**: Nhấp chuột vào bất kỳ trạm nào để xem Tech Stack chuyên môn (Playwright, Jest, Docker, ArgoCD...), System Prompt Core và nút **Sao chép mã** / **Tải file artifact**.
- 🎉 **Tương Tác 3D Nhảy Ăn Mừng (Jumping Cheer Animation)**: Khi click vào bất kỳ kỹ sư AI nào, nhân vật sẽ nhảy cẫng lên ăn mừng và giơ cao hai tay vẫy chào vui nhộn kèm âm thanh pop.
- 📊 **Telemetry APM Biến Thiên Thời Gian Thực**: Chỉ số CPU (%), P99 Latency (ms), TPS và Sparkline thay đổi trực tiếp theo tải trọng từng giai đoạn (QA test CPU 78%, Canary deploy CPU 59%, ổn định 24%).
- 🌅 **Chu kỳ Chiếu Sáng 3 Chế Độ (Day / Sunset / Night)**:
  - `Ban ngày (☀️)`: Ánh sáng mặt trời tươi sáng, rực rỡ, đổ bóng mềm PCF.
  - `Hoàng hôn (🌅)`: Bầu trời nhuộm cam hồng ấm áp, bóng nắng nghiêng dài nghệ thuật.
  - `Ban đêm (🌙)`: Bầu trời xanh tím huyền bí, **11 cây đèn lồng cổ tích (Fairy Lanterns)** tự động thắp sáng ánh vàng bập bùng lung linh dọc khắp các tuyến đường đá.
- 🔊 **Âm Thanh Tổng Hợp Web Audio API Thuần Client (`sfx.ts`)**:
  - Không tải bất kỳ file MP3 nặng nề nào; toàn bộ âm thanh được tổng hợp thời gian thực bằng Web Audio Oscillator và Noise Buffer:
  - ⌨️ Tiếng gõ phím lách cách khi Dev & PM làm việc.
  - 🔔 Tiếng chuông leng keng ấm áp (Delivery Chime) khi Shipper xuất phát.
  - 🚨 Tiếng còi cảnh báo bug alert khi QA phát hiện lỗi.
  - 🎺 Bản nhạc chiến thắng (Victory Fanfare) khi release Production thành công.
- 📊 **Bảng Widget "Tổng quan Milestone"**: Hiển thị 4 ô số liệu thống kê thời gian thực: `Đang chạy` | `Chờ duyệt` | `Lỗi` | `Hoàn tất`.
- 📋 **Hộp Thoại Nhật Ký Kích Thước Cố Định (Fixed-size Log Drawer)**: Cố định kích thước `420px × 380px` ở góc dưới bên phải, thanh cuộn nội bộ tự động, không bao giờ phình to làm vỡ giao diện.
- 💬 **Bong Bóng Thoại Lọc Thông Minh (Smart Speech Bubble De-clutter)**: Chỉ hiện lời thoại khi agent đang hoạt động tích cực hoặc khi được click chọn; triệt tiêu rối mắt.

### 📸 Bộ Sưu Tập Giao Diện (UI & 3D Showcase)

| 🏰 Toàn cảnh Thị trấn DevOps 3D Diorama | 📑 Xuất Báo Cáo Phát Hành (Executive Report) | 📇 Hồ Sơ Kỹ Sư AI & Tech Stack |
|:---:|:---:|:---:|
| <img src="docs/images/town_diorama.png" alt="Toàn cảnh 3D Thị trấn" width="100%" /> | <img src="docs/images/export_report_modal.png" alt="Xuất Báo Cáo Phát Hành" width="100%" /> | <img src="docs/images/agent_dossier_modal.png" alt="Hồ Sơ Kỹ Sư AI" width="100%" /> |

---

## 📂 5. Cấu Trúc Thư Mục (Project Structure)

```bash
agent-town-3d/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── github-pr/route.ts    # Endpoint kéo metadata & .diff thật từ GitHub REST API
│   │   │   └── pipeline/route.ts     # Endpoint Live SSE Streaming Gemini 3.8 Flash / DeepSeek
│   │   ├── globals.css               # Tailwind CSS & custom scrollbar styles
│   │   ├── layout.tsx                # Metadata & root HTML layout
│   │   └── page.tsx                  # Trang chính lắp ráp Canvas 3D & DOM HUD
│   ├── components/
│   │   ├── scene/
│   │   │   ├── TownScene.tsx         # R3F Canvas, ánh sáng Day/Night, Courier Ticker
│   │   │   ├── Island.tsx            # Đảo bay procedural low-poly với vách đất vát
│   │   │   ├── Castle.tsx            # Trung tâm chỉ huy kính (AI Command Center) & Bàn Hologram 3D
│   │   │   ├── Building.tsx          # 7 phòng làm việc cutaway dollhouse & vật dụng
│   │   │   ├── Character.tsx         # Agent chibi nhún nhảy, cheer jump & Shipper
│   │   │   ├── Path.tsx              # Vòng xuyến đại lộ, 7 đại lộ nan hoa, gờ đá curbs
│   │   │   ├── Lanterns.tsx          # Hệ thống 11 đèn lồng cổ tích vàng ấm
│   │   │   ├── Particles.tsx         # Cánh hoa anh đào Sakura & đom đóm đêm vàng ấm
│   │   │   ├── Tree.tsx              # Cây kẹo mút & cây đám mây bông pastel
│   │   │   ├── DataCables.tsx        # Cáp quang ngầm phát sáng & hạt photon dữ liệu
│   │   │   ├── Labels.tsx            # 3D Tracker chiếu nhãn và bong bóng thoại ra 2D DOM
│   │   │   └── CameraRig.tsx         # Điều khiển Camera Isometric & OrbitControls mượt mà
│   │   └── ui/
│   │       ├── Topbar.tsx            # Thanh điều khiển 1 dòng, theme, speed 1x/2x/4x, nút Dừng AI
│   │       ├── MilestoneWidget.tsx   # Bảng widget tổng quan 4 ô số liệu milestone
│   │       ├── StationInspectorPanel.tsx # Trình thanh tra trạm AI cạnh phải chuẩn Game RTS (Non-blocking)
│   │       ├── ToastContainer.tsx    # Bộ hiển thị thông báo Toast tự động co giãn Cyberpunk
│   │       ├── LiveStreamConsole.tsx # Màn hình Terminal nổi hiển thị Live SSE Token Stream
│   │       ├── LogDrawer.tsx         # Khung nhật ký cố định kích thước 420x380px
│   │       ├── RoleChips.tsx         # Thanh dock 8 trạm ở chân màn hình
│   │       ├── ApprovalModal.tsx     # Cổng duyệt Production Gatekeeper tích hợp GitDiffViewer
│   │       ├── ArtifactModal.tsx     # Bộ thanh tra Artifacts đa tab & system prompt
│   │       ├── AgentDossierModal.tsx # Hồ sơ kỹ sư AI (Tech Stack, Prompt, Tải mã nguồn)
│   │       ├── GitDiffViewer.tsx     # Bộ so sánh mã nguồn Git Diff chuẩn GitHub (Unified / Split)
│   │       ├── ExportModal.tsx       # Modal xuất báo cáo phát hành động kèm Snapshot 3D WebGL
│   │       ├── PromptModal.tsx       # Modal giao việc AI 5 kịch bản (bao gồm GitHub PR Audit)
│   │       ├── ApiKeyModal.tsx       # Modal nhập Google Gemini / DeepSeek API key bảo mật
│   │       ├── DeskCamPiP.tsx        # Cửa sổ CCTV Desk Cam nổi góc màn hình kèm scanlines
│   │       └── StatusBar.tsx         # Thanh APM Telemetry (CPU, Latency, TPS) & Zoom
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── gemini.ts             # Google Gemini 3.8 Flash REST & SSE Stream client
│   │   │   └── deepseek.ts           # DeepSeek Chat REST & SSE Stream client
│   │   ├── audio/
│   │   │   ├── sfx.ts                # Bộ tạo âm thanh tổng hợp Web Audio API
│   │   │   └── voice.ts              # Bộ tổng hợp giọng nói Web Speech API TTS cho 8 AI Agents
│   │   ├── events/
│   │   │   ├── EventSource.ts        # Giao diện nguồn sự kiện pipeline
│   │   │   └── MockSimulator.ts      # Bộ mô phỏng kịch bản SDLC tự động
│   │   ├── pipeline/
│   │   │   ├── prompts.ts            # SOP chuẩn thực chiến 8 phòng ban, Output Contracts & Handoff Context
│   │   │   └── stages.ts             # Định nghĩa schemas, role types, stage order
│   │   └── scene/
│   │       ├── layout.ts             # Tọa độ Radial Polar chuẩn R=9.2m & màu sắc
│   │       └── waypoints.ts          # Centripetal Spline waypoints & interpolation
│   ├── store/
│   │   └── useTownStore.ts           # Central Zustand store quản lý state toàn app
│   └── styles/
│       └── tokens.ts                 # Design tokens & bảng màu hex diorama 3D
├── docs/
│   ├── images/                           # Bộ sưu tập ảnh chụp giao diện & 3D showcase
│   │   ├── town_diorama.png
│   │   ├── export_report_modal.png
│   │   └── agent_dossier_modal.png
│   └── archive/                          # Lưu trữ các kế hoạch nâng cấp & thiết kế lịch sử
├── AGENTS.md                             # Đặc tả chi tiết 8 AI Agents & Multi-Agent Architecture
├── CHANGELOG.md                          # Nhật ký thay đổi & lịch sử các phiên bản phát hành
├── POSTMORTEM_AND_LESSONS_LEARNED.md     # Nhật ký chi tiết các sự cố kỹ thuật & bài học khắc phục
├── README.md                             # Tài liệu tổng quan dự án & hướng dẫn khởi chạy
├── LICENSE                               # Giấy phép mã nguồn mở MIT
├── package.json                          # Next.js 16, R3F, Drei, Zustand, Tailwind dependencies
├── tailwind.config.ts                    # Cấu hình Tailwind CSS
└── tsconfig.json                         # TypeScript path mapping (@/*)
```

---

## 🚀 6. Hướng Dẫn Cài Đặt & Khởi Chạy (Quick Start)

### Yêu cầu tiên quyết:
- **Node.js**: v18.18 trở lên (Khuyến nghị Node.js v20+).
- **Trình duyệt**: Chrome, Edge, Firefox, Safari hỗ trợ WebGL 2.0 và Web Audio API.

### Bước 1: Cài đặt dependencies
```bash
npm install
```

### Bước 2: Chạy môi trường phát triển (Development)
```bash
npm run dev
```
Mở trình duyệt tại **`http://localhost:3000`** để khám phá thị trấn 3D.

### Bước 3: Cấu hình Google Gemini API Key (Tùy chọn)
Để chạy chế độ **Real AI Pipeline**:
1. Nhấp vào nút **`Giao việc AI (Ctrl+K)`** trên thanh Topbar hoặc mở modal API Key.
2. Dán mã API key từ [Google AI Studio](https://aistudio.google.com/). Mã khóa được lưu trữ an toàn trong `localStorage` trình duyệt.

### Bước 4: Build và chạy Production
```bash
npm run build
npm run start
```

---

## 📖 7. Tài Liệu Kỹ Thuật Tham Khảo

- 🤖 [**`AGENTS.md`**](file:///c:/Users/Admin/Documents/CV_Truong%20Dinh%20Anh/Ph%E1%BB%8Fng%20v%E1%BA%A5n/agent-town-3d/AGENTS.md): Đặc tả chi tiết System Prompt, hợp đồng dữ liệu đầu vào / đầu ra và cơ chế phối hợp giữa 8 AI Agents.
- 📜 [**`CHANGELOG.md`**](file:///c:/Users/Admin/Documents/CV_Truong%20Dinh%20Anh/Ph%E1%BB%8Fng%20v%E1%BA%A5n/agent-town-3d/CHANGELOG.md): Nhật ký lưu vết toàn bộ các phiên bản, tính năng mới và các đợt refactor kiến trúc từ v1.0 đến v1.4.
- 🛠️ [**`POSTMORTEM_AND_LESSONS_LEARNED.md`**](file:///c:/Users/Admin/Documents/CV_Truong%20Dinh%20Anh/Ph%E1%BB%8Fng%20v%E1%BA%A5n/agent-town-3d/POSTMORTEM_AND_LESSONS_LEARNED.md): Tài liệu lưu trữ 16 sự cố kỹ thuật tiêu biểu đã từng xuất hiện (lỗi đi xuyên tường, race condition bộ đếm shipper, mở chồng modal, xung dữ liệu cáp quang, ghi đè Output Schema Contract...) kèm nguyên nhân gốc và biện pháp phòng ngừa vĩnh viễn.

---

## 📄 Giấy Phép (License)

Dự án được phân phối dưới giấy phép mã nguồn mở [MIT License](LICENSE).
