import React from 'react';
import * as THREE from 'three';
import { TOKENS } from '../../styles/tokens';

export const Island: React.FC = () => {
  const baseThickness = 3.5;

  const miniIslands = [
    { x: -16, y: -2, z: 8, r: 1.8 },
    { x: 17, y: -3, z: -7, r: 2.2 },
    { x: -12, y: -4, z: -14, r: 1.5 },
    { x: 14, y: -1.5, z: 12, r: 1.6 },
  ];

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Top Grass Slab (Vát nhẹ mềm mại) */}
      <mesh position={[0, 0, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[15, 14.5, 1.2, 12]} />
        <meshLambertMaterial color={TOKENS.palette3D.grass} />
      </mesh>

      {/* 2. Dirt Under-layer (Vách đất thon nhọn tự nhiên) */}
      <mesh position={[0, -baseThickness / 2 - 0.5, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[14.5, 10.5, baseThickness, 12]} />
        <meshLambertMaterial color={TOKENS.palette3D.dirt} />
      </mesh>

      {/* 3. Bottom Rock Tip / Roots (Chóp đá lơ lửng huyền thoại) */}
      <mesh
        position={[0, -baseThickness - 2.4, 0]}
        rotation={[Math.PI, 0, 0]}
        castShadow
      >
        <coneGeometry args={[10.5, 3.8, 8]} />
        <meshLambertMaterial color={TOKENS.palette3D.darkDirt} />
      </mesh>

      {/* 4. Mini Floating Islands (Các tiểu đảo bay vệ tinh quanh đảo chính) */}
      {miniIslands.map((mi, idx) => (
        <group key={idx} position={[mi.x, mi.y, mi.z]}>
          {/* Cỏ tiểu đảo */}
          <mesh position={[0, 0, 0]} receiveShadow castShadow>
            <cylinderGeometry args={[mi.r, mi.r * 0.9, 0.6, 6]} />
            <meshLambertMaterial color={TOKENS.palette3D.grass} />
          </mesh>
          {/* Chóp đá tiểu đảo */}
          <mesh position={[0, -1.1, 0]} rotation={[Math.PI, 0, 0]} castShadow>
            <coneGeometry args={[mi.r * 0.9, 1.8, 6]} />
            <meshLambertMaterial color={TOKENS.palette3D.dirt} />
          </mesh>
        </group>
      ))}
    </group>
  );
};
