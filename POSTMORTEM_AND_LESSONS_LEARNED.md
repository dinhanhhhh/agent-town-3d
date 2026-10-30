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

> **Quy tắc vàng cho tương lai:**
> 1. Mọi đối tượng 3D đặt trên đảo phải tuân theo hệ tọa độ Radial Polar ($R, \theta$) với tâm là Lâu Đài $[0, 0]$.
> 2. Mọi đường đi của nhân vật phải bám theo các nan hoa đại lộ và vòng xuyến trung tâm, tuyệt đối không tự nối chéo qua góc các phòng.
> 3. Tuyệt đối không để container UI mở rộng tự do theo dữ liệu mà luôn cố định kích thước và dùng nội cuộn (`overflow-y-auto min-h-0`).
> 4. Màu số nguyên Three.js (`0x...`) luôn chuyển sang chuỗi hex CSS (`#...`) trước khi dùng trong React inline style.
> 5. Luôn chụp WebGL Canvas thông qua thuộc tính `gl={{ preserveDrawingBuffer: true }}` của Three.js Canvas để tránh màn hình đen khi trích xuất hình ảnh `toDataURL()`.
