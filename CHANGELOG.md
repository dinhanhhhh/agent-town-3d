# 📜 CHANGELOG (NHẬT KÝ THAY ĐỔI & PHIÊN BẢN)

Tất cả các thay đổi đáng chú ý của dự án **Agent Town 3D** sẽ được lưu vết chi tiết tại tài liệu này theo chuẩn [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [v1.3.0] - 2026-10-30
### 🚀 Tính năng & Tối ưu Trải nghiệm (Features & UX Enhancements)
- **Điều Khiển Camera Tự Do Bằng Chuột (`CameraRig.tsx`)**:
  - Tối ưu hóa `OrbitControls`: Cho phép kéo chuột trái xoay 360 độ, chuột phải pan di chuyển góc nhìn mượt mà, con lăn chuột zoom vô cấp không bị giật hay đá ngược lại state của store.
  - Tự động đồng bộ hai chiều mức zoom giữa camera Three.js và Zustand store.
- **Dải Cáp Quang Dữ Liệu Phát Sáng (`DataCables.tsx`)**:
  - Bổ sung 7 đường cáp quang neon chạy ngầm dọc theo tim đường 7 đại lộ nan hoa từ AI Command Center đến 7 trạm.
  - Hạt photon phát sáng (Data Stream Pulse) chạy nhấp nháy dọc theo dây cáp khi trạm đang làm việc.
- **Trình Xem Git Diff Chuẩn GitHub (`GitDiffViewer.tsx`)**:
  - Tích hợp bộ xem diff chuyên nghiệp trong `ArtifactModal` và `AgentDossierModal`.
  - Tô màu trực quan: Dòng thêm mới (+) màu xanh lá, dòng xóa (-) màu đỏ, header chunk (@@) màu tím, đánh số thứ tự dòng.
  - Hỗ trợ chuyển đổi linh hoạt giữa chế độ xem gộp `Unified View` và xem so sánh 2 cột `Split View`.
- **Giả Lập Thử Tải & Kịch Bản Sự Cố (`useTownStore.ts`, `Topbar.tsx`, `PromptModal.tsx`)**:
  - Bổ sung kịch bản Chaos Engineering / Traffic Surge (10x): TPS tăng vọt 2,500, Latency vượt ngưỡng 168ms (báo động đỏ).
  - Trạm APM Watchdog kích hoạt còi báo động khẩn cấp và cảnh báo lỗi.
  - Trạm DevOps tự động kích hoạt HPA Auto-scaler, phóng Shipper mang kiện hàng `ScaleUp.yaml (12 Pods)`.
  - Cụm máy chủ tái cân bằng tải thành công và hạ nhiệt an toàn về 14ms (Healthy).
- **Xuất Báo Cáo Phát Hành Kèm Snapshot 3D (`ExportModal.tsx`)**:
  - Tự động chụp lại ảnh snapshot 3D thị trấn chân thực từ Three.js WebGL Canvas thông qua `preserveDrawingBuffer: true`.
  - Tổng hợp số liệu kiểm thử QA (48/48 passed, coverage 98.4%), an ninh SAST (0 CVEs) và telemetry APM thời gian thực.
  - Hỗ trợ sao chép Markdown vào clipboard hoặc tải file `.md` và file ảnh `.png` chất lượng cao.
- **Cải Tạo 7 Trạm Chuyên Môn Độc Bản (High-Tech Autonomous Labs - `Building.tsx`)**:
  - Đồng bộ hoàn toàn ngôn ngữ thiết kế công nghệ cao với AI Command Center trung tâm.
  - Vách kính mờ cường lực khung nhôm graphite tối giản (Frosted Glass & Dark Aluminum Frame) thay cho tường thô pastel cũ.
  - Sàn phòng thí nghiệm Cleanroom trắng bóng tương phản cao, làm nổi bật bàn nâng công thái học (Smart Standing Desk) viền LED neon phát sáng theo `accentColor`.
  - Hệ thống đèn ray treo trần thông minh (Suspended Modern Luminaire) tự động tăng cường luồng sáng rọi xuống bàn khi agent đang lập trình.
  - Trang bị đạo cụ chuyên môn riêng biệt: Dev (Triple curved monitors, PC tản nhiệt nước RGB), QA (Server rack 3 tầng, ống nghiệm lượng tử), Security (Cyber Vault, tia laser quét an ninh), DevOps (2 thùng Docker container, cụm Kubernetes rack), PM (Digital glass whiteboard, roadmap), Review (Split diff display, thấu kính hologram), Monitor (Tháp radar, màn hình NOC Grafana).
- **Tối Giản Hóa Cấu Trúc Tài Liệu (Clean Docs Architecture)**:
  - Gom các file kế hoạch lịch sử (`UPGRADE_PLAN.md`, `UPGRADE_PLAN_PHASE_2.md`, `PROPOSAL_5_UPGRADES.md`, `SYSTEM_DESIGN.md`) vào thư mục `docs/archive/`.
  - Chuẩn hóa thư mục gốc chỉ giữ lại đúng 4 tài liệu cốt lõi của dự án (`README.md`, `CHANGELOG.md`, `AGENTS.md`, `POSTMORTEM_AND_LESSONS_LEARNED.md`).

---

## [v1.2.1] - 2026-10-30
### ✨ Thay đổi Kiến trúc & Đồ họa (Architecture & Visual)
- **AI Command Center (War Room kính trong suốt)**: Thay thế hoàn toàn Lâu đài phong cách cổ tích trung cổ cũ bằng Tòa nhà điều hành kính công nghệ cao phong cách SpaceX / Apple Park.
- **Bàn Hologram 3D Phát Sáng (Central Holographic Projector)**: Khối lưới wireframe đa diện đại diện cho 8 AI Agents lơ lửng, xoay tròn và nhấp nhô theo nhịp xung năng lượng.
- **Dàn Màn Hình Giám Sát NOC Cong (Wall of Monitors)**: Màn hình cong lớn hiển thị code và live telemetry phát quang xanh/cyan.
- **Ghế Thuyền Trưởng & Vị trí Claude Code**: Claude Code đứng trực tiếp bên trong phòng chỉ huy cạnh bàn Hologram điều phối toàn thị trấn.
- **Đồng bộ Tài liệu**: Cập nhật `README.md`, `AGENTS.md` và `layout.ts`.

---

## [v1.2.0] - 2026-10-30 (Phase 2 Upgrade)
### 🚀 Tính năng Mới (Added)
- **Tiểu Cảnh Hạt Môi Trường Sống Động (`Particles.tsx`)**:
  - Ban ngày & Hoàng hôn: 45 cánh hoa anh đào Sakura hồng pastel bay là đà trong gió.
  - Ban đêm: 35 hạt đom đóm vàng ấm lung linh lượn sóng quanh tán cây và đèn lồng (InstancedMesh nhẹ 60fps).
- **Bộ Điều Tốc Pipeline (`simSpeed`)**: Nút `⚡ 1x` / `2x` / `4x` trên thanh Topbar giúp tăng tốc di chuyển của Shipper và nhún nhảy của Agent.
- **Hồ Sơ Kỹ Sư AI (`AgentDossierModal.tsx`)**: Nhấp vào bất kỳ trạm nào để xem Tech Stack chuyên môn, System Prompt Core và nút **Sao chép mã** / **Tải file artifact**.
- **Tương Tác Nhảy Ăn Mừng (Jumping Cheer)**: Click vào Agent bất kỳ để nhân vật nhảy cẫng lên và vẫy tay chào vui nhộn kèm âm thanh pop.
- **Telemetry APM Biến Thiên Thời Gian Thực**: Chỉ số CPU (%), P99 Latency (ms), TPS trên thanh chân trang thay đổi chân thực theo từng stage (QA chạy test CPU vọt lên 78%, Canary deploy CPU 59%, ổn định 24%).

---

## [v1.1.0] - 2026-10-30
### 🐛 Sửa lỗi Triệt Để (Bug Fixes)
- **Triệt tiêu lỗi Shipper đi xuyên tường**:
  - Chuẩn hóa toàn bộ thị trấn theo **Kiến trúc Đối xứng Hướng tâm (Radial Polar Layout $R = 9.2\text{m}$)**. Cả 7 trạm có cùng bán kính và cửa mở quay trực diện 100% về tâm đảo.
  - Chuyển điểm đỗ xe của Shipper ra ngoài thềm đá ($R_{\text{door}} = 6.7\text{m}$).
  - Sử dụng **Centripetal Catmull-Rom Spline** triệt tiêu 100% hiện tượng vồng cong góc nhọn (overshoot).
- **Trực quan hóa Tuyến Đường Đá (`Path.tsx`)**:
  - Nâng cấp mặt đường đá sáng tương phản cao (`0xf8fafc`).
  - Bổ sung **gờ đá vỉa hè 3D sẫm màu (Curbs - `0x64748b`)** bao quanh Vòng xuyến trung tâm và 7 nan hoa đại lộ.
  - Thêm bục đá chào đón (`Welcome Pad`) và các phiến đá cuội hoa văn (`Flagstones`).
- **Cố định Khung Nhật Ký (`LogDrawer.tsx`)**: Cố định kích thước `420px × 380px` chống phình to làm vỡ giao diện.
- **Topbar 1 Dòng Cố Định (`Topbar.tsx`)**: Không bị wrap xuống dòng khi có nhiều nút bấm.
- **Smart Speech Bubble De-clutter**: Chỉ hiện bong bóng thoại khi Agent đang làm việc hoặc được chọn.

---

## [v1.0.1] - 2026-10-30
### 🌟 Nâng cấp Trải Nghiệm (Enhancements)
- **Chu kỳ Chiếu Sáng 3 Chế Độ**: Hỗ trợ chuyển đổi Ngày (`☀️`), Hoàng hôn (`🌆`), và Đêm (`🌙`).
- **Hệ thống 11 Đèn Lồng Cổ Tích (`Lanterns.tsx`)**: Tự động bật sáng ánh vàng ấm khi chuyển sang hoàng hôn/đêm.
- **Âm Thanh Tổng Hợp Web Audio API Thuần Client (`sfx.ts`)**: Tiếng gõ phím, chuông giao hàng, còi báo lỗi bug alert, nhạc victory fanfare không phụ thuộc file MP3.
- **Bảng Widget "Tổng quan Milestone"**: Hiển thị 4 ô số liệu thời gian thực: Đang chạy, Chờ duyệt, Lỗi, Hoàn tất.

---

## [v1.0.0] - 2026-10-30
### 🎉 Khởi tạo Dự Án (Initial Release)
- Khởi tạo dashboard mô phỏng 8 Autonomous AI Agents với Next.js 16, React 19 và React Three Fiber v9.
- Thiết lập mô hình Orchestrator Hub & Spoke với 7 trạm SDLC chuyên môn.
- Tích hợp Google Gemini 2.5 API qua endpoint `/api/pipeline`.
- Cơ chế Cổng duyệt Production Gatekeeper (Human-in-the-loop).
- Khởi tạo tài liệu kiến trúc đa đặc vụ [`AGENTS.md`](file:///c:/Users/Admin/Documents/CV_Truong%20Dinh%20Anh/Ph%E1%BB%8Fng%20v%E1%BA%A5n/agent-town-3d/AGENTS.md).
