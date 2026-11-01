'use client';

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useTownStore } from '../../store/useTownStore';

const PETAL_COUNT = 45;
const FIREFLY_COUNT = 35;

/**
 * Hiệu ứng tiểu cảnh hạt sống động (Dynamic Ambience Particles):
 * - Ban ngày & Hoàng hôn: Cánh hoa anh đào Sakura hồng pastel bay lượn trong gió.
 * - Ban đêm: Đom đóm hạt vàng ấm lấp lánh bập bùng quanh các tán cây và đèn lồng.
 */
export const Particles: React.FC = () => {
  const resolvedTheme = useTownStore((s) => s.resolvedTheme);
  const isNight = resolvedTheme === 'night';

  const petalsMeshRef = useRef<THREE.InstancedMesh>(null);
  const firefliesMeshRef = useRef<THREE.InstancedMesh>(null);

  // Khởi tạo vị trí ban đầu của cánh hoa
  const petalsData = useMemo(() => {
    return Array.from({ length: PETAL_COUNT }, () => ({
      pos: new THREE.Vector3(
        (Math.random() - 0.5) * 26,
        Math.random() * 6 + 1,
        (Math.random() - 0.5) * 26
      ),
      rot: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI),
      speedY: 0.008 + Math.random() * 0.012,
      driftX: 0.01 + Math.random() * 0.015,
      driftZ: 0.008 + Math.random() * 0.012,
      spin: (Math.random() - 0.5) * 0.03,
      scale: 0.7 + Math.random() * 0.5,
    }));
  }, []);

  // Khởi tạo vị trí đom đóm
  const firefliesData = useMemo(() => {
    return Array.from({ length: FIREFLY_COUNT }, () => ({
      origin: new THREE.Vector3(
        (Math.random() - 0.5) * 22,
        Math.random() * 2.5 + 0.8,
        (Math.random() - 0.5) * 22
      ),
      freqX: 0.5 + Math.random() * 1.5,
      freqY: 0.8 + Math.random() * 1.2,
      freqZ: 0.6 + Math.random() * 1.4,
      offset: Math.random() * Math.PI * 2,
      radius: 0.6 + Math.random() * 1.2,
    }));
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (!isNight && petalsMeshRef.current) {
      // Cập nhật chuyển động bay của cánh hoa Sakura
      petalsData.forEach((petal, idx) => {
        petal.pos.y -= petal.speedY;
        petal.pos.x += petal.driftX + Math.sin(t * 1.5 + idx) * 0.006;
        petal.pos.z += petal.driftZ + Math.cos(t * 1.2 + idx) * 0.006;
        petal.rot.x += petal.spin;
        petal.rot.y += petal.spin * 1.2;

        // Chạm đất thì quay lại đỉnh bầu trời
        if (petal.pos.y < 0.65) {
          petal.pos.y = 7.0;
          petal.pos.x = (Math.random() - 0.5) * 26 - 6;
          petal.pos.z = (Math.random() - 0.5) * 26 - 6;
        }

        dummy.position.copy(petal.pos);
        dummy.rotation.copy(petal.rot);
        dummy.scale.setScalar(petal.scale);
        dummy.updateMatrix();
        petalsMeshRef.current!.setMatrixAt(idx, dummy.matrix);
      });
      petalsMeshRef.current.instanceMatrix.needsUpdate = true;
    } else if (isNight && firefliesMeshRef.current) {
      // Cập nhật đom đóm vàng lượn sóng
      firefliesData.forEach((f, idx) => {
        const x = f.origin.x + Math.sin(t * f.freqX + f.offset) * f.radius;
        const y = f.origin.y + Math.sin(t * f.freqY + f.offset) * 0.35;
        const z = f.origin.z + Math.cos(t * f.freqZ + f.offset) * f.radius;

        dummy.position.set(x, y, z);
        const pulse = 0.6 + Math.sin(t * 3 + f.offset) * 0.35;
        dummy.scale.setScalar(pulse);
        dummy.updateMatrix();
        firefliesMeshRef.current!.setMatrixAt(idx, dummy.matrix);
      });
      firefliesMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* 1. CÁNH HOA ANH ĐÀO SAKURA (BAN NGÀY & HOÀNG HÔN) */}
      {!isNight && (
        <instancedMesh
          ref={petalsMeshRef}
          args={[undefined, undefined, PETAL_COUNT]}
          castShadow={false}
          receiveShadow={false}
        >
          <planeGeometry args={[0.18, 0.24]} />
          <meshStandardMaterial
            color={resolvedTheme === 'sunset' ? 0xfecdd3 : 0xfbcfe8}
            side={THREE.DoubleSide}
            roughness={0.4}
            transparent
            opacity={0.88}
          />
        </instancedMesh>
      )}

      {/* 2. ĐOM ĐÓM VÀNG LẤP LÁNH (BAN ĐÊM) */}
      {isNight && (
        <instancedMesh
          ref={firefliesMeshRef}
          args={[undefined, undefined, FIREFLY_COUNT]}
          castShadow={false}
          receiveShadow={false}
        >
          <sphereGeometry args={[0.075, 8, 8]} />
          <meshBasicMaterial color={0xfde047} transparent opacity={0.9} />
        </instancedMesh>
      )}
    </group>
  );
};
