# 🚀 Kế hoạch Nâng cấp Toàn diện: Agent Town 3D (Thị trấn DevOps Tự trị)

> **Mục tiêu:** Nâng tầm trải nghiệm thẩm mỹ, tương tác 3D và tính năng thực chiến theo chuẩn thiết kế diorama ấm cúng (Cozy Pastel Aesthetic tương tự *Thị trấn Solomi*), kết hợp sâu với luồng AI DevOps tự trị.

---

## 📋 Danh mục Tính năng Nâng cấp

### 1. 🌓 Hệ thống Chu kỳ Ngày / Chiều / Đêm (Day - Sunset - Night Theme)
- **State Store:** Thêm trạng thái `themeMode: 'day' | 'sunset' | 'night'`.
- **Ánh sáng 3D:**
  - `day`: Bầu trời kem ấm `#f8fafc`, nắng rực rỡ vàng ấm `#fff7ed`, bóng mềm.
  - `sunset`: Bầu trời cam hồng hoàng hôn `#fce7f3`, nắng mật ong `#fed7aa`.
  - `night`: Bầu trời tím than huyền ảo `#1e1b4b`, ánh trăng xanh bạc `#93c5fd`.
- **Hệ thống Đèn lồng đường đá (Street Lanterns):** Đặt dọc các tuyến đường đá và trước cửa phòng; tự động bật ánh sáng vàng ấm (`emissive` + `pointLight`) khi trời tối.
- **Màn hình & Tinh thể:** Phát sáng rực rỡ nổi bật trong màn đêm diorama.

---

### 2. 🎛️ Bộ Điều khiển Tiện ích Topbar (Toolbar Quick Toggles)
- Nút chuyển `[☀️ Ngày | 🌆 Chiều | 🌙 Đêm]`.
- Nút `[🔄 Dừng/Xoay]` điều khiển chế độ tự động quay camera toàn cảnh.
- Nút `[🏷️ Tên]` bật/tắt nhãn tên trạm (hỗ trợ chế độ chụp ảnh/quay video cinematic).
- Nút `[💬 Bong bóng]` ẩn/hiện bong bóng thoại trên đầu nhân vật.
- Nút `[🔔 Âm thanh]` bật/tắt âm thanh hiệu ứng (SFX).

---

### 3. 🔊 Bộ Âm thanh Tương tác Thuần (Web Audio API Synthesizer)
- Sử dụng trực tiếp `AudioContext` của trình duyệt (Zero external MP3 asset dependency - không lo lỗi load file âm thanh):
  - **Tiếng gõ phím nhẹ (Typing Clatter):** Khi Dev / QA đang làm việc.
  - **Tiếng chuông ngân dễ thương (Delivery Ding):** Khi Shipper giao gói hàng đến cửa phòng.
  - **Tiếng còi cảnh báo trầm (Bug/Feedback Alert):** Khi phát hiện lỗi hoặc PR bị từ chối.
  - **Âm thanh chiến thắng (Victory Fanfare):** Khi release Production thành công.

---

### 4. 📜 Ngăn kéo "Nhật ký việc thời gian thực" (Live Activity Timeline Drawer)
- Mô phỏng chính xác bảng nhật ký góc dưới trong ảnh mẫu Solomi:
  - Nút mở góc trái: `📋 Nhật ký việc`.
  - Bảng trượt dạng giấy da bento cao cấp với bảng phân cột:
    - `THỜI GIAN`: Giờ phút thực tế.
    - `AGENT`: Tên và màu nhận diện đặc trưng của Agent.
    - `VIỆC (NHẬT KÝ THẬT)`: Tóm tắt hành động chi tiết.
    - `TRẠNG THÁI`: Pill badge (Đã duyệt, Đang chạy, Thành công, Lỗi).

---

### 5. 🔍 Chế độ Soi Cận cảnh Phòng (Dollhouse Inspection Camera Zoom)
- Khi click chọn bất kỳ phòng nào trên 3D hoặc thanh Dock:
  - Camera lướt mượt mà (`smooth lerp`) lại gần ở góc 45° ngay trước cửa phòng.
  - Tự động tăng mức phóng to (Zoom: 45) để nhìn rõ bên trong: nhân vật gõ phím, màn hình máy tính, cây xanh.
  - Click ra ngoài để zoom-out lại toàn cảnh thị trấn (Zoom: 30).

---

### 6. 🎯 Kịch bản Phát triển Đa dạng (Scenario Presets trong Modal)
- Nâng cấp modal `Ctrl + K`:
  - 🟢 **Tính năng mới (Happy Path):** Google OAuth 2.0 & JWT (Chạy thông suốt 7 trạm).
  - 🔴 **Vá lỗi Token & Feedback Loop:** QA bắt lỗi token hết hạn $\to$ Shipper chạy ngược về Dev sửa lỗi.
  - 🛡️ **Kiểm thử Bảo mật OWASP:** Rà soát Injection & sanitize input trước khi deploy.

---

## 🛠️ Kế hoạch Triển khai & Kiểm tra
1. Cập nhật `src/store/useTownStore.ts` (State, Scenarios, SFX trigger).
2. Tạo module âm thanh `src/lib/audio/sfx.ts` (Web Audio API).
3. Cập nhật ánh sáng `TownScene.tsx` & thêm component `src/components/scene/Lanterns.tsx`.
4. Cập nhật `CameraRig.tsx` và `Labels.tsx` hỗ trợ zoom và toggle nhãn/bong bóng.
5. Tạo `src/components/ui/LogDrawer.tsx` và cập nhật `Topbar.tsx`, `PromptModal.tsx`.
6. Chạy `npm run build` verify 0 lỗi compile TypeScript, kiểm tra toàn bộ luồng.
