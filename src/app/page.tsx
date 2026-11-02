'use client';

import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Topbar } from '../components/ui/Topbar';
import { MilestoneWidget } from '../components/ui/MilestoneWidget';
import { LogDrawer } from '../components/ui/LogDrawer';
import { PromptModal } from '../components/ui/PromptModal';
import { RoleChips } from '../components/ui/RoleChips';
import { StatusBar } from '../components/ui/StatusBar';
import { ApprovalModal } from '../components/ui/ApprovalModal';
import { ArtifactModal } from '../components/ui/ArtifactModal';
import { ApiKeyModal } from '../components/ui/ApiKeyModal';
import { AgentDossierModal } from '../components/ui/AgentDossierModal';
import { ExportModal } from '../components/ui/ExportModal';
import { KeyboardShortcutsModal } from '../components/ui/KeyboardShortcutsModal';
import { SystemDiagnosticsModal } from '../components/ui/SystemDiagnosticsModal';
import { LiveStreamConsole } from '../components/ui/LiveStreamConsole';
import { DeskCamPiP } from '../components/ui/DeskCamPiP';
import { ToastContainer } from '../components/ui/ToastContainer';
import { StationInspectorPanel } from '../components/ui/StationInspectorPanel';
import { simulator } from '../lib/events/MockSimulator';

// Dynamically import TownScene with ssr: false for WebGL safety
const TownScene = dynamic(
  () => import('../components/scene/TownScene').then((mod) => mod.TownScene),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-slate-300">
        <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold tracking-wide">
          Đang khởi tạo Thị trấn DevOps 3D...
        </p>
      </div>
    ),
  }
);

export default function Home() {
  useEffect(() => {
    // Start simulation loop on client mount
    simulator.start();
    return () => {
      simulator.pause();
    };
  }, []);

  return (
    <main className="relative w-screen h-[100dvh] overflow-hidden bg-slate-950">
      {/* 3D WebGL Canvas Layer */}
      <TownScene />

      {/* 2D HUD UI Overlays */}
      <Topbar />
      <ToastContainer />
      <MilestoneWidget />
      <StationInspectorPanel />
      <LogDrawer />
      <LiveStreamConsole />
      <DeskCamPiP />

      {/* 3. Bottom HUD Bar: Dock trạm bên trái & Zoom / Telemetry bên phải trên cùng một hàng ngang duy nhất, kẹp biên chống va chạm */}
      <div className="absolute bottom-2 left-2 right-2 sm:bottom-3 sm:left-3 sm:right-3 z-30 pointer-events-none flex items-center justify-between gap-1.5 sm:gap-2.5">
        <RoleChips />
        <StatusBar />
      </div>

      {/* Interactive Modals */}
      <PromptModal />
      <ApprovalModal />
      <ArtifactModal />
      <ApiKeyModal />
      <AgentDossierModal />
      <ExportModal />
      <KeyboardShortcutsModal />
      <SystemDiagnosticsModal />
    </main>
  );
}
