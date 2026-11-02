'use client';

import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { AgentRole, STAGE_ORDER } from '../../lib/pipeline/stages';
import { getStationNavPoints } from '../../lib/scene/waypoints';
import { useTownStore } from '../../store/useTownStore';

/**
 * Hệ thống Cáp Quang Dữ Liệu Phát Sáng & Heatmap Lưu Lượng (Network Traffic & Data Bus Heatmap):
 * - 7 dải cáp neon chạy dọc theo tim đường 7 đại lộ nan hoa nối từ Command Center ra 7 trạm.
 * - Tự động đổi màu Heatmap (Cyan ➔ Vàng Amber ➔ Đỏ Rực) dựa trên trạng thái làm việc, lỗi, và TPS/CPU.
 * - Hạt photon (Data Pulse) tăng tốc độ dịch chuyển tương ứng theo lưu lượng tải thời gian thực.
 */
export const DataCables: React.FC = () => {
  const agents = useTownStore((s) => s.agents);
  const resolvedTheme = useTownStore((s) => s.resolvedTheme);
  const cpuUsage = useTownStore((s) => s.cpuUsage);
  const tps = useTownStore((s) => s.tps);
  const isChaosRunning = useTownStore((s) => s.isChaosRunning);
  const isNight = resolvedTheme === 'night';

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
    const currentTps = currentState.tps || 342;
    const chaosActive = currentState.isChaosRunning;

    cableSegments.forEach((seg, idx) => {
      const mesh = pulseRefs.current[idx];
      if (!mesh) return;

      const agent = currentState.agents[seg.role];
      const isWorking = agent?.status === 'working';
      const isDebugging = agent?.status === 'debugging';

      // Tính tốc độ xung dữ liệu dựa trên tải trọng
      let speedFactor = isWorking ? 1.6 : isDebugging ? 2.4 : 0.35;
      if (chaosActive) {
        speedFactor = 3.6;
      } else if (currentTps > 600) {
        speedFactor *= 1.5;
      }

      mesh.visible = true;
      const progress = (t * speedFactor + idx * 0.22) % 1;
      const currentR = seg.rStart + seg.cableLen * progress;
      mesh.position.set(
        Math.cos(seg.angle) * currentR,
        0.052,
        Math.sin(seg.angle) * currentR
      );

      // Độ co giãn nhấp nháy của photon hạt
      if (chaosActive || isDebugging) {
        mesh.scale.setScalar(1.25 + Math.sin(t * 18) * 0.35);
      } else if (isWorking) {
        mesh.scale.setScalar(1.1 + Math.sin(t * 12) * 0.22);
      } else {
        mesh.scale.setScalar(isNight ? 0.85 : 0.65);
      }
    });
  });

  return (
    <group position={[0, 0.6, 0]}>
      {cableSegments.map((seg, idx) => {
        const agent = agents[seg.role];
        const isWorking = agent?.status === 'working';
        const isDebugging = agent?.status === 'debugging';
        const isError = agent?.status === 'error';

        // Tính màu Heatmap theo tải
        let cableColor = 0x0ea5e9; // Cyan mặc định
        let glowColor = 0x38bdf8;
        let opacity = isNight ? 0.5 : 0.35;

        if (isChaosRunning) {
          cableColor = 0xef4444; // Đỏ bão tải
          glowColor = 0xff6b6b;
          opacity = 0.95;
        } else if (isError || isDebugging) {
          cableColor = 0xf97316; // Cam cảnh báo
          glowColor = 0xfdba74;
          opacity = 0.9;
        } else if (isWorking) {
          if (cpuUsage > 75 || tps > 600) {
            cableColor = 0xfbbf24; // Vàng Amber tải nặng
            glowColor = 0xfef08a;
          } else {
            cableColor = 0x06b6d4; // Cyan công nghệ cao
            glowColor = 0x67e8f9;
          }
          opacity = 0.95;
        } else if (isNight) {
          cableColor = 0x0284c7;
          opacity = 0.65;
        }

        return (
          <group key={seg.role}>
            {/* Rãnh cáp quang ngầm phát sáng mỏng trên tim đường (nâng y = 0.038 tránh Z-fighting) */}
            <mesh
              position={[seg.midX, 0.038, seg.midZ]}
              rotation={[-Math.PI / 2, 0, -seg.angle + Math.PI / 2]}
            >
              <planeGeometry args={[0.12, seg.cableLen]} />
              <meshBasicMaterial
                color={cableColor}
                transparent
                opacity={Math.max(opacity, 0.6)}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* Vầng sáng viền Heatmap khi trạm hoạt động */}
            {(isWorking || isDebugging || isChaosRunning) && (
              <mesh
                position={[seg.midX, 0.036, seg.midZ]}
                rotation={[-Math.PI / 2, 0, -seg.angle + Math.PI / 2]}
              >
                <planeGeometry args={[0.26, seg.cableLen]} />
                <meshBasicMaterial
                  color={glowColor}
                  transparent
                  opacity={0.45}
                  side={THREE.DoubleSide}
                />
              </mesh>
            )}

            {/* Hạt photon xung dữ liệu dịch chuyển dọc theo cáp (Pulse Particle) */}
            <mesh
              ref={(el) => {
                pulseRefs.current[idx] = el;
              }}
              position={[
                Math.cos(seg.angle) * (seg.rStart + seg.cableLen * 0.5),
                0.052,
                Math.sin(seg.angle) * (seg.rStart + seg.cableLen * 0.5),
              ]}
            >
              <sphereGeometry args={[0.082, 12, 12]} />
              <meshBasicMaterial color={glowColor} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};
