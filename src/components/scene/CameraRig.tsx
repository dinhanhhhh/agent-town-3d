import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useTownStore } from '../../store/useTownStore';
import { STATIONS_LAYOUT } from '../../lib/scene/layout';

/**
 * Bộ điều khiển Camera Isometric & Tự do (OrbitControls):
 * - Hỗ trợ kéo chuột trái xoay 360 độ
 * - Chuột phải pan di chuyển góc nhìn mượt mà
 * - Con lăn chuột zoom in/out vô cấp không bị giật ngược lại store
 * - Smooth lerp khi chọn Agent hoặc chuyển preset
 */
export const CameraRig: React.FC = () => {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { camera, size } = useThree();

  const isRotating = useTownStore((s) => s.isRotating);
  const cameraZoom = useTownStore((s) => s.cameraZoom);
  const setCameraZoom = useTownStore((s) => s.setCameraZoom);
  const cameraTarget = useTownStore((s) => s.cameraTarget);
  const selectedAgentRole = useTownStore((s) => s.selectedAgentRole);

  const targetVec = useRef(new THREE.Vector3(0, 0, 0));
  const isUserInteracting = useRef(false);

  // Hệ số thu phóng tự động theo kích thước khung nhìn (Responsive 3D Viewport Scale)
  // giúp ốc đảo không bao giờ bị tràn lề trái/phải khi thu nhỏ cửa sổ hoặc xem trên mobile/tablet
  const responsiveScale = Math.min(1, Math.max(0.45, size.width / 1200));
  const effectiveZoom = cameraZoom * responsiveScale;

  // Update target when an agent is selected or target changes
  useEffect(() => {
    if (selectedAgentRole && STATIONS_LAYOUT[selectedAgentRole]) {
      const pos = STATIONS_LAYOUT[selectedAgentRole].focusCamera;
      targetVec.current.set(pos[0], pos[1], pos[2]);
    } else if (cameraTarget) {
      targetVec.current.set(cameraTarget[0], cameraTarget[1], cameraTarget[2]);
    } else {
      targetVec.current.set(0, 0, 0);
    }
  }, [selectedAgentRole, cameraTarget]);

  useFrame((_, delta) => {
    if (controlsRef.current) {
      // Smooth lerp controls target khi không kéo chuột
      if (!isUserInteracting.current) {
        controlsRef.current.target.lerp(targetVec.current, delta * 4);
      }
      controlsRef.current.update();
    }

    // Chỉ lerp camera zoom khi người dùng KHÔNG đang cuộn chuột tương tác trực tiếp
    if (!isUserInteracting.current && 'zoom' in camera && typeof (camera as THREE.OrthographicCamera).zoom === 'number') {
      const orthoCam = camera as THREE.OrthographicCamera;
      if (Math.abs(orthoCam.zoom - effectiveZoom) > 0.05) {
        orthoCam.zoom = THREE.MathUtils.lerp(orthoCam.zoom, effectiveZoom, delta * 6);
        orthoCam.updateProjectionMatrix();
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.06}
      enablePan
      panSpeed={1.0}
      screenSpacePanning
      enableZoom
      zoomSpeed={1.0}
      autoRotate={isRotating}
      autoRotateSpeed={1.5}
      maxPolarAngle={Math.PI / 2.15}
      minPolarAngle={Math.PI / 6}
      minZoom={10}
      maxZoom={65}
      target={[0, 0, 0]}
      onStart={() => {
        isUserInteracting.current = true;
      }}
      onEnd={() => {
        isUserInteracting.current = false;
        // Đồng bộ mức zoom thực tế của camera (đã quy đổi theo tỉ lệ màn hình) về lại store
        if ('zoom' in camera && typeof (camera as THREE.OrthographicCamera).zoom === 'number') {
          const rawZoom = (camera as THREE.OrthographicCamera).zoom / responsiveScale;
          setCameraZoom(Math.round(Math.max(14, Math.min(65, rawZoom))));
        }
      }}
    />
  );
};
