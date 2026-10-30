import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { AgentRole } from '../../lib/pipeline/stages';
import { STATIONS_LAYOUT } from '../../lib/scene/layout';
import { TOKENS } from '../../styles/tokens';
import { useTownStore } from '../../store/useTownStore';

interface BuildingProps {
  role: AgentRole;
}

/**
 * 7 Trạm Chuyên Môn Công Nghệ Cao (High-Tech Autonomous Labs)
 * Thiết kế đồng bộ hoàn hảo với AI Command Center:
 * - Vách kính mờ cường lực khung nhôm đen tối giản (Frosted Glass & Dark Aluminum Frame)
 * - Bàn nâng công thái học (Smart Standing Desk) viền LED neon phát sáng theo accentColor
 * - Đèn ray LED treo trần thông minh (Suspended Modern Luminaire) rọi sáng bàn làm việc
 * - Đạo cụ chuyên môn độc bản cho từng vai trò kỹ sư (Triple Monitor, Docker Containers, Server Racks...)
 */
export const Building: React.FC<BuildingProps> = ({ role }) => {
  const layout = STATIONS_LAYOUT[role];
  const selectAgent = useTownStore((s) => s.selectAgent);
  const selectedAgentRole = useTownStore((s) => s.selectedAgentRole);
  const agentStatus = useTownStore((s) => s.agents[role]?.status);

  const isSelected = selectedAgentRole === role;
  const isWorking = agentStatus === 'working' || agentStatus === 'debugging';

  const radarRef = useRef<THREE.Group>(null);
  const monitorLightRef = useRef<THREE.PointLight>(null);
  const overheadLightRef = useRef<THREE.PointLight>(null);
  const hologramRef = useRef<THREE.Group>(null);
  const laserRef = useRef<THREE.Group>(null);
  const blinkLedRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    // Xoay radar trạm Monitor
    if (radarRef.current) {
      radarRef.current.rotation.y += delta * 2.2;
    }

    // Xoay thấu kính hologram trạm Tech Review
    if (hologramRef.current) {
      hologramRef.current.rotation.y += delta * 1.5;
      hologramRef.current.position.y = 0.95 + Math.sin(t * 3) * 0.03;
    }

    // Tia quét laser an ninh trạm Security
    if (laserRef.current) {
      laserRef.current.position.x = Math.sin(t * 2.5) * 0.45;
    }

    // Nhấp nháy đèn LED server blade
    if (blinkLedRef.current) {
      blinkLedRef.current.opacity = 0.4 + Math.sin(t * 8) * 0.5;
    }

    // Hiệu ứng ánh sáng màn hình máy tính nhấp nháy code
    if (monitorLightRef.current) {
      const flicker = (isWorking ? 0.9 : 0.45) + Math.sin(t * 7) * 0.15;
      monitorLightRef.current.intensity = flicker;
    }

    // Đèn rọi trần tăng cường sáng khi Agent làm việc
    if (overheadLightRef.current) {
      const targetIntensity = isWorking ? 1.4 : isSelected ? 1.0 : 0.55;
      overheadLightRef.current.intensity = THREE.MathUtils.lerp(
        overheadLightRef.current.intensity,
        targetIntensity,
        0.1
      );
    }
  });

  return (
    <group
      position={layout.position}
      rotation={[0, layout.rotationY, 0]}
      onClick={(e) => {
        e.stopPropagation();
        selectAgent(role);
      }}
      onPointerOver={() => {
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'default';
      }}
    >
      {/* 1. ĐẾ NỀN NÂNG CAO CÔNG NGHỆ (High-Tech Cleanroom Platform) */}
      <mesh position={[0, 0.1, 0]} receiveShadow>
        <boxGeometry args={[3.8, 0.2, 3.8]} />
        <meshStandardMaterial color={0xf8fafc} roughness={0.4} metalness={0.1} />
      </mesh>

      {/* Dải LED neon ngầm chạy viền chân đế trạm */}
      <mesh position={[0, 0.04, 0]}>
        <boxGeometry args={[3.84, 0.04, 3.84]} />
        <meshStandardMaterial
          color={layout.accentColor}
          emissive={layout.accentColor}
          emissiveIntensity={0.85}
        />
      </mesh>

      {/* BẬC THỀM ĐÁ TRƯỚC CỬA (Entrance Step With Neon Guide) */}
      <group position={[0, 0.05, 2.05]}>
        <mesh receiveShadow>
          <boxGeometry args={[2.2, 0.1, 0.5]} />
          <meshStandardMaterial color={0xe2e8f0} roughness={0.5} />
        </mesh>
        {/* Vạch neon dẫn đường vào phòng */}
        <mesh position={[0, 0.052, 0]}>
          <boxGeometry args={[0.08, 0.01, 0.48]} />
          <meshStandardMaterial
            color={layout.accentColor}
            emissive={layout.accentColor}
            emissiveIntensity={1.0}
          />
        </mesh>
      </group>

      {/* 2. SÀN PHÒNG PHÒNG THÍ NGHIỆM TRẮNG SÁNG (Polished Cleanroom Epoxy Floor) */}
      <mesh position={[0, 0.205, 0]} receiveShadow>
        <boxGeometry args={[3.5, 0.02, 3.5]} />
        <meshStandardMaterial color={0xffffff} roughness={0.2} metalness={0.05} />
      </mesh>

      {/* Thảm công nghệ tròn có viền phát quang */}
      <group position={[0, 0.22, 0.2]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.15, 32]} />
          <meshStandardMaterial
            color={layout.accentColor}
            transparent
            opacity={0.12}
            roughness={0.6}
          />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
          <ringGeometry args={[1.05, 1.15, 32]} />
          <meshStandardMaterial
            color={layout.accentColor}
            emissive={layout.accentColor}
            emissiveIntensity={0.7}
            transparent
            opacity={0.85}
          />
        </mesh>
      </group>

      {/* VÒNG TRÒN PULSE HIGHLIGHT KHI TRẠM ĐƯỢC CHỌN */}
      {isSelected && (
        <mesh position={[0, 0.23, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.9, 2.1, 36]} />
          <meshBasicMaterial color={layout.accentColor} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* 3. VÁCH KÍNH CƯỜNG LỰC MỜ & KHUNG NHÔM GRAPHITE (Frosted Glass Partitions) */}
      {/* Vách kính sau */}
      <group position={[0, 1.25, -1.65]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[3.5, 2.1, 0.08]} />
          <meshPhysicalMaterial
            color={0x94a3b8}
            transparent
            opacity={0.4}
            roughness={0.15}
            metalness={0.1}
            transmission={0.6}
            thickness={0.5}
          />
        </mesh>
        {/* Khung dầm nhôm ngang trên */}
        <mesh position={[0, 1.05, 0]}>
          <boxGeometry args={[3.54, 0.08, 0.12]} />
          <meshStandardMaterial color={0x334155} metalness={0.6} roughness={0.3} />
        </mesh>
        {/* Khung dầm nhôm chân tường */}
        <mesh position={[0, -1.02, 0]}>
          <boxGeometry args={[3.54, 0.06, 0.12]} />
          <meshStandardMaterial color={0x334155} metalness={0.6} roughness={0.3} />
        </mesh>
        {/* Cột nhôm gia cố giữa vách sau */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.08, 2.1, 0.1]} />
          <meshStandardMaterial color={0x334155} metalness={0.6} roughness={0.3} />
        </mesh>
      </group>

      {/* Vách kính trái */}
      <group position={[-1.65, 1.25, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.08, 2.1, 3.5]} />
          <meshPhysicalMaterial
            color={0x94a3b8}
            transparent
            opacity={0.4}
            roughness={0.15}
            metalness={0.1}
            transmission={0.6}
            thickness={0.5}
          />
        </mesh>
        {/* Dầm trên */}
        <mesh position={[0, 1.05, 0]}>
          <boxGeometry args={[0.12, 0.08, 3.54]} />
          <meshStandardMaterial color={0x334155} metalness={0.6} roughness={0.3} />
        </mesh>
        {/* Cột nhôm giữa */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.1, 2.1, 0.08]} />
          <meshStandardMaterial color={0x334155} metalness={0.6} roughness={0.3} />
        </mesh>
      </group>

      {/* 4. ĐÈN RAY TREO TRẦN THÔNG MINH (Suspended Overhead Luminaire) */}
      <group position={[0, 2.05, -0.6]}>
        {/* 2 dây thép treo thanh mảnh */}
        <mesh position={[-0.7, 0.22, 0]}>
          <cylinderGeometry args={[0.005, 0.005, 0.44]} />
          <meshStandardMaterial color={0x64748b} metalness={0.9} />
        </mesh>
        <mesh position={[0.7, 0.22, 0]}>
          <cylinderGeometry args={[0.005, 0.005, 0.44]} />
          <meshStandardMaterial color={0x64748b} metalness={0.9} />
        </mesh>
        {/* Thanh đèn nhôm đen mỏng */}
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[1.7, 0.04, 0.1]} />
          <meshStandardMaterial color={0x0f172a} metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Dải LED phát quang phía dưới */}
        <mesh position={[0, -0.021, 0]}>
          <boxGeometry args={[1.65, 0.01, 0.07]} />
          <meshStandardMaterial
            color={0xffffff}
            emissive={layout.accentColor}
            emissiveIntensity={isWorking ? 1.5 : 0.8}
          />
        </mesh>
        {/* Nguồn sáng rọi thẳng xuống bàn */}
        <pointLight
          ref={overheadLightRef}
          color={layout.accentColor}
          intensity={0.6}
          distance={3.2}
          decay={2}
          position={[0, -0.15, 0]}
        />
      </group>

      {/* 5. BÀN NÂNG CÔNG THÁI HỌC CÔNG NGHỆ CAO (High-Tech Smart Standing Desk) */}
      <group position={[0, 0.22, -0.6]}>
        {/* Mặt bàn kính đen carbon cường lực */}
        <mesh position={[0, 0.65, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.8, 0.05, 0.85]} />
          <meshStandardMaterial color={0x0f172a} roughness={0.2} metalness={0.4} />
        </mesh>
        {/* Dải LED neon phát sáng bao quanh viền mặt bàn */}
        <mesh position={[0, 0.648, 0]}>
          <boxGeometry args={[1.82, 0.02, 0.87]} />
          <meshStandardMaterial
            color={layout.accentColor}
            emissive={layout.accentColor}
            emissiveIntensity={0.85}
          />
        </mesh>
        {/* 2 Chân trụ nâng điện kim loại chữ T */}
        <mesh position={[-0.7, 0.32, 0]} castShadow>
          <boxGeometry args={[0.08, 0.62, 0.12]} />
          <meshStandardMaterial color={0x334155} metalness={0.8} roughness={0.25} />
        </mesh>
        <mesh position={[0.7, 0.32, 0]} castShadow>
          <boxGeometry args={[0.08, 0.62, 0.12]} />
          <meshStandardMaterial color={0x334155} metalness={0.8} roughness={0.25} />
        </mesh>
        {/* Thanh đế chân bàn trên sàn */}
        <mesh position={[-0.7, 0.02, 0]}>
          <boxGeometry args={[0.12, 0.03, 0.6]} />
          <meshStandardMaterial color={0x1e293b} metalness={0.8} />
        </mesh>
        <mesh position={[0.7, 0.02, 0]}>
          <boxGeometry args={[0.12, 0.03, 0.6]} />
          <meshStandardMaterial color={0x1e293b} metalness={0.8} />
        </mesh>

        {/* 6. MÀN HÌNH CHÍNH & THIẾT BỊ ĐIỀU HÀNH */}
        <group position={[0, 0.68, -0.18]}>
          {/* Tay arm nâng màn hình cơ học */}
          <mesh position={[0, 0.18, 0]}>
            <cylinderGeometry args={[0.02, 0.025, 0.32]} />
            <meshStandardMaterial color={0x475569} metalness={0.8} />
          </mesh>
          {/* Khung màn hình mỏng tràn viền */}
          <mesh position={[0, 0.38, 0]} castShadow>
            <boxGeometry args={[0.85, 0.48, 0.035]} />
            <meshStandardMaterial color={0x0f172a} roughness={0.2} metalness={0.5} />
          </mesh>
          {/* Màn hình hiển thị phát quang */}
          <mesh position={[0, 0.38, 0.02]}>
            <planeGeometry args={[0.81, 0.44]} />
            <meshStandardMaterial
              color={0x0284c7}
              emissive={layout.accentColor}
              emissiveIntensity={isWorking ? 0.95 : 0.6}
            />
          </mesh>
          {/* Nguồn sáng phát ra từ màn hình */}
          <pointLight
            ref={monitorLightRef}
            color={layout.accentColor}
            distance={2.4}
            intensity={0.6}
            position={[0, 0.38, 0.35]}
          />

          {/* Bàn phím cơ Tenkeyless LED & Chuột công nghệ */}
          <mesh position={[0, 0.015, 0.28]}>
            <boxGeometry args={[0.46, 0.018, 0.16]} />
            <meshStandardMaterial color={0x1e293b} metalness={0.6} />
          </mesh>
          {/* Đèn nền bàn phím */}
          <mesh position={[0, 0.025, 0.28]}>
            <boxGeometry args={[0.42, 0.005, 0.14]} />
            <meshStandardMaterial
              color={layout.accentColor}
              emissive={layout.accentColor}
              emissiveIntensity={0.6}
            />
          </mesh>
          <mesh position={[0.32, 0.015, 0.28]}>
            <boxGeometry args={[0.07, 0.02, 0.11]} />
            <meshStandardMaterial color={0x1e293b} metalness={0.6} />
          </mesh>
        </group>

        {/* 7. GHẾ CÔNG THÁI HỌC LƯỚI CAO CẤP (Ergonomic Mesh Chair) */}
        <group position={[0, 0.15, 0.65]}>
          {/* Chân sao 5 cánh kim loại */}
          <mesh position={[0, 0.04, 0]}>
            <cylinderGeometry args={[0.26, 0.26, 0.02, 5]} />
            <meshStandardMaterial color={0x475569} metalness={0.8} />
          </mesh>
          <mesh position={[0, 0.16, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.24]} />
            <meshStandardMaterial color={0x334155} metalness={0.9} />
          </mesh>
          {/* Đệm ngồi công thái học */}
          <mesh position={[0, 0.31, 0]} castShadow>
            <cylinderGeometry args={[0.26, 0.28, 0.07, 20]} />
            <meshStandardMaterial color={0x0f172a} roughness={0.4} />
          </mesh>
          {/* Tựa lưng lưới cong thoáng khí viền accent */}
          <mesh position={[0, 0.6, 0.2]} castShadow>
            <boxGeometry args={[0.44, 0.46, 0.04]} />
            <meshStandardMaterial
              color={0x1e293b}
              roughness={0.5}
              wireframe={false}
            />
          </mesh>
          <mesh position={[0, 0.6, 0.21]}>
            <planeGeometry args={[0.4, 0.42]} />
            <meshStandardMaterial
              color={layout.accentColor}
              emissive={layout.accentColor}
              emissiveIntensity={0.25}
              wireframe
            />
          </mesh>
        </group>
      </group>

      {/* =========================================================================
          8. ĐẠO CỤ CHUYÊN MÔN ĐỘC BẢN CHO TỪNG PHÒNG LAB (Specialized Lab Equipment)
          ========================================================================= */}

      {/* --- TRẠM 1: PM · BA (Digital Strategy & Product Roadmap Lab) --- */}
      {role === 'pm' && (
        <group>
          {/* Bảng kính tương tác lớn Digital Glass Whiteboard gắn vách sau */}
          <group position={[0, 1.45, -1.55]}>
            <mesh castShadow>
              <boxGeometry args={[1.7, 0.95, 0.02]} />
              <meshPhysicalMaterial
                color={0x0284c7}
                transparent
                opacity={0.3}
                roughness={0.1}
                transmission={0.8}
              />
            </mesh>
            {/* Khung viền bảng */}
            <mesh>
              <boxGeometry args={[1.74, 0.99, 0.015]} />
              <meshStandardMaterial color={0x38bdf8} wireframe />
            </mesh>
            {/* User Flow Cards & Roadmap nodes phát sáng */}
            <mesh position={[-0.5, 0.2, 0.02]}>
              <planeGeometry args={[0.35, 0.2]} />
              <meshBasicMaterial color={0x38bdf8} />
            </mesh>
            <mesh position={[0, 0.2, 0.02]}>
              <planeGeometry args={[0.35, 0.2]} />
              <meshBasicMaterial color={0x818cf8} />
            </mesh>
            <mesh position={[0.5, -0.15, 0.02]}>
              <planeGeometry args={[0.35, 0.2]} />
              <meshBasicMaterial color={0x34d399} />
            </mesh>
          </group>
          {/* Laptop mỏng mở trên bàn cạnh màn hình */}
          <group position={[-0.55, 0.91, -0.6]} rotation={[0, 0.25, 0]}>
            <mesh>
              <boxGeometry args={[0.36, 0.015, 0.24]} />
              <meshStandardMaterial color={0x64748b} metalness={0.7} />
            </mesh>
            <mesh position={[0, 0.12, -0.12]} rotation={[-0.35, 0, 0]}>
              <boxGeometry args={[0.36, 0.22, 0.01]} />
              <meshStandardMaterial color={0x0f172a} />
            </mesh>
            <mesh position={[0, 0.12, -0.11]} rotation={[-0.35, 0, 0]}>
              <planeGeometry args={[0.34, 0.2]} />
              <meshStandardMaterial color={0x0284c7} emissive={0x38bdf8} emissiveIntensity={0.6} />
            </mesh>
          </group>
        </group>
      )}

      {/* --- TRẠM 2: DEV (Software Architecture & Triple Monitor Workstation) --- */}
      {role === 'dev' && (
        <group>
          {/* 2 Màn hình phụ dựng nghiêng tạo thành Triple Monitor cong */}
          <group position={[-0.55, 1.06, -0.72]} rotation={[0, 0.42, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.48, 0.46, 0.03]} />
              <meshStandardMaterial color={0x0f172a} metalness={0.6} />
            </mesh>
            <mesh position={[0, 0, 0.018]}>
              <planeGeometry args={[0.44, 0.42]} />
              <meshStandardMaterial color={0x059669} emissive={0x10b981} emissiveIntensity={0.8} />
            </mesh>
          </group>
          <group position={[0.55, 1.06, -0.72]} rotation={[0, -0.42, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.48, 0.46, 0.03]} />
              <meshStandardMaterial color={0x0f172a} metalness={0.6} />
            </mesh>
            <mesh position={[0, 0, 0.018]}>
              <planeGeometry args={[0.44, 0.42]} />
              <meshStandardMaterial color={0x0284c7} emissive={0x06b6d4} emissiveIntensity={0.8} />
            </mesh>
          </group>
          {/* Workstation PC Case kính cường lực lộ quạt tản nhiệt nước RGB đặt cạnh bàn */}
          <group position={[1.15, 0.45, -0.6]}>
            <mesh castShadow>
              <boxGeometry args={[0.26, 0.48, 0.45]} />
              <meshStandardMaterial color={0x0f172a} metalness={0.8} roughness={0.2} />
            </mesh>
            {/* Kính hông trong suốt */}
            <mesh position={[-0.132, 0, 0]}>
              <boxGeometry args={[0.005, 0.44, 0.42]} />
              <meshPhysicalMaterial color={0x38bdf8} transparent opacity={0.3} transmission={0.9} />
            </mesh>
            {/* 2 Quạt LED tròn tản nhiệt RGB */}
            <mesh position={[-0.1, 0.1, 0]} rotation={[0, Math.PI / 2, 0]}>
              <ringGeometry args={[0.05, 0.08, 16]} />
              <meshBasicMaterial color={0x10b981} />
            </mesh>
            <mesh position={[-0.1, -0.1, 0]} rotation={[0, Math.PI / 2, 0]}>
              <ringGeometry args={[0.05, 0.08, 16]} />
              <meshBasicMaterial color={0x38bdf8} />
            </mesh>
          </group>
        </group>
      )}

      {/* --- TRẠM 3: REVIEW (Code Review & Floating Holographic Inspector) --- */}
      {role === 'review' && (
        <group>
          {/* Màn hình Split View Before/After Diff */}
          <group position={[0, 1.06, -0.76]}>
            <mesh position={[-0.24, 0, 0.02]}>
              <planeGeometry args={[0.38, 0.4]} />
              <meshStandardMaterial color={0x991b1b} emissive={0xef4444} emissiveIntensity={0.65} />
            </mesh>
            <mesh position={[0.24, 0, 0.02]}>
              <planeGeometry args={[0.38, 0.4]} />
              <meshStandardMaterial color={0x166534} emissive={0x22c55e} emissiveIntensity={0.65} />
            </mesh>
          </group>
          {/* Thấu kính Hologram lơ lửng xoay tròn soi code */}
          <group ref={hologramRef} position={[0.62, 0.95, -0.4]}>
            <mesh>
              <torusGeometry args={[0.16, 0.014, 16, 32]} />
              <meshStandardMaterial color={0x38bdf8} emissive={0x0284c7} emissiveIntensity={1.2} />
            </mesh>
            <mesh>
              <cylinderGeometry args={[0.14, 0.14, 0.01, 24]} />
              <meshPhysicalMaterial
                color={0x38bdf8}
                transparent
                opacity={0.4}
                roughness={0.1}
                transmission={0.8}
              />
            </mesh>
          </group>
          {/* Hộp con dấu phê duyệt "LGTM APPROVED" phát quang */}
          <group position={[-0.65, 0.9, -0.4]}>
            <mesh castShadow>
              <boxGeometry args={[0.18, 0.08, 0.12]} />
              <meshStandardMaterial color={0x10b981} emissive={0x10b981} emissiveIntensity={0.7} />
            </mesh>
          </group>
        </group>
      )}

      {/* --- TRẠM 4: QA · TEST (Automated Test Server Rack & Quantum Flasks) --- */}
      {role === 'qa' && (
        <group>
          {/* Tháp Server Rack Test Suite 3 tầng đặt ở góc phòng */}
          <group position={[1.15, 0.72, -1.0]}>
            <mesh castShadow>
              <boxGeometry args={[0.5, 1.0, 0.42]} />
              <meshStandardMaterial color={0x0f172a} metalness={0.7} roughness={0.3} />
            </mesh>
            {/* 3 Blade Server Units */}
            {[0.3, 0.0, -0.3].map((yOffset, idx) => (
              <group key={idx} position={[0, yOffset, 0.212]}>
                <mesh>
                  <boxGeometry args={[0.44, 0.22, 0.01]} />
                  <meshStandardMaterial color={0x1e293b} />
                </mesh>
                {/* Hàng đèn LED trạng thái test cases passed/failed */}
                <mesh position={[-0.14, 0.04, 0.01]}>
                  <boxGeometry args={[0.08, 0.03, 0.01]} />
                  <meshBasicMaterial color={0x22c55e} />
                </mesh>
                <mesh position={[0.14, 0.04, 0.01]}>
                  <boxGeometry args={[0.08, 0.03, 0.01]} />
                  <meshBasicMaterial ref={idx === 1 ? blinkLedRef : undefined} color={0xa855f7} />
                </mesh>
              </group>
            ))}
          </group>
          {/* Ống nghiệm số lượng tử phát quang màu tím trên bàn */}
          <group position={[-0.65, 0.95, -0.4]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.06, 0.09, 0.24, 16]} />
              <meshStandardMaterial
                color={0xa855f7}
                emissive={0xc084fc}
                emissiveIntensity={0.8}
                transparent
                opacity={0.85}
              />
            </mesh>
            <mesh position={[0, 0.13, 0]}>
              <cylinderGeometry args={[0.03, 0.03, 0.06, 12]} />
              <meshStandardMaterial color={0x334155} />
            </mesh>
          </group>
        </group>
      )}

      {/* --- TRẠM 5: SECURITY (Cyber Defense Vault & Security Laser Gate) --- */}
      {role === 'security' && (
        <group>
          {/* Tủ sắt kiên cố an ninh Cyber Vault đặt ở góc */}
          <group position={[1.15, 0.75, -1.0]}>
            <mesh castShadow>
              <boxGeometry args={[0.55, 1.05, 0.45]} />
              <meshStandardMaterial color={0x1e293b} metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Tay nắm khóa quay an toàn */}
            <mesh position={[0, 0.1, 0.23]}>
              <cylinderGeometry args={[0.08, 0.08, 0.02, 16]} />
              <meshStandardMaterial color={0xf59e0b} metalness={0.9} />
            </mesh>
            {/* Bàn phím số LED ma trận */}
            <mesh position={[0, 0.32, 0.23]}>
              <boxGeometry args={[0.14, 0.18, 0.01]} />
              <meshBasicMaterial color={0x14b8a6} />
            </mesh>
          </group>
          {/* Cổng quét tia laser bảo mật qua lại ở thềm cửa */}
          <group ref={laserRef} position={[0, 0.35, 1.4]}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.006, 0.006, 1.2]} />
              <meshStandardMaterial
                color={0xef4444}
                emissive={0xef4444}
                emissiveIntensity={2.0}
              />
            </mesh>
          </group>
          {/* Khiên bảo mật hologram bát giác gắn tường sau */}
          <group position={[0, 1.5, -1.56]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.32, 0.32, 0.03, 8]} />
              <meshStandardMaterial color={0xf59e0b} metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[0, 0, 0.02]}>
              <sphereGeometry args={[0.12, 16, 16]} />
              <meshStandardMaterial color={0x14b8a6} emissive={0x2dd4bf} emissiveIntensity={0.8} />
            </mesh>
          </group>
        </group>
      )}

      {/* --- TRẠM 6: DEVOPS (Dual Docker Cargo Containers & Kubernetes Rack) --- */}
      {role === 'devops' && (
        <group>
          {/* 2 Thùng container Docker dập gân kim loại xếp chồng */}
          <group position={[1.05, 0.22, 0.8]}>
            {/* Container 1 bên dưới */}
            <group position={[0, 0.16, 0]}>
              <mesh castShadow>
                <boxGeometry args={[0.7, 0.32, 0.38]} />
                <meshStandardMaterial color={0x0284c7} metalness={0.5} roughness={0.4} />
              </mesh>
              {/* Logo sọc gân container */}
              <mesh position={[0, 0, 0.192]}>
                <boxGeometry args={[0.62, 0.26, 0.01]} />
                <meshStandardMaterial color={0x0369a1} />
              </mesh>
            </group>
            {/* Container 2 bên trên xếp lệch */}
            <group position={[-0.08, 0.48, 0]} rotation={[0, 0.12, 0]}>
              <mesh castShadow>
                <boxGeometry args={[0.66, 0.3, 0.36]} />
                <meshStandardMaterial color={0x0284c7} metalness={0.5} roughness={0.4} />
              </mesh>
            </group>
          </group>
          {/* Cụm Kubernetes Server Rack 4 tầng */}
          <group position={[1.15, 0.75, -1.0]}>
            <mesh castShadow>
              <boxGeometry args={[0.48, 1.05, 0.42]} />
              <meshStandardMaterial color={0x0f172a} metalness={0.8} roughness={0.2} />
            </mesh>
            {[0.35, 0.12, -0.12, -0.35].map((yOffset, i) => (
              <mesh key={i} position={[0, yOffset, 0.212]}>
                <boxGeometry args={[0.42, 0.18, 0.01]} />
                <meshStandardMaterial
                  color={0x1e293b}
                  emissive={0x38bdf8}
                  emissiveIntensity={0.4}
                />
              </mesh>
            ))}
          </group>
        </group>
      )}

      {/* --- TRẠM 7: MONITOR (APM Telemetry Waveform & Rotating Radar Tower) --- */}
      {role === 'monitor' && (
        <group>
          {/* Cột tháp Radar quan trắc APM xoay tròn */}
          <group ref={radarRef} position={[-1.15, 1.7, -1.15]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.035, 0.045, 0.8]} />
              <meshStandardMaterial color={0x475569} metalness={0.8} />
            </mesh>
            {/* Đĩa chảo radar parabol */}
            <mesh position={[0, 0.42, 0]} rotation={[0.45, 0, 0]}>
              <cylinderGeometry args={[0.32, 0.06, 0.12, 20]} />
              <meshStandardMaterial
                color={0x0284c7}
                emissive={0x38bdf8}
                emissiveIntensity={0.8}
              />
            </mesh>
            {/* Chóp ăng-ten phát sóng nhấp nháy */}
            <mesh position={[0, 0.6, 0]}>
              <sphereGeometry args={[0.06, 12, 12]} />
              <meshBasicMaterial color={0xef4444} />
            </mesh>
          </group>
          {/* Màn hình Grafana Waveform nhịp tim APM trên vách sau */}
          <group position={[0, 1.45, -1.55]}>
            <mesh castShadow>
              <boxGeometry args={[1.6, 0.75, 0.03]} />
              <meshStandardMaterial color={0x0f172a} metalness={0.8} />
            </mesh>
            <mesh position={[0, 0, 0.018]}>
              <planeGeometry args={[1.52, 0.67]} />
              <meshStandardMaterial
                color={0x0284c7}
                emissive={0x38bdf8}
                emissiveIntensity={0.85}
              />
            </mesh>
          </group>
        </group>
      )}
    </group>
  );
};
