'use client';

import React from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { STAGE_ORDER, AgentRole } from '../../lib/pipeline/stages';
import { STATIONS_LAYOUT } from '../../lib/scene/layout';
import { getRouteWaypoints, interpolateCourierPosition } from '../../lib/scene/waypoints';
import { useTownStore } from '../../store/useTownStore';
import { sfx } from '../../lib/audio/sfx';

const ROLE_ICONS: Record<AgentRole, string> = {
  orchestrator: '🤖',
  pm: '📝',
  dev: '💻',
  review: '🔍',
  qa: '🧪',
  security: '🛡️',
  devops: '🚀',
  monitor: '📡',
};

const ROLE_GLOW_STYLES: Record<AgentRole, { border: string; badge: string; shadow: string }> = {
  orchestrator: {
    border: 'border-purple-500/70',
    badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    shadow: 'shadow-purple-950/60',
  },
  pm: {
    border: 'border-blue-500/70',
    badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    shadow: 'shadow-blue-950/60',
  },
  dev: {
    border: 'border-amber-500/70',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    shadow: 'shadow-amber-950/60',
  },
  review: {
    border: 'border-cyan-500/70',
    badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    shadow: 'shadow-cyan-950/60',
  },
  qa: {
    border: 'border-emerald-500/70',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    shadow: 'shadow-emerald-950/60',
  },
  security: {
    border: 'border-rose-500/70',
    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    shadow: 'shadow-rose-950/60',
  },
  devops: {
    border: 'border-indigo-500/70',
    badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    shadow: 'shadow-indigo-950/60',
  },
  monitor: {
    border: 'border-teal-500/70',
    badge: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
    shadow: 'shadow-teal-950/60',
  },
};

/**
 * 3D Tracker running inside <Canvas> that projects 3D coordinates of stations
 * and couriers to 2D screen positions, updating DOM elements directly with zero React re-render overhead.
 */
export const OverlayProjector: React.FC = () => {
  const { camera, size } = useThree();
  const vec = React.useMemo(() => new THREE.Vector3(), []);

  // KHÔNG truyền priority > 0 (R3F sẽ tắt auto-render → canvas trắng).
  // Thứ tự chạy sau CameraRig được đảm bảo bằng thứ tự mount trong TownScene.
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
          const bx = (vec.x * 0.5 + 0.5) * size.width;
          const by = (-vec.y * 0.5 + 0.5) * size.height;
          // Nếu nằm ngoài màn hình thì ẩn, chỉ kẹp nhẹ 20px ở sát mép để không giật bóng thoại vào giữa đảo
          if (bx < -200 || bx > size.width + 200 || by < -150 || by > size.height + 150) {
            bubbleEl.style.display = 'none';
          } else {
            bubbleEl.style.display = 'block';
            const clampedBx = Math.max(20, Math.min(size.width - 20, bx));
            const clampedBy = Math.max(50, Math.min(size.height - 30, by));
            bubbleEl.style.transform = `translate3d(${clampedBx.toFixed(1)}px, ${clampedBy.toFixed(1)}px, 0) translate(-50%, -100%)`;
          }
        }
      }

      // Station title chip element (neo cố định ngay trên nóc trạm y = 2.45m)
      const labelEl = document.getElementById(`label-${role}`);
      if (labelEl) {
        vec.set(
          layout.position[0],
          layout.position[1] + 2.45,
          layout.position[2]
        );
        vec.project(camera);
        if (vec.z > 1) {
          labelEl.style.display = 'none';
        } else {
          const lx = (vec.x * 0.5 + 0.5) * size.width;
          const ly = (-vec.y * 0.5 + 0.5) * size.height;
          // Neo tuyệt đối theo nóc tòa nhà 3D, không kẹp lề để nhãn không bị giằng xé hay rung lắc khi xoay camera
          if (lx < -120 || lx > size.width + 120 || ly < -80 || ly > size.height + 80) {
            labelEl.style.display = 'none';
          } else {
            labelEl.style.display = 'block';
            labelEl.style.transform = `translate3d(${lx.toFixed(1)}px, ${ly.toFixed(1)}px, 0) translate(-50%, -50%)`;
          }
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
          const cx = (vec.x * 0.5 + 0.5) * size.width;
          const cy = (-vec.y * 0.5 + 0.5) * size.height;
          if (cx < -100 || cx > size.width + 100 || cy < -80 || cy > size.height + 80) {
            courierEl.style.display = 'none';
          } else {
            courierEl.style.display = 'block';
            courierEl.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0) translate(-50%, -50%)`;
          }
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
  const openApprovalModal = useTownStore((s) => s.openApprovalModal);
  const isApiKeyModalOpen = useTownStore((s) => s.isApiKeyModalOpen);
  const isPromptModalOpen = useTownStore((s) => s.isPromptModalOpen);
  const isDossierModalOpen = useTownStore((s) => s.isDossierModalOpen);
  const isExportModalOpen = useTownStore((s) => s.isExportModalOpen);
  const agents = useTownStore((s) => s.agents);
  const couriers = useTownStore((s) => s.couriers);
  const selectAgent = useTownStore((s) => s.selectAgent);
  const selectedAgentRole = useTownStore((s) => s.selectedAgentRole);

  const isAnyModalOpen =
    isArtifactModalOpen ||
    isApprovalModalOpen ||
    isApiKeyModalOpen ||
    isPromptModalOpen ||
    isDossierModalOpen ||
    isExportModalOpen;

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
        const shouldShowBubble =
          showBubbles &&
          agent.speech &&
          (isWorking || isDebugging || isError || isWaiting || isSelected);

        const glowStyle = ROLE_GLOW_STYLES[role];
        const roleIcon = ROLE_ICONS[role];

        return (
          <React.Fragment key={role}>
            {/* 3D Floating Speech Bubble (Redesigned & Responsive Compact) */}
            {shouldShowBubble && (
              <div
                id={`bubble-${role}`}
                className={`absolute top-0 left-0 pointer-events-auto will-change-transform ${
                  isSelected ? 'z-30' : 'z-20'
                }`}
                style={{ transform: 'translate3d(-9999px, -9999px, 0)' }}
              >
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    sfx.playPop();
                    if (isWaiting && role === 'devops') {
                      openApprovalModal(true);
                    } else {
                      selectAgent(role);
                    }
                  }}
                  className={`cursor-pointer group transition-all duration-300 transform hover:scale-105 select-none w-max min-w-[120px] max-w-[180px] sm:max-w-[220px] md:max-w-[250px] p-1.5 sm:p-2 rounded-xl sm:rounded-2xl shadow-xl border backdrop-blur-xl bg-slate-950/95 mb-0.5 ${glowStyle.border} ${glowStyle.shadow}`}
                >
                  {/* Bubble Header: Avatar, Name & Live status dot */}
                  <div className="flex items-center justify-between gap-1 pb-0.5 border-b border-slate-800/80 mb-1">
                    <div className="flex items-center gap-1 min-w-0">
                      <span className="text-[11px] sm:text-xs shrink-0">{roleIcon}</span>
                      <span className="text-[9px] sm:text-[10px] font-bold text-white tracking-wide truncate">
                        {layout.name}
                      </span>
                    </div>
                    <span
                      className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shrink-0 ${
                        isError
                          ? 'bg-rose-500 animate-ping'
                          : isDebugging
                          ? 'bg-amber-400 animate-pulse'
                          : isWaiting
                          ? 'bg-purple-400 animate-pulse'
                          : isWorking
                          ? 'bg-emerald-400'
                          : 'bg-slate-400'
                      }`}
                    />
                  </div>

                  {/* Bubble Text (Giới hạn 2 dòng gọn gàng, tránh tràn lấp trung tâm đảo) */}
                  <div className="text-[10px] sm:text-[11px] font-medium text-slate-200 leading-snug line-clamp-2">
                    {agent.speech}
                  </div>

                  {/* Sleek SVG pointer downward */}
                  <div className="flex justify-center -mb-2 sm:-mb-2.5 mt-1">
                    <svg
                      width="10"
                      height="5"
                      viewBox="0 0 10 5"
                      className="text-slate-950 fill-current drop-shadow-md"
                    >
                      <polygon points="0,0 10,0 5,5" />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {/* Station Title & Status Chip (tự động ẩn mượt khi bong bóng thoại đang hiển thị để chống đè lặp chữ) */}
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
                  className={`cursor-pointer flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-slate-950/90 border border-slate-700/80 text-white shadow-xl hover:border-slate-400 transition-all duration-300 whitespace-nowrap backdrop-blur-md ${
                    shouldShowBubble ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
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
                  <span className="hidden md:inline text-[10px] font-bold tracking-wider uppercase text-slate-400">
                    {layout.tag}
                  </span>
                  <span className="text-[10px] sm:text-xs font-semibold text-slate-100">
                    {layout.name}
                  </span>
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
              className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full whitespace-nowrap shadow-xl border backdrop-blur-md ${
                isFeedback
                  ? 'bg-rose-950/90 text-rose-200 border-rose-500/80 shadow-rose-950/60 animate-bounce'
                  : 'bg-amber-950/90 text-amber-200 border-amber-400/80 shadow-amber-950/60'
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
