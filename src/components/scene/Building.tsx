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
 * Phòng làm việc cắt lát (Cutaway Office Room / Dollhouse)
 * Nhìn thấy trọn vẹn nội thất bên trong: sàn gỗ, bàn làm việc, màn hình máy tính phát sáng,
 * chậu cây xanh, ghế xoay và các vật dụng đặc trưng cho từng AI Agent.
 */
export const Building: React.FC<BuildingProps> = ({ role }) => {
  const layout = STATIONS_LAYOUT[role];
  const selectAgent = useTownStore((s) => s.selectAgent);
  const selectedAgentRole = useTownStore((s) => s.selectedAgentRole);
  const agentStatus = useTownStore((s) => s.agents[role]?.status);

  const isSelected = selectedAgentRole === role;
  const radarRef = useRef<THREE.Group>(null);
  const monitorLightRef = useRef<THREE.PointLight>(null);

  useFrame((state, delta) => {
    // Xoay radar của trạm Monitor
    if (radarRef.current) {
      radarRef.current.rotation.y += delta * 2.5;
    }

    // Hiệu ứng màn hình máy tính nhấp nháy ánh sáng code
    if (monitorLightRef.current) {
      const flicker = 0.5 + Math.sin(state.clock.elapsedTime * 6) * 0.15;
      monitorLightRef.current.intensity = flicker;
    }
  });

  // Màu pastel êm dịu cho từng phòng
  const getRoomWallColor = () => {
    switch (role) {
      case 'pm':
        return 0xdbeafe; // Pastel blue
      case 'dev':
        return 0xffedd5; // Pastel warm peach
      case 'review':
        return 0xfef9c3; // Pastel warm yellow
      case 'qa':
        return 0xf3e8ff; // Pastel purple
      case 'security':
        return 0xccfbf1; // Pastel teal/mint
      case 'devops':
        return 0xe0e7ff; // Pastel indigo
      case 'monitor':
        return 0xf1f5f9; // Pastel slate
      default:
        return 0xfef3c7;
    }
  };

  const wallColor = getRoomWallColor();

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
      {/* 1. ĐẾ NỀN PHÒNG (Room Platform) */}
      <mesh position={[0, 0.1, 0]} receiveShadow>
        <boxGeometry args={[3.8, 0.2, 3.8]} />
        <meshStandardMaterial color={0xf1f5f9} roughness={0.6} />
      </mesh>

      {/* BẬC THỀM ĐÁ TRƯỚC CỬA (Stone Entrance Step) */}
      <mesh position={[0, 0.05, 2.1]} receiveShadow>
        <boxGeometry args={[2.4, 0.1, 0.6]} />
        <meshStandardMaterial color={TOKENS.palette3D.path} roughness={0.6} />
      </mesh>

      {/* 2. SÀN GỖ ẤM ÁP (Warm Parquet Wooden Floor) */}
      <mesh position={[0, 0.21, 0]} receiveShadow>
        <boxGeometry args={[3.5, 0.04, 3.5]} />
        <meshStandardMaterial color={0xfde68a} roughness={0.4} />
      </mesh>

      {/* 3. THẢM TRÒN PASTEL TRÊN SÀN (Pastel Cozy Rug) */}
      <mesh position={[0, 0.235, 0.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.1, 32]} />
        <meshStandardMaterial
          color={layout.accentColor}
          opacity={0.3}
          transparent
          roughness={0.8}
        />
      </mesh>

      {/* VÒNG TRÒN HIGHLIGHT KHI ĐƯỢC CHỌN */}
      {isSelected && (
        <mesh position={[0, 0.25, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.0, 2.2, 32]} />
          <meshBasicMaterial color={layout.accentColor} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* 4. HAI VÁCH TƯỜNG PASTEL MỞ (L-Shaped Cutaway Walls - Không có nóc che khuất) */}
      {/* Vách tường sau */}
      <mesh position={[0, 1.25, -1.65]} castShadow receiveShadow>
        <boxGeometry args={[3.5, 2.1, 0.18]} />
        <meshStandardMaterial color={wallColor} roughness={0.4} />
      </mesh>
      {/* Nẹp viền trắng trên tường sau */}
      <mesh position={[0, 2.32, -1.65]}>
        <boxGeometry args={[3.52, 0.08, 0.22]} />
        <meshStandardMaterial color={0xffffff} roughness={0.3} />
      </mesh>

      {/* Vách tường trái */}
      <mesh position={[-1.65, 1.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.18, 2.1, 3.5]} />
        <meshStandardMaterial color={wallColor} roughness={0.4} />
      </mesh>
      {/* Nẹp viền trắng tường trái */}
      <mesh position={[-1.65, 2.32, 0]}>
        <boxGeometry args={[0.22, 0.08, 3.52]} />
        <meshStandardMaterial color={0xffffff} roughness={0.3} />
      </mesh>

      {/* 5. CỤM BÀN LÀM VIỆC NỘI THẤT (Wooden Office Desk) */}
      <group position={[0, 0.23, -0.6]}>
        {/* Mặt bàn gỗ sáng */}
        <mesh position={[0, 0.65, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.7, 0.08, 0.85]} />
          <meshStandardMaterial color={0xd97706} roughness={0.35} />
        </mesh>
        {/* 4 chân bàn thanh mảnh */}
        <mesh position={[-0.75, 0.32, -0.32]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.64]} />
          <meshStandardMaterial color={0x78350f} />
        </mesh>
        <mesh position={[0.75, 0.32, -0.32]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.64]} />
          <meshStandardMaterial color={0x78350f} />
        </mesh>
        <mesh position={[-0.75, 0.32, 0.32]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.64]} />
          <meshStandardMaterial color={0x78350f} />
        </mesh>
        <mesh position={[0.75, 0.32, 0.32]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.64]} />
          <meshStandardMaterial color={0x78350f} />
        </mesh>

        {/* 6. MÀN HÌNH MÁY TÍNH PHÁT SÁNG (Glowing Desktop Monitor) */}
        <group position={[0, 0.7, -0.15]}>
          {/* Chân đế màn hình */}
          <mesh position={[0, 0.02, 0]}>
            <cylinderGeometry args={[0.1, 0.12, 0.04]} />
            <meshStandardMaterial color={0x334155} />
          </mesh>
          <mesh position={[0, 0.18, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.32]} />
            <meshStandardMaterial color={0x475569} />
          </mesh>
          {/* Khung viền màn hình */}
          <mesh position={[0, 0.38, 0]} castShadow>
            <boxGeometry args={[0.72, 0.44, 0.05]} />
            <meshStandardMaterial color={0x1e293b} roughness={0.2} />
          </mesh>
          {/* Màn hình hiển thị phát sáng dịu mắt (Emissive Display) */}
          <mesh position={[0, 0.38, 0.027]}>
            <planeGeometry args={[0.66, 0.38]} />
            <meshStandardMaterial
              color={0x0284c7}
              emissive={0x38bdf8}
              emissiveIntensity={0.65}
            />
          </mesh>
          {/* Ánh sáng dịu tỏa ra từ màn hình */}
          <pointLight
            ref={monitorLightRef}
            color="#38bdf8"
            distance={2.5}
            intensity={0.6}
            position={[0, 0.38, 0.4]}
          />

          {/* Bàn phím & Chuột trên bàn */}
          <mesh position={[0, 0.01, 0.24]}>
            <boxGeometry args={[0.42, 0.015, 0.16]} />
            <meshStandardMaterial color={0x334155} />
          </mesh>
          <mesh position={[0.28, 0.01, 0.24]}>
            <boxGeometry args={[0.07, 0.02, 0.1]} />
            <meshStandardMaterial color={0x334155} />
          </mesh>
        </group>

        {/* 7. CỐC TRÀ MATCHA / COFFEE 🍵 TRÊN BÀN */}
        <group position={[-0.6, 0.73, 0.15]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.065, 0.05, 0.12, 16]} />
            <meshStandardMaterial color={0xffffff} roughness={0.2} />
          </mesh>
          {/* Nước matcha xanh */}
          <mesh position={[0, 0.055, 0]}>
            <cylinderGeometry args={[0.058, 0.058, 0.01, 16]} />
            <meshStandardMaterial color={0x65a30d} />
          </mesh>
        </group>

        {/* 8. GHẾ XOAY VĂN PHÒNG PASTEL (Office Swivel Chair) */}
        <group position={[0, 0.25, 0.6]}>
          {/* Đệm ngồi */}
          <mesh position={[0, 0.32, 0]} castShadow>
            <cylinderGeometry args={[0.26, 0.28, 0.08, 20]} />
            <meshStandardMaterial color={layout.accentColor} roughness={0.5} />
          </mesh>
          {/* Tựa lưng cong */}
          <mesh position={[0, 0.58, 0.2]} castShadow>
            <boxGeometry args={[0.42, 0.4, 0.06]} />
            <meshStandardMaterial color={layout.accentColor} roughness={0.5} />
          </mesh>
          {/* Chân ghế */}
          <mesh position={[0, 0.15, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.3]} />
            <meshStandardMaterial color={0x334155} />
          </mesh>
        </group>
      </group>

      {/* 9. CHẬU CÂY MONSTERA XANH MÁT Ở GÓC PHÒNG */}
      <group position={[-1.15, 0.23, 1.15]}>
        {/* Chậu gốm trắng bo tròn */}
        <mesh position={[0, 0.22, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.15, 0.4, 20]} />
          <meshStandardMaterial color={0xf8fafc} roughness={0.3} />
        </mesh>
        {/* Đất */}
        <mesh position={[0, 0.41, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.02, 16]} />
          <meshStandardMaterial color={0x523218} />
        </mesh>
        {/* Tán lá xanh tròn xoe */}
        <mesh position={[0, 0.6, 0]} castShadow>
          <sphereGeometry args={[0.25, 14, 14]} />
          <meshStandardMaterial color={0x22c55e} roughness={0.5} />
        </mesh>
        <mesh position={[0.1, 0.72, 0.05]} castShadow>
          <sphereGeometry args={[0.2, 14, 14]} />
          <meshStandardMaterial color={0x4ade80} roughness={0.5} />
        </mesh>
      </group>

      {/* 10. ĐỒ TRANG TRÍ RIÊNG BIỆT CHO TỪNG TRẠM */}
      {/* PM: Bảng ghi chú Kanban gắn trên tường */}
      {role === 'pm' && (
        <group position={[0, 1.5, -1.54]}>
          <mesh>
            <boxGeometry args={[1.2, 0.7, 0.02]} />
            <meshStandardMaterial color={0xffffff} />
          </mesh>
          {/* Note vàng */}
          <mesh position={[-0.35, 0.12, 0.02]}>
            <planeGeometry args={[0.2, 0.2]} />
            <meshBasicMaterial color={0xfde047} />
          </mesh>
          {/* Note hồng */}
          <mesh position={[0, 0.12, 0.02]}>
            <planeGeometry args={[0.2, 0.2]} />
            <meshBasicMaterial color={0xf472b6} />
          </mesh>
          {/* Note xanh */}
          <mesh position={[0.35, -0.12, 0.02]}>
            <planeGeometry args={[0.2, 0.2]} />
            <meshBasicMaterial color={0x38bdf8} />
          </mesh>
        </group>
      )}

      {/* DEV: Cốc cà phê & Màn hình phụ dựng dọc */}
      {role === 'dev' && (
        <group position={[0.62, 0.95, -0.7]} rotation={[0, -0.3, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.24, 0.44, 0.04]} />
            <meshStandardMaterial color={0x1e293b} />
          </mesh>
          <mesh position={[0, 0, 0.022]}>
            <planeGeometry args={[0.2, 0.4]} />
            <meshBasicMaterial color={0x10b981} />
          </mesh>
        </group>
      )}

      {/* QA: Bình thí nghiệm Test Suite phát sáng tím */}
      {role === 'qa' && (
        <group position={[0.6, 0.96, -0.45]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.08, 0.12, 0.25, 16]} />
            <meshStandardMaterial
              color={0xa855f7}
              emissive={0xc084fc}
              emissiveIntensity={0.6}
              transparent
              opacity={0.85}
            />
          </mesh>
        </group>
      )}

      {/* SECURITY: Khiên vàng bảo mật gắn tường */}
      {role === 'security' && (
        <group position={[0, 1.5, -1.54]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.3, 0.3, 0.04, 6]} />
            <meshStandardMaterial color={0xf59e0b} metalness={0.4} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0, 0.03]}>
            <sphereGeometry args={[0.12, 12, 12]} />
            <meshStandardMaterial color={0x14b8a6} emissive={0x2dd4bf} emissiveIntensity={0.5} />
          </mesh>
        </group>
      )}

      {/* DEVOPS: Thùng Container Docker Mini ở góc */}
      {role === 'devops' && (
        <group position={[1.15, 0.35, 1.15]}>
          <mesh castShadow>
            <boxGeometry args={[0.5, 0.35, 0.35]} />
            <meshStandardMaterial color={0x0284c7} roughness={0.4} />
          </mesh>
        </group>
      )}

      {/* MONITORING: Cột Radar xoay tròn giám sát */}
      {role === 'monitor' && (
        <group ref={radarRef} position={[-1.2, 1.8, -1.2]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.03, 0.03, 0.6]} />
            <meshStandardMaterial color={0x64748b} />
          </mesh>
          <mesh position={[0, 0.3, 0]} rotation={[0.4, 0, 0]}>
            <cylinderGeometry args={[0.26, 0.05, 0.1, 16]} />
            <meshStandardMaterial color={0x38bdf8} emissive={0x0284c7} emissiveIntensity={0.5} />
          </mesh>
        </group>
      )}
    </group>
  );
};
