import React from 'react';
import * as THREE from 'three';
import { STATIONS_LAYOUT } from '../../lib/scene/layout';
import { AgentRole } from '../../lib/pipeline/stages';
import { getStationNavPoints } from '../../lib/scene/waypoints';

// Bảng màu đá hoa cương và sa thạch sắc nét
const ROAD_STONE = 0xf8fafc; // Đá hoa cương trắng ngà sạch đẹp
const ROAD_ACCENT = 0xfef08a; // Đá sa thạch vàng ấm đón khách
const CURB_STONE = 0x64748b; // Gờ đá viền vỉa hè xám sẫm nổi khối
const PLAZA_RING = 0xe2e8f0; // Vành đai đá trung tâm

export const Paths: React.FC = () => {
  const stations: AgentRole[] = ['pm', 'dev', 'review', 'qa', 'security', 'devops', 'monitor'];

  return (
    <group position={[0, 0.6, 0]}>
      {/* ========================================================
          1. QUẢNG TRƯỜNG ĐÁ TRUNG TÂM (CENTRAL PLAZA)
          ======================================================== */}
      {/* Nền tròn quảng trường trung tâm bao quanh Lâu đài (R = 5.2m) */}
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <cylinderGeometry args={[5.2, 5.2, 0.04, 48]} />
        <meshStandardMaterial color={ROAD_STONE} roughness={0.7} />
      </mesh>

      {/* Vòng đai đá hoa văn đồng tâm trên quảng trường (R = 3.2m -> 5.1m) */}
      <mesh position={[0, 0.025, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[3.2, 5.1, 48]} />
        <meshStandardMaterial color={PLAZA_RING} roughness={0.6} />
      </mesh>

      {/* Gờ đá viền vỉa hè tròn quanh quảng trường trung tâm */}
      <mesh position={[0, 0.035, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[5.12, 5.32, 48]} />
        <meshStandardMaterial color={CURB_STONE} roughness={0.5} />
      </mesh>

      {/* Thềm đá chính diện trước cửa Lâu đài Claude Code */}
      <mesh position={[0, 0.04, 2.7]} receiveShadow castShadow>
        <boxGeometry args={[3.6, 0.06, 2.2]} />
        <meshStandardMaterial color={ROAD_STONE} roughness={0.5} />
      </mesh>
      {/* Viền bậc thềm lâu đài */}
      <mesh position={[0, 0.045, 3.8]}>
        <boxGeometry args={[3.62, 0.07, 0.16]} />
        <meshStandardMaterial color={CURB_STONE} />
      </mesh>

      {/* ========================================================
          2. ĐẠI LỘ HOÀNG GIA PHÍA NAM (SOUTH ROYAL BOULEVARD)
          Nối từ Quảng trường Trung tâm thẳng ra cổng Nam của hòn đảo
          ======================================================== */}
      <mesh position={[0, 0.022, 7.8]} receiveShadow>
        <boxGeometry args={[2.6, 0.04, 5.4]} />
        <meshStandardMaterial color={ROAD_STONE} roughness={0.7} />
      </mesh>
      {/* 2 Gờ đá viền hai bên đại lộ Nam */}
      <mesh position={[-1.38, 0.035, 7.8]} receiveShadow>
        <boxGeometry args={[0.16, 0.06, 5.4]} />
        <meshStandardMaterial color={CURB_STONE} />
      </mesh>
      <mesh position={[1.38, 0.035, 7.8]} receiveShadow>
        <boxGeometry args={[0.16, 0.06, 5.4]} />
        <meshStandardMaterial color={CURB_STONE} />
      </mesh>

      {/* ========================================================
          3. 7 NHÁNH ĐẠI LỘ NAN HOA HƯỚNG TÂM (7 RADIAL AVENUES)
          Nối thẳng tắp từ vòng xuyến trung tâm vào thềm cửa 7 phòng
          ======================================================== */}
      {stations.map((role) => {
        const layout = STATIONS_LAYOUT[role];
        const nav = getStationNavPoints(role);

        // Vector từ tâm đảo ra đến thềm cửa trạm
        const doorX = nav.door.x;
        const doorZ = nav.door.z;
        const angle = Math.atan2(doorZ, doorX);
        const dist = Math.hypot(doorX, doorZ); // Khoảng 6.7m

        // Điểm nối đại lộ nan hoa từ R = 4.2 đến R = dist + 0.3
        const rStart = 4.2;
        const rEnd = dist + 0.3;
        const roadLen = rEnd - rStart;
        const rMid = (rStart + rEnd) / 2;

        const midX = Math.cos(angle) * rMid;
        const midZ = Math.sin(angle) * rMid;

        // Vector vuông góc để dựng viền vỉa hè hai bên
        const perpX = Math.cos(angle + Math.PI / 2);
        const perpZ = Math.sin(angle + Math.PI / 2);
        const halfRoadWidth = 1.25;

        return (
          <group key={role}>
            {/* Lòng đường lát đá nan hoa hướng tâm */}
            <mesh
              position={[midX, 0.024, midZ]}
              rotation={[-Math.PI / 2, 0, -angle + Math.PI / 2]}
              receiveShadow
            >
              <planeGeometry args={[2.5, roadLen]} />
              <meshStandardMaterial color={ROAD_STONE} roughness={0.7} side={THREE.DoubleSide} />
            </mesh>

            {/* Dải gờ đá viền vỉa hè bên trái */}
            <mesh
              position={[
                midX - perpX * halfRoadWidth,
                0.035,
                midZ - perpZ * halfRoadWidth,
              ]}
              rotation={[-Math.PI / 2, 0, -angle + Math.PI / 2]}
              receiveShadow
            >
              <planeGeometry args={[0.16, roadLen]} />
              <meshStandardMaterial color={CURB_STONE} side={THREE.DoubleSide} />
            </mesh>

            {/* Dải gờ đá viền vỉa hè bên phải */}
            <mesh
              position={[
                midX + perpX * halfRoadWidth,
                0.035,
                midZ + perpZ * halfRoadWidth,
              ]}
              rotation={[-Math.PI / 2, 0, -angle + Math.PI / 2]}
              receiveShadow
            >
              <planeGeometry args={[0.16, roadLen]} />
              <meshStandardMaterial color={CURB_STONE} side={THREE.DoubleSide} />
            </mesh>

            {/* Sân đỗ chào đón trước cửa phòng (Station Welcome Landing Pad) */}
            <group position={[doorX, 0.03, doorZ]} rotation={[0, layout.rotationY, 0]}>
              {/* Bục đá sa thạch đón khách */}
              <mesh receiveShadow castShadow>
                <boxGeometry args={[2.8, 0.05, 1.4]} />
                <meshStandardMaterial color={ROAD_ACCENT} roughness={0.6} />
              </mesh>
              {/* Viền gờ đá bảo vệ quanh bục */}
              <mesh position={[0, 0.01, 0.72]}>
                <boxGeometry args={[2.84, 0.06, 0.12]} />
                <meshStandardMaterial color={CURB_STONE} />
              </mesh>
            </group>
          </group>
        );
      })}

      {/* ========================================================
          4. CÁC VIÊN ĐÁ LÁT CUỘI HOA VĂN ĐIỂM XUYẾT (FLAGSTONES)
          ======================================================== */}
      {[
        [-1.8, 1.6],
        [-2.4, 0.4],
        [-1.2, -1.8],
        [1.6, -1.5],
        [2.2, 0.8],
        [1.8, 2.2],
        [-3.8, -1.2],
        [3.6, -1.0],
        [-4.2, 1.8],
        [4.2, 1.8],
        [0, 6.2],
        [-1.0, 7.8],
        [1.0, 7.8],
        [0, 9.4],
      ].map(([fx, fz], idx) => (
        <mesh
          key={idx}
          position={[fx, 0.032, fz]}
          rotation={[-Math.PI / 2, 0, idx * 0.45]}
          receiveShadow
        >
          <circleGeometry args={[0.35 + (idx % 3) * 0.08, 16]} />
          <meshStandardMaterial color={ROAD_ACCENT} roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
};
