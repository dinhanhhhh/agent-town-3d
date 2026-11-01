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
      <RoleChips />
      <StatusBar />

      {/* Interactive Modals */}
      <PromptModal />
      <ApprovalModal />
      <ArtifactModal />
      <ApiKeyModal />
      <AgentDossierModal />
      <ExportModal />
    </main>
  );
}
