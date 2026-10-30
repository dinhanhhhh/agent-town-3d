'use client';

import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { STATIONS_LAYOUT } from '../../lib/scene/layout';
import { AgentRole, STAGE_ORDER } from '../../lib/pipeline/stages';
import { getStationNavPoints } from '../../lib/scene/waypoints';
import { useTownStore } from '../../store/useTownStore';

/**
 * Hệ thống Cáp Quang Dữ Liệu Phát Sáng (Glowing Neon Data Bus):
 * - 7 dải cáp neon chạy dọc theo tim đường 7 đại lộ nan hoa nối từ Command Center ra 7 trạm.
 * - Hạt photon phát sáng (Data Pulse) chạy nhấp nháy dọc theo dây cáp khi trạm đang làm việc.
 */
export const DataCables: React.FC = () => {
  const agents = useTownStore((s) => s.agents);
  const themeMode = useTownStore((s) => s.themeMode);
  const isNight = themeMode === 'night';

  const stations = STAGE_ORDER.filter((r) => r !== 'orchestrator') as AgentRole[];
  const pulseRefs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    stations.forEach((role, idx) => {
      const mesh = pulseRefs.current[idx];
      if (!mesh) return;

      const agent = agents[role];
      const isWorking = agent?.status === 'working' || agent?.status === 'debugging';

      if (isWorking) {
        mesh.visible = true;
        // Chuyển động lặp từ R = 2.6m đến R = 6.6m
        const progress = (t * 1.5 + idx * 0.25) % 1;
        mesh.scale.setScalar(0.8 + Math.sin(t * 8) * 0.2);
        // Lưu progress vào userData để tính vị trí
        mesh.userData.progress = progress;
      } else {
        mesh.visible = isNight;
        mesh.userData.progress = 0.5 + Math.sin(t + idx) * 0.4;
      }
    });
  });

  return (
    <group position={[0, 0.6, 0]}>
      {stations.map((role, idx) => {
        const nav = getStationNavPoints(role);
        const doorX = nav.door.x;
        const doorZ = nav.door.z;
        const angle = Math.atan2(doorZ, doorX);
        const dist = Math.hypot(doorX, doorZ);

        // Chiều dài cáp nối từ vòng xuyến (R = 2.7m) đến thềm trạm (R = dist)
        const rStart = 2.7;
        const rEnd = dist;
        const cableLen = rEnd - rStart;
        const rMid = (rStart + rEnd) / 2;

        const midX = Math.cos(angle) * rMid;
        const midZ = Math.sin(angle) * rMid;

        const agent = agents[role];
        const isWorking = agent?.status === 'working' || agent?.status === 'debugging';
        const cableColor = isWorking ? 0x38bdf8 : isNight ? 0x0284c7 : 0x0ea5e9;

        return (
          <group key={role}>
            {/* Rãnh cáp quang ngầm phát sáng mỏng trên tim đường */}
            <mesh
              position={[midX, 0.028, midZ]}
              rotation={[-Math.PI / 2, 0, -angle + Math.PI / 2]}
            >
              <planeGeometry args={[0.08, cableLen]} />
              <meshBasicMaterial
                color={cableColor}
                transparent
                opacity={isWorking ? 0.95 : isNight ? 0.65 : 0.4}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* Hạt photon xung dữ liệu chạy dọc theo cáp (Pulse Particle) */}
            <mesh
              ref={(el) => {
                pulseRefs.current[idx] = el;
              }}
              position={[
                Math.cos(angle) * (rStart + cableLen * 0.5),
                0.035,
                Math.sin(angle) * (rStart + cableLen * 0.5),
              ]}
            >
              <sphereGeometry args={[0.065, 8, 8]} />
              <meshBasicMaterial color={isWorking ? 0x67e8f9 : 0x38bdf8} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};
