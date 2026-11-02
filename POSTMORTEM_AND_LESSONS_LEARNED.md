# 🛠️ POST-MORTEM & LESSONS LEARNED (NHẬT KÝ SỰ CỐ & BÀI HỌC KINH NGHIỆM)

> **Dự án:** Agent Town 3D  
> **Mục đích:** Tài liệu này ghi chép lại toàn bộ các sự cố kỹ thuật, lỗi hiển thị, lỗi không gian 3D và lỗi logic luồng đã từng xuất hiện trong quá trình phát triển hệ thống Agent Town 3D, kèm theo nguyên nhân gốc rễ (Root Cause) và giải pháp chuẩn hóa để phòng tránh tái diễn trong tương lai.

---

## 📑 Mục lục Sự cố
1. [Sự cố 1: Nhân vật Shipper đi xuyên tường và đồ nội thất các phòng ban](#1-sự-cố-1-nhân-vật-shipper-đi-xuyên-tường-và-đồ-nội-thất-các-phòng-ban)
2. [Sự cố 2: Tuyến đường mờ căm, không rõ ràng trên đảo 3D](#2-sự-cố-2-tuyến-đường-mờ-căm-không-rõ-ràng-trên-đảo-3d)
3. [Sự cố 3: Khung Nhật Ký (Log Drawer) bị phình to theo dữ liệu đẩy vỡ giao diện](#3-sự-cố-3-khung-nhật-ký-log-drawer-bị-phình-to-theo-dữ-liệu-đẩy-vỡ-giao-diện)
4. [Sự cố 4: Thanh Topbar bị ngắt dòng (wrap) đè lên Widget Tổng quan bên trái](#4-sự-cố-4-thanh-topbar-bị-ngắt-dòng-wrap-đè-lên-widget-tổng-quan-bên-trái)
5. [Sự cố 5: Quá nhiều bong bóng thoại (Speech Bubbles) gây rối mắt Diorama](#5-sự-cố-5-quá-nhiều-bong-bóng-thoại-speech-bubbles-gây-rối-mắt-diorama)
6. [Sự cố 6: Shipper bị đứng khựng giữa đường khi Pipeline chuyển trạng thái](#6-sự-cố-6-shipper-bị-đứng-khựng-giữa-đường-khi-pipeline-chuyển-trạng-thái)
7. [Sự cố 7: Lỗi Compile TypeScript (Type Overlap & Duplicate Key)](#7-sự-cố-7-lỗi-compile-typescript-type-overlap--duplicate-key)
8. [Sự cố 8: Kiểu dữ liệu màu 3D (Number) gán trực tiếp vào Style CSS (String)](#8-sự-cố-8-kiểu-dữ-liệu-màu-3d-number-gán-trực-tiếp-vào-style-css-string)
9. [Sự cố 9: Không khớp kiểu EventSeverity và Tên Method trong Audio Synthesizer](#9-sự-cố-9-không-khớp-kiểu-eventseverity-và-tên-method-trong-audio-synthesizer)
10. [Sự cố 10: Xung đột Double Courier Ticker làm treo cứng Pipeline tự động (Race Condition)](#10-sự-cố-10-xung-đột-double-courier-ticker-làm-treo-cứng-pipeline-tự-động-race-condition)
11. [Sự cố 11: Mở chồng 2 Modal cùng lúc và rò rỉ nhãn 3D phía sau Backdrop](#11-sự-cố-11-mở-chồng-2-modal-cùng-lúc-và-rò-rỉ-nhãn-3d-phía-sau-backdrop)
12. [Sự cố 12: Hạt xung dữ liệu (Photon Pulse) trên cáp quang đứng yên tại điểm giữa](#12-sự-cố-12-hạt-xung-dữ-liệu-photon-pulse-trên-cáp-quang-đứng-yên-tại-điểm-giữa)
13. [Sự cố 13: Nền ban ngày trắng xóa làm nhạt ốc đảo & Nhân vật đứng ngoài thảm cửa thay vì ngồi ghế làm việc](#13-sự-cố-13-nền-ban-ngày-trắng-xóa-làm-nhạt-ốc-đảo--nhân-vật-đứng-ngoài-thảm-cửa-thay-vì-ngồi-ghế-làm-việc)
14. [Sự cố 14: Lệch nhịp giữa Shipper và AI Stream; Tái cấp phát Spline liên tục 60fps; Vòng lặp phản hồi thiếu AI tự sửa thật](#14-sự-cố-14-lệch-nhịp-giữa-shipper-và-ai-stream-tái-cấp-phát-spline-liên-tục-60fps-vòng-lặp-phản-hồi-thiếu-ai-tự-sửa-thật)
15. [Sự cố 15: Trùng lặp ký hiệu Git Diff (+/+); Tràn chữ Split View; Thiếu thực thi song song DAG (QA ∥ DevSecOps) & Thiếu Playground Prompt](#15-sự-cố-15-trùng-lặp-ký-hiệu-git-diff--tràn-chữ-split-view-thiếu-thực-thi-song-song-dag-qa--devsecops--thiếu-playground-prompt)
16. [Sự cố 16: Client `customSystemPrompt` ghi đè làm mất Output Schema Contract của Server; Đứt gãy ngữ cảnh bàn giao liên phòng ban & Trạm Monitor thiếu Live SSE Stream](#16-sự-cố-16-client-customsystemprompt-ghi-đè-làm-mất-output-schema-contract-của-server-đứt-gãy-ngữ-cảnh-bàn-giao-liên-phòng-ban--trạm-monitor-thiếu-live-sse-stream)
17. [Sự cố 17: Thu hẹp kiểu dữ liệu biến trong Closure bất đồng bộ (TypeScript Control Flow Narrowing `never` trên biến cục bộ tái gán trong Closure)](#17-sự-cố-17-thu-hẹp-kiểu-dữ-liệu-biến-trong-closure-bất-đồng-bộ-typescript-control-flow-narrowing-never-trên-biến-cục-bộ-tái-gán-trong-closure)
18. [Sự cố 18: Nút Rollback làm treo Approval Queue; Bỏ sót kiểm tra lỗi API tại DAG song song; Xung đột text stream trên Live Console & Che giấu lỗi DOM](#18-sự-cố-18-nút-rollback-làm-treo-approval-queue-bỏ-sót-kiểm-tra-lỗi-api-tại-dag-song-song-xung-đột-text-stream-trên-live-console--che-giấu-lỗi-dom)
19. [Sự cố 19: Thông báo hiển thị thiếu responsive và thẩm mỹ kém; Góc phải hiển thị tĩnh "Nắng nhẹ" không phản ánh chu kỳ đêm thời gian thực](#19-sự-cố-19-thông-báo-hiển-thị-thiếu-responsive-và-thẩm-mỹ-kém-góc-phải-hiển-thị-tĩnh-nắng-nhẹ-không-phản-ánh-chu-kỳ-đêm-thời-gian-thực)
20. [Sự cố 20: Lỗi bố cục Cổng Phê Duyệt Production (Tab bị cắt cụt ở cạnh phải & Thẻ trạm Reviewer chiếm trọn màn hình đè mất các trạm còn lại)](#20-sự-cố-20-lỗi-bố-cục-cổng-phê-duyệt-production-tab-bị-cắt-cụt-ở-cạnh-phải--thẻ-trạm-reviewer-chiếm-trọn-màn-hình-đè-mất-các-trạm-còn-lại)
21. [Sự cố 21: Nhấp chọn trạm AI bị pop-up Modal toàn màn hình che mất không gian 3D; Camera focus nhưng người dùng không thấy được trạm và nhân vật đang làm việc](#21-sự-cố-21-nhấp-chọn-trạm-ai-bị-pop-up-modal-toàn-màn-hình-che-mất-không-gian-3d-camera-focus-nhưng-người-dùng-không-thấy-được-trạm-và-nhân-vật-đang-làm-việc)
22. [Sự cố 22: Nhấp chọn nhân vật/trạm bị crash giao diện (Minified React error #310) do vi phạm React Rules of Hooks](#22-sự-cố-22-nhấp-chọn-nhân-vậttrạm-bị-crash-giao-diện-minified-react-error-310--this-page-couldnt-load-do-vi-phạm-react-rules-of-hooks)
23. [Sự cố 23: Vỡ bố cục khi xem trên điện thoại di động (Oppo A55 360×800 / iPhone 16 Pro Max 430×932) & khi thu nhỏ cửa sổ](#23-sự-cố-23-vỡ-bố-cục-khi-xem-trên-điện-thoại-di-động-oppo-a55-360800--iphone-16-pro-max-430932--khi-thu-nhỏ-cửa-sổ)
24. [Sự cố 24: Rò rỉ Google Gemini API Key lên GitHub công khai qua file script test tạm thời (`scripts/test_models.js`)](#24-sự-cố-24-rò-rỉ-google-gemini-api-key-lên-github-công-khai-qua-file-script-test-tạm-thời-scriptstest_modelsjs)
25. [Sự cố 25: Bong bóng thoại 3D đè nát nhãn trạm (Double-Header Collision); Icon Dev Next.js che nút Hub; Lệch số thứ tự Dock/Phím tắt (0 vs 1) và Cáp quang neon chìm dưới lòng đường (Z-Fighting)](#25-sự-cố-25-bong-bóng-thoại-3d-đè-nát-nhãn-trạm-double-header-collision-icon-dev-nextjs-che-nút-hub-lệch-số-thứ-tự-dockphím-tắt-0-vs-1-và-cáp-quang-neon-chìm-dưới-lòng-đường-z-fighting)
26. [Sự cố 26: Rung lắc nhãn 3D do CSS Transition xung đột 60fps; Crash React Error #31 (render Object Compliance) & Va chạm đè hàng thanh Dock với StatusBar](#26-sự-cố-26-rung-lắc-nhãn-3d-do-css-transition-xung-đột-60fps-crash-react-error-31-render-object-compliance--va-chạm-đè-hàng-thanh-dock-với-statusbar)

---

## 1. Sự cố 1: Nhân vật Shipper đi xuyên tường và đồ nội thất các phòng ban

### 🔴 Triệu chứng (Symptom)
- Khi mô phỏng pipeline hoặc chạy AI thật, nhân vật vận chuyển (Shipper) khi di chuyển giữa các trạm bị cắt ngang vách tường sau, đâm xuyên qua vách tường bên hông của các phòng lân cận, hoặc đi xuyên qua bàn làm việc và ghế xoay.

### 🔍 Nguyên nhân gốc rễ (Root Cause)
1. **Bố cục mặt bằng bất đối xứng, phòng bị lệch góc (Irregular Layout):**
   - Trong cấu hình cũ, 7 phòng ban có bán kính không đồng đều (trạm thì $R = 8.5\text{m}$, trạm thì $R = 9.92\text{m}$).
   - Góc xoay của các phòng bị gán tùy tiện (Dev xoay $22.5^\circ$, Review xoay $-30^\circ$, DevOps xoay $30^\circ$). Hậu quả là cửa mở không hướng về trung tâm, khiến sườn tường nhọn của phòng chĩa thẳng ra lối đi.
2. **Tọa độ Waypoint bị hardcode lọt vào lòng phòng:**
   - Điểm nhận/trả hàng cũ được đặt ở khoảng cách $1.3\text{m} - 1.4\text{m}$ tính từ tâm phòng. Đây là vị trí nằm ngay trong cụm bàn ghế làm việc và gần sát vách tường.
3. **Hiện tượng vồng góc của đường cong Spline (Spline Overshoot):**
   - Thuật toán `CatmullRomCurve3` mặc định khi uốn qua các góc cua gấp (như từ cửa phòng rẽ vuông góc ra đường) sẽ tự động tạo một vòng cung phình rộng ra ngoài (overshoot), cắt ngang qua vách tường phòng bên cạnh.

### ✅ Giải pháp chuẩn hóa (Solution & Prevention)
- **Chuẩn hóa Kiến trúc Đối xứng Hướng tâm (Radial Polar Layout - Bán kính $R = 9.2\text{m}$):**
  - Tất cả 7 trạm chuyên môn được đặt trên cùng một đường tròn bán kính cố định $R = 9.2\text{m}$.
  - Góc xoay của mọi phòng được tính toán toán học chuẩn: $\text{rotY} = \text{atan2}(-x, -z)$. Nhờ đó, **mặt trước mở của 100% các phòng đều quay trực diện vào Lâu đài Claude Code ở tâm**, còn vách tường sau quay ra biển ngoài rìa đảo.
- **Điểm đỗ xe ngoài thềm cửa (`door` waypoint):**
  - Đặt điểm đỗ của Shipper ở khoảng cách $2.5\text{m}$ về phía trước cửa mở ($R_{\text{door}} = 6.7\text{m}$). Shipper đứng hoàn toàn trên bục đá bên ngoài phòng, không bao giờ bước vào trong nội thất.
- **Mạng lưới 7 đại lộ nan hoa thẳng tắp:**
  - Tuyến đường di chuyển luôn tuân theo: `Thềm trạm gửi` $\to$ `Đại lộ nhánh` $\to$ `Vòng xuyến trung tâm (R = 4.4m)` $\to$ `Đại lộ nhánh đích` $\to$ `Thềm trạm nhận`.
- **Triệt tiêu Overshoot bằng Centripetal Spline:**
  - Chuyển `new THREE.CatmullRomCurve3(waypoints, false, 'centripetal')`. Thuật toán Centripetal đảm bảo đường cong ôm sát tim đường, không bao giờ tự tạo loop hay vồng ra khỏi mặt đường đá.

---

## 2. Sự cố 2: Tuyến đường mờ căm, không rõ ràng trên đảo 3D

### 🔴 Triệu chứng (Symptom)
- Người dùng không nhìn thấy con đường đi lại giữa các trạm; nhìn từ camera góc cao trông như các ngôi nhà và nhân vật nổi trôi lơ lửng trên bãi cỏ phẳng nhợt nhạt.

### 🔍 Nguyên nhân gốc rễ (Root Cause)
- Mặt đường cũ chỉ là một tấm `planeGeometry` / `ringGeometry` cực mỏng ($y = 0.01$) với màu kem nhạt (`0xf5ebd6`). Màu này gần như bị ánh sáng directional light rửa trôi (washed out) và tiệp màu với nền cỏ pastel.
- Không có gờ đá vỉa hè (Curbs) để mắt người dùng nhận diện ranh giới giữa đường và cỏ.

### ✅ Giải pháp chuẩn hóa (Solution & Prevention)
- Nâng độ dày mặt đường lên $0.04\text{m}$ ($y = 0.022\text{m}$) có `receiveShadow`.
- Dùng màu đá hoa cương sáng tương phản rõ nét (`0xf8fafc`).
- Thêm **gờ đá vỉa hè 3D sẫm màu (Curbs - `0x64748b`)** dày $0.06\text{m}$ chạy viền bao quanh Vòng xuyến trung tâm và hai bên mép của cả 7 đại lộ nan hoa.
- Thêm **bục đá chào đón (Welcome Landing Pad - `0xfef08a`)** tại thềm cửa từng phòng và rải các phiến đá cuội điểm xuyết (`Flagstones`) dọc đường đi.

---

## 3. Sự cố 3: Khung Nhật Ký (Log Drawer) bị phình to theo dữ liệu đẩy vỡ giao diện

### 🔴 Triệu chứng (Symptom)
- Khi chạy pipeline qua nhiều giai đoạn hoặc có nhiều sự kiện log, hộp thoại Nhật ký (Log Drawer) tự động giãn dài theo chiều dọc, đè lên các nút điều khiển và che mất nửa dưới màn hình 3D.

### 🔍 Nguyên nhân gốc rễ (Root Cause)
- Thẻ container dùng `max-h-[...]` động kết hợp với flex-col mà không có `min-h-0` trên vùng danh sách cuộn, dẫn đến việc container cha bị nội dung con đẩy phình to ra.

### ✅ Giải pháp chuẩn hóa (Solution & Prevention)
- Đặt kích thước cố định vĩnh viễn: `w-[420px] h-[380px]`.
- Neo vị trí cố định ở góc dưới bên phải: `fixed bottom-14 right-4 z-30`.
- Thêm `min-h-0 flex-1 overflow-y-auto` cho vùng danh sách log để thanh cuộn nội bộ tự hoạt động khi số lượng sự kiện vượt quá chiều cao cho phép.

---

## 4. Sự cố 4: Thanh Topbar bị ngắt dòng (wrap) đè lên Widget Tổng quan bên trái

### 🔴 Triệu chứng (Symptom)
- Trên màn hình laptop hoặc cửa sổ trình duyệt thu nhỏ, thanh Topbar bị gãy thành 2 dòng, phần bên phải rơi xuống đè lên Widget "Tổng quan Milestone" ở góc trên bên trái.

### 🔍 Nguyên nhân gốc rễ (Root Cause)
- Class thiếu `flex-nowrap`, padding và gap quá lớn (`gap-3`, `px-4`), văn bản nút quá dài khiến tổng chiều rộng vượt quá khoảng trống trung tâm.

### ✅ Giải pháp chuẩn hóa (Solution & Prevention)
- Áp dụng `flex items-center flex-nowrap` trên toàn bộ Topbar.
- Rút gọn padding: `px-2 py-1` cho các nút bấm, giảm `gap-1.5`.
- Gom các nút theme Ngày / Hoàng hôn / Đêm thành nhóm icon compact với emoji (`☀️`, `🌅`, `🌙`).
- Đặt Topbar căn giữa tuyệt đối (`left-1/2 -translate-x-1/2`) độc lập với Widget bên trái.

---

## 5. Sự cố 5: Quá nhiều bong bóng thoại (Speech Bubbles) gây rối mắt Diorama

### 🔴 Triệu chứng (Symptom)
- Cả 8 trạm đồng loạt hiện bong bóng thoại màu tối trên đầu agent dù đang ở trạng thái rảnh rỗi (`idle`), che khuất toàn bộ kiến trúc lâu đài và cảnh quan hòn đảo.

### 🔍 Nguyên nhân gốc rễ (Root Cause)
- Logic render DOM overlay trong `Labels.tsx` lặp qua toàn bộ 8 agent và render bong bóng thoại cho mọi role mà không lọc theo trạng thái hoạt động.

### ✅ Giải pháp chuẩn hóa (Solution & Prevention)
- **Cơ chế De-clutter thông minh:**
  - Chỉ hiển thị bong bóng thoại khi agent đang ở trạng thái tích cực: `working`, `debugging`, `waiting`, hoặc `error`.
  - Nếu agent đang `idle`, chỉ hiển thị bong bóng khi người dùng trực tiếp nhấp chuột chọn trạm đó (`selectedAgentRole === role`).
  - Hỗ trợ nút bật/tắt toàn bộ bong bóng (`Bong bóng`) trên thanh Topbar khi người dùng muốn ngắm cảnh quan thuần túy.

---

## 6. Sự cố 6: Shipper bị đứng khựng giữa đường khi Pipeline chuyển trạng thái

### 🔴 Triệu chứng (Symptom)
- Khi pipeline vừa hoàn tất hoặc khi người dùng bấm Duyệt / Từ chối ở Cổng duyệt DevOps, shipper đang vận chuyển trên đường đột nhiên bị đông cứng hoặc biến mất giữa đường.

### 🔍 Nguyên nhân gốc rễ (Root Cause)
- Trong `TownScene.tsx`, hàm `CourierTicker` chứa câu lệnh guard:
  ```ts
  if (!isRealRunning) return;
  ```
- Khi pipeline kết thúc hoặc bước duyệt kích hoạt, store set `isRealRunning = false`, khiến `CourierTicker` ngừng tính toán delta progress ngay lập tức dù danh sách `couriers` trong store vẫn còn hàng đang chạy.

### ✅ Giải pháp chuẩn hóa (Solution & Prevention)
- Bỏ điều kiện `if (!isRealRunning) return;`.
- Ticker chỉ kiểm tra `if (store.couriers.length === 0) return;`. Bất kỳ shipper nào đã xuất hiện trên đường đều được phép di chuyển mượt mà cho đến khi `nextProgress >= 1` thì mới tự hủy khỏi store.

---

## 7. Sự cố 7: Lỗi Compile TypeScript (Type Overlap & Duplicate Key)

### 🔴 Triệu chứng (Symptom)
- `npm run build` thất bại với các lỗi:
  - `error TS2367: This comparison appears to be unintentional because the types 'EventKind' and '"approval"' have no overlap.`
  - `error TS1117: An object literal cannot have multiple properties with the same name.`

### 🔍 Nguyên nhân gốc rễ (Root Cause)
- Code so sánh nhầm tên sự kiện (`kind === 'approval'` thay vì `'approve_needed'` như đã định nghĩa trong `stages.ts`).
- Merge code Zustand store để lại 2 lần khai báo các state thuộc tính `isRotating`, `showLabels`.

### ✅ Giải pháp chuẩn hóa (Solution & Prevention)
- Luôn kiểm tra đối chiếu type union gốc trong [`src/lib/pipeline/stages.ts`](file:///c:/Users/Admin/Documents/CV_Truong%20Dinh%20Anh/Ph%E1%BB%8Fng%20v%E1%BA%A5n/agent-town-3d/src/lib/pipeline/stages.ts).
- Chạy `npm run build` trước khi bàn giao để TypeScript Compiler & Turbopack kiểm soát 100% type safety.
- Sử dụng linter tự động phát hiện duplicate keys trong object literals.

---

## 8. Sự cố 8: Kiểu dữ liệu màu 3D (Number) gán trực tiếp vào Style CSS (String)

### 🔴 Triệu chứng (Symptom)
- `error TS2322: Type 'number' is not assignable to type 'BackgroundColor | undefined'`.

### 🔍 Nguyên nhân gốc rễ (Root Cause)
- Trong Three.js / Tokens, màu sắc thường được lưu dưới dạng số nguyên hex (`0x3b82f6` - kiểu `number`), trong khi React DOM `style={{ backgroundColor }}` đòi hỏi kiểu `string`.

### ✅ Giải pháp chuẩn hóa (Solution & Prevention)
- Luôn chuyển đổi số nguyên hex sang chuỗi CSS trước khi đưa vào thẻ JSX:
  ```ts
  const hexColor = '#' + layout.accentColor.toString(16).padStart(6, '0');
  ```
- Định nghĩa rõ ràng type helper cho chuyển đổi màu giữa Three.js và CSS.

---

## 9. Sự cố 9: Không khớp kiểu EventSeverity và Tên Method trong Audio Synthesizer

### 🔴 Triệu chứng (Symptom)
- `npm run build` báo lỗi:
  - `error TS2322: Type '"warning"' is not assignable to type '"ok" | "warn" | "error"'.`
  - `error TS2339: Property 'playVictoryFanfare' does not exist on type 'SoundFX'.`

### 🔍 Nguyên nhân gốc rễ (Root Cause)
- Kiểu `EventSeverity` trong `stages.ts` chỉ chấp nhận union `'ok' | 'warn' | 'error'`, nhưng code gọi `addEvent` sử dụng nhầm `'warning'`.
- Phương thức phát âm thanh reo vui trong `SoundFX` được đặt tên là `playSuccessFanfare()` thay vì `playVictoryFanfare()`.

### ✅ Giải pháp chuẩn hóa (Solution & Prevention)
- Chuẩn hóa giá trị severity thành `'warn'` theo đúng type union `EventSeverity`.
- Đồng bộ tên method của singleton `sfx` (`sfx.playSuccessFanfare()`).
- Bắt buộc chạy `npm run build` kiểm tra toàn diện trước khi bàn giao.

---

## 10. Sự cố 10: Xung đột Double Courier Ticker làm treo cứng Pipeline tự động (Race Condition)

### 🔴 Triệu chứng (Symptom)
- Trong chế độ mô phỏng tự động (`MockSimulator`), Shipper di chuyển với tốc độ thất thường (gấp đôi bình thường) và pipeline thỉnh thoảng bị **treo cứng vĩnh viễn** sau khi Shipper biến mất ở cửa trạm tiếp theo mà trạm đó không bao giờ chuyển sang trạng thái làm việc.

### 🔍 Nguyên nhân gốc rễ (Root Cause)
- Hai vòng lặp độc lập cùng cộng dồn `courier.progress` trên cùng một mảng state Zustand:
  1. `CourierTicker` trong `TownScene.tsx` chạy qua `useFrame` (60fps) và gọi `store.removeCourier(id)` ngay khi `nextProgress >= 1` nhưng **không kích hoạt callback chuyển trạm**.
  2. `MockSimulator.tick()` chạy qua `setInterval` (100ms) cũng cộng `courier.progress` và chờ `nextProgress >= 1` để gọi `onCourierArrived()`.
- Bất cứ khi nào nhịp 60fps cán mốc `>= 1` trước nhịp 100ms, courier bị xóa âm thầm khỏi store khiến `onCourierArrived()` bị bỏ lỡ hoàn toàn.

### ✅ Giải pháp chuẩn hóa (Solution & Prevention)
- **Single Source of Truth cho chuyển động 3D:** Xóa hoàn toàn logic cộng `courier.progress` khỏi `MockSimulator.tick()`, giao độc quyền cho `CourierTicker` (60fps, có kẹp `Math.min(delta, 0.1)` chống vọt frame khi chuyển tab).
- Ngay khi `nextProgress >= 1` trong `CourierTicker`, gọi `store.removeCourier(courier.id)` đồng thời gọi thẳng `simulator.handleCourierArrived(...)` nếu `store.isSimulating === true`.

---

## 11. Sự cố 11: Mở chồng 2 Modal cùng lúc và rò rỉ nhãn 3D phía sau Backdrop

### 🔴 Triệu chứng (Symptom)
- Khi click vào các chip trạm dưới thanh `RoleChips`, bong bóng thoại 3D (`Labels.tsx`) hoặc dòng nhiệm vụ trong `MilestoneWidget`, cả `AgentDossierModal` lẫn `ArtifactModal` đều bật chồng lên nhau tạo 2 lớp màn đen; khi đóng bảng trên lại hiện bảng dưới. Ngoài ra nhãn tên 3D vẫn hiển thị đè phía sau khi mở `AgentDossierModal` hoặc `ExportModal`.

### 🔍 Nguyên nhân gốc rễ (Root Cause)
- Hàm `selectAgent(role)` trong `useTownStore.ts` mặc định ép `isDossierModalOpen: true`, trong khi các sự kiện `onClick` ở các component trên lại gọi nối tiếp `selectAgent(role)` rồi `openArtifactModal(true)`.
- Biến `isAnyModalOpen` trong `Labels.tsx` chưa kiểm tra `isDossierModalOpen` và `isExportModalOpen`.

### ✅ Giải pháp chuẩn hóa (Solution & Prevention)
- Mở rộng chữ ký hàm `selectAgent(role, modalMode: 'dossier' | 'artifact' | 'none' = 'dossier')` đảm bảo tính loại trừ tương hỗ (mutually exclusive) giữa `isDossierModalOpen` và `isArtifactModalOpen`, đồng thời hỗ trợ `'none'` khi chỉ muốn bay camera 3D tới trạm (`flyToStation`).
- Bổ sung đầy đủ `isDossierModalOpen` và `isExportModalOpen` vào điều kiện ẩn `StationOverlay` trong `Labels.tsx`.

---

## 12. Sự cố 12: Hạt xung dữ liệu (Photon Pulse) trên cáp quang đứng yên tại điểm giữa

### 🔴 Triệu chứng (Symptom)
- Các hạt cầu xung dữ liệu trên 7 tuyến cáp quang neon (`DataCables.tsx`) chỉ phập phồng to nhỏ tại đúng trung điểm dây cáp thay vì chạy dọc từ AI Command Center ra các phòng lab.

### 🔍 Nguyên nhân gốc rễ (Root Cause)
- Vòng lặp `useFrame` tính toán biến `progress = (t * 1.5 + idx * 0.25) % 1` rồi lưu vào `mesh.userData.progress`, nhưng quên gọi `mesh.position.set(x, y, z)` để cập nhật tọa độ không gian thực tế của mesh Three.js.

### ✅ Giải pháp chuẩn hóa (Solution & Prevention)
- Tiền tính toán vector góc cực `{ angle, rStart, cableLen }` bằng `useMemo` cho 7 trạm và cập nhật trực tiếp `mesh.position.set(Math.cos(angle) * currentR, y, Math.sin(angle) * currentR)` trong mỗi frame của `useFrame`.
- **Lưu ý bổ sung khi lưu trữ file `.tsx` cũ vào `docs/archive/`:** Do `tsconfig.json` mặc định quét `**/*.tsx` trên toàn repo, mọi component `.tsx` lưu trữ trong `docs/archive/legacy-v1/` phải đổi hậu tố sang `.tsx.bak` để tránh lỗi đường dẫn import tương đối khi chạy `next build`.

---

## 13. Sự cố 13: Nền ban ngày trắng xóa làm nhạt ốc đảo & Nhân vật đứng ngoài thảm cửa thay vì ngồi ghế làm việc

### 🔴 Triệu chứng (Symptom)
1. **Nền ban ngày quá chói:** Ở chế độ Ban ngày (`themeMode === 'day'`), toàn bộ phông nền có màu trắng xám (`#f8fafc`) trùng với màu sàn Cleanroom (`#ffffff`, `#f8fafc`) và độ phơi sáng cao (`toneMappingExposure: 1.15`, `ambientIntensity: 0.95`), làm ốc đảo và các phòng kính bị chìm, thiếu chiều sâu.
2. **Nhân viên đứng ngoài cửa thay vì ngồi vào bàn:** Cả 8 kỹ sư AI đều đứng ở thảm chùi chân ngoài cửa (`z = +0.95m` và `z = +1.3m`) thay vì ngồi trên ghế công thái học ngay trước bàn làm việc.

### 🔍 Nguyên nhân gốc rễ (Root Cause)
1. `TownScene.tsx` dùng màu nền đơn sắc `#f8fafc` kết hợp tổng cường độ nguồn sáng quá lớn (`ambient 0.95 + sun 1.4 + hemi 0.55 + fill 0.45`) khiến ACES Filmic Tone Mapping đẩy các bề mặt sáng của đảo và sàn phòng lab về vùng cháy sáng (white clipping).
2. `Character.tsx` vẫn giữ tọa độ `offsetDistance = 1.3` (và `0.95` cho Hub) từ phiên bản nhà gỗ đóng kín v1.0 (nhân vật đứng ngoài hiên nhà), chưa cập nhật về tọa độ ghế công thái học bên trong phòng sau khi nâng cấp nội thất High-Tech Labs (`Castle.tsx` ghế tại `z = -0.95`, `Building.tsx` ghế tại `z = -0.05`). Ngoài ra, chuyển động tay gõ phím cũ dùng `mesh.rotation.x` trên khối cầu đồng tâm (`<sphereGeometry>`) nên không tạo ra dịch chuyển thị giác.

### ✅ Giải pháp chuẩn hóa (Solution & Prevention)
1. **Cân bằng phơi sáng & Bầu trời Ban ngày (`TownScene.tsx`, `tokens.ts`):** Thay nền trắng `#f8fafc` bằng dải gradient bầu trời xanh da trời dịu mắt (`linear-gradient(180deg, #38bdf8 0%, #7dd3fc 48%, #bae6fd 100%)`), hạ `toneMappingExposure` ban ngày về `0.96`, `ambientIntensity` về `0.65`, và nâng sắc độ thảm cỏ sang xanh ngọc lục bảo (`0x52c48a`) để tạo độ tương phản nổi khối sắc nét.
2. **Đồng bộ tọa độ ghế ngồi & tư thế làm việc (`Character.tsx`, `Building.tsx`, `Castle.tsx`):**
   - Đặt `Claude Code` (`orchestrator`) ngồi trên ghế Captain's Chair (`offsetDistance = -0.92`, `baseY = layout.position[1] + 0.48`, hướng `+Z` nhìn vào bàn Hologram).
   - Đặt 7 kỹ sư chuyên môn ngồi trực tiếp trên đệm ghế công thái học (`offsetDistance = -0.05`, `baseY = layout.position[1] + 0.52`, hướng `-Z` nhìn thẳng vào màn hình máy tính).
   - Điều chỉnh tư thế 2 chân gập về phía trước trên đệm ghế (`z = +0.16`) và 2 tay đặt lên bàn phím cơ (`z = +0.25`), cập nhật trực tiếp `position.y` của 2 bàn tay trong `useFrame` để tạo hiệu ứng gõ phím cơ liên hồi chân thực.
3. **Liên tục hóa vòng đời Shipper (`waypoints.ts`, `Character.tsx`, `Building.tsx`, `Castle.tsx`):**
   - Bổ sung điểm mốc `handover` bên trong phòng để Shipper bước qua cửa đến sát bàn làm việc thay vì dừng ngoài đường (`2.5m`).
   - Khi giao hàng xong, hiển thị thùng kiện hàng (`Artifact Parcel`) đặt ngay trên góc bàn làm việc của kỹ sư và giữ `StandbyCourier` đứng đợi cạnh bàn cho tới khi kỹ sư hoàn thành để bưng kiện hàng đi tiếp, xóa bỏ hoàn toàn hiện tượng Shipper tự nhiên biến mất rồi lại hiện ra.
4. **Chuẩn hóa Responsive 3D & HUD (`CameraRig.tsx`, `Topbar.tsx`, `RoleChips.tsx`, `StatusBar.tsx`, `MilestoneWidget.tsx`):**
   - Trong `CameraRig.tsx`, nhân `cameraZoom` với hệ số `responsiveScale = Math.min(1, Math.max(0.45, size.width / 1200))` để ốc đảo 3D luôn nằm trọn trong khung nhìn khi thu hẹp cửa sổ trình duyệt hoặc mở trên tablet/mobile.
   - Tách tầng `StatusBar` (`bottom-14 lg:bottom-3`) nằm phía trên `RoleChips` ở màn hình `< 1024px`, ẩn bớt chữ phụ trên `Topbar` theo breakpoint và tự động thu gọn danh sách task của `MilestoneWidget` khi `window.innerWidth < 768`.

---

## 14. Sự cố 14: Lệch nhịp giữa Shipper và AI Stream; Tái cấp phát Spline liên tục 60fps; Vòng lặp phản hồi thiếu AI tự sửa thật

### 🔴 Triệu chứng (Symptom)
1. **Lệch nhịp hiển thị:** Khi chạy real AI hoặc GitHub PR audit, trạm kế tiếp bắt đầu stream token ngay lập tức trong khi nhân vật Shipper 3D mới chỉ vừa rời trạm trước đó vài bước chân trên đại lộ.
2. **Áp lực bộ nhớ (GC Pressure):** Hàm `interpolateCourierPosition` khởi tạo `new THREE.CatmullRomCurve3(waypoints, false, 'centripetal')` liên tục trong mỗi frame tại 60fps cho từng shipper đang di chuyển.
3. **Kịch bản Feedback Loop thụ động:** Khi QA báo test fail hoặc DevSecOps cảnh báo SAST/OWASP, hệ thống chỉ dùng `setTimeout` sleep giả lập rồi tự chuyển trạng thái thay vì gọi AI thật để sửa file diff.
4. **Trải nghiệm đóng Modal thiếu tiện lợi:** Người dùng không thể nhấn phím `Esc` hoặc bấm click-outside ra ngoài vùng backdrop mờ để đóng nhanh các modal (`ArtifactModal`, `AgentDossierModal`, `ApprovalModal`, `ApiKeyModal`).

### 🔍 Nguyên nhân gốc rễ (Root Cause)
1. Vòng lặp `for` trong `runRealPipeline` và `runGitHubPrAudit` gọi `addCourier()` dạng asynchronous fire-and-forget mà không có cơ chế `await` theo dõi khi nào kiện hàng đạt `progress >= 1` (đã đặt lên bàn làm việc trạm đích).
2. Chưa áp dụng cơ chế memoization cho mảng waypoints giữa 8 trạm cố định ($8 \times 8 = 64$ cặp đường) và chưa dùng `WeakMap` cache cho `CatmullRomCurve3`.
3. Server route `/api/pipeline` và `STAGE_CONFIGS.dev` chưa hỗ trợ tham số `feedbackNote` trong `PipelineContext` để hướng dẫn AI sinh bản vá hotfix Unified Git Diff xử lý đúng lỗi được báo cáo.

### ✅ Giải pháp chuẩn hóa (Solution & Prevention)
1. **Đồng bộ hóa thể chất Shipper & AI Stream (`useTownStore.ts`, `TownScene.tsx`):**
   - Thiết lập cơ chế `registerCourierArrival` và `waitForCourierArrival(courierId)`: khi shipper di chuyển đến bàn làm việc trạm đích (`progress >= 1`), `CourierTicker` gọi `removeCourier()` kích hoạt thông báo hoàn tất, lúc đó trạm mới bắt đầu khởi động AI stream.
2. **Zero-Allocation Spline Engine (`waypoints.ts`):**
   - Memoize kết quả `getRouteWaypoints(from, to)` bằng `Map<string, THREE.Vector3[]>`.
   - Lưu trữ đường cong bằng `WeakMap<THREE.Vector3[], THREE.CatmullRomCurve3>` qua hàm `getCurveForWaypoints()`, triệt tiêu hoàn toàn việc cấp phát Curve mới trong render loop 60fps.
3. **AI Self-Healing Feedback Loop thực tế (`route.ts`, `useTownStore.ts`, `ApprovalModal.tsx`):**
   - Bổ sung `feedbackNote` vào `PipelineContext`. Khi QA bắt bug hoặc DevSecOps cảnh báo SAST, Dev nhận shipper bug, gọi real AI stream tạo `source-code.diff` vá lỗi, rồi gửi lại cho QA/Sec kiểm định.
   - Thêm biểu mẫu phản hồi kỹ thuật của Tech Lead tại Cổng Phê Duyệt Production: khi từ chối, Tech Lead nhập góp ý hoặc chọn gợi ý nhanh, Dev tự động đọc phản hồi và stream bản vá mới.
4. **Session History & Persistence (`useTownStore.ts`, `PromptModal.tsx`):**
   - Lưu trữ tối đa 5 phiên chạy gần nhất vào `localStorage` (`AGENT_TOWN_SESSIONS`), cho phép khôi phục tức thì toàn bộ artifacts, telemetry và log mà không tốn thêm token AI.
5. **Tiến độ trực quan (`RoleChips.tsx`):**
   - Hiển thị huy hiệu `✓` màu xanh lá cho các trạm đã hoàn thành và viền phát sáng xanh dương nhấp nháy cho trạm đang stream dữ liệu.
6. **Chuẩn hóa Modal Keyboard & Click-Outside:**
   - Bổ sung phím tắt `Escape` và `onClick` backdrop dismissal đồng bộ cho toàn bộ modal trong ứng dụng.

---

## 15. Sự cố 15: Trùng lặp ký hiệu Git Diff (+/+); Tràn chữ Split View; Thiếu thực thi song song DAG (QA ∥ DevSecOps) & Thiếu Playground Prompt

### 🔴 Triệu chứng (Symptom)
1. **Lỗi hiển thị Git Diff (`GitDiffViewer.tsx`):** Dòng code thêm mới hoặc xóa hiển thị thừa ký hiệu đầu dòng thành `+ +const x = 1` hoặc `- -return null`. Ở chế độ Split 2 cột (Before / After), thuộc tính `truncate` cắt mất phần đuôi dòng code dài.
2. **Lỗi cuộn & Lọc Log Drawer (`LogDrawer.tsx`):** Drawer cuộn xuống đáy hiển thị log cũ thay vì hiển thị log mới nhất ở đầu; thiếu bộ lọc nhanh theo trạm hoặc mức độ cảnh báo; khi bấm vào dòng log không bay camera tới trạm tương ứng.
3. **Lệch trục Sparkline trong bão Chaos (`StatusBar.tsx`):** Khi kích hoạt Chaos Surge (độ trễ vọt 168ms), trục đồ thị cố định mức trần 40ms khiến đường cong vẽ tràn ra ngoài viewBox SVG; thời tiết hiển thị tĩnh "Nắng nhẹ 24°C" ngay cả khi đang ban đêm hoặc xảy ra bão tải.
4. **Pipeline thực thi tuần tự tuyến tính:** Sau khâu Tech Review, QA và DevSecOps chạy tuần tự (review ➔ qa ➔ sec) thay vì rẽ nhánh song song đồng thời theo chuẩn DAG Pipeline.
5. **Thiếu AI Playground & Re-run trạm:** Người dùng không thể chỉnh sửa `systemPrompt` của từng Agent trực tiếp trên UI và không có nút chạy lại riêng biệt cho một trạm với ngữ cảnh hiện tại.

### 🔍 Nguyên nhân gốc rễ (Root Cause)
1. `GitDiffViewer.tsx` parse dòng `content: line` (đã có dấu `+`/`-` ở đầu) nhưng trong JSX lại render thêm `<span className="w-4">{isAdd ? '+' : '-'}</span>`, gây ra hiệu ứng nhân đôi ký hiệu. Split View áp dụng class `truncate` trên thẻ `<span>` mà không có thanh cuộn ngang `overflow-x-auto`.
2. `LogDrawer.tsx` dùng `useEffect` đặt `scrollTop = scrollHeight` (cuộn xuống đáy log cũ nhất) thay vì `scrollTop = 0` (mới nhất trên cùng).
3. `StatusBar.tsx` fix cứng trục Y của SVG Sparkline ở giá trị `40 - (val / 40) * 20`, không co dãn động khi `val > 40ms`.
4. `useTownStore.ts` duyệt mảng tuyến tính `pipelineStages` mà không sử dụng `Promise.all` cho các trạm độc lập về dữ liệu (`qa` và `security` đều chỉ cần bản diff đã qua review).

### ✅ Giải pháp chuẩn hóa (Solution & Prevention)
1. **Chuẩn hóa Git Diff & Inline Review Comments (`GitDiffViewer.tsx`, `ArtifactModal.tsx`):**
   - Cắt bỏ ký hiệu đầu dòng qua `line.slice(1)` khi parse dòng `add` và `delete`.
   - Thay `truncate` bằng `overflow-x-auto scrollbar-none` ở Split View.
   - Hiển thị trực quan các bình luận kiến trúc (`ReviewComments.json`) trực tiếp dưới đúng số dòng code tương ứng với huy hiệu Tech Reviewer.
2. **Nâng cấp Glassmorphism Log Drawer & Auto-Scale Sparkline (`LogDrawer.tsx`, `StatusBar.tsx`):**
   - Đặt `scrollTop = 0` khi mở drawer; bổ sung bộ lọc nhanh `Tất cả`, `Lỗi & Cảnh báo` và lọc theo từng trạm; thêm click-to-fly-to-station qua `selectAgent(role, 'none')`.
   - Tính toán động `min` và `max` cho Sparkline (`Math.min(10, ...points)`, `Math.max(35, ...points)`); tự động đổi thời tiết sinh động theo `themeMode` và trạng thái `isChaosRunning`.
3. **Mô hình thực thi DAG Parallel (`QA` ∥ `DevSecOps`) & FinOps Telemetry (`useTownStore.ts`, `LiveStreamConsole.tsx`, `ExportModal.tsx`):**
   - Sau khi Tech Review duyệt PR, hệ thống phóng đồng thời 2 Shipper về trạm QA và Security (`Promise.all([waitForCourierArrival(cQa), waitForCourierArrival(cSec)])`).
   - Kích hoạt `qa` và `security` chạy suy luận song song qua `Promise.all([streamStageFromApi('qa'), streamStageFromApi('security')])`.
   - Sau khi hoàn thành, 2 Shipper từ QA và Security đồng thời mang test suite và security audit về bàn làm việc của DevOps.
   - Đo lường và hiển thị thời gian thực hiện (`durationMs`), số lượng token và tốc độ suy luận (`tok/s`) trên console và bảng FinOps trong `ExportModal`.
4. **Chế độ Đạo diễn 3D Camera (`CameraRig.tsx`, `Topbar.tsx`):**
   - Nút bật/tắt `🎥 Đạo diễn` trên Topbar; camera tự động bám theo tọa độ vị trí thực của Shipper đang chạy trên các nan hoa đại lộ hoặc trạm AI đang stream dữ liệu.
5. **AI Agent Playground & Re-run Stage (`ArtifactModal.tsx`, `route.ts`, `useTownStore.ts`):**
   - Cho phép tinh chỉnh trực tiếp System Prompt của từng Agent trong tab `🧠 System Prompt` kèm nút "Khôi phục mặc định".
   - Nút `🔄 Chạy lại trạm này` gọi API với `customSystemPrompt` và ngữ cảnh hiện tại để sinh lại artifact riêng biệt mà không cần chạy lại toàn bộ pipeline.
   - Bổ sung nút `📦 Tải trọn bộ 8 Artifacts Bundle (.md)` trong `ExportModal.tsx`.

---

## 16. Sự cố 16: Client `customSystemPrompt` ghi đè làm mất Output Schema Contract của Server; Đứt gãy ngữ cảnh bàn giao liên phòng ban & Trạm Monitor thiếu Live SSE Stream

### 🔴 Triệu chứng (Symptom)
1. **Mất JSON Schema & Thẻ thoại `---SPEECH---:` khi gọi AI:** Khi `streamStageFromApi` gửi `customSystemPrompt: get().agents[stage]?.systemPrompt` từ Client lên `/api/pipeline`, phản hồi JSON của các trạm `orchestrator`, `review`, `security`, `monitor` dễ bị sai lệch tên trường (`comments`, `score`, `cveCount`, `speech`), hoặc các trạm `pm`, `dev`, `qa`, `devops` thiếu thẻ `---SPEECH---:` ở cuối khiến bong bóng thoại 3D chỉ hiện câu mặc định `"Hoàn thành khâu xử lý."`.
2. **Rủi ro vỡ Parser khi dùng AI Playground:** Khi người dùng sửa `systemPrompt` trên tab `🧠 System Prompt` của `ArtifactModal`, nếu vô tình xóa mất đoạn hướng dẫn định dạng JSON / Unified Diff thì `GitDiffViewer` và `ExportModal` không thể bóc tách số liệu.
3. **Thiếu tài liệu đối chiếu chéo giữa các phòng ban (Cross-Department Context Gap):**
   - `PM` chưa nhận trực tiếp `MilestonePlan.json` tách biệt từ `Orchestrator`.
   - `QA` và `Tech Review` chỉ nhận `sourceCode` của `Dev` mà không nhận `PRD.md` của `PM`, dẫn đến việc QA chỉ viết test theo code của Dev (nếu Dev làm thiếu yêu cầu Gherkin trong PRD thì QA cũng bỏ lọt).
   - `DevOps` tại điểm hội tụ DAG Join chưa nhận báo cáo `SecurityAudit.json` từ `DevSecOps`.
4. **Trạm `APM Monitor` không stream live & khuyết số liệu FinOps:** Sau khi Tech Lead bấm Approve tại Cổng duyệt Production, trạm `monitor` gọi `fetch('/api/pipeline')` dạng JSON tĩnh thay vì `streamStageFromApi`, khiến `LiveStreamConsole` không hiển thị luồng suy luận SRE, camera Auto-Follow không lia tới đài Radar và bảng FinOps trong `ExportModal` khuyết dòng đo lường của trạm thứ 8.

### 🔍 Nguyên nhân gốc rễ (Root Cause)
1. Prompt bị phân mảnh ở 2 nơi: `INITIAL_AGENTS` trong `useTownStore.ts` chỉ lưu 1 câu mô tả ngắn (không có Output Schema), trong khi `STAGE_CONFIGS` trong `route.ts` lưu bản đầy đủ. Khi bổ sung tính năng AI Playground (`v1.4.2`), Client luôn gửi chuỗi `agents[stage].systemPrompt` (khác rỗng) lên Server và biểu thức `customSystemPrompt?.trim() ? customSystemPrompt : config.systemPrompt` trên Server đã ghi đè toàn bộ System Prompt gốc kèm Output Contract bằng câu mô tả 1 dòng của Client.
2. Đối tượng `context` truyền vào `streamStageFromApi` mới chỉ truyền cục bộ `prd` và `sourceCode` ở một số bước thay vì gom đầy đủ hồ sơ bàn giao (`PipelineContext`) từ `realArtifacts`.
3. Nhánh `status === 'approved'` trong `resolveApproval` vẫn giữ lệnh `fetch` cũ từ phiên bản trước khi nâng cấp SSE Streaming.

### ✅ Giải pháp chuẩn hóa (Solution & Prevention)
1. **Thiết lập Single Source of Truth & Khóa bảo vệ Output Contract (`src/lib/pipeline/prompts.ts`, `src/app/api/pipeline/route.ts`):**
   - Tạo module dùng chung `src/lib/pipeline/prompts.ts` chuẩn hóa quy trình nghiệp vụ thực chiến (Enterprise Department SOP) cho toàn bộ 8 phòng ban: INVEST User Stories (`orchestrator`), PRD 5 phần kèm Gherkin & NFRs (`pm`), Clean Architecture Unified Diff (`dev`), Code Review 5 trụ cột khớp số dòng `+newStart` (`review`), Vitest/Jest 4 tầng đối chiếu PRD (`qa`), OWASP Top 10 SAST & Threat Modeling (`security`), Multi-stage non-root Alpine Dockerfile + K8s Canary Rollout (`devops`), và Google SRE 4 Golden Signals & SLO Error Budget (`monitor`).
   - Tách bạch `defaultRolePrompt` (hiển thị và cho phép người dùng tự do chỉnh sửa trên UI Playground) khỏi `outputContract` (JSON Schema / Git Diff + Speech Tag bất biến). Hàm `buildEffectiveSystemPrompt(stage, customRolePrompt)` trên Server luôn tự động ghép `outputContract` vào cuối, đảm bảo dù người dùng sửa prompt thế nào thì UI parser vẫn hoạt động chính xác 100%.
   - Gia cố `finalizeStageOutput` tự động trích xuất khối `{ ... }` hợp lệ và dọn sạch code fence thừa cho `typescript` / `dockerfile`.
2. **Liên thông Hồ sơ Bàn giao Liên phòng ban (`buildCurrentContext` trong `useTownStore.ts`):**
   - Chuẩn hóa `PipelineContext` truyền xuyên suốt toàn bộ 7 artifacts (`milestonePlan`, `prd`, `sourceCode`, `reviewComments`, `testReport`, `securityAudit`, `dockerfile`, `feedbackNote`, `scenario`) qua mọi chặng của `runRealPipeline`, `runGitHubPrAudit`, `rerunStage` và `resolveApproval`.
3. **Đồng bộ Live SSE Stream cho `APM Monitor` & Inline Review Comments toàn cục (`useTownStore.ts`, `AgentDossierModal.tsx`, `ApprovalModal.tsx`):**
   - Chuyển trạm `monitor` trong `resolveApproval` sang `streamStageFromApi`, hoàn thiện trọn vẹn 8/8 trạm trên bảng thống kê FinOps Telemetry, Live Terminal và Camera Đạo diễn.
   - Truyền `reviewComments` vào `GitDiffViewer` trên cả 3 modal (`ArtifactModal`, `AgentDossierModal`, `ApprovalModal`) và giữ định dạng đa dòng `whitespace-pre-wrap` cho SOP Prompt.

---

## 17. Sự cố 17: Thu hẹp kiểu dữ liệu biến trong Closure bất đồng bộ (TypeScript Control Flow Narrowing `never` trên biến cục bộ tái gán trong Closure)

### 🔴 Triệu chứng (Symptom)
- Khi chạy `npm run build` cho phiên bản v1.5.0, trình biên dịch Next.js TypeScript báo lỗi biên dịch tại dòng 453 của `src/store/useTownStore.ts`:
  ```
  src/store/useTownStore.ts(453,21): error TS2339: Property 'model' does not exist on type 'never'.
  ```

### 🔍 Nguyên nhân gốc rễ (Root Cause)
- Biến `finalPayload` được khai báo là biến cục bộ `let finalPayload: StageOutputPayload | null = null;` trước vòng lặp đọc stream chunk.
- Phép gán giá trị lại cho `finalPayload` nằm trong hàm nội bộ `processLine(...)`.
- Bộ phân tích luồng điều khiển của TypeScript (Control Flow Analysis) không coi việc gọi hàm `processLine(l)` trong vòng lặp là hành động tái gán biến cục bộ `finalPayload`. Vì vậy, sau khi vòng lặp kết thúc, TypeScript đánh giá biến này vẫn giữ giá trị khởi tạo `null`. Khi xuất hiện biểu thức truy xuất, TypeScript suy luận biến rơi vào trạng thái thu hẹp `never`.
- Cách ép kiểu lỏng lẻo `as Record<string, any>` trước đó là vá bề mặt, làm mất type safety của TypeScript.

### ✅ Giải pháp chuẩn hóa (Solution & Prevention)
- Áp dụng mẫu **Object Wrapper Container** (`captureBox`):
  ```ts
  const captureBox: { payload: StageOutputPayload | null } = { payload: null };
  // Bên trong processLine:
  captureBox.payload = { ... };
  // Sau vòng lặp:
  const parsedPayload = captureBox.payload;
  ```
  Do TypeScript hiểu thuộc tính của một object có thể bị thay đổi bởi bất kỳ lệnh gọi hàm nào, nó sẽ không thu hẹp kiểu thuộc tính về `never` và bảo toàn 100% type-safety của interface `StageOutputPayload`.

---

## 18. Sự cố 18: Nút Rollback làm treo Approval Queue; Bỏ sót kiểm tra lỗi API tại DAG song song; Xung đột text stream trên Live Console & Che giấu lỗi DOM

### 🔴 Triệu chứng (Symptom)
1. **Nút Rollback khẩn cấp đóng băng luồng:** Trong modal duyệt `ApprovalModal`, khi người dùng bấm nút "Kích hoạt Rollback khẩn cấp", modal bị đóng nhưng đối tượng `currentApproval` không được cập nhật trạng thái (`status: 'pending'` vĩnh viễn), `isRealRunning` giữ nguyên `true` làm người dùng không thể chạy bất kỳ task nào tiếp theo.
2. **Lỗi API ở DAG song song bị bỏ qua:** Ở bước chạy song song `QA ∥ DevSecOps`, nếu 1 trong 2 trạm (hoặc cả 2) gặp lỗi gọi API (HTTP 429, sai key), mã nguồn không kiểm tra `qaData.error` / `secData.error` mà vẫn gán artifact rỗng và thông báo "Hoàn thành QA" / "Hoàn thành Security Audit".
3. **Xung đột chớp giật chữ trên Live Console & Desk Cam:** Cả QA và DevSecOps cùng gọi `streamStageFromApi` song song và cùng ghi đè biến toàn cục `streamingContent` và `streamingStage`, dẫn tới việc các token stream của 2 trạm đè lẫn nhau liên tục.
4. **Vá bề mặt DOM & che giấu lỗi React:** File `src/app/page.tsx` có đoạn monkey-patch `Node.prototype.removeChild`, `Node.prototype.insertBefore` và nuốt `console.error` (unmount root, createRoot).
5. **Nói quá về số liệu:** Desk Cam hiển thị text tĩnh `· 60 FPS`, ma trận CI/CD Staging hiển thị số liệu tĩnh `48/48 (1.2s)` không gắn với dữ liệu artifact thật, Export Modal luôn gắn nhãn `✅ PRODUCTION READY` kể cả khi bị Tech Review từ chối.

### 🔍 Nguyên nhân gốc rễ (Root Cause)
1. Hàm `triggerRollback` chỉ phát sinh shipper và đổi telemetry, không giải quyết dứt điểm các approval đang chờ trong `approvals[]` và không dọn cờ `isRealRunning`.
2. Khối lệnh sau `Promise.all([streamStageFromApi(qa), streamStageFromApi(security)])` thiếu nhánh kiểm tra lỗi `.error` trước khi cập nhật state và event.
3. Không có cờ phân biệt giữa luồng stream cần trực quan hóa lên console giao diện (`visualize: true`) và luồng chạy ngầm đồng thời (`visualize: false`).
4. Đoạn patch DOM trong `page.tsx` là tàn dư từ phiên bản cũ khi dùng thẻ Drei `<Html>` trong Canvas (nay đã chuyển hoàn toàn sang 2D DOM ngoài Canvas nên không còn cần thiết).

### ✅ Giải pháp chuẩn hóa (Solution & Prevention)
1. **Gia cố `triggerRollback`:** Tự động hủy controller pipeline đang chạy, đóng và chuyển toàn bộ pending approval sang `rejected`, cập nhật task state sang `failed`, chuyển `isRealRunning: false`, và chặn kích hoạt lặp (debounce `isRollingBack`).
2. **Kiểm tra lỗi chặt chẽ tại các điểm DAG:** Bắt buộc kiểm tra `qaData.error`, `secData.error`, `devopsData.error` và `hotfixResult.error`, chỉ xác nhận hoàn thành khi không có lỗi.
3. **Phân tách luồng hiển thị Live Stream Console (`visualize` flag):** Trong các giai đoạn DAG song song, trạm chính (QA) hiển thị trực tiếp dòng mã lên Live Terminal, trạm chạy song song (Security) thu thập dữ liệu ngầm mà không gây xung đột chữ trên màn hình.
4. **Loại bỏ hoàn toàn monkey patch DOM:** Dọn dẹp các can thiệp vào `Node.prototype` trong `page.tsx`.
5. **Đo lường thật & Minh bạch hóa:**
   - Desk Cam đo FPS thực tế bằng `requestAnimationFrame` và tính delta time thời gian thực.
   - CI/CD Staging Matrix trích xuất số lượng specs kiểm thử thực tế từ artifact `test-suite.spec.ts` của QA và ghi chú minh bạch.
   - Export Modal kiểm tra kết luận review thật, tự động chuyển nhãn `⚠️ NEEDS REVISION` khi bị từ chối.

---

## 19. Sự cố 19: Thông báo hiển thị thiếu responsive và thẩm mỹ kém; Góc phải hiển thị tĩnh "Nắng nhẹ" không phản ánh chu kỳ đêm thời gian thực

### 🔴 Triệu chứng (Symptom)
1. **Bong bóng thoại 3D (`Labels.tsx`) bị tràn màn hình mobile và cắt cụt câu:** Trên màn hình di động (< 640px), các trạm 3D ở rìa đảo khi chiếu tọa độ 2D ra rìa màn hình khiến bong bóng thoại bị tràn ra ngoài cạnh trái/phải (`transform: translate(-50%, -100%)`), gây thanh cuộn ngang hoặc mất chữ; kiểu dáng dạng hộp vuông đơn điệu, mũi nhọn CSS bị lệch viền.
2. **Thiếu hệ thống thông báo sự kiện (Toast Notification) thời gian thực:** Khi trạm AI phát hiện CVE an ninh, hoàn thành kiểm thử QA, yêu cầu phê duyệt hoặc kích hoạt Rollback, hệ thống chỉ âm thầm ghi vào mảng `events[]` mà không có thông báo đẩy nổi bật, người dùng khó nhận biết tiến trình nếu không mở Log Drawer.
3. **Góc phải hiển thị tĩnh "Nắng nhẹ" bất kể thời gian thực là ban đêm:** Trạng thái `themeMode` khởi tạo mặc định là `'day'`, thanh `StatusBar.tsx` hiển thị tĩnh "Nắng ấm · 26°C" / "Nắng nhẹ" và bị ẩn (`hidden xl:flex`) trên mọi màn hình dưới 1280px (laptop 13-inch, tablet, mobile); hệ thống không có cơ chế tự động đọc giờ máy khách để chuyển chu kỳ Ngày/Hoàng hôn/Đêm.
4. **LiveStreamConsole xung đột vị trí với thanh điều hướng đáy trên mobile:** Khi xuất hiện ở `bottom-24`, khung console đè lên thanh `RoleChips` và `StatusBar`.

### 🔍 Nguyên nhân gốc rễ (Root Cause)
1. Tọa độ chiếu 2D của Three.js Vector3 không có cơ chế kẹp biên (viewport clamping) theo kích thước màn hình `size.width` và `size.height`.
2. Chưa có component `ToastContainer` độc lập để lắng nghe các sự kiện severity `warn`/`error` và kind `approve_needed`/`pass`.
3. `themeMode` thiếu tùy chọn `'auto'`, chưa có hàm tính toán `getRealTimeTheme()` dựa trên giờ địa phương thực tế và thiếu bộ đếm giây hiển thị đồng hồ số.

### ✅ Giải pháp chuẩn hóa (Solution & Prevention)
1. **Kẹp biên tọa độ chiếu 3D (`OverlayProjector`):** Tự động kẹp `clampedBx = Math.max(margin, Math.min(size.width - margin, bx))` và `clampedBy`, đảm bảo 100% bong bóng thoại và nhãn trạm luôn nằm gọn gàng bên trong khung nhìn trên mọi thiết bị.
2. **Nâng cấp thẩm mỹ Bong bóng thoại 3D:** Thiết kế kính mờ bo tròn 2xl (`backdrop-blur-xl bg-slate-950/92`), viền neon phát sáng theo màu chuyên môn của từng trạm, huy hiệu tên vai trò, chấm trạng thái nhấp nháy và mũi tên SVG hướng tâm sắc nét.
3. **Xây dựng Hệ thống Toast Notification (`ToastContainer.tsx`):** Tự động kích hoạt khi có sự kiện quan trọng (Cảnh báo CVE, Hoàn tất QA, Cổng duyệt Production, Bão tải SRE), hỗ trợ nút hành động nhanh ("Mở Cổng Duyệt", "Xem Nhật Ký"), thanh tiến trình đếm ngược 4.5s tự hủy và tự co giãn responsive trên mobile/desktop.
4. **Chu kỳ Thời gian thực Tự động (`themeMode: 'auto'`):**
   - Tự động nhận diện ban đêm (`night`, 18:30 - 06:00), hoàng hôn (`sunset`, 17:00 - 18:30) hoặc ban ngày (`day`, 06:00 - 17:00).
   - Bổ sung nút bấm `⏱️ Auto` trên Topbar cạnh các nút chỉnh tay (☀️ / 🌆 / 🌙).
   - `StatusBar.tsx` hiển thị thời tiết chính xác và đồng hồ thời gian thực (`HH:mm:ss`), loại bỏ class `hidden xl:flex` để hiển thị mượt mà trên mọi kích cỡ màn hình.
5. **Tối ưu vị trí LiveStreamConsole:** Trên màn hình di động, console hiển thị ở nửa trên màn hình (`top-14 left-2 right-2`), không còn đè lên thanh điều hướng trạm và telemetry ở đáy.

---

## 20. Sự cố 20: Lỗi bố cục Cổng Phê Duyệt Production (Tab bị cắt cụt ở cạnh phải & Thẻ trạm Reviewer chiếm trọn màn hình đè mất các trạm còn lại)

### 🔴 Triệu chứng (Symptom)
1. **Thanh Tab điều hướng bị cắt ngang mép phải (`Unit T...`):** 8 tab điều hướng có nhãn quá dài gắn tên file cụ thể (`Code Dev (oauth.service.ts)`, `Review (ReviewComments.json)`, `Unit Tests (test-suite.spec.ts)`...), chiều rộng vượt quá 1200px; class `no-scrollbar` làm ẩn thanh cuộn khiến người dùng không biết bên phải còn 3 tab khác (`Security`, `Canary`, `PRD`).
2. **Khối chi tiết của trạm Reviewer mở bung đè mất 3 trạm còn lại:** Biến `expandedStation` khởi tạo mặc định là `'review'`, mở sẵn khung code JSON chiếm trọn hơn 300px chiều dọc; đẩy toàn bộ các trạm khác (Dev, QA, DevSecOps) xuống dưới đáy màn hình, người dùng lầm tưởng modal chỉ có mỗi 1 trạm.
3. **Tiêu đề danh sách trạm bị chèn ép:** Dòng tiêu đề và gợi ý nằm chung một hàng flex, chữ sát rạt mép phải trên màn hình hẹp.

### 🔍 Nguyên nhân gốc rễ (Root Cause)
1. Đặt nhãn tab quá dài và lạm dụng `no-scrollbar` mà không có nút cuộn hoặc chỉ báo trực quan.
2. Thiết lập trạng thái ban đầu của Accordion là mở bung thay vì đóng gọn gàng (`null`).
3. Khung preview code trong accordion chiếm chiều cao quá lớn (`max-h-48`) thay vì giới hạn nhỏ gọn trong modal duyệt.

### ✅ Giải pháp chuẩn hóa (Solution & Prevention)
1. **Tinh gọn nhãn Tab & Thêm điều khiển cuộn (`ApprovalModal.tsx`):**
   - Đổi nhãn 8 tab ngắn gọn: `📋 Tiêu chuẩn`, `🚀 CI/CD Canary`, `💻 Mã nguồn Dev`, `🔍 Tech Review`, `🧪 QA Tests`, `🛡️ Security Audit`, `📦 Dockerfile`, `📄 PRD Specs`.
   - Bổ sung 2 nút mũi tên cuộn ngang `‹` `›` và thanh cuộn mỏng tinh tế (`scrollbar-thin`).
2. **Mặc định đóng gọn Accordion (`expandedStation: null`):**
   - Đưa cả 4 trạm chuẩn bị release (Dev, Review, QA, Security) hiển thị đồng thời trong 1 khung nhìn (viewport), không ai bị đẩy mất khỏi tầm mắt.
   - Khi bấm mở trạm, khung code giới hạn `max-h-36 sm:max-h-40`, chuyển tên file lên thanh công cụ thay vì đè lên code.
3. **Tối ưu Section Header & Độ rộng Modal:**
   - Dùng `flex-col sm:flex-row` chống ép chữ và mở rộng chiều ngang modal lên `max-w-4xl xl:max-w-5xl`.

---

## 21. Sự cố 21: Nhấp chọn trạm AI bị pop-up Modal toàn màn hình che mất không gian 3D; Camera focus nhưng người dùng không thấy được trạm và nhân vật đang làm việc

### 🔴 Triệu chứng (Symptom)
- Khi người dùng bấm vào một trạm AI (ví dụ: Dev, PM, QA, hay Lâu đài Claude Code), dù hệ thống có cơ chế bay camera 3D (`cameraTarget`, `cameraZoom`), người dùng hoàn toàn không nhìn thấy được trạm đó vì một cửa sổ Modal to đùng ở chính giữa màn hình (`AgentDossierModal` hoặc `ArtifactModal`) lập tức bật lên kèm lớp nền phủ mờ xám đen che kín toàn bộ hòn đảo (`bg-slate-950/80 backdrop-blur-md`).
- Trải nghiệm bị gián đoạn, biến một game mô phỏng DevOps 3D tương tác sống động thành ứng dụng web truyền thống đơn điệu.

### 🔍 Nguyên nhân gốc rễ (Root Cause)
1. **Mặc định ép mở Center Modal trong Store:** Hàm `selectAgent(role, modalMode = 'dossier')` trong `useTownStore.ts` mặc định kích hoạt cờ `isDossierModalOpen = true` bất cứ khi nào nhận được một `role`.
2. **Cấu trúc Modal chiếm dụng toàn màn hình (Blocking Backdrop):** Cả `AgentDossierModal.tsx` và `ArtifactModal.tsx` đều có layout `fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm`, phong tỏa mọi tương tác 3D và phủ đen hoàn toàn khung nhìn.
3. **Thiếu thành phần Inspector Panel chuẩn game chiến thuật (RTS / City-Builder):** Thiếu một ngăn thanh tra đặt bên cạnh màn hình (Side Panel) cho phép vừa xem mã nguồn, vừa quan sát được camera đang zoom cận cảnh vào nhân vật đang gõ bàn phím và các đường cáp quang đang phát sáng.

### ✅ Giải pháp chuẩn hóa (Solution & Prevention)
1. **Xây dựng `StationInspectorPanel.tsx` chuẩn Game RTS:**
   - Đặt cố định ở cạnh phải màn hình (`fixed top-14 sm:top-16 right-2 sm:right-3 bottom-11 sm:bottom-12 z-30 w-[420px] max-w-[calc(100vw-16px)] pointer-events-auto`).
   - Tuyệt đối **không dùng backdrop che mờ toàn màn hình**, giữ trọn 65-75% diện tích màn hình cho không gian 3D hoạt động mượt 60fps.
   - Tích hợp 3 Tab chuyên sâu: 💻 Mã nguồn (hỗ trợ `GitDiffViewer` Unified & Split view cho Dev, Review Comments trực quan cho Tech Review), 📝 Quy trình SOP & System Prompt chỉnh sửa lưu trực tiếp, 📊 Chỉ số Telemetry & Tọa độ 3D.
   - Hỗ trợ thanh điều hướng 8 trạm ở chân bảng (Carousel Strip) kèm phím tắt `Escape` và nút đóng `✕` để khép panel và tự động zoom camera trở lại toàn cảnh đảo trung tâm `[0, 0, 0]`.
2. **Đổi mặc định `selectAgent(role, modalMode = 'none')`:**
   - Mọi tương tác click vào công trình (`Building.tsx`), lâu đài (`Castle.tsx`), nhân vật (`Character.tsx`), bong bóng thoại (`Labels.tsx`), thẻ trạm (`RoleChips.tsx`) hay công việc (`MilestoneWidget.tsx`) đều chuyển sang chế độ RTS Game: Camera bay tới trạm và mở bảng Inspector bên cạnh.
   - Vẫn giữ nút "⛶ Toàn màn hình" trên Inspector Panel nếu người dùng chủ động muốn phóng to dạng modal truyền thống.

---

## 22. Sự cố 22: Nhấp chọn nhân vật/trạm bị crash giao diện (`Minified React error #310` / "This page couldn't load") do vi phạm React Rules of Hooks

### 🔴 Triệu chứng (Symptom)
- Khi người dùng bấm vào bất kỳ nhân vật hoặc trạm nào trên giao diện 3D hoặc thanh điều hướng dock:
  - Trước khi có `src/app/error.tsx`: toàn bộ cây React root bị sập khiến Chromium hiển thị trang lỗi hệ thống `⚠️ This page couldn't load. Reload to try again, or go back.`
  - Sau khi bổ sung `src/app/error.tsx`: Error Boundary bắt được chính xác mã lỗi gốc `Minified React error #310` (*"Rendered more hooks than during the previous render"*).
- Ngoài ra, khi chế độ `isAutoFollow` đang bật mặc định, ngay sau khi bấm chọn một trạm để focus camera, mỗi khi có Shipper chạy ngang (`couriers.length > 0`) camera lại bị kéo trôi khỏi trạm đang xem.

### 🔍 Nguyên nhân gốc rễ (Root Cause)
1. **Gọi React Hook (`useMemo`) phía sau câu lệnh `return null` sớm (`StationInspectorPanel.tsx`):**
   - Trong `StationInspectorPanel.tsx`, các hook từ dòng 42–90 (28 hooks) chạy trước khối kiểm tra điều kiện `if (!selectedAgentRole || isApprovalModalOpen || ...) return null;` ở dòng 93–103.
   - Tuy nhiên, ở dòng 119 phía dưới câu lệnh `return null` lại có thêm lời gọi hook thứ 29: `const reviewData = useMemo(...)`.
   - Khi mới vào trang (`selectedAgentRole === null`), React ghi nhận component chỉ có **28 hooks**. Ngay khoảnh khắc người dùng click chọn bất kỳ nhân vật nào (`selectedAgentRole !== null`), luồng thực thi vượt qua dòng 103 và gọi thêm `useMemo` (**29 hooks**), vi phạm trực diện Rules of Hooks và ném lỗi `Minified React error #310`.
2. **Lỗi logic phụ trong `reviewData` & `CameraRig`:**
   - `reviewData` trước đó kiểm tra `if (selectedAgentRole !== 'review') return null;`, dẫn đến khi mở trạm `dev`, `GitDiffViewer` không bao giờ nhận được danh sách inline `reviewComments` từ trạm Tech Review.
   - Trong `CameraRig.tsx`, khối `if (isAutoFollow && !isUserInteracting.current)` ưu tiên bám theo `couriers[0]` ngay cả khi `selectedAgentRole` đang khác `null`.
3. **Thiếu Error Boundary cấp ứng dụng (`src/app/error.tsx`) & import chéo hằng số giữa các UI Modal:**
   - Thiếu `error.tsx` làm lỗi client unmount toàn bộ trang thay vì hiện thông báo lỗi rõ ràng; hằng số `AGENT_TECH_STACK` / `ARTIFACT_PREVIEWS` đặt rải rác trong các file modal `.tsx`.

### ✅ Giải pháp chuẩn hóa (Solution & Prevention)
1. **Đưa toàn bộ Hooks lên trước mọi câu lệnh `return` sớm (`StationInspectorPanel.tsx`) & Kiểm định toàn bộ `src/` bằng TypeScript AST:**
   - Đưa `useMemo` phân tích `reviewData` lên phía trên khối `if (!selectedAgentRole || ...) return null;`, đồng thời đọc trực tiếp dữ liệu từ artifact của trạm `review` để cả trạm `review` (thẻ đánh giá) lẫn trạm `dev` (`GitDiffViewer` inline comments) đều hiển thị chuẩn xác.
   - Chạy kiểm định AST trên toàn bộ file `.ts`/`.tsx` trong `src/` xác nhận 0 vi phạm `[HOOK AFTER RETURN]` và 0 `[CONDITIONAL HOOK]`.
2. **Khóa giữ tiêu điểm Camera khi đang chọn nhân vật (`CameraRig.tsx`):**
   - Cập nhật điều kiện Auto-Follow thành `if (isAutoFollow && !selectedAgentRole && !isUserInteracting.current)` để khi người dùng click chọn nhân vật, camera giữ vững góc cận cảnh tại trạm đó cho tới khi đóng bảng thanh tra (`Esc` hoặc `✕`).
3. **Tách hằng số sang `src/lib/pipeline/contracts.ts` & Bổ sung `src/app/error.tsx`:**
   - Lưu trữ tập trung `AGENT_TECH_STACK` và `ARTIFACT_PREVIEWS` tại `contracts.ts` và duy trì `error.tsx` làm chốt chặn an toàn cho Next.js App Router.

---

## 23. Sự cố 23: Vỡ bố cục khi xem trên điện thoại di động (Oppo A55 360×800 / iPhone 16 Pro Max 430×932) & khi thu nhỏ cửa sổ

### 🔴 Triệu chứng (Symptom)
- Khi xem ở kích thước màn hình smartphone (Oppo A55 360×800, iPhone 16 Pro Max 430×932) hoặc thu nhỏ cửa sổ:
  1. **Topbar:** Logo và nút "Giao việc AI" quá to chiếm hết 230px, đẩy toàn bộ thanh công cụ bên phải (`Voice`, `Desk Cam`, `Chaos`, `Báo cáo`, `Nhật ký`) tràn mất ra khỏi màn hình.
  2. **Widget Tổng quan:** Chiếm hơn 45% chiều cao màn hình (360px), che kín nửa trên của đảo 3D và đè lên Hub Claude Code, trạm PM, trạm Dev.
  3. **Thanh Dock (RoleChips) & Telemetry (StatusBar):** Tạo thành 2 tầng chiếm 150px chiều cao ở đáy; nút trạm bị cắt cụt ngoài màn hình; phím zoom `+ - Reset` thừa thãi trên màn hình cảm ứng vốn đã có pinch-to-zoom 2 ngón tay.
  4. **Cổng Phê Duyệt Production (ApprovalModal):**
     - Nút "🔭 Bay tới trạm 3D" bị ép hẹp rớt thành 4 dòng (`Bay / tới / trạm / 3D`).
     - Nhãn địa danh dài `Software Engineering Lab (Chính Tây)` rớt thành 3 dòng làm thẻ trạm phình to gấp đôi.
     - 2 trạm còn lại (`QA · Test` và `DevSecOps`) bị đẩy tụt mất hoàn toàn khỏi màn hình.

### 🔍 Nguyên nhân gốc rễ (Root Cause)
1. **Mật độ thông tin dành cho Desktop:** Các thành phần UI hiển thị đầy đủ text dài và bento box cồng kềnh, không có biến thể thu gọn (compact mode / mini pill) riêng cho viewport `< 640px`.
2. **Cụm phím Zoom cơ học không cần thiết trên Mobile:** OrbitControls đã hỗ trợ pinch-to-zoom đa điểm, việc để thêm 3 nút `+ - Reset` làm vỡ layout 2 tầng ở đáy.
3. **Thẻ trạm trong Modal không giới hạn độ dài:** Thiếu `hidden sm:inline` cho các nhãn phụ và nút bấm chữ dài.

### ✅ Giải pháp chuẩn hóa (Solution & Prevention)
1. **Chế độ Mini Pill cho Widget Tổng quan (`MilestoneWidget.tsx`):**
   - Trên mobile `< 640px`, tự động thu gọn widget thành 1 pill badge nhỏ gọn `[📊 Tổng quan · 1 chạy ▾]`, chỉ chiếm 32px ở góc trái thay vì 360px. Chạm vào mới mở rộng xem chi tiết.
2. **Chế độ Icon Dock cho Thanh trạm (`RoleChips.tsx`):**
   - Trên mobile, ẩn text dài, hiển thị 8 icon trạm `[🎛️ 🏢 🛠️ 🔍 🧪 🛡️ 🚀 📡]` kèm chấm trạng thái. Toàn bộ 8 trạm nằm gọn trong 284px, vừa vặn hoàn hảo trên màn hình 360px của Oppo A55 mà không cần cuộn.
3. **Ẩn nút Zoom cơ học trên Mobile & Gọn hóa Telemetry (`StatusBar.tsx`):**
   - Ẩn cụm `+ - Reset` trên mobile (`hidden sm:flex`), chỉ hiển thị dòng trạng thái gọn nhẹ `bottom-12 right-2`.
4. **Tối ưu thẻ trạm trong Cổng Duyệt Production (`ApprovalModal.tsx`):**
   - Rút gọn nút thành icon `🔭` trên mobile (`hidden sm:inline` cho chữ "Bay tới trạm 3D").
   - Ẩn nhãn địa danh dài dòng (`📍 Software Engineering Lab...`), giảm chiều cao thẻ xuống ~44px, hiển thị đầy đủ 4/4 trạm trên một màn hình điện thoại mà không cần cuộn.
5. **Tinh giản Topbar cho Mobile (`Topbar.tsx`):**
   - Thu nhỏ logo còn icon `🏢` và nút `✨ AI` gọn gàng, chừa hơn 255px cho thanh công cụ bên phải cuộn mượt mà.

---

## 24. Sự cố 24: Rò rỉ Google Gemini API Key lên GitHub công khai qua file script test tạm thời (`scripts/test_models.js`)

### 🔴 Triệu chứng (Symptom)
- Hệ thống giám sát bảo mật **GitGuardian** gửi email cảnh báo tự động:
  - *"[dinhanhhhh/agent-town-3d] Google API Key exposed on GitHub"*
  - Secret type: `Google API Key` (`AIzaSy...bkU`)
  - Vị trí: commit `e6a9673` (`feat: upgrade to v1.3.0...`) tại file `scripts/test_models.js`.

### 🔍 Nguyên nhân gốc rễ (Root Cause)
1. **Hardcode secret vào file script kiểm thử tạm thời:**
   - Khi viết script kiểm tra kết nối các model Gemini (`gemini-2.5-flash`, `gemini-flash-latest`), API key thật được gán cứng trực tiếp vào biến `const key = 'AIzaSy...'` thay vì đọc qua biến môi trường hoặc nhập từ UI.
2. **Cấu hình `.gitignore` bị hổng đối với thư mục scripts:**
   - File `.gitignore` chỉ chặn `.env` và `.env*.local`, hoàn toàn chưa chặn thư mục `scripts/` hoặc các file script `test_*.js`.
3. **Stage commit diện rộng (`git add .`) không có pre-commit scan:**
   - Khi đóng gói commit lớn `e6a9673` (72 files), file `scripts/test_models.js` đã bị quét chung vào commit mà không qua bước kiểm tra secret. Dù toàn bộ mã nguồn `src/` lưu key an toàn trong Client LocalStorage, sự xuất hiện của file test này đã làm lộ secret.

### ✅ Giải pháp chuẩn hóa (Solution & Prevention)
1. **Thu hồi và vô hiệu hóa key cũ tại nhà cung cấp (Khẩn cấp & Triệt để):**
   - Xóa bỏ/Revoke vĩnh viễn key bị lộ trên bảng điều khiển **Google AI Studio** / Google Cloud Console để triệt tiêu mọi khả năng lạm dụng từ commit history cũ.
2. **Xóa hoàn toàn file test và chuẩn hóa `.gitignore`:**
   - Xóa vĩnh viễn file `scripts/test_models.js` khỏi repository bằng `git rm`.
   - Bổ sung quy tắc vào `.gitignore`:
     ```gitignore
     # local test scripts & scratch
     scripts/test_*.js
     scripts/temp_*.js
     *.secret
     *.key
     ```
3. **Quét kiểm toán toàn bộ codebase:**
   - Chạy quét toàn diện regex các mẫu secret Google (`AIza[0-9A-Za-z_-]{35}`) và DeepSeek/OpenAI (`sk-[0-9A-Za-z_-]{20,}`) trên toàn bộ cây thư mục để đảm bảo không còn bất kỳ secret nào hardcode.

---

## 25. Sự cố 25: Bong bóng thoại 3D đè nát nhãn trạm (Double-Header Collision); Icon Dev Next.js che nút Hub; Lệch số thứ tự Dock/Phím tắt (0 vs 1) và Cáp quang neon chìm dưới lòng đường (Z-Fighting)

### 🔴 Triệu chứng (Symptom)
1. **Va chạm bong bóng thoại & nhãn trạm 3D:** Tại trạm Release Eng (`devops`), bong bóng thoại ("Dừng tại cổng duyệt: Chờ Tech Lead duyệt release Production ⏳") có đuôi trỏ đâm thẳng vào chip nhãn `STATION 6 Release Eng`, gây đè chữ và che khuất cổng vào trạm. Cả 2 cùng hiển thị tên trạm thừa thãi.
2. **Icon Next.js che khuất thanh Dock:** Nút tròn màu đen chữ "N" (`devIndicators`) của Next.js nổi ở góc dưới bên trái, đè trực tiếp lên nút `Hub` trong `RoleChips`.
3. **Bất nhất số thứ tự và phím tắt điều hướng:**
   - Trên không gian 3D, các trạm đánh số từ 0: `HUB 0`, `STATION 1`, ..., `STATION 7`.
   - Dưới thanh Dock và hướng dẫn phím tắt lại hiển thị từ 1: `Hub 1`, `PM 2`, ..., `APM 8`. Người dùng bấm phím `1` lại focus vào Hub 0, bấm `2` lại focus vào Station 1, gây nhầm lẫn trầm trọng.
4. **Cáp quang neon chìm dưới lòng đường (Z-Fighting):** Cáp dữ liệu `DataCables.tsx` chạy ở cao độ $y = 0.028$, trong khi đá lát vỉa hè chạy ở $y = 0.024 - 0.035$, khiến hiệu ứng phát sáng neon và nhiệt lượng heatmap bị vùi lấp dưới nền đá.
5. **Bong bóng duyệt Release thiếu tương tác mở cổng:** Khi Release Eng dừng tại cổng duyệt, người dùng bấm vào bong bóng thoại chỉ chọn agent chứ không bật trực tiếp modal phê duyệt.

### 🔍 Nguyên nhân gốc rễ (Root Cause)
1. **Tọa độ nhãn 3D phụ thuộc vào `bubbleOffset`:** `Labels.tsx` tính cao độ nhãn bằng `bubbleOffset[1] - 0.65`. Khi `bubbleOffset` là $4.1\text{m}$, nhãn trôi lơ lửng ở cao độ $3.45\text{m}$ ngay dưới đít bong bóng thay vì gắn cố định trên nóc nhà trạm ($y = 2.45\text{m}$). Đồng thời khi bong bóng xuất hiện, nhãn trạm không được ẩn đi, dẫn đến hiển thị 2 tiêu đề đè lên nhau.
2. **Next.js mặc định bật Prerender Dev Indicator:** Trong chế độ phát triển, Next.js chèn component chỉ báo cố định ở góc dưới `bottom-left`, che các thành phần dock ở mép dưới màn hình.
3. **Chỉ số mảng `indexOf(role) + 1` không đồng bộ với kiến trúc 0-based:** RoleChips dùng `idx + 1` (1-8), trong khi hệ thống 3D coi Claude Hub là `Station 0` và 7 trạm chuyên môn là `Station 1..7`.
4. **Sai lệch cao độ render tầng lớp (Layer Elevation Z-Fighting):** Trục Y của cáp quang thấp hơn độ dày của các phiến đá lát đường `RoadMesh`.

### ✅ Giải pháp chuẩn hóa (Solution & Prevention)
1. **Tách biệt và neo cao độ chuẩn xác trong `Labels.tsx` & `layout.ts`:**
   - Nâng `devops.bubbleOffset` lên `[0, 4.8, 0]` để tạo khoảng thoáng trên cao.
   - Neo nhãn trạm `labelEl` cố định tại nóc nhà: `layout.position[1] + 2.45m`.
   - Thêm hiệu ứng tự động ẩn nhãn trạm (`opacity-0 scale-90 pointer-events-none`) khi bong bóng thoại đang hiển thị (`shouldShowBubble`), dọn sạch xung đột hiển thị.
   - Thêm tương tác mở `ApprovalModal` trực tiếp khi bấm vào bong bóng chờ duyệt của DevOps.
2. **Tắt Dev Indicator trong `next.config.mjs`:** Thêm `devIndicators: false` để thanh lọc hoàn toàn overlay góc dưới.
3. **Đồng bộ toàn diện hệ thống số thứ tự và phím tắt:**
   - Sửa thanh Dock `RoleChips.tsx`: hiển thị `Hub 0`, `PM 1`, `Dev 2`, ..., `APM 7`.
   - Cập nhật `Topbar.tsx` & `KeyboardShortcutsModal.tsx`: Phím `0` = Focus Hub 0 (hoặc toggle toàn cảnh), Phím `1..7` = Focus Station 1..7, Phím `8` = Đặt lại toàn cảnh.
4. **Nâng cao độ cáp quang và hạt photon pulse trong `DataCables.tsx`:**
   - Nâng rãnh cáp lên $y = 0.038$, dải sáng heatmap lên $y = 0.036$, và hạt xung dữ liệu lên $y = 0.052$, nổi hoàn toàn trên bề mặt đá lát đường ($y \le 0.035$).

---

## 26. Sự cố 26: Rung lắc nhãn 3D do CSS Transition xung đột 60fps; Crash React Error #31 (render Object Compliance) & Va chạm đè hàng thanh Dock với StatusBar

### 🔴 Triệu chứng (Symptom)
1. **Nhãn trạm 3D và bong bóng thoại bị rung lắc, giật cục khi xoay/di chuyển camera:** Khi người dùng xoay 360 độ hoặc lia camera qua lại, các thẻ nhãn trạm (`label-${role}`) rung bần bật, trễ giật và không bám sát đỉnh tòa nhà 3D. Đồng thời bong bóng DevSecOps bị kéo lệch 135px vào giữa đảo đè lên trạm QA/Hub.
2. **Crash toàn bộ ứng dụng với lỗi Minified React error #31:** Khi người dùng chọn trạm DevSecOps hoặc mở Station Inspector Panel, màn hình hiển thị trang lỗi "Đã xảy ra sự cố giao diện" với mã lỗi `Minified React error #31; args[] = object with keys {standard, status}`.
3. **Va chạm đè chồng giao diện mép dưới màn hình:** Trên màn hình laptop hoặc desktop có tỉ lệ thu phóng (1080p scaling 125%/150%), thanh Dock chọn trạm (`RoleChips`) dài 8 nút và thanh trạng thái SRE Telemetry (`StatusBar` kèm cụm Zoom `+ - Reset`) cùng nằm ở tầng đáy `bottom-3`, khiến nút `+ - Reset` đè trực tiếp lên 2 nút `Ops 6` và `APM 7` của thanh Dock.

### 🔍 Nguyên nhân gốc rễ (Root Cause)
1. **Xung đột giữa CSS Transition và cập nhật Transform 60fps:**
   - Thẻ `label-${role}` được gán class `transition-all duration-300`. Trong khi đó, `OverlayProjector` chạy trong `useFrame` (60fps) liên tục gán giá trị mới cho `style.transform = translate3d(...)`. Trình duyệt cố gắng nội suy chuyển động 300ms cho một giá trị thay đổi liên tục mỗi 16ms, gây ra hiện tượng rung lắc giật ngược (jittering/oscillation).
   - Thứ tự thực thi: `<OverlayProjector />` được đặt TRƯỚC `<CameraRig />` trong `TownScene.tsx`, khiến tọa độ chiếu bị trễ 1 frame so với vị trí camera thực tế.
   - Biên kẹp cứng `bubbleMarginX = 135` ép buộc bong bóng DevSecOps thụt lùi 135px vào tâm đảo khi trạm nằm gần cạnh phải màn hình.
2. **Vi phạm React Child Invariant (React Error #31):**
   - Trong `StationInspectorPanel.tsx`, mảng `securityData.compliance` chứa danh sách các object `{ standard: string, status: string }` sinh ra từ AI / Mock. Component thực hiện render trực tiếp `{item}` vào thẻ JSX `<span>✓ {item}</span>`. React từ chối render trực tiếp object và ném lỗi fatal error #31.
3. **Thiếu phân tầng hiển thị Responsive mép dưới:**
   - `RoleChips` và `StatusBar` đều đặt định vị tuyệt đối ở `bottom-3` trên màn hình `lg:`. Tổng chiều rộng 2 thanh vượt quá 1350px, dẫn đến việc trên màn hình dưới 1536px hai thanh đè nát lên nhau.

### ✅ Giải pháp chuẩn hóa (Solution & Prevention)
1. **Thanh lọc CSS Transition và đồng bộ thứ tự Frame:**
   - Xóa bỏ `transition-all duration-300` khỏi thẻ container gốc `label-${role}` có `translate3d`. Chỉ áp dụng transition opacity/scale trên thẻ con bên trong để hiệu ứng mờ nhạt không ảnh hưởng tới tọa độ di chuyển.
   - Đặt `<CameraRig />` TRƯỚC `<OverlayProjector />` trong `<Canvas>` và gán độ ưu tiên `useFrame(..., 1)` để đảm bảo ma trận camera được cập nhật hoàn chỉnh trước khi chiếu tọa độ 2D.
   - Bỏ kẹp lề cưỡng bức trên nhãn nóc nhà, nới lỏng biên kẹp bong bóng thoại (20px thay vì 135px) giúp bóng thoại luôn bám tự nhiên trên đỉnh trạm của mình.
2. **Defensive Parsing cho toàn bộ thuộc tính mảng:**
   - Trong `StationInspectorPanel.tsx`, kiểm tra kiểu dữ liệu của từng phần tử `compliance`: nếu là chuỗi thì hiển thị trực tiếp, nếu là object thì trích xuất `${item.standard} (${item.status})` hoặc serialize an toàn, tuyệt đối không bao giờ để object lọt vào React child.
   - Phòng ngừa tương tự cho `orchestratorData.technicalScope`.
3. **Hợp nhất thanh đáy vào Flexbox Container duy nhất (Single Unified Bottom HUD Bar):**
   - Loại bỏ hoàn toàn định vị `absolute` riêng lẻ trên `RoleChips` và `StatusBar`. Thay vào đó, gom cả hai vào container chung tại `src/app/page.tsx`:
     `<div className="absolute bottom-2 left-2 right-2 sm:bottom-3 sm:left-3 sm:right-3 z-30 pointer-events-none flex items-center justify-between gap-1.5 sm:gap-2.5">`
   - Cả hai thành phần luôn nằm trên **chính xác cùng một hàng ngang duy nhất (cùng baseline đáy)**, triệt tiêu hoàn toàn hiện tượng lệch tầng lơ lửng giữa trời.
   - `RoleChips` dùng `min-w-0 shrink overflow-x-auto scrollbar-none` (tự co giãn và cho phép vuốt cuộn khi màn hình hẹp), `StatusBar` dùng `shrink-0` cố định bên phải. Cơ chế Flexbox tự động bảo vệ hai cụm không bao giờ có thể đè lên nhau.
   - Đưa nút duyệt `⚠️ 1 duyệt` sang cụm cố định bên trái của `Topbar` để không bao giờ bị cuộn che khuất.

### ⚠️ Hồi quy (Regression) phát sinh từ các bước trước & bài học
- **Triệu chứng:** Canvas 3D trắng trơn, chỉ còn nhãn HTML trôi nổi; Thanh StatusBar bị đẩy lên `bottom-14` lơ lửng giữa trời trong khi Dock nằm ở đáy.
- **Root cause:** 
  1. Đã gán `useFrame(cb, 1)` cho `OverlayProjector`. Trong R3F, **bất kỳ `useFrame` nào có priority > 0 sẽ tắt auto-render** — R3F giao toàn quyền gọi `gl.render()` cho người dùng → không còn gì được vẽ.
  2. Dùng mẹo nâng `StatusBar` lên `bottom-14` thay vì giải quyết bằng cấu trúc Flexbox cha, khiến thanh bên phải bay lơ lửng trên không trung tạo khoảng trống vô nghĩa bên dưới.
- **Fix:** 
  1. Bỏ priority, đảm bảo thứ tự chạy bằng thứ tự mount (`<CameraRig />` đặt trước `<OverlayProjector />`).
  2. Bỏ `bottom-14`, đưa cả 2 component vào container cha Flexbox `justify-between items-center` duy nhất ở đáy màn hình.

---

> **Quy tắc vàng cho tương lai:**
> 1. Mọi đối tượng 3D đặt trên đảo phải tuân theo hệ tọa độ Radial Polar ($R, \theta$) với tâm là Lâu Đài $[0, 0]$.
> 2. Mọi đường đi của nhân vật phải bám theo các nan hoa đại lộ và vòng xuyến trung tâm, tuyệt đối không tự nối chéo qua góc các phòng.
> 3. Tuyệt đối không để container UI mở rộng tự do theo dữ liệu mà luôn cố định kích thước và dùng nội cuộn (`overflow-y-auto min-h-0`).
> 4. Màu số nguyên Three.js (`0x...`) luôn chuyển sang chuỗi hex CSS (`#...`) trước khi dùng trong React inline style.
> 5. Luôn chụp WebGL Canvas thông qua thuộc tính `gl={{ preserveDrawingBuffer: true }}` của Three.js Canvas để tránh màn hình đen khi trích xuất hình ảnh `toDataURL()`.
> 6. Mọi animation di chuyển giữa các trạm phải hoàn tất bàn giao hàng tại bàn làm việc trước khi kích hoạt logic xử lý tiếp theo của trạm đó.
> 7. Luôn tách biệt `Role SOP` (cho phép người dùng tùy biến trên UI Playground) khỏi `Output Contract` (JSON Schema / Git Diff + Speech Tag khóa cố định trên Server) để tránh làm vỡ bộ parser giao diện.
> 8. Với các biến trạng thái tích lũy bên trong hàm lặp stream/closure, sử dụng **Object Wrapper Container** (`captureBox`) để giữ trọn vẹn type-safety thay vì ép kiểu lỏng lẻo.
> 9. Mọi lệnh Rollback hoặc Hủy phải đồng bộ dọn sạch Approval Queue và cờ `isRealRunning` để không làm treo trạng thái hệ thống.
> 10. Tuyệt đối không chèn số liệu giả hoặc nhãn tĩnh vào giao diện; nếu là mô phỏng phải ghi chú rõ ràng, nếu là đo lường phải dùng API đo lường thực tế (`requestAnimationFrame`, trích xuất artifact).
> 11. Các thành phần 2D overlay chiếu từ không gian 3D bắt buộc phải được kẹp biên viewport (`Math.max` / `Math.min`) để không bao giờ bị cắt cụt ngoài màn hình trên thiết bị di động.
> 12. Tuyệt đối tuân thủ **React Rules of Hooks**: 100% lời gọi hook (`useState`, `useEffect`, `useMemo`, `useCallback`, `useRef`, `useFrame`, Zustand `useTownStore`) BẮT BUỘC phải đặt ở cấp cao nhất phía TRƯỚC mọi câu lệnh early return (`if (...) return null;`), tuyệt đối không đặt hook sau `return` hoặc trong nhánh điều kiện/vòng lặp. Hằng số dữ liệu thuần túy tách riêng vào `src/lib/...`.
> 13. Khi thiết kế thanh công cụ đa nút (Topbar, Dock), tuyệt đối không lạm dụng nhãn text cố định; luôn cấu hình container có `overflow-x-auto scrollbar-none`, ưu tiên icon kèm tooltip và kẹp chặn tỉ lệ thu phóng 3D (`responsiveScale` tối thiểu 0.70-0.75) để không làm teo nhỏ không gian 3D trên màn hình hẹp/dọc.
> 14. **Tuyệt đối không hardcode API Key / Secret vào bất kỳ file nào**, kể cả file script test tạm thời (`scripts/`, `tests/`). Mọi secret thử nghiệm bắt buộc phải nạp qua biến môi trường hoặc nhập từ Client UI; mọi file script cá nhân phải có tiền tố `test_*` hoặc `temp_*` đã được chặn nghiêm ngặt trong `.gitignore` trước khi commit.
> 15. **Hệ thống nhãn & bong bóng 3D phải phân tầng cao độ rõ ràng và tránh hiển thị kép (No Double-Header):** Nhãn trạm cố định phải neo theo nóc phòng ban ($y = 2.45\text{m}$), bong bóng động phải ở tầng trên cao ($y \ge 4.2\text{m}$). Khi bong bóng xuất hiện, phải tự động làm mờ nhãn trạm để tránh đè chữ. Số thứ tự hiển thị trên thanh Dock và phím tắt bàn phím phải tuyệt đối trùng khớp với nhãn 3D (`Hub 0`, `Station 1..7`). Mọi dải neon / cáp quang trên mặt đất phải có cao độ $y$ cao hơn mặt đá đường để tránh hiện tượng nhấp nháy z-fighting.
> 16. **Tuyệt đối cấm gán CSS `transition` lên thuộc tính `transform` của các phần tử DOM được cập nhật liên tục 60fps từ Three.js `useFrame`:** Bất kỳ hiệu ứng chuyển cảnh mờ nhạt hay co giãn nào (`opacity`, `scale`) BẮT BUỘC phải đặt trên phần tử con bên trong. Mọi biến dữ liệu mảng nhận từ AI khi render ra JSX BẮT BUỘC phải qua hàm bảo vệ phòng thủ (Defensive Stringifier), tuyệt đối không render trực tiếp `{item}` để tránh gây lỗi sập toàn cục `Minified React error #31`. Mọi thanh công cụ cố định mép dưới phải được phân tầng cao độ rõ rệt (`bottom-2` vs `bottom-14`) trên màn hình máy tính thông dụng (< 1536px).
> 17. **Không bao giờ truyền priority > 0 cho `useFrame` trong R3F** trừ khi chủ động tự gọi `gl.render()` — nếu không canvas sẽ trắng. Muốn đảm bảo thứ tự giữa các `useFrame`, dùng thứ tự mount component.
