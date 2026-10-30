# 🚀 ĐỀ XUẤT 5 TÍNH NĂNG NÂNG CẤP & SỬA LỖI (UPGRADE PROPOSALS)

> **Dự án:** Agent Town 3D  
> **Thời gian tạo:** 2026-10-30  
> **Mục tiêu:** Nâng tầm trải nghiệm tương tác 3D, chiều sâu kỹ thuật DevOps thực chiến và tính trực quan chuyên nghiệp của hệ thống 8 Autonomous AI Agents.

---

## 📋 Danh sách 5 Đề xuất Nâng cấp

### 1. 🎮 Điều khiển Camera Tự do Bằng Chuột (Interactive OrbitControls)
* **Thực trạng:** Camera hiện tại bị khóa góc Isometric, chỉ có thể zoom bằng 2 nút `+` / `−` và chuyển 3 góc nhìn cố định (`default`, `panoramic`, `overview`), hoặc tự xoay đảo đều đều. Người dùng không thể kéo chuột để ngắm nhìn từng ngóc ngách hòn đảo.
* **Giải pháp triển khai:**
  - Tích hợp `@react-three/drei` `OrbitControls` với cơ chế giảm xóc mượt mà (`enableDamping: true`, `dampingFactor: 0.05`).
  - Hỗ trợ thao tác tự nhiên:
    - **Chuột trái:** Xoay tự do 360 độ quanh hòn đảo.
    - **Chuột phải:** Pan (di chuyển) khung nhìn theo mặt phẳng đảo.
    - **Con lăn chuột:** Zoom in/out vô cấp mượt mà.
  - Thiết lập góc giới hạn thông minh (`minPolarAngle: Math.PI / 6`, `maxPolarAngle: Math.PI / 2.3`) để người dùng không bao giờ bị xoay lộn ngược xuống đáy biển.
  - Vẫn giữ nguyên khả năng bay mượt mà (`smooth lerp`) khi bấm các nút Preset hoặc khi click chọn một Agent.

---

### 2. ⚡ Dải Cáp Quang Dữ Liệu Phát Sáng (Glowing Neon Data Cables / Bus)
* **Thực trạng:** 7 nan hoa đại lộ đá đã rõ nét, nhưng thiếu sự liên kết "hạ tầng số" giữa Trung tâm Chỉ huy (Command Center) và 7 trạm chuyên môn.
* **Giải pháp triển khai:**
  - Đặt các rãnh cáp quang công nghệ cao phát sáng LED mỏng chạy ngầm dọc theo tim 7 đại lộ nan hoa.
  - **Hiệu ứng dòng chảy dữ liệu (Data Stream Pulse):**
    - Khi một trạm đang làm việc (`status: 'working'`), một hạt xung ánh sáng (pulse particle) hoặc vệt sáng laser sẽ chạy nhấp nháy từ trạm đó về Trung tâm chỉ huy.
    - Khi Shipper vận chuyển artifact, rãnh cáp quang bên dưới sáng rực rỡ tiếp năng lượng cho Shipper.
  - Tạo cảm giác một cụm Cloud Infrastructure thực thụ đang truyền tải hàng triệu bytes dữ liệu.

---

### 3. 🔍 Bộ So Sánh Git Diff Mã Nguồn Trực Quan (Interactive Git Diff Viewer)
* **Thực trạng:** Mã nguồn Pull Request trong `ArtifactModal` và `AgentDossierModal` hiện chỉ hiển thị dưới dạng văn bản thô (raw text trong thẻ pre) không màu sắc.
* **Giải pháp triển khai:**
  - Xây dựng component `GitDiffViewer.tsx` chuyên dụng:
    - Tô màu cú pháp chuẩn GitHub: Dòng code thêm mới có nền xanh lá mờ với dấu `+`, dòng code bị xóa có nền đỏ mờ với dấu `-`.
    - Đánh số thứ tự dòng code (`Line Numbers`).
    - Nút chuyển đổi chế độ xem: `Unified View` (gộp 1 cột) hoặc `Split View` (2 cột so sánh Before/After).
    - Header hiển thị branch info: `main` $\leftarrow$ `feat/google-oauth-jwt`.

---

### 4. 🚨 Giả Lập Thử Tải & Kịch Bản Sự Cố (Chaos Engineering & Load Surge Simulator)
* **Thực trạng:** Hiện mới chỉ có các kịch bản phát triển thông thường (Happy Path, Token Bug, SAST Scan), thiếu các tình huống thử thách năng lực tự trị của hệ thống DevOps.
* **Giải pháp triển khai:**
  - Bổ sung kịch bản **Chaos Engineering / Traffic Surge (Spike 10x)**:
    1. Kích hoạt sự cố: Bão request ồ ạt đổ vào hệ thống $\to$ TPS tăng vọt lên 2,500, P99 Latency vượt ngưỡng 160ms (báo động đỏ).
    2. Trạm APM Monitor phát còi báo động khẩn cấp: cột radar xoay tít, đèn đỏ chớp nháy, status chuyển `error`.
    3. Trạm DevOps tự động kích hoạt Auto-scaling (HPA - Horizontal Pod Autoscaler) bổ sung node worker.
    4. Shipper DevOps phóng hối hả với kiện hàng `ScaleUp.yaml`.
    5. Hệ thống hạ nhiệt thành công, latency trở về mức an toàn 14ms (Healthy).

---

### 5. 📑 Xuất Báo Cáo Phát Hành (Executive Release Summary & Snapshot Export)
* **Thực trạng:** Sau khi hoàn thành một vòng đời release, toàn bộ số liệu và bằng chứng kiểm thử chỉ hiển thị trên màn hình và sẽ mất khi tải lại trang.
* **Giải pháp triển khai:**
  - Bổ sung nút **"Xuất Báo Cáo (Export Release)"** tại thanh Topbar hoặc sau khi hoàn thành:
    - Tự động chụp lại ảnh snapshot 3D thị trấn ở góc đẹp nhất (`canvas.toDataURL('image/png')`).
    - Biên tập báo cáo tổng quan dạng Markdown / HTML:
      - Tên Task & Mục tiêu phát hành.
      - Thời gian thực thi toàn pipeline.
      - Bảng kiểm thử QA (Số test cases passed, code coverage %).
      - Kết quả quét bảo mật SAST (0 CVEs).
      - Chỉ số APM Telemetry Production.
    - Hỗ trợ tải file báo cáo `.md` hoặc copy nhanh markdown để dán vào Jira / Confluence / Slack.
