'use client';

import React from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { STAGE_ORDER } from '../../lib/pipeline/stages';
import { STATIONS_LAYOUT } from '../../lib/scene/layout';
import { getRouteWaypoints, interpolateCourierPosition } from '../../lib/scene/waypoints';
import { useTownStore } from '../../store/useTownStore';

/**
 * 3D Tracker running inside <Canvas> that projects 3D coordinates of stations
 * and couriers to 2D screen positions, updating DOM elements directly with zero React re-render overhead.
 */
export const OverlayProjector: React.FC = () => {
  const { camera, size } = useThree();
  const vec = React.useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    // 1. Project Station Speech Bubbles & Badges
    for (const role of STAGE_ORDER) {
      const layout = STATIONS_LAYOUT[role];

      // Speech bubble element
      const bubbleEl = document.getElementById(`bubble-${role}`);
      if (bubbleEl) {
        vec.set(
          layout.position[0],
          layout.position[1] + layout.bubbleOffset[1],
          layout.position[2]
        );
        vec.project(camera);
        if (vec.z > 1) {
          bubbleEl.style.display = 'none';
        } else {
          bubbleEl.style.display = 'block';
          const bx = (vec.x * 0.5 + 0.5) * size.width;
          const by = (-vec.y * 0.5 + 0.5) * size.height;
          bubbleEl.style.transform = `translate3d(${bx}px, ${by}px, 0) translate(-50%, -100%)`;
        }
      }

      // Station title chip element
      const labelEl = document.getElementById(`label-${role}`);
      if (labelEl) {
        vec.set(
          layout.position[0],
          layout.position[1] + layout.bubbleOffset[1] - 0.65,
          layout.position[2]
        );
        vec.project(camera);
        if (vec.z > 1) {
          labelEl.style.display = 'none';
        } else {
          labelEl.style.display = 'block';
          const lx = (vec.x * 0.5 + 0.5) * size.width;
          const ly = (-vec.y * 0.5 + 0.5) * size.height;
          labelEl.style.transform = `translate3d(${lx}px, ${ly}px, 0) translate(-50%, -50%)`;
        }
      }
    }

    // 2. Project Active Couriers (Shippers)
    const couriers = useTownStore.getState().couriers;
    for (const courier of couriers) {
      const courierEl = document.getElementById(`courier-${courier.id}`);
      if (courierEl) {
        const waypoints = getRouteWaypoints(courier.fromRole, courier.toRole);
        const { position } = interpolateCourierPosition(waypoints, courier.progress);
        vec.set(position.x, position.y + 1.7, position.z);
        vec.project(camera);
        if (vec.z > 1) {
          courierEl.style.display = 'none';
        } else {
          courierEl.style.display = 'block';
          const cx = (vec.x * 0.5 + 0.5) * size.width;
          const cy = (-vec.y * 0.5 + 0.5) * size.height;
          courierEl.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`;
        }
      }
    }
  });

  return null;
};

/**
 * 2D React DOM Overlay rendered OUTSIDE <Canvas>, completely avoiding
 * Drei <Html> nested roots and R3F reconciler collisions.
 */
export const StationOverlay: React.FC = () => {
  const showLabels = useTownStore((s) => s.showLabels);
  const showBubbles = useTownStore((s) => s.showBubbles);
  const isArtifactModalOpen = useTownStore((s) => s.isArtifactModalOpen);
  const isApprovalModalOpen = useTownStore((s) => s.isApprovalModalOpen);
  const isApiKeyModalOpen = useTownStore((s) => s.isApiKeyModalOpen);
  const isPromptModalOpen = useTownStore((s) => s.isPromptModalOpen);
  const agents = useTownStore((s) => s.agents);
  const couriers = useTownStore((s) => s.couriers);
  const selectAgent = useTownStore((s) => s.selectAgent);
  const selectedAgentRole = useTownStore((s) => s.selectedAgentRole);
  const openArtifactModal = useTownStore((s) => s.openArtifactModal);

  const isAnyModalOpen =
    isArtifactModalOpen || isApprovalModalOpen || isApiKeyModalOpen || isPromptModalOpen;

  return (
    <div
      className="absolute inset-0 pointer-events-none z-20 overflow-hidden select-none"
      style={{ display: isAnyModalOpen ? 'none' : 'block' }}
    >
      {/* Station speech bubbles & status chips */}
      {STAGE_ORDER.map((role) => {
        const layout = STATIONS_LAYOUT[role];
        const agent = agents[role];
        if (!agent) return null;

        const isWorking = agent.status === 'working';
        const isDebugging = agent.status === 'debugging';
        const isError = agent.status === 'error';
        const isWaiting = agent.status === 'waiting';
        const isSelected = selectedAgentRole === role;

        // Chỉ hiển thị bong bóng thoại khi Agent đang bận việc hoặc đang được chọn xem chi tiết:
        // Ngăn chặn việc 8 bong bóng thoại cùng hiện che kín toàn bộ hòn đảo 3D
        const shouldShowBubble =
          showBubbles &&
          agent.speech &&
          (isWorking || isDebugging || isError || isWaiting || isSelected);

        return (
          <React.Fragment key={role}>
            {/* 3D Floating Speech Bubble (Chỉ hiện khi Agent đang có việc) */}
            {shouldShowBubble && (
              <div
                id={`bubble-${role}`}
                className="absolute top-0 left-0 pointer-events-auto will-change-transform"
                style={{ transform: 'translate3d(-9999px, -9999px, 0)' }}
              >
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    selectAgent(role);
                    openArtifactModal(true);
                  }}
                  className={`cursor-pointer transition-all duration-300 transform hover:scale-105 select-none max-w-[210px] text-center p-2 rounded-xl shadow-lg border backdrop-blur-md mb-2 ${
                    isError
                      ? 'bg-red-950/90 border-red-500 text-red-200'
                      : isDebugging
                      ? 'bg-amber-950/90 border-amber-500 text-amber-200'
                      : isWaiting
                      ? 'bg-purple-950/90 border-purple-500 text-purple-200 animate-pulse'
                      : isWorking
                      ? 'bg-slate-900/90 border-blue-400 text-blue-100'
                      : 'bg-slate-900/80 border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="text-[11px] font-medium leading-snug line-clamp-2">
                    {agent.speech}
                  </div>
                  {/* Little speech arrow below */}
                  <div className="w-2 h-2 mx-auto rotate-45 -mb-3 mt-1 bg-inherit border-r border-b border-inherit" />
                </div>
              </div>
            )}

            {/* Station Title & Status Chip */}
            {showLabels && (
              <div
                id={`label-${role}`}
                className="absolute top-0 left-0 pointer-events-auto will-change-transform"
                style={{ transform: 'translate3d(-9999px, -9999px, 0)' }}
              >
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    selectAgent(role);
                  }}
                  className="cursor-pointer flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/80 border border-slate-700/80 text-white shadow-md hover:border-slate-400 transition-colors whitespace-nowrap"
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isError
                        ? 'bg-red-500 animate-ping'
                        : isDebugging
                        ? 'bg-amber-500'
                        : isWaiting
                        ? 'bg-purple-500 animate-pulse'
                        : isWorking
                        ? 'bg-emerald-400'
                        : 'bg-slate-400'
                    }`}
                  />
                  <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400">
                    {layout.tag}
                  </span>
                  <span className="text-xs font-semibold text-slate-100">{layout.name}</span>
                </div>
              </div>
            )}
          </React.Fragment>
        );
      })}

      {/* Courier floating tags */}
      {couriers.map((courier) => {
        const isFeedback = courier.type === 'feedback';
        return (
          <div
            id={`courier-${courier.id}`}
            key={courier.id}
            className="absolute top-0 left-0 pointer-events-none will-change-transform"
            style={{ transform: 'translate3d(-9999px, -9999px, 0)' }}
          >
            <div
              className={`px-2 py-0.5 text-[10px] font-bold rounded-full whitespace-nowrap shadow-md border ${
                isFeedback
                  ? 'bg-red-600 text-white border-red-400 animate-bounce'
                  : 'bg-amber-500 text-slate-900 border-amber-300'
              }`}
            >
              {isFeedback ? `🐛 ${courier.label}` : `📦 ${courier.label}`}
            </div>
          </div>
        );
      })}
    </div>
  );
};
