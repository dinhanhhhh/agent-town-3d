'use client';

import React from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Island } from './Island';
import { Castle } from './Castle';
import { Building } from './Building';
import { StationAgent, CourierCharacter } from './Character';
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

export const TownScene: React.FC = () => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const couriers = useTownStore((s) => s.couriers);
  const themeMode = useTownStore((s) => s.themeMode);
  const otherRoles = STAGE_ORDER.filter((r) => r !== 'orchestrator') as AgentRole[];

  // Cấu hình bảng màu ánh sáng theo chu kỳ Ngày / Hoàng hôn / Đêm
  const isNight = themeMode === 'night';
  const isSunset = themeMode === 'sunset';

  const bgColor = isNight ? '#0b0f19' : isSunset ? '#fed7aa' : '#f8fafc';
  const ambientColor = isNight ? '#1e1b4b' : isSunset ? '#fed7aa' : '#fff5ea';
  const ambientIntensity = isNight ? 0.38 : isSunset ? 0.85 : 0.95;

  const hemiSky = isNight ? '#312e81' : isSunset ? '#fbcfe8' : '#e8f4f8';
  const hemiGround = isNight ? '#064e3b' : isSunset ? '#ca8a04' : '#88d49e';
  const hemiIntensity = isNight ? 0.32 : isSunset ? 0.6 : 0.55;

  const sunColor = isNight ? '#93c5fd' : isSunset ? '#f97316' : '#fffaed';
  const sunIntensity = isNight ? 0.65 : isSunset ? 1.5 : 1.4;
  const sunPos: [number, number, number] = isSunset ? [35, 22, 12] : [28, 42, 18];

  const fillColor = isNight ? '#6366f1' : isSunset ? '#c084fc' : '#d4e4ff';
  const fillIntensity = isNight ? 0.28 : isSunset ? 0.5 : 0.45;

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative select-none transition-colors duration-700"
      style={{ backgroundColor: bgColor }}
    >
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
        gl={{
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: isNight ? 1.35 : 1.15,
          antialias: true,
          preserveDrawingBuffer: true,
        }}
        dpr={[1, 2]}
        className="w-full h-full"
      >
        {/* Ánh sáng môi trường dịu nhẹ */}
        <ambientLight color={ambientColor} intensity={ambientIntensity} />

        {/* Ánh sáng bán cầu mô phỏng bầu trời và phản chiếu mặt đất */}
        <hemisphereLight
          color={hemiSky}
          groundColor={hemiGround}
          intensity={hemiIntensity}
        />

        {/* Nguồn sáng chính mặt trời / mặt trăng */}
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

        {/* Nguồn sáng phụ fill light */}
        <directionalLight position={[-20, 15, -15]} intensity={fillIntensity} color={fillColor} />

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

        {/* Shippers vận chuyển thùng artifact */}
        {couriers.map((courier) => (
          <CourierCharacter key={courier.id} courier={courier} />
        ))}

        {/* 3D Tracker tính toán tọa độ chiếu cho nhãn 2D */}
        <OverlayProjector />

        {/* Bộ điều khiển camera Isometric */}
        <CameraRig />

        {/* Cập nhật chuyển động shipper khi chạy AI thật */}
        <CourierTicker />
      </Canvas>

      {/* 2D HTML Overlay Layer hoàn toàn bên ngoài Canvas */}
      <StationOverlay />
    </div>
  );
};
