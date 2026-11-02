import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useTownStore } from '../../store/useTownStore';

const TREE_DATA = [
  // Cây kẹo mút hồng phấn (Pink Lollipop)
  { x: -11, z: -4, type: 'lollipop', color: 0xfbcfe8, height: 1.6 },
  // Cây đám mây kem pastel (Pastel Cloud Tree)
  { x: -10.5, z: 5, type: 'cloud', color: 0xbbf7d0, height: 1.4 },
  // Cây kẹo mút vàng bơ (Butter Yellow Lollipop)
  { x: 11.5, z: -3, type: 'lollipop', color: 0xfef08a, height: 1.5 },
  // Cây đám mây tím oải hương (Lavender Cloud)
  { x: 9.5, z: 6, type: 'cloud', color: 0xe9d5ff, height: 1.7 },
  // Cây kẹo mút anh đào hồng
  { x: -5, z: -11, type: 'lollipop', color: 0xf472b6, height: 1.8 },
  // Cây kẹo mút xanh bạc hà (Mint Green)
  { x: 6, z: -11, type: 'cloud', color: 0x99f6e4, height: 1.5 },
  // Cây đám mây xanh da trời pastel (Baby Blue Cloud)
  { x: -4, z: 11.5, type: 'cloud', color: 0xbae6fd, height: 1.6 },
  // Cây kẹo mút đào cam (Peach Lollipop)
  { x: 4.5, z: 11, type: 'lollipop', color: 0xfecdd3, height: 1.7 },
  // Cây ven đảo
  { x: -13, z: 0, type: 'cloud', color: 0xdcfce7, height: 1.4 },
  { x: 13, z: 2, type: 'lollipop', color: 0xfbcfe8, height: 1.6 },
  { x: 0, z: -12.5, type: 'cloud', color: 0xfde68a, height: 1.5 },
];

/**
 * Cây kẹo mút & Cây kẹo bông pastel tròn xoe đáng yêu
 * Phong cách đồ họa hoạt hình ấm cúng (Cozy Pastel Aesthetic)
 */
export const Trees: React.FC = () => {
  const treesGroupRef = useRef<THREE.Group>(null);
  const isChaosRunning = useTownStore((s) => s.isChaosRunning);

  useFrame((state) => {
    if (!treesGroupRef.current) return;
    const t = state.clock.elapsedTime;
    const windSpeed = isChaosRunning ? 7.5 : 1.8;
    const windAngle = isChaosRunning ? 0.08 : 0.018;

    treesGroupRef.current.children.forEach((child, i) => {
      child.rotation.z = Math.sin(t * windSpeed + i * 0.7) * windAngle;
      child.rotation.x = Math.cos(t * windSpeed * 0.8 + i * 0.5) * (windAngle * 0.5);
    });
  });

  return (
    <group ref={treesGroupRef} position={[0, 0.6, 0]}>
      {TREE_DATA.map((t, idx) => (
        <group key={idx} position={[t.x, 0, t.z]}>
          {/* Thân cây gỗ tròn mịn màng */}
          <mesh position={[0, t.height * 0.45, 0]} castShadow>
            <cylinderGeometry args={[0.09, 0.12, t.height * 0.9, 16]} />
            <meshStandardMaterial color={0x92400e} roughness={0.6} />
          </mesh>

          {/* Loại 1: CÂY KẸO MÚT TRÒN XOE (Lollipop Tree) */}
          {t.type === 'lollipop' && (
            <group position={[0, t.height * 0.95, 0]}>
              {/* Quả cầu chính to */}
              <mesh castShadow>
                <sphereGeometry args={[0.9, 24, 24]} />
                <meshStandardMaterial color={t.color} roughness={0.35} metalness={0.02} />
              </mesh>
              {/* Vòng đai / quả cầu nhỏ nổi bật */}
              <mesh position={[0, 0.25, 0]} castShadow>
                <sphereGeometry args={[0.55, 20, 20]} />
                <meshStandardMaterial color={0xffffff} opacity={0.6} transparent roughness={0.4} />
              </mesh>
            </group>
          )}

          {/* Loại 2: CÂY ĐÁM MÂY KẸO BÔNG (Pastel Cloud Cluster Tree) */}
          {t.type === 'cloud' && (
            <group position={[0, t.height * 0.92, 0]}>
              {/* Quả cầu trung tâm */}
              <mesh castShadow>
                <sphereGeometry args={[0.82, 24, 24]} />
                <meshStandardMaterial color={t.color} roughness={0.4} />
              </mesh>
              {/* 3 cụm bông mây tròn xoe xung quanh */}
              <mesh position={[-0.45, -0.1, 0.2]} castShadow>
                <sphereGeometry args={[0.55, 20, 20]} />
                <meshStandardMaterial color={t.color} roughness={0.4} />
              </mesh>
              <mesh position={[0.45, -0.15, -0.2]} castShadow>
                <sphereGeometry args={[0.5, 20, 20]} />
                <meshStandardMaterial color={t.color} roughness={0.4} />
              </mesh>
              <mesh position={[0.1, 0.35, 0.1]} castShadow>
                <sphereGeometry args={[0.6, 20, 20]} />
                <meshStandardMaterial color={t.color} roughness={0.4} />
              </mesh>
            </group>
          )}

          {/* Thảm hoa cỏ nhỏ dưới chân cây */}
          <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.45, 16]} />
            <meshStandardMaterial color={0x86efac} roughness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
};
