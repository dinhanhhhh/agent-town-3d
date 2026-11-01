# 📜 CHANGELOG (NHẬT KÝ THAY ĐỔI & PHIÊN BẢN)

Tất cả các thay đổi đáng chú ý của dự án **Agent Town 3D** sẽ được lưu vết chi tiết tại tài liệu này theo chuẩn [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [v1.5.1] - 2026-11-01
### 🎮 Trải Nghiệm Thanh Tra Trạm Chuẩn Game RTS (Game-Style Station Inspector & Camera Focus)
- **Trình Thanh Tra Cạnh Bên Không Phong Tỏa Màn Hình (`src/components/ui/StationInspectorPanel.tsx`, `src/app/page.tsx`)**:
  - Chuyển đổi toàn bộ cơ chế xem thông tin trạm từ dạng pop-up Modal toàn màn hình có nền xám đen che phủ (`backdrop-blur-md`) sang **Ngăn Thanh Tra Cạnh Phải (Station Inspector Side Panel)** chuẩn game chiến thuật thời gian thực (RTS / City-Builder):
    - Đặt cố định ở cạnh phải (`w-[420px] max-w-[calc(100vw-16px)]`), không dùng lớp phủ tối, giữ trọn vẹn 65-75% diện tích màn hình để người dùng vừa xem mã nguồn vừa quan sát camera 3D zoom cận cảnh vào nhân vật đang làm việc và hệ thống cáp quang đang phát sáng.
    - Viền phát sáng neon cá nhân hóa theo màu sắc nhận diện của từng phòng ban (`hexColor`), huy hiệu trạng thái nhấp nháy, phát ngôn AI thời gian thực (`agent.speech`) và thanh tiến trình streaming live.
    - Thanh điều hướng trạm nhanh 8 phòng ban ở chân bảng (Station Carousel Strip) kèm nút chuyển `‹ Trước` `Sau ›` và phím tắt `Escape` cho phép bay camera lướt quanh toàn bộ hòn đảo mượt mà.
  - Tích hợp 3 Tab chuyên sâu:
    - 💻 **Mã nguồn / Artifact**: Tích hợp `GitDiffViewer` (chế độ Unified & Split view) cho Dev Lab, thẻ kết quả kèm bình luận trực tiếp cho Tech Review, và khung hiển thị code/JSON có định dạng sắc nét.
    - 📝 **Quy trình SOP & System Prompt**: Hiển thị SOP vai trò phòng ban và khung soạn thảo System Prompt cho phép chỉnh sửa, lưu trực tiếp (`updateAgentSystemPrompt`) hoặc khôi phục về mặc định (`resetAgentSystemPrompt`).
    - 📊 **Chỉ số Telemetry & Tọa độ 3D**: Trực quan hóa danh mục Tech Stack chuyên môn, tọa độ $[X, Y, Z]$, góc xoay hướng tâm và vị trí trạm trong chuỗi DAG.
- **Tối Ưu Chuyển Động Camera Hướng Tâm (`src/store/useTownStore.ts`, `src/components/scene/Labels.tsx`, `src/components/ui/RoleChips.tsx`, `src/components/ui/MilestoneWidget.tsx`)**:
  - Đổi chế độ mặc định của hàm `selectAgent(role, modalMode = 'none')`: nhấp vào bất kỳ công trình 3D (`Building.tsx`), Lâu đài (`Castle.tsx`), nhân vật (`Character.tsx`), bong bóng thoại (`Labels.tsx`), thẻ trạm (`RoleChips.tsx`) hay công việc (`MilestoneWidget.tsx`) đều kích hoạt camera bay mượt mà đến trạm và trượt mở bảng Inspector bên cạnh.
  - Vẫn duy trì nút phóng to "⛶ Toàn màn hình" trên thanh công cụ của Inspector Panel cho người dùng khi có nhu cầu xem chi tiết dạng modal to truyền thống.
### 🛠️ Sửa Lỗi Triệt Để (Bug Fixes)
- **Tối ưu hóa Bố cục Responsive & Chống Tràn Giao diện khi thu nhỏ cửa sổ (`Topbar.tsx`, `RoleChips.tsx`, `StatusBar.tsx`, `Labels.tsx`, `CameraRig.tsx`)**:
  - Topbar: loại bỏ nhãn text thừa trên các nút toggle, thêm `overflow-x-auto scrollbar-none` và giới hạn bề rộng an toàn, đảm bảo mọi nút chức năng (`Voice`, `Desk Cam`, `Chaos`, `Báo cáo`, `Nhật ký`) luôn hiển thị đầy đủ và không bị chém cụt.
  - Dock chọn trạm: tinh gọn nhãn thành `Hub`, `PM`, `Dev`, `Review`, `QA`, `Sec`, `Ops`, `APM` kèm `touch-pan-x`, toàn bộ 8 trạm nằm gọn gàng trong 460px không bị cắt cụt.
  - Telemetry & Zoom: đưa StatusBar sát dock (`bottom-11 sm:bottom-12`) với kích thước phím zoom và chỉ số tinh gọn, không còn rớt dòng lơ lửng giữa màn hình 3D.
  - Bong bóng thoại: hạ `bubbleOffset` (Release Eng xuống 4.1, APM Monitor xuống 4.8), giới hạn tối đa 2 dòng `line-clamp-2` và max-width gọn gàng, chấm dứt hoàn toàn tình trạng che khuất tâm đảo và đè mất nhãn trạm lân cận.
  - Tỉ lệ Camera: kẹp chặn `responsiveScale` tối thiểu 0.72 (thay vì 0.45), giữ đảo luôn chiếm 70-85% khung nhìn, không còn bị thu teo nhỏ để lại khoảng trống trời xanh quá rộng.
- **Khắc phục triệt để lỗi `Minified React error #310` khi nhấp chọn nhân vật/trạm (`StationInspectorPanel.tsx`, `CameraRig.tsx`)**:
  - Đưa hook `useMemo` phân tích `reviewData` lên phía trước câu lệnh early `return null;` trong [`StationInspectorPanel.tsx`](file:///c:/Users/Admin/Documents/CV_Truong%20Dinh%20Anh/Ph%E1%BB%8Fng%20v%E1%BA%A5n/agent-town-3d/src/components/ui/StationInspectorPanel.tsx), đảm bảo số lượng và thứ tự gọi React Hooks bất biến giữa các lần render khi `selectedAgentRole` chuyển đổi giữa `null` và các phòng ban, đồng thời liên thông bình luận review sang `GitDiffViewer` của trạm Dev.
  - Khóa tiêu điểm camera trong [`CameraRig.tsx`](file:///c:/Users/Admin/Documents/CV_Truong%20Dinh%20Anh/Ph%E1%BB%8Fng%20v%E1%BA%A5n/agent-town-3d/src/components/scene/CameraRig.tsx) khi người dùng đang chọn một nhân vật (`!selectedAgentRole`), không để chế độ Auto-Follow tự ý kéo camera theo Shipper đang chạy.
  - Tách dữ liệu hằng số thuần túy sang [`src/lib/pipeline/contracts.ts`](file:///c:/Users/Admin/Documents/CV_Truong%20Dinh%20Anh/Ph%E1%BB%8Fng%20v%E1%BA%A5n/agent-town-3d/src/lib/pipeline/contracts.ts) và bổ sung Error Boundary [`src/app/error.tsx`](file:///c:/Users/Admin/Documents/CV_Truong%20Dinh%20Anh/Ph%E1%BB%8Fng%20v%E1%BA%A5n/agent-town-3d/src/app/error.tsx).

---

## [v1.5.0] - 2026-11-01
### 🚀 Tính năng Mới & Đột Phá Trải Nghiệm (Voice, Multi-Model, CCTV & CI/CD Gate)
- **Giọng Nói Trí Tuệ Nhân Tạo Thời Gian Thực (Web Speech API AI Voice TTS - `src/lib/audio/voice.ts`)**:
  - Tích hợp bộ tổng hợp giọng nói trực tiếp từ trình duyệt (`window.speechSynthesis`) với hồ sơ ngữ điệu tùy biến riêng cho 8 AI Agents.
  - Tự động lọc sạch ký tự Markdown, URLs và thẻ `---SPEECH---:`, duy trì hàng đợi phát âm (Audio Queue) mượt mà tránh đè tiếng.
  - Hỗ trợ công tắc bật/tắt `🗣️ Voice On / 🔇 Voice` trên thanh công cụ Topbar; tự động chọn giọng tiếng Việt hoặc fallback an toàn sang giọng mặc định hệ thống.
- **Bản Đồ Nhiệt Cáp Quang Dữ Liệu & Gia Tốc Xung Photon Động (`src/components/scene/DataCables.tsx`)**:
  - Nâng cấp 7 tuyến cáp quang neon thành hệ thống Heatmap phản ứng nhạy bén theo trạng thái thực thi của từng trạm và tải lượng hệ thống:
    - Trạng thái bình thường/sẵn sàng: Xanh Cyan (`#00f0ff`).
    - Trạng thái đang chạy pipeline tải cao: Vàng Hổ phách (`#f59e0b`).
    - Trạng thái bão tải Chaos Engineering / Lỗi: Đỏ cảnh báo khẩn cấp (`#ef4444`).
  - Hạt xung dữ liệu (Photon Pulse) tự động tăng tốc độ truyền tải tỷ lệ thuận với chỉ số TPS và tải lượng CPU.
- **Kiến trúc Đa Mô hình Hybrid Gemini 3.8 Flash & DeepSeek V3 (`src/app/api/pipeline/route.ts`, `src/store/useTownStore.ts`, `src/components/ui/ApiKeyModal.tsx`, `src/components/ui/ArtifactModal.tsx`, `src/components/ui/ExportModal.tsx`)**:
  - Hỗ trợ độc lập 2 loại API Key: Google Gemini API (`AIzaSy...`) và DeepSeek API (`sk-...`) lưu trữ cục bộ trên trình duyệt máy khách (LocalStorage).
  - Cho phép gán Model Provider linh hoạt cho từng phòng ban (`⚡ Tự động`, `♊ Gemini Flash`, `🐋 DeepSeek V3`) ngay trên AI Playground của `ArtifactModal`.
  - Phân luồng suy luận thông minh ở Server: tự động ghi nhận chính xác tên model được giải quyết (dynamic model resolution) và thống kê FinOps chuẩn xác trong `ExportModal`.
- **Ma trận Kiểm thử CI/CD & Cổng Khẩn Cấp Rollback Gate (`src/components/ui/ApprovalModal.tsx`, `src/store/useTownStore.ts`)**:
  - Mở rộng Cổng Phê Duyệt Triển Khai (`ApprovalModal`) với tab **🚀 CI/CD Matrix & Canary**:
    - Bảng ma trận kiểm thử Staging Matrix song song trên các môi trường Node 18 LTS, Node 20 LTS và Node 22 Current, liên kết số specs thực tế trích xuất từ test suite của QA.
    - Tiến trình phân phối tải Canary Rollout trực quan: 10% ➔ 50% ➔ 100% Traffic.
    - Nút **🚨 Emergency Rollback** khẩn cấp: Tức thời dọn sạch approval queue đang chờ, hủy pipeline dang dở, điều phối Shipper Rollback ngược từ trạm APM Monitor về Release Eng và bình ổn lại toàn bộ telemetry hệ thống.
- **Màn hình Giám Sát Bàn Làm Việc Nổi Desk Cam PiP (`src/components/ui/DeskCamPiP.tsx`, `src/app/page.tsx`, `src/components/ui/Topbar.tsx`)**:
  - Bổ sung cửa sổ CCTV Terminal thu nhỏ cố định ở góc trái màn hình với hiệu ứng CRT Scanlines cổ điển.
  - Hiển thị trực tiếp dòng mã đang stream theo thời gian thực của trạm đang hoạt động, tọa độ 3D và trạng thái sức khỏe trạm.
  - Tích hợp bộ đo FPS thực tế đo bằng `requestAnimationFrame`, thanh chuyển trạm nhanh/ghim camera, và nút bay Camera 3D trực tiếp tới trạm.
- **Hệ Thống Toast Notification Thông Minh & Tự Động Co Giãn (`src/components/ui/ToastContainer.tsx`)**:
  - Tự động xuất hiện thẻ thông báo góc màn hình khi có các sự kiện quan trọng (Cảnh báo bảo mật CVE, Test Suite QA, Cổng duyệt Production, Báo động đỏ bão tải SRE).
  - Thiết kế Frosted Glass Cyberpunk bo tròn 2xl, viền phát sáng neon theo mức độ cảnh báo, nút mở nhanh modal/nhật ký và thanh tiến trình đếm ngược 4.5s tự hủy.
  - Tối ưu 100% responsive: trên di động thẻ thông báo hiển thị ở đỉnh màn hình gọn gàng không che khuất thanh công cụ hay ốc đảo 3D.
- **Chu Kỳ Thời Gian Thực Tự Động & Đồng Hồ Số Telemetry (`src/components/ui/StatusBar.tsx`, `src/components/ui/Topbar.tsx`, `src/store/useTownStore.ts`)**:
  - Bổ sung chế độ `themeMode: 'auto'`, tự động nhận diện giờ thực tế của máy khách: Ban đêm (`night` 18:30 - 06:00), Hoàng hôn (`sunset` 17:00 - 18:30) hoặc Ban ngày (`day` 06:00 - 17:00).
  - Tự động chuyển màu bầu trời, thắp sáng lồng đèn vàng ấm, thả đom đóm lấp lánh và hiển thị thời tiết đêm thanh mát (`🌙 Đêm thanh mát · 18°C`) thay vì bị kẹt ở "Nắng nhẹ".
  - Thêm nút chuyển đổi `⏱️ Auto` trên Topbar cạnh các nút chỉnh tay (☀️ / 🌆 / 🌙) và tích hợp đồng hồ thời gian thực (`HH:mm:ss`) cập nhật từng giây trên thanh trạng thái.
  - Loại bỏ class `hidden xl:flex` trên `StatusBar.tsx`, đảm bảo thông tin thời tiết hiển thị đầy đủ và co giãn thông minh trên cả mobile, tablet và desktop.
- **Kẹp Biên Tọa Độ & Nâng Cấp Thẩm Mỹ Bong Bóng Thoại 3D (`src/components/scene/Labels.tsx`)**:
  - Kẹp biên tọa độ chiếu 2D (`clampedBx`, `clampedBy`), ngăn chặn triệt để tình trạng bong bóng thoại trôi ra ngoài viền màn hình di động gây tràn trang hoặc cắt cụt chữ.
  - Nâng cấp giao diện kính mờ với viền neon role-based, avatar vai trò, chấm trạng thái nhấp nháy và mũi tên SVG định hướng sắc nét.
- **Tối ưu vị trí LiveStreamConsole trên di động (`src/components/ui/LiveStreamConsole.tsx`)**:
  - Tự động chuyển vị trí console lên nửa trên màn hình trên thiết bị di động, triệt tiêu hoàn toàn xung đột hiển thị với thanh dock điều hướng trạm và telemetry ở đáy.

### 🛡️ Vá Lỗi Kỹ Thuật & Tối Ưu Hệ Thống (Hardening & Bug Fixes)
- **Khắc phục lỗi treo pipeline của nút Rollback (`ApprovalModal.tsx`, `useTownStore.ts`)**: Tự động giải quyết dứt điểm các approval đang chờ (`rejected`), hủy abort controller đang chạy và mở khóa cờ `isRealRunning` để người dùng có thể tiếp tục chạy task mới.
- **Bắt lỗi toàn diện ở các nhánh DAG song song (`useTownStore.ts`)**: Bổ sung kiểm tra lỗi nghiêm ngặt sau `Promise.all([qa, security])` và `devops`, ngăn chặn tình trạng artifact rỗng vẫn báo hoàn thành.
- **Triệt tiêu xung đột ghi đè stream chữ giữa QA & Security (`useTownStore.ts`)**: Bổ sung cờ `visualize` cho phép phân tách trạm stream hiển thị trên Live Console mà không bị chớp giật nội dung.
- **Kích hoạt Feedback Loop động từ kết quả AI thật (`useTownStore.ts`)**: Tự động phân tích phán quyết Tech Review (`ReviewComments.json`) và số lượng CVEs của DevSecOps (`SecurityAudit.json`) để điều phối shipper quay về xưởng Dev sửa mã nguồn.
- **Dọn sạch Monkey Patch DOM (`page.tsx`)**: Loại bỏ toàn bộ các đoạn vá `Node.prototype.removeChild` và lọc `console.error` cục bộ không an toàn.
- **Khắc phục lệnh `npm run lint` (`package.json`)**: Chuyển script sang `tsc --noEmit` tương thích chuẩn với Next.js 16.

---

## [v1.4.3] - 2026-10-31
### 🚀 Tính năng Mới & Chuẩn Hóa Kiến Trúc (Enterprise Prompts & Data Contracts)
- **Chuẩn Hóa Bộ Quy Trình Nghiệp Vụ 8 Phòng Ban Chuẩn Thực Chiến (`src/lib/pipeline/prompts.ts`)**:
  - Hợp nhất toàn bộ System Prompts về một nguồn chân lý duy nhất (`STAGE_PROMPT_CONFIGS`) dùng chung cho cả Client Store lẫn Server API:
    - **Orchestrator**: Phân tích phạm vi kiến trúc, nhận diện rủi ro kỹ thuật và chia User Stories chuẩn INVEST (`P0/P1/P2`, Story Points, Acceptance Gate).
    - **PM · BA**: Biên soạn PRD 5 phần thực chiến gồm Business Metrics, Functional Flows, Gherkin BDD (Happy/Negative/Edge), Non-Functional Requirements (SLA P99, AuthN/AuthZ, Rate-limit) và Out of Scope.
    - **Dev Engineer**: Lập trình Strict TypeScript theo Clean Architecture, Defensive Input Validation, Error Handling bảo mật và xuất Unified Git Diff chính xác số dòng hunk.
    - **Tech Review**: Thẩm định chéo PR Diff đối chiếu PRD theo 5 trụ cột (Spec Compliance, Boundary Safety, Architecture, Memory/Resource Safety, Security Hygiene) kèm comment neo đúng số dòng `+newStart` và mức độ `APPROVED | SUGGESTION | WARNING | BLOCKER`.
    - **QA · Test**: Kiểm thử độc lập đối chiếu song song Gherkin PRD của PM và bản Diff của Dev, xuất 6–8 kịch bản Vitest/Jest bao phủ Happy Path, Validation 400/401/403, Boundary/Timeout và Isolation Mocking.
    - **DevSecOps**: Rà soát SAST, Threat Modeling theo NFRs của PRD, Secret/PII Leak và OWASP Top 10.
    - **Release Eng**: Đóng gói Multi-stage `node:20-alpine` Dockerfile, non-root `USER`, `HEALTHCHECK` kèm tóm tắt chiến lược ArgoCD Canary Rollout (10% ➔ 50% ➔ 100%), HPA & Automated Rollback Gate.
    - **APM Monitor**: Giám sát hậu phát hành dựa trên **4 Tín Hiệu Vàng của Google SRE** (Latency, Traffic, Errors, Saturation) và đánh giá SLO Error Budget.
- **Liên Thông Hồ Sơ Bàn Giao Liên Phòng Ban (`PipelineContext` & `buildCurrentContext` - `useTownStore.ts`)**:
  - Đóng gói và truyền xuyên suốt toàn bộ 7 artifacts giữa các phòng ban trong `runRealPipeline`, `runGitHubPrAudit`, `rerunStage` và `resolveApproval` (`MilestonePlan` ➔ `PM`; `PRD + Diff` ➔ `Review`, `QA` & `Security`; `Review + QA + Security + Diff` ➔ `DevOps`; `PRD + Dockerfile + Security` ➔ `Monitor`).
- **Đồng Bộ Live SSE Streaming Cho Trạm `APM Monitor` (`useTownStore.ts`)**:
  - Chuyển bước kiểm tra sức khỏe Production sau khi duyệt Cổng Gatekeeper sang `streamStageFromApi`, giúp hiển thị trực tiếp luồng suy luận SRE trên `LiveStreamConsole`, kích hoạt camera Đạo diễn bay tới Đài Radar và hoàn thiện trọn vẹn bảng đo lường FinOps **8/8 trạm** trong `ExportModal`.

### 🐛 Sửa lỗi Kỹ thuật (Bug Fixes)
- **Khắc Phục Lỗi Ghi Đè Mất Output Schema Contract (`prompts.ts`, `api/pipeline/route.ts`, `ArtifactModal.tsx`)**:
  - Tách biệt phần `defaultRolePrompt` (cho phép người dùng chỉnh sửa tự do trên AI Playground) và `outputContract` (JSON Schema / Git Diff + thẻ thoại `---SPEECH---:` luôn được Server khóa tự động ở cuối qua `buildEffectiveSystemPrompt`), triệt tiêu hoàn toàn lỗi prompt ngắn của Client làm mất schema JSON và bong bóng thoại 3D.
- **Hiển Thị Đa Dòng SOP & Ghim Inline Review Comments Toàn Cục (`AgentDossierModal.tsx`, `ApprovalModal.tsx`)**:
  - Bổ sung `whitespace-pre-wrap` cho khung System Prompt trong Hồ sơ kỹ sư và truyền `reviewComments` vào `GitDiffViewer` trên toàn bộ các modal xem mã nguồn.

---

## [v1.4.2] - 2026-10-31
### 🚀 Tính năng Mới (New Features)
- **Mô hình Thực thi Song song DAG Pipeline (`QA` ∥ `DevSecOps`) (`useTownStore.ts`)**:
  - Tách luồng kiểm định sau khâu Tech Review thành mô hình đồ thị có hướng không chu trình (DAG): Review đồng thời phóng 2 Shipper về trạm QA và Security.
  - QA sinh bộ kiểm thử và DevSecOps quét SAST bảo mật được thực thi song song đồng thời qua `Promise.all`, rút ngắn 40% thời gian xử lý pipeline.
  - Sau khi hoàn thành, 2 Shipper đồng thời bàn giao artifacts về bàn làm việc của trạm Release Eng (DevOps).
- **Chế độ Đạo diễn Camera 3D Tự động (`🎥 Auto-Follow Director Mode` - `CameraRig.tsx`, `Topbar.tsx`)**:
  - Bổ sung nút chuyển đổi `🎥 Đạo diễn / Tự do` trên thanh công cụ Topbar.
  - Camera tự động lia mượt mà bám theo tọa độ không gian 3D của nhân vật Shipper đang chạy trên nan hoa đại lộ hoặc trạm AI đang trực tiếp suy luận.
  - Tự động nhường quyền điều khiển khi người dùng chủ động kéo/xoay chuột và mượt mà bám lại khi thả chuột.
- **AI Agent Playground & Re-run Stage Cô Lập (`ArtifactModal.tsx`, `api/pipeline/route.ts`, `useTownStore.ts`)**:
  - Cho phép người dùng chỉnh sửa trực tiếp `systemPrompt` của từng Agent ngay trong tab `🧠 System Prompt` với nút khôi phục mặc định.
  - Nút `🔄 Chạy lại trạm này` hỗ trợ gửi prompt tùy biến lên server để sinh lại artifact riêng biệt cho trạm đang chọn mà không phải chạy lại toàn bộ pipeline.
- **Bình luận Kiến trúc Trực quan & Tải Trọn Bộ 8 Artifacts Bundle (`GitDiffViewer.tsx`, `ExportModal.tsx`)**:
  - Tự động hiển thị các nhận xét đánh giá từ `ReviewComments.json` dưới dạng thẻ bình luận inline trực tiếp dưới dòng code tương ứng trên Git Diff.
  - Bổ sung nút **`📦 Tải Bundle 8 Artifacts`** trong `ExportModal` cho phép tải toàn bộ tài liệu và mã nguồn của cả 8 trạm gom gọn trong 1 file Markdown chuẩn hóa.
- **Bảng Thống kê Hiệu năng FinOps & DAG Telemetry (`ExportModal.tsx`, `LiveStreamConsole.tsx`)**:
  - Đo lường và hiển thị chính xác thời gian thực thi (`durationMs`), số lượng token ước tính và tốc độ suy luận (`tok/s`) cho từng trạm.

### ⚡ Tối ưu Hiệu Năng & Sửa Lỗi (Bug Fixes)
- **Sửa Lỗi Nhân Đôi Dấu `+`/`-` Trên Git Diff (`GitDiffViewer.tsx`)**:
  - Loại bỏ ký hiệu đầu dòng `line.slice(1)` khi parse dòng `add` và `delete`, triệt tiêu hoàn toàn lỗi hiển thị `+ +code` hoặc `- -code`.
- **Khắc Phục Cắt Chữ Trên Chế Độ Split 2 Cột (`GitDiffViewer.tsx`)**:
  - Thay thế thuộc tính `truncate` bằng vùng cuộn ngang `overflow-x-auto scrollbar-none` giúp dòng mã dài không bị che khuất.
- **Hiện Đại Hóa Log Drawer & Đảo Chiều Cuộn (`LogDrawer.tsx`)**:
  - Cập nhật giao diện Dark Glassmorphism cao cấp, sửa lỗi cuộn ngược (`scrollTop = 0` hiển thị log mới nhất ở đầu).
  - Tích hợp bộ lọc nhanh `Tất cả`, `Lỗi & Cảnh báo` và lọc theo từng trạm; thêm sự kiện click-to-fly-to-station bay camera đến trạm phát sinh log.
- **Tự Động Co Dãn Trục Sparkline Trong Bão Chaos (`StatusBar.tsx`)**:
  - Tính toán động biên độ trục Y của SVG Sparkline theo ngưỡng tải thực tế (ngăn chặn vỡ nét khi latency chạm 168ms).
  - Hiển thị thời tiết động đồng bộ theo chu kỳ Ngày / Hoàng hôn / Đêm và trạng thái bão tải Chaos.

---

## [v1.4.1] - 2026-10-31
### 🚀 Tính năng Mới (New Features)
- **Lưu trữ & Khôi phục Lịch sử Phiên Chạy (Session History & Persistence - `useTownStore.ts`, `PromptModal.tsx`)**:
  - Tự động lưu vết tối đa 5 phiên chạy gần nhất vào `localStorage` (`AGENT_TOWN_SESSIONS`) kèm nhãn scenario, thời gian thực thi, telemetry và toàn bộ artifacts sinh ra từ 8 trạm.
  - Cho phép người dùng duyệt danh sách phiên cũ trong `PromptModal` và khôi phục ngay lập tức trạng thái code/diff/test mà không cần tốn thêm token AI hoặc chờ đợi.
- **Từ Chối Kiểm Duyệt Kèm Phản Hồi Kỹ Thuật (Interactive Tech Lead Rejection with Feedback Notes - `ApprovalModal.tsx`, `useTownStore.ts`)**:
  - Tại Cổng Phê Duyệt Production (`ApprovalGate`), khi Tech Lead từ chối phát hành, giao diện mở hộp nhập phản hồi với các gợi ý sẵn (bổ sung exception handling, null safety, tối ưu memory leak...).
  - Kỹ sư Dev tự động nhận shipper feedback mang ghi chú từ chối, kích hoạt real AI stream viết lại bản vá Unified Git Diff tương ứng và tự động gửi lại lên Cổng duyệt.
- **Huy Hiệu Tiến Độ Trực Quan & Trạng Thái Stream (`RoleChips.tsx`)**:
  - Bổ sung huy hiệu checkmark `✓` màu xanh ngọc cho các trạm đã tạo xong artifact trong phiên làm việc.
  - Hiệu ứng vòng viền xanh dương phát sáng nhấp nháy (`animate-pulse`) làm nổi bật trạm đang trực tiếp stream token AI.
- **Nút Bật/Tắt Auto-Demo Mô Phỏng Nhanh Trên Topbar (`Topbar.tsx`)**:
  - Bổ sung nút bấm `🎬 Demo / ⏸️ Demo On` ngay trên thanh công cụ điều khiển giúp người xem trình diễn chu trình DevOps tuần hoàn tự động không tốn token mà không cần mở console.

### ⚡ Tối ưu Hiệu Năng & Sửa Lỗi (Performance & Bug Fixes)
- **Đồng bộ hóa thể chất Shipper & AI Stream (`useTownStore.ts`, `TownScene.tsx`)**:
  - Tích hợp cơ chế `registerCourierArrival` / `waitForCourierArrival(courierId)`: trạm kế tiếp chỉ bắt đầu stream mã nguồn khi nhân vật Shipper 3D đã thực sự bước vào phòng và đặt kiện hàng lên bàn làm việc (`progress >= 1`).
- **Zero-Allocation Spline Engine 60fps (`waypoints.ts`)**:
  - Memoize waypoints các tuyến đường giữa 8 trạm bằng `Map<string, THREE.Vector3[]>`.
  - Cache đường cong uốn lượn bằng `WeakMap<THREE.Vector3[], THREE.CatmullRomCurve3>` qua hàm `getCurveForWaypoints()`, triệt tiêu hoàn toàn việc cấp phát Curve mới trong render loop 60fps.
- **AI Self-Healing Hoàn Chỉnh Cho Kịch Bản Bug QA & SAST Security (`route.ts`, `useTownStore.ts`)**:
  - Khi QA bắt bug hoặc DevSecOps phát hiện lỗ hổng SAST/OWASP, Dev nhận shipper lỗi và gọi real AI stream để cập nhật trực tiếp `source-code.diff` thay vì dùng timer tĩnh `setTimeout`.
- **Đồng Bộ Phím Tắt Escape & Click-Outside Cho Toàn Bộ Modal (`ArtifactModal`, `AgentDossierModal`, `ApprovalModal`, `ApiKeyModal`, `PromptModal`)**:
  - Thêm xử lý sự kiện phím `Escape` và click vào vùng backdrop mờ bên ngoài để đóng modal tức thì, mang lại trải nghiệm UX desktop chuẩn mực.

---

## [v1.4.0] - 2026-10-31
### 🚀 Tính năng Đột Phá (Major Features)
- **Live AI Token Streaming (SSE) & Nút Dừng Khẩn Cấp (`LiveStreamConsole.tsx`, `api/pipeline/route.ts`, `gemini.ts`, `deepseek.ts`)**:
  - Chuyển đổi luồng gọi AI sang giao thức Server-Sent Events (`text/event-stream`) truyền trực tiếp từng cụm token từ Google Gemini 3.8 Flash / DeepSeek lên màn hình Terminal nổi theo thời gian thực.
  - Bổ sung cơ chế `AbortController` cho phép bấm nút **`⏹ Dừng`** ngay trên Topbar hoặc khung Live Stream để ngắt kết nối và thu hồi trạng thái các trạm tức thì.
- **Chế độ Kiểm Toán GitHub Pull Request Thực Tế (`api/github-pr/route.ts`, `PromptModal.tsx`, `useTownStore.ts`)**:
  - Hỗ trợ dán URL GitHub PR công khai bất kỳ (`https://github.com/owner/repo/pull/123` hoặc `owner/repo#123`) để kéo trực tiếp PR metadata và bản vá `.diff` thật về thị trấn 3D.
  - Hiển thị diff thật trên `GitDiffViewer` (Unified & Split 2 cột) và điều phối chuỗi trạm **Review ➔ QA ➔ DevSecOps ➔ Release Gate** chấm điểm, sinh test và quét bảo mật SAST trên chính PR đó.
- **Báo Cáo Phát Hành Trích Xuất Động 100% (`ExportModal.tsx`)**:
  - Tự động bóc tách điểm số & nhận xét từ `ReviewComments.json`, đếm số kịch bản `it()/test()` thực tế từ `test-suite.spec.ts`, số dòng `+additions/-deletions` của bản diff, số lượng CVE từ `SecurityAudit.json` và tổng số vòng lặp Feedback Loops trong phiên chạy.

### 🐛 Sửa lỗi & Chuẩn hóa Kỹ thuật (Bug Fixes & Repo Hygiene)
- **Xóa bỏ Race Condition giữa 2 bộ đếm Shipper (`TownScene.tsx`, `MockSimulator.ts`)**: Hợp nhất chuyển động Shipper về một nguồn 60fps duy nhất tại `CourierTicker`, chấm dứt hoàn toàn lỗi treo đứng pipeline tự động.
- **Khắc phục lỗi mở chồng 2 Modal & rò rỉ nhãn 3D (`useTownStore.ts`, `RoleChips.tsx`, `Labels.tsx`, `MilestoneWidget.tsx`, `ApprovalModal.tsx`)**: Chuẩn hóa tham số `modalMode` (`'dossier' | 'artifact' | 'none'`) và ẩn triệt để overlay nhãn 3D khi mở mọi modal; bổ sung `overscroll-contain` khóa cuộn nền.
- **Kích hoạt chuyển động hạt xung Photon dọc Cáp Quang (`DataCables.tsx`)**: Cập nhật trực tiếp tọa độ cực `mesh.position.set()` trong `useFrame` giúp xung dữ liệu phóng mượt từ AI Command Center tới 7 phòng lab.
- **Tối ưu Bầu Trời Ban Ngày & Tư Thế Ngồi Bàn Làm Việc (`TownScene.tsx`, `Character.tsx`, `Building.tsx`, `Castle.tsx`, `tokens.ts`)**: Thay nền trắng chói ban ngày bằng bầu trời xanh Azure dịu mắt kết hợp cân bằng lại ACES Filmic Exposure (`0.96`); đưa toàn bộ 8 kỹ sư AI vào ngồi ngay ngắn trên ghế công thái học trước màn hình với hiệu ứng hai tay gõ bàn phím cơ trực quan.
- **Chuẩn hóa Luồng Giao Nhận Kiện Hàng Của Shipper (`waypoints.ts`, `Character.tsx`, `Building.tsx`, `Castle.tsx`)**: Kéo dài lộ trình spline vào tận mép bàn làm việc bên trong phòng (`handover`), đặt thùng Artifact lên góc bàn khi kỹ sư xử lý và bổ sung `StandbyCourier` đứng chờ bàn giao cạnh bàn giúp Shipper hiển thị liền mạch 100% thời gian, không bao giờ bị biến mất đột ngột.
- **Tối ưu Responsive 3D Camera & Hệ thống HUD Đa Thiết Bị (`CameraRig.tsx`, `Topbar.tsx`, `RoleChips.tsx`, `StatusBar.tsx`, `MilestoneWidget.tsx`, `LogDrawer.tsx`)**: Tự động nội suy tỉ lệ thu phóng Orthographic Camera theo chiều rộng màn hình (`size.width / 1200`), tự động thu gọn bảng `MilestoneWidget` trên màn hình `< 768px`, và tách tầng `StatusBar` / `RoleChips` trên mobile/tablet tránh đè chồng giao diện.
- **Đồng bộ Git Diff & Kịch bản AppSec Audit cho AI Thật (`route.ts`, `useTownStore.ts`)**: Chuẩn hóa đầu ra trạm Dev sang Unified Git Diff (`source-code.diff`) kích hoạt `GitDiffViewer` 100% thời gian; bổ sung kịch bản Feedback Loop bảo mật SAST/OWASP hoàn chỉnh cho chế độ `security`.
- **Dọn dẹp cấu trúc Repo & Đồng bộ `AGENTS.md`**: Lưu trữ bản prototype Vanilla JS v1.0 (`index.html`, `js/`, `css/`) và các file không còn sử dụng vào `docs/archive/legacy-v1/`; cập nhật toàn diện `AGENTS.md` khớp kiến trúc Next.js 16 + R3F + High-Tech Labs.

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
