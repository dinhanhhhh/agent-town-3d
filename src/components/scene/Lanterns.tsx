import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useTownStore } from '../../store/useTownStore';
import { STATIONS_LAYOUT } from '../../lib/scene/layout';
import { STAGE_ORDER, AgentRole } from '../../lib/pipeline/stages';

interface LanternPos {
  x: number;
  z: number;
}

export const Lanterns: React.FC = () => {
  const resolvedTheme = useTownStore((s) => s.resolvedTheme);
  const lightsRef = useRef<THREE.PointLight[]>([]);

  const isLit = resolvedTheme !== 'day';
  const lightIntensity = resolvedTheme === 'night' ? 1.5 : resolvedTheme === 'sunset' ? 0.8 : 0;
  const emissiveColor = resolvedTheme === 'night' ? 0xfbbf24 : 0xf59e0b;

  // Tính toán vị trí đèn lồng cạnh vỉa hè thềm đón khách của từng trạm
  const lanternPositions: LanternPos[] = React.useMemo(() => {
    const list: LanternPos[] = [
      // 2 đèn trước thềm Lâu đài Claude Code
      { x: -1.8, z: 3.2 },
      { x: 1.8, z: 3.2 },
      // 2 đèn trên đại lộ phía Nam
      { x: -2.5, z: 7.2 },
      { x: 2.5, z: 7.2 },
    ];

    const stations = STAGE_ORDER.filter((r) => r !== 'orchestrator') as AgentRole[];
    for (const role of stations) {
      const layout = STATIONS_LAYOUT[role];
      const rotY = layout.rotationY;
      // Cạnh thềm cửa phòng (lệch sang bên phải vỉa hè một chút để không cản lối đi)
      const fwdX = Math.sin(rotY);
      const fwdZ = Math.cos(rotY);
      const sideX = Math.cos(rotY);
      const sideZ = -Math.sin(rotY);

      list.push({
        x: layout.position[0] + fwdX * 2.2 + sideX * 1.5,
        z: layout.position[2] + fwdZ * 2.2 + sideZ * 1.5,
      });
    }

    return list;
  }, []);

  useFrame((state) => {
    // Hiệu ứng đèn dầu bập bùng nhẹ nhàng trong gió đêm
    if (isLit) {
      const flicker = 1 + Math.sin(state.clock.elapsedTime * 8) * 0.08;
      lightsRef.current.forEach((light) => {
        if (light) light.intensity = lightIntensity * flicker;
      });
    }
  });

  return (
    <group position={[0, 0.6, 0]}>
      {lanternPositions.map((pos, idx) => (
        <group key={idx} position={[pos.x, 0, pos.z]}>
          {/* Cột gỗ đèn lồng */}
          <mesh position={[0, 0.6, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.07, 1.2, 8]} />
            <meshStandardMaterial color={0x78350f} roughness={0.7} />
          </mesh>

          {/* Giá treo chữ L bằng đồng */}
          <mesh position={[0, 1.22, 0.08]}>
            <boxGeometry args={[0.06, 0.06, 0.22]} />
            <meshStandardMaterial color={0x334155} metalness={0.6} roughness={0.3} />
          </mesh>

          {/* Lồng kính đèn */}
          <group position={[0, 1.15, 0.16]}>
            {/* Nón chóp đèn */}
            <mesh position={[0, 0.2, 0]} castShadow>
              <coneGeometry args={[0.18, 0.14, 4]} />
              <meshStandardMaterial color={0x334155} roughness={0.3} />
            </mesh>

            {/* Bóng đèn phát sáng vàng ấm */}
            <mesh>
              <sphereGeometry args={[0.09, 12, 12]} />
              <meshStandardMaterial
                color={0xffedd5}
                emissive={isLit ? emissiveColor : 0x000000}
                emissiveIntensity={isLit ? 1.8 : 0.1}
                roughness={0.2}
              />
            </mesh>

            {/* Khung viền đèn */}
            <mesh>
              <boxGeometry args={[0.22, 0.26, 0.22]} />
              <meshStandardMaterial
                color={0xffffff}
                transparent
                opacity={0.3}
                roughness={0.1}
              />
            </mesh>

            {/* Ánh sáng tỏa ra từ đèn lồng */}
            {isLit && (
              <pointLight
                ref={(el) => {
                  if (el) lightsRef.current[idx] = el;
                }}
                color="#fde047"
                distance={3.5}
                intensity={lightIntensity}
              />
            )}
          </group>

          {/* Vòng đá nhỏ dưới chân cột */}
          <mesh position={[0, 0.03, 0]}>
            <cylinderGeometry args={[0.16, 0.2, 0.06, 8]} />
            <meshStandardMaterial color={0x64748b} roughness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
};
