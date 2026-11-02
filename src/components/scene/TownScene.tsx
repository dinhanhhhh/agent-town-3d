'use client';

import React from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Island } from './Island';
import { Castle } from './Castle';
import { Building } from './Building';
import { StationAgent, CourierCharacter, StandbyCourier } from './Character';
import { Trees } from './Tree';
import { Paths } from './Path';
import { DataCables } from './DataCables';
import { Lanterns } from './Lanterns';
import { Particles } from './Particles';
import { OverlayProjector, StationOverlay } from './Labels';
import { CameraRig } from './CameraRig';
import { AgentRole, STAGE_ORDER } from '../../lib/pipeline/stages';
import { useTownStore } from '../../store/useTownStore';
import { simulator } from '../../lib/events/MockSimulator';
import { sfx } from '../../lib/audio/sfx';

const ChaosLightningStorm: React.FC = () => {
  const isChaosRunning = useTownStore((s) => s.isChaosRunning);
  const lightRef = React.useRef<THREE.PointLight>(null);
  const flashTimer = React.useRef(0);

  useFrame((_, delta) => {
    if (!lightRef.current) return;
    if (!isChaosRunning) {
      lightRef.current.intensity = 0;
      return;
    }

    flashTimer.current -= delta;
    if (flashTimer.current <= 0) {
      // Tần suất ngẫu nhiên chớp sấm sét trong bão tải
      if (Math.random() < 0.035) {
        lightRef.current.intensity = 3.6 + Math.random() * 2.2;
        flashTimer.current = 0.28;
        sfx.playThunder();
      } else {
        lightRef.current.intensity = 0;
      }
    } else {
      // Phai dần cường độ chớp
      lightRef.current.intensity = Math.max(0, lightRef.current.intensity - delta * 14);
    }
  });

  return (
    <pointLight
      ref={lightRef}
      position={[0, 18, 0]}
      color="#e0f2fe"
      intensity={0}
      distance={80}
      decay={1.5}
    />
  );
};

const CourierTicker: React.FC = () => {
  useFrame((_, delta) => {
    const store = useTownStore.getState();
    if (store.couriers.length === 0) return;
    const speed = store.simSpeed || 1;
    const dt = Math.min(delta, 0.1);
    const activeCouriers = [...store.couriers];

    for (const courier of activeCouriers) {
      const nextProgress = courier.progress + dt * 0.4 * speed;
      if (nextProgress >= 1) {
        store.removeCourier(courier.id);
        if (store.isSimulating) {
          simulator.handleCourierArrived(courier.fromRole, courier.toRole, courier.boxType);
        }
      } else {
        store.updateCourierProgress(courier.id, nextProgress);
      }
    }
  });

  return null;
};

const GL_CONFIG = {
  toneMapping: THREE.ACESFilmicToneMapping,
  antialias: true,
  alpha: true,
  preserveDrawingBuffer: true,
};

const SceneLighting: React.FC = () => {
  const { gl } = useThree();
  const resolvedTheme = useTownStore((s) => s.resolvedTheme);
  const isNight = resolvedTheme === 'night';
  const isSunset = resolvedTheme === 'sunset';

  React.useEffect(() => {
    gl.toneMappingExposure = isNight ? 1.3 : isSunset ? 1.08 : 0.96;
  }, [gl, isNight, isSunset]);

  const ambientColor = isNight ? '#1e1b4b' : isSunset ? '#fed7aa' : '#f0f9ff';
  const ambientIntensity = isNight ? 0.38 : isSunset ? 0.72 : 0.65;

  const hemiSky = isNight ? '#312e81' : isSunset ? '#fbcfe8' : '#7dd3fc';
  const hemiGround = isNight ? '#064e3b' : isSunset ? '#ca8a04' : '#34d399';
  const hemiIntensity = isNight ? 0.32 : isSunset ? 0.5 : 0.42;

  const sunColor = isNight ? '#93c5fd' : isSunset ? '#f97316' : '#fffbeb';
  const sunIntensity = isNight ? 0.65 : isSunset ? 1.35 : 1.18;
  const sunPos: [number, number, number] = isSunset ? [35, 22, 12] : [28, 42, 18];

  const fillColor = isNight ? '#6366f1' : isSunset ? '#c084fc' : '#93c5fd';
  const fillIntensity = isNight ? 0.28 : isSunset ? 0.42 : 0.32;

  return (
    <>
      <ambientLight color={ambientColor} intensity={ambientIntensity} />
      <hemisphereLight color={hemiSky} groundColor={hemiGround} intensity={hemiIntensity} />
      <directionalLight
        position={sunPos}
        intensity={sunIntensity}
        color={sunColor}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={120}
        shadow-camera-left={-24}
        shadow-camera-right={24}
        shadow-camera-top={24}
        shadow-camera-bottom={-24}
        shadow-bias={-0.0008}
      />
      <directionalLight position={[-20, 15, -15]} intensity={fillIntensity} color={fillColor} />
    </>
  );
};

export const TownScene: React.FC = () => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const couriers = useTownStore((s) => s.couriers);
  const resolvedTheme = useTownStore((s) => s.resolvedTheme);
  const otherRoles = STAGE_ORDER.filter((r) => r !== 'orchestrator') as AgentRole[];

  const isNight = resolvedTheme === 'night';
  const isSunset = resolvedTheme === 'sunset';

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative select-none overflow-hidden"
    >
      {/* 3 Lớp Bầu Trời Cross-Fade chuyển cảnh mượt 60fps trên GPU qua opacity, không làm đơ trình duyệt */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ease-in-out pointer-events-none ${
          !isNight && !isSunset ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ background: 'linear-gradient(180deg, #38bdf8 0%, #7dd3fc 48%, #bae6fd 100%)' }}
      />
      <div
        className={`absolute inset-0 transition-opacity duration-700 ease-in-out pointer-events-none ${
          isSunset ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ background: 'linear-gradient(180deg, #fdba74 0%, #fed7aa 55%, #fde68a 100%)' }}
      />
      <div
        className={`absolute inset-0 transition-opacity duration-700 ease-in-out pointer-events-none ${
          isNight ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ background: 'radial-gradient(circle at 50% 35%, #1e293b 0%, #0b0f19 75%)' }}
      />

      <Canvas
        eventSource={containerRef}
        orthographic
        shadows
        camera={{
          position: [25, 26, 25],
          zoom: 30,
          near: 0.1,
          far: 1000,
        }}
        gl={GL_CONFIG}
        dpr={[1, 2]}
        className="w-full h-full relative z-10"
      >
        {/* Hệ thống ánh sáng Ngày / Hoàng hôn / Đêm */}
        <SceneLighting />

        {/* Nguồn chớp sấm sét động khi bão tải Chaos Surge */}
        <ChaosLightningStorm />

        {/* Hòn đảo bay 3D diorama (vát tự nhiên và chóp đá lơ lửng) */}
        <Island />

        {/* Đường đá cuội tròn và các nan quạt hướng tâm */}
        <Paths />

        {/* Hệ thống cáp quang dữ liệu neon phát sáng dọc 7 đại lộ */}
        <DataCables />

        {/* Hệ thống đèn lồng thắp sáng vàng ấm khi hoàng hôn & đêm */}
        <Lanterns />

        {/* Cây cối tròn xoe và hoa anh đào hồng */}
        <Trees />

        {/* Cánh hoa anh đào Sakura & Đom đóm đêm bay lượn */}
        <Particles />

        {/* Lâu đài trung tâm Claude Code */}
        <Castle />

        {/* 7 công trình chuyên môn với màu sắc pastel dịu mắt */}
        {otherRoles.map((role) => (
          <Building key={role} role={role} />
        ))}

        {/* Kỹ sư AI tại các trạm */}
        {STAGE_ORDER.map((role) => (
          <StationAgent key={role} role={role} />
        ))}

        {/* Shippers vận chuyển thùng artifact trên đường & đứng đợi bàn giao tại bàn làm việc */}
        {couriers.map((courier) => (
          <CourierCharacter key={courier.id} courier={courier} />
        ))}
        <StandbyCourier />

        {/* Bộ điều khiển camera Isometric */}
        <CameraRig />

        {/* 3D Tracker tính toán tọa độ chiếu cho nhãn 2D (chạy sau khi CameraRig đã cập nhật camera) */}
        <OverlayProjector />

        {/* Cập nhật chuyển động shipper khi chạy AI thật */}
        <CourierTicker />
      </Canvas>

      {/* 2D HTML Overlay Layer hoàn toàn bên ngoài Canvas */}
      <StationOverlay />
    </div>
  );
};
