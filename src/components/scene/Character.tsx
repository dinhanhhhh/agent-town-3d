import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { AgentRole } from '../../lib/pipeline/stages';
import { STATIONS_LAYOUT } from '../../lib/scene/layout';
import { getRouteWaypoints, interpolateCourierPosition } from '../../lib/scene/waypoints';
import { Courier, useTownStore } from '../../store/useTownStore';

interface StationAgentProps {
  role: AgentRole;
}

/**
 * Nhân vật Chibi Plushie phong cách Pop Mart / Animal Crossing
 * Đầu tròn, tai gấu/mèo, má hồng, mắt tròn đen, thân mập mạp đáng yêu
 */
export const StationAgent: React.FC<StationAgentProps> = ({ role }) => {
  const layout = STATIONS_LAYOUT[role];
  const agent = useTownStore((s) => s.agents[role]);
  const selectAgent = useTownStore((s) => s.selectAgent);
  const selectedAgentRole = useTownStore((s) => s.selectedAgentRole);
  const isSelected = selectedAgentRole === role;

  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);

  // Vị trí ngồi trực tiếp trên ghế công thái học ngay trước bàn làm việc:
  // - Orchestrator (Hub 0): ngồi trên Captain's Chair (z = -0.92), quay mặt +Z nhìn vào bàn Hologram trung tâm
  // - 7 Trạm chuyên môn: ngồi trên Ergonomic Mesh Chair (z = -0.05), quay mặt -Z nhìn thẳng vào màn hình & gõ phím
  const isOrchestrator = role === 'orchestrator';
  const offsetDistance = isOrchestrator ? -0.92 : -0.05;
  const baseY = isOrchestrator ? layout.position[1] + 0.48 : layout.position[1] + 0.52;
  const seatRotationY = isOrchestrator ? layout.rotationY : layout.rotationY + Math.PI;
  const agentPos: [number, number, number] = [
    layout.position[0] + Math.sin(layout.rotationY) * offsetDistance,
    baseY,
    layout.position[2] + Math.cos(layout.rotationY) * offsetDistance,
  ];

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    if (isSelected) {
      // Nhảy cẫng lên ăn mừng và giơ cao hai tay vẫy khi được chọn (Jumping cheer)
      groupRef.current.position.y = baseY + Math.abs(Math.sin(t * 9)) * 0.16;
      if (headRef.current) headRef.current.rotation.y = Math.sin(t * 8) * 0.22;
      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.position.set(-0.24, 0.64 + Math.sin(t * 14) * 0.06, 0.16);
        rightArmRef.current.position.set(0.24, 0.64 - Math.sin(t * 14) * 0.06, 0.16);
      }
    } else if (agent.status === 'working') {
      // Ngồi nhún nhẹ theo nhịp và hai tay gõ bàn phím cơ liên hồi
      groupRef.current.position.y = baseY + Math.abs(Math.sin(t * 6)) * 0.04;
      if (headRef.current) {
        headRef.current.rotation.x = 0.08 + Math.sin(t * 8) * 0.08;
        headRef.current.rotation.y = Math.sin(t * 4) * 0.12;
      }
      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.position.set(-0.18, 0.41 + Math.sin(t * 20) * 0.035, 0.27);
        rightArmRef.current.position.set(0.18, 0.41 - Math.sin(t * 20) * 0.035, 0.27);
      }
    } else if (agent.status === 'debugging') {
      // Nghiêng đầu suy nghĩ, một tay chống cằm một tay gõ nhịp trên bàn
      groupRef.current.position.y = baseY + Math.sin(t * 3) * 0.02;
      if (headRef.current) {
        headRef.current.rotation.z = Math.sin(t * 2) * 0.2;
        headRef.current.rotation.y = Math.sin(t * 3) * 0.25;
      }
      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.position.set(-0.14, 0.52, 0.26);
        rightArmRef.current.position.set(0.20, 0.40 + Math.sin(t * 10) * 0.02, 0.25);
      }
    } else if (agent.status === 'error') {
      // Rung rinh hoảng loạn trước màn hình báo động
      groupRef.current.position.x = agentPos[0] + (Math.random() - 0.5) * 0.03;
      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.position.set(-0.24, 0.56, 0.20);
        rightArmRef.current.position.set(0.24, 0.56, 0.20);
      }
    } else {
      // Ngồi thư giãn trên ghế công thái học, hai tay đặt nhẹ lên bàn phím
      groupRef.current.position.y = baseY + Math.sin(t * 2.2) * 0.02;
      groupRef.current.position.x = agentPos[0];
      if (headRef.current) {
        headRef.current.rotation.x = 0.04;
        headRef.current.rotation.z = 0;
        headRef.current.rotation.y = Math.sin(t * 1.2) * 0.08;
      }
      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.position.set(-0.19, 0.40 + Math.sin(t * 2.2) * 0.01, 0.25);
        rightArmRef.current.position.set(0.19, 0.40 + Math.sin(t * 2.2) * 0.01, 0.25);
      }
    }
  });

  return (
    <group
      ref={groupRef}
      position={agentPos}
      rotation={[0, seatRotationY, 0]}
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
      {/* THÂN BÉO MẬP (Chubby Pastel Hoodie) */}
      <mesh position={[0, 0.42, 0]} castShadow>
        <sphereGeometry args={[0.28, 20, 20]} />
        <meshStandardMaterial
          color={layout.accentColor}
          roughness={0.4}
          metalness={0.05}
        />
      </mesh>

      {/* HAI TAY TRÒN NGẮN Vươn Ra Trước Đặt Lên Bàn Phím */}
      <mesh ref={leftArmRef} position={[-0.19, 0.40, 0.25]} castShadow>
        <sphereGeometry args={[0.095, 14, 14]} />
        <meshStandardMaterial color={layout.accentColor} roughness={0.4} />
      </mesh>
      <mesh ref={rightArmRef} position={[0.19, 0.40, 0.25]} castShadow>
        <sphereGeometry args={[0.095, 14, 14]} />
        <meshStandardMaterial color={layout.accentColor} roughness={0.4} />
      </mesh>

      {/* HAI CHÂN MẬP NGẮN Gập Về Phía Trước Đặt Trên Đệm Ghế Công Thái Học */}
      <mesh position={[-0.13, 0.18, 0.16]} castShadow>
        <sphereGeometry args={[0.105, 14, 14]} />
        <meshStandardMaterial color={0x1e293b} roughness={0.5} />
      </mesh>
      <mesh position={[0.13, 0.18, 0.16]} castShadow>
        <sphereGeometry args={[0.105, 14, 14]} />
        <meshStandardMaterial color={0x1e293b} roughness={0.5} />
      </mesh>

      {/* CỤM ĐẦU CHIBI */}
      <group ref={headRef} position={[0, 0.78, 0]}>
        {/* Khối đầu tròn xoe */}
        <mesh castShadow>
          <sphereGeometry args={[0.32, 24, 24]} />
          <meshStandardMaterial color={0xffe5d9} roughness={0.5} />
        </mesh>

        {/* NÓN / BĂNG ĐÔ MÀU SẮC TRẠM */}
        <mesh position={[0, 0.18, 0]}>
          <sphereGeometry args={[0.33, 20, 20, 0, Math.PI * 2, 0, Math.PI / 2.3]} />
          <meshStandardMaterial color={layout.accentColor} roughness={0.4} />
        </mesh>

        {/* TAI GẤU TRÒN (2 TAI) */}
        <group position={[-0.24, 0.28, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial color={layout.accentColor} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0, 0.04]}>
            <sphereGeometry args={[0.055, 12, 12]} />
            <meshStandardMaterial color={0xffccd5} roughness={0.6} />
          </mesh>
        </group>

        <group position={[0.24, 0.28, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial color={layout.accentColor} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0, 0.04]}>
            <sphereGeometry args={[0.055, 12, 12]} />
            <meshStandardMaterial color={0xffccd5} roughness={0.6} />
          </mesh>
        </group>

        {/* 2 MẮT ĐEN LÁY LONG LANH */}
        <mesh position={[-0.1, 0.03, 0.29]}>
          <sphereGeometry args={[0.035, 12, 12]} />
          <meshStandardMaterial color={0x1e293b} roughness={0.2} />
        </mesh>
        <mesh position={[0.1, 0.03, 0.29]}>
          <sphereGeometry args={[0.035, 12, 12]} />
          <meshStandardMaterial color={0x1e293b} roughness={0.2} />
        </mesh>

        {/* 2 ĐIỂM SÁNG TRONG MẮT (Highlight) */}
        <mesh position={[-0.09, 0.045, 0.318]}>
          <sphereGeometry args={[0.012, 8, 8]} />
          <meshBasicMaterial color={0xffffff} />
        </mesh>
        <mesh position={[0.11, 0.045, 0.318]}>
          <sphereGeometry args={[0.012, 8, 8]} />
          <meshBasicMaterial color={0xffffff} />
        </mesh>

        {/* 2 VẾT MÁ HỒNG CUTE */}
        <mesh position={[-0.16, -0.05, 0.26]}>
          <sphereGeometry args={[0.048, 12, 12]} />
          <meshBasicMaterial color={0xfb7185} opacity={0.8} transparent />
        </mesh>
        <mesh position={[0.16, -0.05, 0.26]}>
          <sphereGeometry args={[0.048, 12, 12]} />
          <meshBasicMaterial color={0xfb7185} opacity={0.8} transparent />
        </mesh>

        {/* MŨI NHỎ XINH */}
        <mesh position={[0, -0.01, 0.31]}>
          <sphereGeometry args={[0.018, 10, 10]} />
          <meshStandardMaterial color={0x475569} />
        </mesh>
      </group>
    </group>
  );
};

/**
 * Shipper Chibi vận chuyển hàng ngộ nghĩnh
 */
export const CourierCharacter: React.FC<{ courier: Courier }> = ({ courier }) => {
  const groupRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);

  const waypoints = React.useMemo(() => {
    return getRouteWaypoints(courier.fromRole, courier.toRole);
  }, [courier.fromRole, courier.toRole]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const { position, rotationY } = interpolateCourierPosition(waypoints, courier.progress);
    groupRef.current.position.copy(position);
    groupRef.current.rotation.y = rotationY;

    // Dáng đi lắc lư nhún nhảy (Waddle walk) trên mặt đường / sàn nhà
    const t = state.clock.elapsedTime;
    const walkCycle = Math.sin(t * 14);
    const bounce = Math.abs(Math.sin(t * 8)) * 0.08;
    groupRef.current.position.y = position.y + bounce;
    groupRef.current.rotation.z = Math.sin(t * 7) * 0.08;

    if (leftLegRef.current && rightLegRef.current) {
      leftLegRef.current.rotation.x = walkCycle * 0.6;
      rightLegRef.current.rotation.x = -walkCycle * 0.6;
    }
  });

  const isFeedback = courier.type === 'feedback';
  const capColor = isFeedback ? 0xef4444 : 0x0ea5e9;
  const boxColor = isFeedback ? 0xf87171 : 0xfbbf24;

  return (
    <group ref={groupRef}>
      {/* THÂN BÉO */}
      <mesh position={[0, 0.42, 0]} castShadow>
        <sphereGeometry args={[0.28, 18, 18]} />
        <meshStandardMaterial color={isFeedback ? 0xdc2626 : 0x0284c7} roughness={0.4} />
      </mesh>

      {/* CHÂN LẮC LƯ */}
      <mesh ref={leftLegRef} position={[-0.1, 0.14, 0]}>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshStandardMaterial color={0x0f172a} />
      </mesh>
      <mesh ref={rightLegRef} position={[0.1, 0.14, 0]}>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshStandardMaterial color={0x0f172a} />
      </mesh>

      {/* ĐẦU TRÒN */}
      <group position={[0, 0.74, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.29, 22, 22]} />
          <meshStandardMaterial color={0xffe5d9} roughness={0.5} />
        </mesh>

        {/* NÓN SHIPPER CÓ LƯỠI TRAI */}
        <mesh position={[0, 0.14, 0]}>
          <sphereGeometry args={[0.3, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2.5]} />
          <meshStandardMaterial color={capColor} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.12, 0.22]} rotation={[0.2, 0, 0]}>
          <boxGeometry args={[0.26, 0.03, 0.16]} />
          <meshStandardMaterial color={capColor} />
        </mesh>

        {/* MẮT CHIBI */}
        <mesh position={[-0.09, 0.02, 0.27]}>
          <sphereGeometry args={[0.032, 10, 10]} />
          <meshStandardMaterial color={0x1e293b} />
        </mesh>
        <mesh position={[0.09, 0.02, 0.27]}>
          <sphereGeometry args={[0.032, 10, 10]} />
          <meshStandardMaterial color={0x1e293b} />
        </mesh>

        {/* MÁ HỒNG */}
        <mesh position={[-0.14, -0.05, 0.24]}>
          <sphereGeometry args={[0.04, 10, 10]} />
          <meshBasicMaterial color={0xfb7185} opacity={0.7} transparent />
        </mesh>
        <mesh position={[0.14, -0.05, 0.24]}>
          <sphereGeometry args={[0.04, 10, 10]} />
          <meshBasicMaterial color={0xfb7185} opacity={0.7} transparent />
        </mesh>
      </group>

      {/* THÙNG BƯNG TRƯỚC NGỰC CÓ RUY-BĂNG ĐẸP MẮT */}
      <group position={[0, 0.5, 0.32]}>
        <mesh castShadow>
          <boxGeometry args={[0.36, 0.28, 0.26]} />
          <meshStandardMaterial color={boxColor} roughness={0.4} />
        </mesh>
        {/* Ruy băng trắng bọc quà */}
        <mesh position={[0, 0, 0.132]}>
          <boxGeometry args={[0.06, 0.282, 0.01]} />
          <meshBasicMaterial color={0xffffff} />
        </mesh>
      </group>
    </group>
  );
};
