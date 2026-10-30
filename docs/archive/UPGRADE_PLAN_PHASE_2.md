# 🚀 Kế hoạch Nâng cấp Toàn diện (Phase 2): Agent Town 3D

> **Mục tiêu:** Nâng tầm tính trực quan, tính tương tác và chiều sâu kỹ thuật cho hệ thống DevOps 3D thông qua: Điều khiển bước pipeline (Step-by-Step Playback), Hiệu ứng tiểu cảnh sống động (Sakura Petals & Fireflies), Hồ sơ kỹ sư AI tương tác (Interactive Agent Dossier), và Dữ liệu APM Telemetry thời gian thực.

---

## 📋 Danh mục 4 Tính năng Nâng cấp Trọng tâm (Phase 2 Features)

### 1. ⏯️ Bộ Điều Khiển Tiến Trình Pipeline (Step-by-Step & Playback Controller)
- **Vấn đề giải quyết:** Hiện tại khi chạy pipeline hoặc mock simulator, pipeline chạy liên tục hoặc người dùng khó dừng lại ở từng trạm để thuyết trình/giải thích sản phẩm.
- **Tính năng mới:**
  - **Nút Bước kế tiếp (Step Forward ⏭️):** Cho phép dừng pipeline ở trạng thái Pause và bấm nút từng bước một để quan sát kỹ lưỡng: Agent gõ phím $\to$ sinh artifact $\to$ Shipper xuất phát $\to$ trạm tiếp theo nhận hàng.
  - **Điều tốc linh hoạt (Speed Multiplier ⚡):** Chuyển đổi mượt mà giữa các tốc độ `1x` (chuẩn quan sát), `2x` (nhanh), `4x` (tốc độ cao) tác động trực tiếp lên tốc độ di chuyển của Shipper và chu kỳ gõ phím của kỹ sư.
  - **Thanh trạng thái tiến độ Pipeline Mini:** Hiển thị trực quan 7 nốt bước trên Topbar giúp người dùng nhận biết ngay lập tức pipeline đang ở khâu nào.

---

### 2. 🌸 Hiệu ứng Tiểu cảnh Môi trường Sống động (Dynamic Diorama Particles: Sakura & Fireflies)
- **Vấn đề giải quyết:** Hòn đảo hiện tại đẹp nhưng còn tĩnh; cần các hiệu ứng vi hạt (particle system) nhẹ nhàng để tạo chất thơ mộng của dòng game Animal Crossing & Studio Ghibli.
- **Tính năng mới (`src/components/scene/Particles.tsx`):**
  - **Ban ngày & Hoàng hôn (🌸 Sakura Breeze):** 40 cánh hoa anh đào màu hồng phấn nhẹ nhàng bay lượn và xoay vòng theo làn gió trên nền đảo.
  - **Ban đêm (✨ Golden Fireflies):** 35 đom đóm hạt vàng lơ lửng bập bùng xung quanh các tán cây và đèn lồng cổ tích.
  - Tối ưu hóa hiệu năng bằng `THREE.InstancedMesh` hoặc `BufferGeometry` điểm nhẹ (Zero drop FPS).

---

### 3. 📊 Hệ thống Telemetry APM Biến thiên Thời gian thực (Dynamic Metrics Stream)
- **Vấn đề giải quyết:** Chỉ số APM Telemetry ở thanh chân trang hiện tại đang giữ số liệu cố định hoặc chỉ đổi ở cuối chặng.
- **Tính năng mới:**
  - **Telemetry phản ánh tải thực tế theo từng stage:**
    - Giai đoạn **QA Automation Test**: CPU tăng vọt lên 78%, TPS đạt 120, Latency biến thiên 18-24ms.
    - Giai đoạn **DevSecOps SAST Scan**: CPU duy trì 64%, Memory tăng nhẹ.
    - Giai đoạn **Release Eng Deployment**: Tải I/O tăng, mạng nhấp nháy.
    - Giai đoạn **APM Monitoring (Production Healthy)**: Trở về trạng thái lý tưởng (CPU 24%, Latency 14ms, TPS 380).
  - Biểu đồ **Sparkline P99 Latency SVG động** nhấp nhô mượt mà theo từng giây.

---

### 4. 📇 Hồ Sơ Kỹ Sư AI Tương Tác & Tương Tác Nhân Vật (Agent Dossier & Interactive 3D Cheer)
- **Vấn đề giải quyết:** Người dùng muốn tìm hiểu sâu về vai trò, bộ công cụ (Tech Stack) và mã nguồn mà từng AI Agent tạo ra.
- **Tính năng mới:**
  - Khi nhấp chuột vào bất kỳ trạm nào hoặc bấm vào thanh Dock:
    - Mở Drawer/Modal **Dossier Kỹ sư AI**:
      - Avatar Chibi 3D & Chức danh chi tiết.
      - **Bộ công nghệ phụ trách (Tech Stack):** Ví dụ QA phụ trách *Playwright, Jest, Vitest, K6*; DevOps phụ trách *Docker, Kubernetes, ArgoCD, GitHub Actions*.
      - **System Prompt Core:** Xem prompt chỉ đạo của trạm.
      - **Artifacts mới nhất:** Xem và Copy nhanh mã nguồn patch diff, file Dockerfile, tài liệu PRD.
    - Nhân vật kỹ sư tại trạm thực hiện animation nhún nhảy ăn mừng (**Jumping Cheer**) kèm âm thanh vui nhộn.

---

## 🛠️ Lộ trình Thực Hiện & Kiểm Thử (Execution Steps)

1. **Bước 1 - State & Store Upgrade (`src/store/useTownStore.ts`):**
   - Thêm `playbackSpeed: 1 | 2 | 4`.
   - Thêm hàm `stepNext()` cho phép điều hướng thủ công từng bước trong pipeline.
   - Thêm cập nhật metrics telemetry biến thiên theo từng stage.
2. **Bước 2 - Particle Ambience System (`src/components/scene/Particles.tsx`):**
   - Xây dựng component hạt cánh hoa anh đào và đom đóm đêm.
   - Tích hợp vào `TownScene.tsx`.
3. **Bước 3 - Nâng cấp Thanh Điều Khiển (`Topbar.tsx` & `StatusBar.tsx`):**
   - Thêm nút chuyển tốc độ `1x` $\to$ `2x` $\to$ `4x`.
   - Thêm nút Step Next `⏭️ Bước`.
   - Vẽ lại sparkline telemetry động thời gian thực.
4. **Bước 4 - Modal Hồ Sơ Agent Dossier (`src/components/ui/AgentDossierModal.tsx`):**
   - Tạo giao diện xem hồ sơ chuyên môn, tech stack và tải artifact của từng trạm.
5. **Bước 5 - Build & Verify:**
   - Chạy `npm run build` đảm bảo 100% Type-safe.
   - Khởi chạy server và kiểm thử tất cả các tính năng mới trên trình duyệt.
