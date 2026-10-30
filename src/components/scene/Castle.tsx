import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useTownStore } from '../../store/useTownStore';

/**
 * TRUNG TÂM CHỈ HUY TRUNG TÂM (AI COMMAND CENTER / WAR ROOM)
 * Thay thế cho lâu đài cổ tích cũ: Tòa nhà điều hành kính trong suốt phong cách hiện đại
 * (Apple Park / SpaceX Mission Control). Nhìn thấy trọn vẹn bên trong: Bàn Hologram 3D phát sáng,
 * Dàn màn hình chỉ huy NOC cong lớn, Ghế thuyền trưởng công thái học và Agent Claude Code điều hành.
 */
export const CommandCenter: React.FC = () => {
  const hologramCoreRef = useRef<THREE.Group>(null);
  const orbitalRingRef = useRef<THREE.Mesh>(null);
  const monitorLightRef = useRef<THREE.PointLight>(null);

  const selectAgent = useTownStore((s) => s.selectAgent);
  const selectedAgentRole = useTownStore((s) => s.selectedAgentRole);
  const isRealRunning = useTownStore((s) => s.isRealRunning);
  const isSimulating = useTownStore((s) => s.isSimulating);

  const isSelected = selectedAgentRole === 'orchestrator';
  const isBusy = isRealRunning || isSimulating;

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const speedMult = isBusy ? 2.5 : 1.0;

    // Quả cầu Hologram lơ lửng xoay tròn và nhấp nhô
    if (hologramCoreRef.current) {
      hologramCoreRef.current.rotation.y += delta * 0.8 * speedMult;
      hologramCoreRef.current.rotation.x = Math.sin(t * 1.5) * 0.15;
      hologramCoreRef.current.position.y = 1.25 + Math.sin(t * 2.5) * 0.08;
    }

    // Vành quỹ đạo xoay nghiêng ngược chiều
    if (orbitalRingRef.current) {
      orbitalRingRef.current.rotation.z -= delta * 1.2 * speedMult;
      orbitalRingRef.current.rotation.y += delta * 0.6;
    }

    // Ánh sáng nhịp tim của trung tâm chỉ huy
    if (monitorLightRef.current) {
      const pulse = 0.8 + Math.sin(t * (isBusy ? 8 : 3)) * 0.25;
      monitorLightRef.current.intensity = pulse;
    }
  });

  return (
    <group
      position={[0, 0.6, 0]}
      onClick={(e) => {
        e.stopPropagation();
        selectAgent('orchestrator');
      }}
      onPointerOver={() => {
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'default';
      }}
    >
      {/* ========================================================
          1. BỆ SÀN EPOXY TRÒN HIỆN ĐẠI (CIRCULAR PLATFORM)
          ======================================================== */}
      {/* Sàn đá công nghệ cao trắng ngà */}
      <mesh position={[0, 0.1, 0]} receiveShadow>
        <cylinderGeometry args={[2.8, 2.9, 0.2, 36]} />
        <meshStandardMaterial color={0xf8fafc} roughness={0.4} />
      </mesh>

      {/* Vòng viền LED phát sáng bao quanh mép sàn */}
      <mesh position={[0, 0.205, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.65, 2.78, 36]} />
        <meshBasicMaterial
          color={isSelected ? 0xf59e0b : isBusy ? 0x06b6d4 : 0x38bdf8}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Bậc thềm đá trước cửa đón khách */}
      <mesh position={[0, 0.05, 2.5]} receiveShadow>
        <boxGeometry args={[2.4, 0.1, 0.8]} />
        <meshStandardMaterial color={0xe2e8f0} roughness={0.5} />
      </mesh>

      {/* Vòng highlight khi Orchestrator được chọn */}
      {isSelected && (
        <mesh position={[0, 0.22, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.85, 3.05, 36]} />
          <meshBasicMaterial color={0xf59e0b} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* ========================================================
          2. VÁCH KÍNH CONG BÁN NGUYỆT PHÍA SAU (CURVED GLASS WALL)
          Kính trong suốt mở ra không gian bên trong
          ======================================================== */}
      <mesh position={[0, 1.45, 0]}>
        <cylinderGeometry
          args={[2.7, 2.7, 2.5, 32, 1, true, -Math.PI / 2 - 0.35, Math.PI + 0.7]}
        />
        <meshStandardMaterial
          color={0x93c5fd}
          transparent
          opacity={0.28}
          roughness={0.1}
          metalness={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Nẹp viền kim loại nóc kính cong */}
      <mesh position={[0, 2.72, 0]}>
        <cylinderGeometry
          args={[2.72, 2.72, 0.08, 32, 1, true, -Math.PI / 2 - 0.35, Math.PI + 0.7]}
        />
        <meshStandardMaterial color={0xffffff} roughness={0.3} side={THREE.DoubleSide} />
      </mesh>

      {/* 4 Cột trụ kim loại titan nâng đỡ kiến trúc */}
      {[
        [-1.9, 1.9],
        [1.9, 1.9],
        [-1.9, -1.9],
        [1.9, -1.9],
      ].map(([px, pz], idx) => (
        <mesh key={idx} position={[px, 1.4, pz]} castShadow>
          <cylinderGeometry args={[0.065, 0.065, 2.6, 16]} />
          <meshStandardMaterial color={0x334155} metalness={0.6} roughness={0.3} />
        </mesh>
      ))}

      {/* ========================================================
          3. MÁI VÒM BAY HIỆN ĐẠI CÓ GIẾNG TRỜI (AERO CANOPY ROOF)
          Khoét lỗ giếng trời để nhìn trọn vẹn từ trên cao
          ======================================================== */}
      <mesh position={[0, 2.75, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
        <ringGeometry args={[1.6, 2.95, 36]} />
        <meshStandardMaterial color={0x0f172a} roughness={0.4} side={THREE.DoubleSide} />
      </mesh>
      {/* Vòng nẹp viền ngoài màu trắng sang trọng */}
      <mesh position={[0, 2.76, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.92, 3.02, 36]} />
        <meshStandardMaterial color={0x38bdf8} side={THREE.DoubleSide} />
      </mesh>

      {/* Cột ăng-ten phát sóng chỉ huy trên nóc */}
      <group position={[0, 2.75, -1.8]}>
        <mesh position={[0, 0.45, 0]} castShadow>
          <cylinderGeometry args={[0.02, 0.04, 0.9, 8]} />
          <meshStandardMaterial color={0x64748b} metalness={0.8} />
        </mesh>
        {/* Đèn tín hiệu đỉnh tháp nhấp nháy */}
        <mesh position={[0, 0.92, 0]}>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshBasicMaterial color={isBusy ? 0xef4444 : 0x10b981} />
        </mesh>
      </group>

      {/* ========================================================
          4. DÀN MÀN HÌNH CHỈ HUY CONG (CURVED COMMAND SCREEN WALL)
          Hiển thị code & APM live telemetry trên vách tường sau
          ======================================================== */}
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry
          args={[2.62, 2.62, 1.25, 28, 1, true, -Math.PI / 2 + 0.15, Math.PI - 0.3]}
        />
        <meshStandardMaterial
          color={0x0284c7}
          emissive={isBusy ? 0x38bdf8 : 0x0284c7}
          emissiveIntensity={0.65}
          roughness={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Bàn Console điều khiển cong trước màn hình */}
      <mesh position={[0, 0.65, 0]}>
        <cylinderGeometry
          args={[2.1, 2.1, 0.5, 24, 1, true, -Math.PI / 2 + 0.3, Math.PI - 0.6]}
        />
        <meshStandardMaterial color={0x1e293b} roughness={0.4} side={THREE.DoubleSide} />
      </mesh>

      {/* ========================================================
          5. BÀN HOLOGRAM 3D TRUNG TÂM (CENTRAL HOLOGRAPHIC PROJECTOR)
          Trái tim của Orchestrator: mô hình kiến trúc phát sáng
          ======================================================== */}
      <group position={[0, 0.2, 0]}>
        {/* Chân đế kim loại bàn Hologram */}
        <mesh position={[0, 0.32, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.75, 0.9, 0.64, 24]} />
          <meshStandardMaterial color={0x1e293b} metalness={0.5} roughness={0.3} />
        </mesh>

        {/* Đĩa phát quang xanh cyan trên mặt bàn */}
        <mesh position={[0, 0.65, 0]}>
          <cylinderGeometry args={[0.7, 0.7, 0.03, 24]} />
          <meshStandardMaterial
            color={0x0284c7}
            emissive={0x38bdf8}
            emissiveIntensity={0.8}
            roughness={0.2}
          />
        </mesh>

        {/* Chùm tia sáng quét Hologram hình nón mờ */}
        <mesh position={[0, 1.0, 0]}>
          <cylinderGeometry args={[0.55, 0.12, 0.65, 16, 1, true]} />
          <meshBasicMaterial
            color="#38bdf8"
            transparent
            opacity={0.22}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Quả cầu lưới Hologram 3D lơ lửng */}
        <group ref={hologramCoreRef} position={[0, 1.25, 0]}>
          {/* Lưới đa giác đại diện cho mạng lưới 8 AI Agents */}
          <mesh castShadow>
            <icosahedronGeometry args={[0.38, 1]} />
            <meshStandardMaterial
              color={0x38bdf8}
              emissive={0x0284c7}
              emissiveIntensity={0.9}
              wireframe
            />
          </mesh>

          {/* Lõi năng lượng trung tâm lấp lánh */}
          <mesh>
            <octahedronGeometry args={[0.16, 0]} />
            <meshStandardMaterial
              color={0xfbbf24}
              emissive={0xf59e0b}
              emissiveIntensity={1.2}
            />
          </mesh>

          {/* Vành quỹ đạo xoay nghiêng quanh Hologram */}
          <mesh ref={orbitalRingRef} rotation={[0.6, 0, 0]}>
            <torusGeometry args={[0.48, 0.015, 8, 24]} />
            <meshBasicMaterial color={0x67e8f9} transparent opacity={0.7} />
          </mesh>
        </group>

        {/* Nguồn sáng xanh dịu tỏa ra từ Hologram */}
        <pointLight
          ref={monitorLightRef}
          color="#38bdf8"
          distance={6}
          intensity={1.0}
          position={[0, 1.3, 0]}
        />
      </group>

      {/* ========================================================
          6. GHẾ XOAY THUYỀN TRƯỞNG / CHỈ HUY (CAPTAIN'S CHAIR)
          ======================================================== */}
      <group position={[0, 0.22, -1.05]}>
        {/* Đệm ngồi công thái học màu đỏ rượu vang Claude Code */}
        <mesh position={[0, 0.38, 0]} castShadow>
          <cylinderGeometry args={[0.32, 0.35, 0.1, 20]} />
          <meshStandardMaterial color={0x8b2635} roughness={0.4} />
        </mesh>
        {/* Tựa lưng cao quyền lực */}
        <mesh position={[0, 0.72, -0.22]} rotation={[-0.1, 0, 0]} castShadow>
          <boxGeometry args={[0.5, 0.6, 0.08]} />
          <meshStandardMaterial color={0x8b2635} roughness={0.4} />
        </mesh>
        {/* Gối đệm đầu vàng kim */}
        <mesh position={[0, 1.05, -0.25]}>
          <boxGeometry args={[0.32, 0.15, 0.06]} />
          <meshStandardMaterial color={0xfbbf24} roughness={0.3} />
        </mesh>
        {/* Chân ghế kim loại */}
        <mesh position={[0, 0.18, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.36, 12]} />
          <meshStandardMaterial color={0x334155} metalness={0.7} />
        </mesh>
      </group>
    </group>
  );
};

// Export alias Castle để tương thích ngược với các file import hiện hữu
export const Castle = CommandCenter;
