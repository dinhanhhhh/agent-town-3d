'use client';

import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';

// Safe DOM patch to protect React reconciliation from Google Translate and browser extensions
if (typeof window !== 'undefined') {
  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function <T extends Node>(child: T): T {
    if (child.parentNode !== this) {
      if (child.parentNode) {
        return child.parentNode.removeChild(child);
      }
      return child;
    }
    return originalRemoveChild.call(this, child) as T;
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function <T extends Node>(newNode: T, referenceNode: Node | null): T {
    if (referenceNode && referenceNode.parentNode !== this) {
      if (referenceNode.parentNode) {
        return referenceNode.parentNode.insertBefore(newNode, referenceNode);
      }
      return newNode;
    }
    return originalInsertBefore.call(this, newNode, referenceNode) as T;
  };

  const origError = console.error;
  console.error = (...args: unknown[]) => {
    const msg = typeof args[0] === 'string' ? args[0] : '';
    if (
      msg.includes('Attempted to synchronously unmount a root') ||
      msg.includes("Failed to execute 'removeChild' on 'Node'") ||
      msg.includes('The node to be removed is not a child of this node') ||
      msg.includes('You are calling ReactDOMClient.createRoot()')
    ) {
      return;
    }
    origError(...args);
  };
}
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
      <MilestoneWidget />
      <LogDrawer />
      <LiveStreamConsole />
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
