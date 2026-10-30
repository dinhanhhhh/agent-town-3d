'use client';

import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { AgentRole, STAGE_ORDER } from '../../lib/pipeline/stages';
import { getStationNavPoints } from '../../lib/scene/waypoints';
import { useTownStore } from '../../store/useTownStore';

/**
 * Hệ thống Cáp Quang Dữ Liệu Phát Sáng (Glowing Neon Data Bus):
 * - 7 dải cáp neon chạy dọc theo tim đường 7 đại lộ nan hoa nối từ Command Center ra 7 trạm.
 * - Hạt photon phát sáng (Data Pulse) dịch chuyển thực tế dọc theo dây cáp từ R = 2.7m đến cửa trạm.
 */
export const DataCables: React.FC = () => {
  const agents = useTownStore((s) => s.agents);
  const themeMode = useTownStore((s) => s.themeMode);
  const isNight = themeMode === 'night';

  const stations = useMemo(
    () => STAGE_ORDER.filter((r) => r !== 'orchestrator') as AgentRole[],
    []
  );

  const cableSegments = useMemo(
    () =>
      stations.map((role) => {
        const nav = getStationNavPoints(role);
        const doorX = nav.door.x;
        const doorZ = nav.door.z;
        const angle = Math.atan2(doorZ, doorX);
        const dist = Math.hypot(doorX, doorZ);
        const rStart = 2.7;
        const rEnd = dist;
        const cableLen = rEnd - rStart;
        const rMid = (rStart + rEnd) / 2;
        return {
          role,
          angle,
          rStart,
          cableLen,
          midX: Math.cos(angle) * rMid,
          midZ: Math.sin(angle) * rMid,
        };
      }),
    [stations]
  );

  const pulseRefs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const currentState = useTownStore.getState();

    cableSegments.forEach((seg, idx) => {
      const mesh = pulseRefs.current[idx];
      if (!mesh) return;

      const agent = currentState.agents[seg.role];
      const isWorking = agent?.status === 'working' || agent?.status === 'debugging';

      if (isWorking) {
        mesh.visible = true;
        const progress = (t * 1.45 + idx * 0.22) % 1;
        const currentR = seg.rStart + seg.cableLen * progress;
        mesh.position.set(
          Math.cos(seg.angle) * currentR,
          0.038,
          Math.sin(seg.angle) * currentR
        );
        mesh.scale.setScalar(1.05 + Math.sin(t * 10) * 0.25);
      } else {
        mesh.visible = true;
        const progress = (t * 0.32 + idx * 0.17) % 1;
        const currentR = seg.rStart + seg.cableLen * progress;
        mesh.position.set(
          Math.cos(seg.angle) * currentR,
          0.034,
          Math.sin(seg.angle) * currentR
        );
        mesh.scale.setScalar(isNight ? 0.85 : 0.6);
      }
    });
  });

  return (
    <group position={[0, 0.6, 0]}>
      {cableSegments.map((seg, idx) => {
        const agent = agents[seg.role];
        const isWorking = agent?.status === 'working' || agent?.status === 'debugging';
        const cableColor = isWorking ? 0x38bdf8 : isNight ? 0x0284c7 : 0x0ea5e9;

        return (
          <group key={seg.role}>
            {/* Rãnh cáp quang ngầm phát sáng mỏng trên tim đường */}
            <mesh
              position={[seg.midX, 0.028, seg.midZ]}
              rotation={[-Math.PI / 2, 0, -seg.angle + Math.PI / 2]}
            >
              <planeGeometry args={[0.08, seg.cableLen]} />
              <meshBasicMaterial
                color={cableColor}
                transparent
                opacity={isWorking ? 0.95 : isNight ? 0.65 : 0.4}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* Hạt photon xung dữ liệu dịch chuyển dọc theo cáp (Pulse Particle) */}
            <mesh
              ref={(el) => {
                pulseRefs.current[idx] = el;
              }}
              position={[
                Math.cos(seg.angle) * (seg.rStart + seg.cableLen * 0.5),
                0.036,
                Math.sin(seg.angle) * (seg.rStart + seg.cableLen * 0.5),
              ]}
            >
              <sphereGeometry args={[0.068, 10, 10]} />
              <meshBasicMaterial color={isWorking ? 0x67e8f9 : 0x38bdf8} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};
