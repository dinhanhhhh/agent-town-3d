import { AgentRole } from '../pipeline/stages';

export interface IEventSource {
  start(): void;
  pause(): void;
  reset(): void;
  step(): void;
  dispatchTask(title: string): void;
  resolveApproval(approvalId: string, status: 'approved' | 'rejected'): void;
}
