export type AgentRole = 'orchestrator' | 'pm' | 'dev' | 'review' | 'qa' | 'security' | 'devops' | 'monitor';
export type AgentStatus = 'idle' | 'working' | 'walking' | 'waiting' | 'debugging' | 'error';
export type TaskType = 'ticket' | 'pr' | 'bug' | 'deploy' | 'alert';
export type TaskState = 'queued' | 'in_progress' | 'passed' | 'failed' | 'blocked';
export type EventKind = 'start' | 'handoff' | 'fail' | 'pass' | 'alert' | 'approve_needed';

export interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  status: AgentStatus;
  currentTaskId?: string;
  speech: string;
  category: string;
  systemPrompt: string;
}

export interface Task {
  id: string;
  type: TaskType;
  title: string;
  refNo: string;
  stage: AgentRole;
  state: TaskState;
  payload: Record<string, any>;
  createdAt: number;
  updatedAt: number;
}

export interface PipelineEvent {
  id: string;
  agentId: string;
  taskId: string;
  kind: EventKind;
  message: string;
  severity: 'ok' | 'warn' | 'error';
  createdAt: number;
}

export interface Approval {
  id: string;
  taskId: string;
  status: 'pending' | 'approved' | 'rejected';
  decidedAt?: number;
}

// Stage sequence definition
export const STAGE_ORDER: AgentRole[] = [
  'orchestrator',
  'pm',
  'dev',
  'review',
  'qa',
  'security',
  'devops',
  'monitor',
];

// Configurable failure & alert probabilities
export const PIPELINE_PROBABILITIES = {
  reviewRejectChance: 0.15, // 15% Review requests changes back to Dev
  qaFailChance: 0.20,       // 20% QA fails -> feedback loop courier bike to Dev
  securityAlertChance: 0.10 // 10% Security discovers dependency warning
};
