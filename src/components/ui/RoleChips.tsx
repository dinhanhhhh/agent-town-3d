'use client';

import React from 'react';
import { AgentRole, STAGE_ORDER } from '../../lib/pipeline/stages';
import { STATIONS_LAYOUT } from '../../lib/scene/layout';
import { useTownStore } from '../../store/useTownStore';

const ROLE_ICONS: Record<AgentRole, string> = {
  orchestrator: '🎛️',
  pm: '🏢',
  dev: '🛠️',
  review: '🔍',
  qa: '🧪',
  security: '🛡️',
  devops: '🚀',
  monitor: '📡',
};

const ROLE_SHORT_NAMES: Record<AgentRole, string> = {
  orchestrator: 'Hub',
  pm: 'PM',
  dev: 'Dev',
  review: 'Review',
  qa: 'QA',
  security: 'Sec',
  devops: 'Ops',
  monitor: 'APM',
};

export const RoleChips: React.FC = () => {
  const agents = useTownStore((s) => s.agents);
  const selectedAgentRole = useTownStore((s) => s.selectedAgentRole);
  const selectAgent = useTownStore((s) => s.selectAgent);
  const realArtifacts = useTownStore((s) => s.realArtifacts);
  const streamingStage = useTownStore((s) => s.streamingStage);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'working':
        return 'bg-emerald-400 shadow-emerald-400/50';
      case 'debugging':
        return 'bg-amber-400 shadow-amber-400/50';
      case 'error':
        return 'bg-rose-500 animate-ping shadow-rose-500/50';
      case 'waiting':
        return 'bg-purple-400 animate-pulse shadow-purple-400/50';
      default:
        return 'bg-slate-500 shadow-slate-500/30';
    }
  };

  return (
    <div className="flex items-center gap-1 shrink-0">
      {STAGE_ORDER.map((role) => {
        const agent = agents[role];
        const layout = STATIONS_LAYOUT[role];
        const isSelected = selectedAgentRole === role;
        const shortName = ROLE_SHORT_NAMES[role];
        const hasArtifact = Boolean(realArtifacts[role]);
        const isStreaming = streamingStage === role;

        return (
          <button
            key={role}
            onClick={() => {
              if (isSelected) {
                selectAgent(null);
              } else {
                selectAgent(role);
              }
            }}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold transition-all whitespace-nowrap border ${
              isSelected
                ? 'bg-slate-700/90 text-white border-blue-400 shadow-lg scale-105'
                : isStreaming
                ? 'bg-blue-950/70 text-blue-200 border-blue-400 ring-2 ring-blue-400/50 animate-pulse shadow-md'
                : 'bg-slate-800/60 text-slate-300 border-slate-700/60 hover:bg-slate-700/70 hover:text-white'
            }`}
            title={`${layout.name} (${agent?.status}) - Bấm để phóng to và xem trạm`}
          >
            <span className="text-xs sm:text-sm">{ROLE_ICONS[role]}</span>
            <span className="hidden sm:inline font-bold">{shortName}</span>
            <span className="hidden xl:inline text-[9px] font-mono text-cyan-300/80 bg-slate-950/80 px-1 py-0.2 rounded border border-slate-700/60 leading-none">
              {STAGE_ORDER.indexOf(role)}
            </span>
            {hasArtifact && (
              <span className="hidden sm:inline px-1 py-0.2 text-[9px] font-extrabold bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 rounded-full leading-none">
                ✓
              </span>
            )}
            <span
              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shadow-sm ${getStatusColor(
                agent?.status || 'idle'
              )}`}
            />
          </button>
        );
      })}
    </div>
  );
};
