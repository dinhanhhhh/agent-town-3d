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
  security: 'Security',
  devops: 'DevOps',
  monitor: 'Monitor',
};

export const RoleChips: React.FC = () => {
  const agents = useTownStore((s) => s.agents);
  const selectedAgentRole = useTownStore((s) => s.selectedAgentRole);
  const selectAgent = useTownStore((s) => s.selectAgent);

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
    <div className="absolute bottom-3 left-3 z-30 pointer-events-none max-w-[calc(100vw-400px)] overflow-x-auto pb-1 scrollbar-none">
      <div className="pointer-events-auto flex items-center gap-1 p-1.5 bg-slate-900/85 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl">
        {STAGE_ORDER.map((role) => {
          const agent = agents[role];
          const layout = STATIONS_LAYOUT[role];
          const isSelected = selectedAgentRole === role;
          const shortName = ROLE_SHORT_NAMES[role];

          return (
            <button
              key={role}
              onClick={() => {
                selectAgent(role, 'dossier');
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap border ${
                isSelected
                  ? 'bg-slate-700/90 text-white border-blue-400 shadow-lg scale-105'
                  : 'bg-slate-800/60 text-slate-300 border-slate-700/60 hover:bg-slate-700/70 hover:text-white'
              }`}
              title={`${layout.name} (${agent?.status}) - Bấm để phóng to và xem artifact`}
            >
              <span>{ROLE_ICONS[role]}</span>
              <span className="font-bold">{shortName}</span>
              <span
                className={`w-2 h-2 rounded-full shadow-sm ${getStatusColor(
                  agent?.status || 'idle'
                )}`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};
