import { create } from 'zustand';
import { Agent, AgentRole, AgentStatus, Approval, PipelineEvent, Task } from '../lib/pipeline/stages';
import { sfx } from '../lib/audio/sfx';

export interface Courier {
  id: string;
  type: 'forward' | 'feedback';
  fromRole: AgentRole;
  toRole: AgentRole;
  progress: number; // 0 to 1
  boxType: 'pr' | 'bug' | 'ticket' | 'deploy' | 'spec';
  label: string;
}

export type ThemeMode = 'day' | 'sunset' | 'night';
export type ScenarioMode = 'feature' | 'bug' | 'security' | 'chaos' | 'github';

export interface PipelineSession {
  id: string;
  timestamp: number;
  prompt: string;
  scenario: ScenarioMode;
  artifacts: Record<AgentRole, { filename: string; language: string; content: string } | null>;
  metrics?: { latencyMs: number; tps: number; cpuUsage: number };
}

let activePipelineAbortController: AbortController | null = null;

const courierArrivalListeners = new Map<string, () => void>();

export function registerCourierArrival(courierId: string, cb: () => void) {
  courierArrivalListeners.set(courierId, cb);
}

export function notifyCourierArrived(courierId: string) {
  const cb = courierArrivalListeners.get(courierId);
  if (cb) {
    courierArrivalListeners.delete(courierId);
    cb();
  }
}

export function waitForCourierArrival(courierId: string, signal?: AbortSignal, maxWaitMs = 12000): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }
    const onAbort = () => {
      courierArrivalListeners.delete(courierId);
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    };
    signal?.addEventListener('abort', onAbort, { once: true });

    const timer = setTimeout(() => {
      courierArrivalListeners.delete(courierId);
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, maxWaitMs);

    registerCourierArrival(courierId, () => {
      clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
      resolve();
    });
  });
}

function saveSessionToStorage(session: PipelineSession) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem('AGENT_TOWN_SESSIONS');
    const existing: PipelineSession[] = raw ? JSON.parse(raw) : [];
    const updated = [session, ...existing.filter((s) => s.id !== session.id)].slice(0, 5);
    localStorage.setItem('AGENT_TOWN_SESSIONS', JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save session to storage', err);
  }
}

function loadSessionsFromStorage(): PipelineSession[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('AGENT_TOWN_SESSIONS');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function abortableSleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    };
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

export interface TownState {
  // Pipeline State
  agents: Record<AgentRole, Agent>;
  tasks: Task[];
  activeTaskId: string | null;
  events: PipelineEvent[];
  approvals: Approval[];
  couriers: Courier[];

  // 3D & HUD Settings
  themeMode: ThemeMode;
  isRotating: boolean;
  isAutoFollow: boolean;
  showLabels: boolean;
  showBubbles: boolean;
  isSoundEnabled: boolean;
  isLogDrawerOpen: boolean;
  isSimulating: boolean;
  simSpeed: number;
  cameraPreset: 'default' | 'panoramic' | 'overview';
  cameraTarget: [number, number, number] | null;
  cameraZoom: number;

  // Selected Inspect / Modals
  selectedAgentRole: AgentRole | null;
  isApprovalModalOpen: boolean;
  isArtifactModalOpen: boolean;
  isApiKeyModalOpen: boolean;
  isPromptModalOpen: boolean;
  isDossierModalOpen: boolean;
  isExportModalOpen: boolean;
  isChaosRunning: boolean;

  // Real LLM Pipeline & Live Token Stream
  apiKey: string;
  sessions: PipelineSession[];
  isRealRunning: boolean;
  streamingStage: AgentRole | null;
  streamingFilename: string;
  streamingContent: string;
  realArtifacts: Record<AgentRole, { filename: string; language: string; content: string } | null>;
  stageMetrics: Record<AgentRole, { durationMs: number; tokens: number } | null>;

  // Telemetry
  weather: string;
  latencyMs: number;
  tps: number;
  cpuUsage: number;
  passedCount: number;
  failedCount: number;

  // Actions
  setThemeMode: (mode: ThemeMode) => void;
  toggleThemeMode: () => void;
  toggleSound: () => void;
  toggleLogDrawer: (open?: boolean) => void;
  setApiKey: (key: string) => void;
  openApiKeyModal: (open: boolean) => void;
  openPromptModal: (open: boolean) => void;
  openExportModal: (open: boolean) => void;
  runChaosSimulation: () => Promise<void>;
  runRealPipeline: (userPrompt: string, scenario?: ScenarioMode) => Promise<void>;
  runGitHubPrAudit: (prUrl: string) => Promise<void>;
  abortPipeline: () => void;
  setRotating: (isRotating: boolean) => void;
  toggleRotating: () => void;
  setAutoFollow: (isAutoFollow: boolean) => void;
  toggleAutoFollow: () => void;
  setShowLabels: (show: boolean) => void;
  toggleLabels: () => void;
  setShowBubbles: (show: boolean) => void;
  toggleBubbles: () => void;
  setIsSimulating: (sim: boolean) => void;
  toggleSimulating: () => void;
  setSimSpeed: (speed: number) => void;
  cycleSimSpeed: () => void;

  updateAgentSystemPrompt: (role: AgentRole, prompt: string) => void;
  resetAgentSystemPrompt: (role: AgentRole) => void;
  rerunStage: (stage: AgentRole) => Promise<void>;

  setCameraPreset: (preset: 'default' | 'panoramic' | 'overview') => void;
  setCameraTarget: (target: [number, number, number] | null) => void;
  setCameraZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetCamera: () => void;

  selectAgent: (role: AgentRole | null, modalMode?: 'dossier' | 'artifact' | 'none') => void;
  openApprovalModal: (open: boolean) => void;
  openArtifactModal: (open: boolean) => void;
  openDossierModal: (open: boolean) => void;

  updateAgent: (role: AgentRole, updates: Partial<Agent>) => void;
  setAgentStatus: (role: AgentRole, status: AgentStatus, speech?: string) => void;

  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  setActiveTaskId: (id: string | null) => void;

  addEvent: (event: Omit<PipelineEvent, 'id' | 'createdAt'>) => void;
  addCourier: (courier: Omit<Courier, 'id' | 'progress'>) => string;
  updateCourierProgress: (id: string, progress: number) => void;
  removeCourier: (id: string) => void;

  createApproval: (taskId: string) => void;
  resolveApproval: (approvalId: string, status: 'approved' | 'rejected', feedbackNote?: string) => Promise<void> | void;

  loadSession: (session: PipelineSession) => void;
  deleteSession: (id: string) => void;
  initClientStorage: () => void;

  updateTelemetry: (metrics: Partial<{ latencyMs: number; tps: number; cpuUsage: number; weather: string }>) => void;
}

const INITIAL_AGENTS: Record<AgentRole, Agent> = {
  orchestrator: {
    id: 'agent-orchestrator',
    name: 'Claude Code',
    role: 'orchestrator',
    status: 'idle',
    speech: 'Trung tâm chỉ huy AI: Sẵn sàng nhận yêu cầu mới...',
    category: 'Hub & Spoke Master',
    systemPrompt:
      'Bạn là Orchestrator chính của hệ thống DevOps tự trị. Tiếp nhận prompt, phân rã milestone và điều phối 7 trạm chuyên môn.',
  },
  pm: {
    id: 'agent-pm',
    name: 'PM · BA',
    role: 'pm',
    status: 'idle',
    speech: 'Đang chuẩn bị PRD & 3 User Stories mới...',
    category: 'Product & Specs',
    systemPrompt:
      'Bạn là Senior Product Manager. Phân tích yêu cầu và viết PRD ngắn gọn gồm mục tiêu, flow, functional specs và Gherkin acceptance criteria.',
  },
  dev: {
    id: 'agent-dev',
    name: 'Dev Engineer',
    role: 'dev',
    status: 'idle',
    speech: 'Lab lập trình: Sẵn sàng nhận ticket...',
    category: 'Software Engineering',
    systemPrompt:
      'Bạn là Senior Full-Stack Engineer. Dựa trên PRD, viết mã nguồn sạch, xử lý validation, error handling và xuất diff Pull Request.',
  },
  review: {
    id: 'agent-review',
    name: 'Tech Review',
    role: 'review',
    status: 'idle',
    speech: 'Sẵn sàng kiểm tra PR diff & kiến trúc...',
    category: 'Code Quality & Tech Lead',
    systemPrompt:
      'Bạn là Principal Code Reviewer. Kiểm tra diff PR tỉ mỉ: tìm memory leak, boundary check và quyết định APPROVE hoặc REQUEST_CHANGES.',
  },
  qa: {
    id: 'agent-qa',
    name: 'QA · Test',
    role: 'qa',
    status: 'idle',
    speech: 'Phòng lab kiểm thử: 48/48 test suite sẵn sàng ✅',
    category: 'Automation Testing',
    systemPrompt:
      'Bạn là Lead QA Automation Engineer. Tạo và chạy tự động các bộ unit, integration và edge cases test; xuất telemetry pass/fail.',
  },
  security: {
    id: 'agent-security',
    name: 'DevSecOps',
    role: 'security',
    status: 'idle',
    speech: '0 lỗ hổng nghiêm trọng · Security Audit Passed 🛡️',
    category: 'AppSec & SAST Audit',
    systemPrompt:
      'Bạn là Cybersecurity Specialist. Rà soát source code và dependencies nhằm phát hiện injection, secret leak, CVE và OWASP Top 10.',
  },
  devops: {
    id: 'agent-devops',
    name: 'Release Eng',
    role: 'devops',
    status: 'idle',
    speech: 'Đang chờ release lên Production cluster 🚀',
    category: 'CI/CD & Kubernetes',
    systemPrompt:
      'Bạn là Senior DevOps & SRE. Viết Dockerfile chuẩn production, manifest Kubernetes/ArgoCD và quản lý luồng Blue-Green release.',
  },
  monitor: {
    id: 'agent-monitor',
    name: 'APM Telemetry',
    role: 'monitor',
    status: 'idle',
    speech: 'CPU 24% · Latency 14ms · Hệ thống ổn định 100% 📡',
    category: 'SRE & Watchdog',
    systemPrompt:
      'Bạn là SRE Monitoring Watchdog. Theo dõi telemetry từ cụm production, đánh giá độ ổn định và phát hiện spike latency hoặc 5xx.',
  },
};

export const useTownStore = create<TownState>((set, get) => {
  // Helper đọc SSE stream từ /api/pipeline và cập nhật live terminal
  const streamStageFromApi = async (params: {
    prompt: string;
    stage: AgentRole;
    defaultFilename: string;
    context: Record<string, unknown>;
    signal: AbortSignal;
  }): Promise<{
    filename?: string;
    language?: string;
    content?: string;
    speech?: string;
    error?: string;
  }> => {
    const { prompt, stage, defaultFilename, context, signal } = params;
    const startTime = Date.now();
    set({
      streamingStage: stage,
      streamingFilename: defaultFilename,
      streamingContent: '',
    });

    const activeKey =
      get().apiKey ||
      (typeof window !== 'undefined' ? localStorage.getItem('AGENT_TOWN_GEMINI_KEY') || '' : '');
    const customPrompt = get().agents[stage]?.systemPrompt;

    const res = await fetch('/api/pipeline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        stage,
        apiKey: activeKey,
        stream: true,
        context,
        customSystemPrompt: customPrompt,
      }),
      signal,
    });

    const contentType = res.headers.get('content-type') || '';
    if (!res.ok || contentType.includes('application/json') || !res.body) {
      const errData = await res.json().catch(() => ({}));
      return { error: errData.error || `Lỗi gọi AI tại trạm ${stage} (HTTP ${res.status})` };
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let accText = '';
    let finalPayload: {
      filename?: string;
      language?: string;
      content?: string;
      speech?: string;
      error?: string;
    } | null = null;

    const processLine = (rawLine: string) => {
      const line = rawLine.trim();
      if (!line.startsWith('data:')) return;
      const jsonStr = line.slice(5).trim();
      if (!jsonStr) return;
      try {
        const evt = JSON.parse(jsonStr);
        if (evt.type === 'chunk' && typeof evt.delta === 'string') {
          accText += evt.delta;
          set({ streamingContent: accText });
        } else if (evt.type === 'done') {
          finalPayload = {
            filename: evt.filename,
            language: evt.language,
            content: evt.content,
            speech: evt.speech,
          };
        } else if (evt.type === 'error') {
          finalPayload = { error: evt.error || 'Lỗi stream AI.' };
        }
      } catch {
        // Bỏ qua dòng không hợp lệ
      }
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const l of lines) {
        processLine(l);
      }
    }

    if (buffer.trim()) {
      processLine(buffer);
    }

    const durationMs = Math.max(100, Date.now() - startTime);
    const payloadContent = (finalPayload as { content?: string } | null)?.content;
    const resolvedContent = payloadContent || accText;
    const tokens = Math.max(1, Math.round(resolvedContent.length / 3.8));

    set((s) => ({
      stageMetrics: {
        ...s.stageMetrics,
        [stage]: { durationMs, tokens },
      },
    }));

    if (finalPayload) {
      return finalPayload;
    }

    if (accText.trim()) {
      return {
        filename: defaultFilename,
        language: stage === 'dev' ? 'diff' : 'markdown',
        content: accText,
        speech: 'Hoàn thành xử lý.',
      };
    }

    return { error: 'AI Stream kết thúc nhưng không có dữ liệu trả về.' };
  };

  return {
    agents: INITIAL_AGENTS,
    tasks: [],
    activeTaskId: null,
    events: [
      {
        id: 'evt-init',
        agentId: 'agent-orchestrator',
        taskId: 'task-init',
        kind: 'start',
        message: 'Khởi động thị trấn DevOps 3D với 8 Autonomous Agents.',
        severity: 'ok',
        createdAt: Date.now(),
      },
    ],
    approvals: [],
    couriers: [],

    // 3D & HUD Settings
    themeMode: 'day',
    isRotating: false,
    isAutoFollow: true,
    showLabels: true,
    showBubbles: true,
    isSoundEnabled: true,
    isLogDrawerOpen: false,
    isSimulating: false,
    simSpeed: 1,
    cameraPreset: 'default',
    cameraTarget: [0, 0, 0],
    cameraZoom: 30,

    selectedAgentRole: null,
    isApprovalModalOpen: false,
    isArtifactModalOpen: false,
    isApiKeyModalOpen: false,
    isPromptModalOpen: false,
    isDossierModalOpen: false,
    isExportModalOpen: false,
    isChaosRunning: false,

    apiKey: '',
    sessions: [],
    isRealRunning: false,
    streamingStage: null,
    streamingFilename: '',
    streamingContent: '',
    realArtifacts: {
      orchestrator: null,
      pm: null,
      dev: null,
      review: null,
      qa: null,
      security: null,
      devops: null,
      monitor: null,
    },
    stageMetrics: {
      orchestrator: null,
      pm: null,
      dev: null,
      review: null,
      qa: null,
      security: null,
      devops: null,
      monitor: null,
    },

    weather: 'Nắng nhẹ · 24°C',
    latencyMs: 14,
    tps: 342,
    cpuUsage: 28,
    passedCount: 14,
    failedCount: 2,

    setThemeMode: (themeMode) => set({ themeMode }),
    toggleThemeMode: () =>
      set((s) => {
        const next: ThemeMode = s.themeMode === 'day' ? 'sunset' : s.themeMode === 'sunset' ? 'night' : 'day';
        return { themeMode: next };
      }),
    toggleSound: () =>
      set((s) => {
        const next = !s.isSoundEnabled;
        sfx.setEnabled(next);
        return { isSoundEnabled: next };
      }),
    toggleLogDrawer: (open) =>
      set((s) => ({
        isLogDrawerOpen: open !== undefined ? open : !s.isLogDrawerOpen,
      })),
    setRotating: (isRotating) => set({ isRotating }),
    toggleRotating: () => set((s) => ({ isRotating: !s.isRotating })),
    setAutoFollow: (isAutoFollow) => set({ isAutoFollow }),
    toggleAutoFollow: () => set((s) => ({ isAutoFollow: !s.isAutoFollow })),
    setShowLabels: (showLabels) => set({ showLabels }),
    toggleLabels: () => set((s) => ({ showLabels: !s.showLabels })),
    setShowBubbles: (showBubbles) => set({ showBubbles }),
    toggleBubbles: () => set((s) => ({ showBubbles: !s.showBubbles })),
    setIsSimulating: (isSimulating) => set({ isSimulating }),
    toggleSimulating: () => set((s) => ({ isSimulating: !s.isSimulating })),
    setSimSpeed: (simSpeed) => set({ simSpeed }),
    cycleSimSpeed: () =>
      set((s) => {
        const next = s.simSpeed === 1 ? 2 : s.simSpeed === 2 ? 4 : 1;
        sfx.playPop();
        return { simSpeed: next };
      }),

    setCameraPreset: (cameraPreset) => {
      if (cameraPreset === 'default') {
        set({ cameraPreset, cameraTarget: [0, 0, 0], cameraZoom: 30 });
      } else if (cameraPreset === 'panoramic') {
        set({ cameraPreset, cameraTarget: [0, 1, 0], cameraZoom: 22 });
      } else if (cameraPreset === 'overview') {
        set({ cameraPreset, cameraTarget: [0, 3, 0], cameraZoom: 40 });
      }
    },
    setCameraTarget: (cameraTarget) => set({ cameraTarget }),
    setCameraZoom: (cameraZoom) => set({ cameraZoom }),
    zoomIn: () => set((s) => ({ cameraZoom: Math.min(s.cameraZoom + 4, 55) })),
    zoomOut: () => set((s) => ({ cameraZoom: Math.max(s.cameraZoom - 4, 16) })),
    resetCamera: () =>
      set({
        cameraPreset: 'default',
        cameraTarget: [0, 0, 0],
        cameraZoom: 30,
        selectedAgentRole: null,
      }),

    selectAgent: (role, modalMode = 'dossier') => {
      sfx.playPop();
      if (!role) {
        set({
          selectedAgentRole: null,
          cameraZoom: 30,
          cameraTarget: [0, 0, 0],
          isDossierModalOpen: false,
          isArtifactModalOpen: false,
        });
        return;
      }

      if (modalMode === 'artifact') {
        set({
          selectedAgentRole: role,
          cameraZoom: 45,
          isArtifactModalOpen: true,
          isDossierModalOpen: false,
        });
      } else if (modalMode === 'none') {
        set({
          selectedAgentRole: role,
          cameraZoom: 38,
          isDossierModalOpen: false,
          isArtifactModalOpen: false,
        });
      } else {
        set({
          selectedAgentRole: role,
          cameraZoom: 45,
          isDossierModalOpen: true,
          isArtifactModalOpen: false,
        });
      }
    },
    openApprovalModal: (isApprovalModalOpen) => set({ isApprovalModalOpen }),
    openArtifactModal: (isArtifactModalOpen) =>
      set((s) => ({
        isArtifactModalOpen,
        isDossierModalOpen: isArtifactModalOpen ? false : s.isDossierModalOpen,
      })),
    openDossierModal: (isDossierModalOpen) =>
      set((s) => ({
        isDossierModalOpen,
        isArtifactModalOpen: isDossierModalOpen ? false : s.isArtifactModalOpen,
      })),
    openExportModal: (isExportModalOpen) => set({ isExportModalOpen }),

    updateAgent: (role, updates) =>
      set((state) => ({
        agents: {
          ...state.agents,
          [role]: { ...state.agents[role], ...updates },
        },
      })),

    setAgentStatus: (role, status, speech) =>
      set((state) => ({
        agents: {
          ...state.agents,
          [role]: {
            ...state.agents[role],
            status,
            speech: speech !== undefined ? speech : state.agents[role].speech,
          },
        },
      })),

    addTask: (task) =>
      set((state) => ({
        tasks: [task, ...state.tasks.slice(0, 19)],
        activeTaskId: task.id,
      })),

    updateTask: (id, updates) =>
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: Date.now() } : t)),
      })),

    setActiveTaskId: (activeTaskId) => set({ activeTaskId }),

    addEvent: (eventData) =>
      set((state) => ({
        events: [
          {
            id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            createdAt: Date.now(),
            ...eventData,
          },
          ...state.events.slice(0, 49),
        ],
      })),

    addCourier: (courierData) => {
      sfx.playDeliveryChime();
      const id = `courier-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      set((state) => ({
        couriers: [
          ...state.couriers,
          {
            id,
            progress: 0,
            ...courierData,
          },
        ],
      }));
      return id;
    },

    updateCourierProgress: (id, progress) =>
      set((state) => ({
        couriers: state.couriers.map((c) => (c.id === id ? { ...c, progress } : c)),
      })),

    removeCourier: (id) => {
      notifyCourierArrived(id);
      set((state) => ({
        couriers: state.couriers.filter((c) => c.id !== id),
      }));
    },

    createApproval: (taskId) =>
      set((state) => {
        const approval: Approval = {
          id: `appr-${Date.now()}`,
          taskId,
          status: 'pending',
        };
        return {
          approvals: [approval, ...state.approvals],
          isApprovalModalOpen: true,
        };
      }),

    resolveApproval: async (approvalId, status, feedbackNote) => {
      const state = get();
      const currentApproval = state.approvals.find((a) => a.id === approvalId);

      set((s) => ({
        approvals: s.approvals.map((a) =>
          a.id === approvalId ? { ...a, status, decidedAt: Date.now() } : a
        ),
        isApprovalModalOpen: false,
      }));

      if (state.isRealRunning && currentApproval) {
        if (status === 'approved') {
          sfx.playSuccessFanfare();
          const prompt = state.tasks.find((t) => t.id === currentApproval.taskId)?.title || 'Tính năng mới';
          state.updateTask(currentApproval.taskId, { state: 'passed', stage: 'monitor' });
          state.setAgentStatus('devops', 'working', 'Tech Lead đã phê duyệt! Đang Canary deploy lên Production...');
          const courierId = state.addCourier({
            type: 'forward',
            fromRole: 'devops',
            toRole: 'monitor',
            boxType: 'deploy',
            label: 'Production Release',
          });

          if (courierId) {
            await waitForCourierArrival(courierId);
          }

          try {
            const r = await fetch('/api/pipeline', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                prompt,
                stage: 'monitor',
                apiKey:
                  state.apiKey ||
                  (typeof window !== 'undefined' ? localStorage.getItem('AGENT_TOWN_GEMINI_KEY') : ''),
              }),
            });
            const data = await r.json();
            if (data.content) {
              try {
                const parsed = JSON.parse(data.content);
                state.updateTelemetry({
                  cpuUsage: parseInt(parsed.cpuUsage, 10) || 24,
                  latencyMs: parseInt(parsed.p99Latency, 10) || 14,
                  tps: parsed.tps || 342,
                });
              } catch {
                // Keep existing telemetry if non-numeric
              }
              set((s) => ({
                realArtifacts: {
                  ...s.realArtifacts,
                  monitor: {
                    filename: data.filename,
                    language: data.language,
                    content: data.content,
                  },
                },
              }));
              state.setAgentStatus('monitor', 'idle', data.speech || 'Hệ thống vận hành ổn định.');
              state.setAgentStatus('devops', 'idle', 'Đã release lên Production thành công! 🚀');
              state.addEvent({
                agentId: 'agent-monitor',
                taskId: currentApproval.taskId,
                kind: 'pass',
                message: data.speech || 'Hệ thống ổn định 100%.',
                severity: 'ok',
              });

              // Lưu phiên hoàn tất vào bộ nhớ Session History
              const fullSession: PipelineSession = {
                id: currentApproval.taskId,
                timestamp: Date.now(),
                prompt,
                scenario:
                  (state.tasks.find((t) => t.id === currentApproval.taskId)?.payload?.scenario as ScenarioMode) ||
                  'feature',
                artifacts: get().realArtifacts,
                metrics: {
                  latencyMs: get().latencyMs,
                  tps: get().tps,
                  cpuUsage: get().cpuUsage,
                },
              };
              saveSessionToStorage(fullSession);
              set((s) => ({
                sessions: [fullSession, ...s.sessions.filter((ses) => ses.id !== fullSession.id)].slice(0, 5),
              }));
            }
          } catch (err) {
            console.error('Monitor stage error:', err);
          } finally {
            set({ isRealRunning: false, streamingStage: null });
          }
        } else {
          // Xử lý từ chối kèm phản hồi kỹ thuật từ Tech Lead
          sfx.playBugAlert();
          const prompt = state.tasks.find((t) => t.id === currentApproval.taskId)?.title || 'Tính năng';
          const rejectMsg = feedbackNote || 'Release bị từ chối tại cổng duyệt: cần rà soát lại exception handling.';

          state.updateTask(currentApproval.taskId, { state: 'in_progress', stage: 'dev' });
          state.setAgentStatus('devops', 'error', `Release bị từ chối: "${rejectMsg.slice(0, 30)}..."`);
          state.setAgentStatus('dev', 'debugging', `Tech Lead yêu cầu: "${rejectMsg.slice(0, 35)}...". Đang sửa...`);
          state.addEvent({
            agentId: 'agent-devops',
            taskId: currentApproval.taskId,
            kind: 'alert',
            message: `Tech Lead từ chối: ${rejectMsg}`,
            severity: 'warn',
          });

          const feedbackCourierId = state.addCourier({
            type: 'feedback',
            fromRole: 'devops',
            toRole: 'dev',
            boxType: 'bug',
            label: 'Tech Lead Feedback',
          });

          if (feedbackCourierId) {
            await waitForCourierArrival(feedbackCourierId);
          }

          // Kỹ sư Dev dùng real AI để sửa code theo đúng feedbackNote
          sfx.playTyping();
          const curDevCode = state.realArtifacts.dev?.content || '';
          const hotfixRes = await streamStageFromApi({
            prompt,
            stage: 'dev',
            defaultFilename: 'source-code.diff',
            context: {
              feedbackNote: rejectMsg,
              sourceCode: curDevCode,
              prd: state.realArtifacts.pm?.content || '',
            },
            signal: activePipelineAbortController?.signal || new AbortController().signal,
          });

          if (hotfixRes.content) {
            set((s) => ({
              realArtifacts: {
                ...s.realArtifacts,
                dev: {
                  filename: 'source-code.diff',
                  language: 'diff',
                  content: hotfixRes.content || '',
                },
              },
            }));
            state.setAgentStatus('dev', 'idle', 'Đã cập nhật bản vá PR theo phản hồi Tech Lead!');
            state.addEvent({
              agentId: 'agent-dev',
              taskId: currentApproval.taskId,
              kind: 'pass',
              message: 'Dev đã cập nhật bản vá PR Diff theo yêu cầu.',
              severity: 'ok',
            });

            const forwardCourierId = state.addCourier({
              type: 'forward',
              fromRole: 'dev',
              toRole: 'devops',
              boxType: 'pr',
              label: 'Revised PR Diff',
            });

            if (forwardCourierId) {
              await waitForCourierArrival(forwardCourierId);
            }

            state.setAgentStatus('devops', 'waiting', 'Bản vá mới đã cập nhật! Chờ Tech Lead duyệt lại.');
            state.createApproval(currentApproval.taskId);
            state.openApprovalModal(true);
          } else {
            set({ isRealRunning: false, streamingStage: null });
          }
        }
      }
    },

    loadSession: (session) => {
      sfx.playSuccessFanfare();
      set((s) => ({
        realArtifacts: session.artifacts,
        latencyMs: session.metrics?.latencyMs ?? s.latencyMs,
        tps: session.metrics?.tps ?? s.tps,
        cpuUsage: session.metrics?.cpuUsage ?? s.cpuUsage,
        streamingStage: null,
        isRealRunning: false,
        selectedAgentRole: 'dev',
        isPromptModalOpen: false,
      }));
      get().setAgentStatus('orchestrator', 'idle', `Đã khôi phục phiên: "${session.prompt.slice(0, 28)}..."`);
      get().setAgentStatus('dev', 'idle', `Bản vá "${session.artifacts.dev?.filename || 'diff'}" sẵn sàng.`);
      get().addEvent({
        agentId: 'agent-orchestrator',
        taskId: session.id,
        kind: 'pass',
        message: `Đã khôi phục phiên: ${session.prompt}`,
        severity: 'ok',
      });
    },

    deleteSession: (id) => {
      set((s) => {
        const updated = s.sessions.filter((ses) => ses.id !== id);
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('AGENT_TOWN_SESSIONS', JSON.stringify(updated));
          } catch {}
        }
        return { sessions: updated };
      });
    },

    initClientStorage: () => {
      if (typeof window === 'undefined') return;
      const storedKey = localStorage.getItem('AGENT_TOWN_GEMINI_KEY') || '';
      const storedSessions = loadSessionsFromStorage();
      set({
        apiKey: storedKey || get().apiKey,
        sessions: storedSessions,
      });
    },

    setApiKey: (apiKey: string) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('AGENT_TOWN_GEMINI_KEY', apiKey);
      }
      set({ apiKey });
    },

    openApiKeyModal: (isApiKeyModalOpen: boolean) => set({ isApiKeyModalOpen }),
    openPromptModal: (isPromptModalOpen: boolean) => set({ isPromptModalOpen }),

    updateAgentSystemPrompt: (role: AgentRole, prompt: string) => {
      set((s) => ({
        agents: {
          ...s.agents,
          [role]: { ...s.agents[role], systemPrompt: prompt },
        },
      }));
    },

    resetAgentSystemPrompt: (role: AgentRole) => {
      set((s) => ({
        agents: {
          ...s.agents,
          [role]: { ...s.agents[role], systemPrompt: INITIAL_AGENTS[role].systemPrompt },
        },
      }));
    },

    rerunStage: async (stage: AgentRole) => {
      const state = get();
      if (state.isRealRunning) return;

      const agent = state.agents[stage];
      if (!agent) return;

      const abortController = new AbortController();
      activePipelineAbortController = abortController;
      const { signal } = abortController;

      set({ isRealRunning: true, streamingStage: stage });
      state.setAgentStatus(stage, 'working', `Đang chạy lại trạm với System Prompt tùy chỉnh...`);
      sfx.playTyping();

      const defaultFilename = state.realArtifacts[stage]?.filename || (
        stage === 'orchestrator' ? 'MilestonePlan.json' :
        stage === 'pm' ? 'PRD.md' :
        stage === 'dev' ? 'source-code.diff' :
        stage === 'review' ? 'ReviewComments.json' :
        stage === 'qa' ? 'test-suite.spec.ts' :
        stage === 'security' ? 'SecurityAudit.json' :
        stage === 'devops' ? 'Dockerfile' : 'ClusterHealth.json'
      );

      const activeTask = state.tasks.find((t) => t.id === state.activeTaskId) || state.tasks[0];
      const prompt = activeTask?.title || 'Tối ưu hóa và kiểm định hệ thống DevOps tự trị';

      try {
        const result = await streamStageFromApi({
          prompt,
          stage,
          defaultFilename,
          context: {
            prd: state.realArtifacts.pm?.content || state.realArtifacts.orchestrator?.content || '',
            sourceCode: state.realArtifacts.dev?.content || '',
            reviewComments: state.realArtifacts.review?.content || '',
            testReport: state.realArtifacts.qa?.content || '',
          },
          signal,
        });

        if (result.error) {
          state.setAgentStatus(stage, 'error', result.error);
          state.addEvent({
            agentId: `agent-${stage}`,
            taskId: state.activeTaskId || 'rerun-task',
            kind: 'fail',
            message: `Chạy lại thất bại tại ${stage}: ${result.error}`,
            severity: 'error',
          });
        } else {
          set((s) => ({
            realArtifacts: {
              ...s.realArtifacts,
              [stage]: {
                filename: result.filename || defaultFilename,
                language: result.language || 'text',
                content: result.content || '',
              },
            },
          }));
          state.setAgentStatus(stage, 'idle', result.speech || 'Đã chạy lại thành công.');
          state.addEvent({
            agentId: `agent-${stage}`,
            taskId: state.activeTaskId || 'rerun-task',
            kind: 'pass',
            message: `Đã chạy lại thành công trạm ${stage} (${result.filename || defaultFilename})`,
            severity: 'ok',
          });
          sfx.playSuccessFanfare();
        }
      } catch (err: unknown) {
        if (!signal.aborted) {
          state.setAgentStatus(stage, 'error', 'Lỗi không xác định khi chạy lại.');
        }
      } finally {
        set({ isRealRunning: false, streamingStage: null });
      }
    },

    abortPipeline: () => {
      if (activePipelineAbortController) {
        activePipelineAbortController.abort();
        activePipelineAbortController = null;
      }
      sfx.playPop();

      const currentAgents = get().agents;
      const updatedAgents = { ...currentAgents };
      (Object.keys(updatedAgents) as AgentRole[]).forEach((role) => {
        const st = updatedAgents[role].status;
        if (st === 'working' || st === 'debugging' || st === 'waiting') {
          updatedAgents[role] = {
            ...updatedAgents[role],
            status: 'idle',
            speech: '⏹ Đã dừng pipeline theo lệnh chỉ huy.',
          };
        }
      });

      set({
        agents: updatedAgents,
        isRealRunning: false,
        streamingStage: null,
        streamingContent: '',
        streamingFilename: '',
      });

      get().addEvent({
        agentId: 'agent-orchestrator',
        taskId: get().activeTaskId || 'task-abort',
        kind: 'alert',
        message: '⏹ Người dùng đã chủ động dừng luồng AI Pipeline.',
        severity: 'warn',
      });
    },

    runChaosSimulation: async () => {
      const state = get();
      if (state.isChaosRunning || state.isRealRunning) return;

      set({ isChaosRunning: true });
      state.setIsSimulating(false);

      sfx.playBugAlert();
      state.updateTelemetry({ cpuUsage: 96, latencyMs: 168, tps: 2500 });
      state.setAgentStatus('monitor', 'error', '🚨 BÁO ĐỘNG ĐỎ: Bão request 10x! TPS vọt 2,500, Latency 168ms!');
      state.addEvent({
        agentId: 'agent-monitor',
        taskId: 'chaos-traffic-surge',
        kind: 'fail',
        message:
          '🚨 [CHAOS ALERT] Phát hiện đột biến tải 10x: TPS 2,500, Latency 168ms (vượt ngưỡng P99 160ms), CPU cụm 96%!',
        severity: 'error',
      });

      await new Promise((r) => setTimeout(r, 1600));

      sfx.playTyping();
      state.setAgentStatus(
        'devops',
        'working',
        '⚡ Kích hoạt HPA Auto-scaler: scale từ 3 lên 12 pods (ScaleUp.yaml)...'
      );
      state.addEvent({
        agentId: 'agent-devops',
        taskId: 'chaos-traffic-surge',
        kind: 'start',
        message: 'DevOps tự động kích hoạt HPA: Tạo ScaleUp.yaml, tăng số replicas từ 3 lên 12 worker pods',
        severity: 'warn',
      });

      state.addCourier({
        type: 'forward',
        fromRole: 'devops',
        toRole: 'monitor',
        boxType: 'deploy',
        label: 'ScaleUp.yaml (12 Pods)',
      });

      await new Promise((r) => setTimeout(r, 3000));

      sfx.playSuccessFanfare();
      state.updateTelemetry({ cpuUsage: 26, latencyMs: 14, tps: 820 });
      state.setAgentStatus('devops', 'idle', '✅ Đã scale thành công 12 pods, tải đã được cân bằng!');
      state.setAgentStatus('monitor', 'idle', 'Hệ thống hạ nhiệt an toàn! Latency 14ms · Cluster Healthy 100% 📡');
      state.addEvent({
        agentId: 'agent-monitor',
        taskId: 'chaos-traffic-surge',
        kind: 'pass',
        message: '✅ [CHAOS RESOLVED] Hạ nhiệt cụm server thành công: Latency 14ms, CPU 26%, TPS 820',
        severity: 'ok',
      });

      set({ isChaosRunning: false });
    },

    runGitHubPrAudit: async (prUrl: string) => {
      const state = get();
      if (state.isRealRunning) return;

      if (activePipelineAbortController) {
        activePipelineAbortController.abort();
      }
      const abortController = new AbortController();
      activePipelineAbortController = abortController;
      const { signal } = abortController;

      state.setIsSimulating(false);
      set({
        isPromptModalOpen: false,
        isRealRunning: true,
        streamingStage: 'orchestrator',
        streamingFilename: 'GitHub REST API',
        streamingContent: `🔗 Đang kết nối GitHub API tải Pull Request:\n${prUrl}\n...`,
        realArtifacts: {
          orchestrator: null,
          pm: null,
          dev: null,
          review: null,
          qa: null,
          security: null,
          devops: null,
          monitor: null,
        },
      });

      get().setAgentStatus('orchestrator', 'working', 'Đang kết nối GitHub API để tải PR Diff thực tế...');
      sfx.playTyping();

      const taskId = `task-gh-${Date.now()}`;

      try {
        const ghRes = await fetch('/api/github-pr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prUrl }),
          signal,
        });

        const ghData = await ghRes.json();
        if (!ghRes.ok || ghData.error) {
          const errMsg = ghData.error || 'Không thể tải dữ liệu từ GitHub PR.';
          get().setAgentStatus('orchestrator', 'error', errMsg);
          get().addEvent({
            agentId: 'agent-orchestrator',
            taskId,
            kind: 'fail',
            message: `Lỗi GitHub PR Import: ${errMsg}`,
            severity: 'error',
          });
          set({ isRealRunning: false, streamingStage: null });
          return;
        }

        const { pr, diff } = ghData;
        const prTitle = `PR #${pr.number} (${pr.owner}/${pr.repo}): ${pr.title}`;
        const prContextMd = `# 🔗 GitHub Pull Request Context: ${pr.owner}/${pr.repo}#${pr.number}
- **Tiêu đề:** ${pr.title}
- **Tác giả:** @${pr.author}
- **Nhánh:** \`${pr.headRef}\` ➔ \`${pr.baseRef}\`
- **Thống kê Diff:** +${pr.additions} / -${pr.deletions} (${pr.changedFiles} files)
- **URL gốc:** ${pr.htmlUrl}

## Mô tả PR
${pr.body || '_Không có mô tả chi tiết._'}
`;

        const milestoneJson = JSON.stringify(
          {
            milestone: `GitHub PR Audit · ${pr.owner}/${pr.repo}#${pr.number}`,
            goal: `Kiểm toán tự động Code Quality, Unit Tests, SAST Security & Release cho PR #${pr.number}`,
            sourceUrl: pr.htmlUrl,
            stats: `+${pr.additions} / -${pr.deletions} (${pr.changedFiles} files)`,
          },
          null,
          2
        );

        const task: Task = {
          id: taskId,
          type: 'pr',
          title: prTitle,
          refNo: `PR-${pr.number}`,
          stage: 'dev',
          state: 'in_progress',
          payload: { ...pr },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        get().addTask(task);
        get().setActiveTaskId(taskId);

        set({
          streamingContent: `✅ Đã tải thành công ${pr.owner}/${pr.repo}#${pr.number}\nTiêu đề: ${pr.title}\nThay đổi: +${pr.additions} / -${pr.deletions} trên ${pr.changedFiles} files.\nĐang chuyển diff sang trạm Tech Review...`,
          realArtifacts: {
            orchestrator: {
              filename: 'MilestonePlan.json',
              language: 'json',
              content: milestoneJson,
            },
            pm: {
              filename: 'PR-Context.md',
              language: 'markdown',
              content: prContextMd,
            },
            dev: {
              filename: `PR-${pr.number}.diff`,
              language: 'diff',
              content: diff,
            },
            review: null,
            qa: null,
            security: null,
            devops: null,
            monitor: null,
          },
        });

        get().setAgentStatus(
          'orchestrator',
          'idle',
          `Đã kéo PR #${pr.number} (${pr.owner}/${pr.repo}) về hệ thống!`
        );
        get().setAgentStatus(
          'dev',
          'idle',
          `Đã đồng bộ PR #${pr.number} (+${pr.additions} / -${pr.deletions}) sẵn sàng Audit!`
        );
        get().addEvent({
          agentId: 'agent-dev',
          taskId,
          kind: 'handoff',
          message: `Đã import diff thật từ GitHub ${pr.owner}/${pr.repo}#${pr.number} (+${pr.additions}/-${pr.deletions}).`,
          severity: 'ok',
        });

        const firstCourierId = get().addCourier({
          type: 'forward',
          fromRole: 'dev',
          toRole: 'review',
          boxType: 'pr',
          label: `PR-${pr.number}.diff`,
        });

        if (firstCourierId) {
          await waitForCourierArrival(firstCourierId, signal);
        }

        // 1. Giai đoạn Tech Review diff thực tế
        get().updateTask(taskId, { stage: 'review' });
        get().setAgentStatus('review', 'working', `Đang review diff thực tế của PR #${pr.number}...`);
        sfx.playTyping();
        get().updateTelemetry({ cpuUsage: 42, latencyMs: 16, tps: 310 });

        const reviewResult = await streamStageFromApi({
          prompt: prTitle,
          stage: 'review',
          defaultFilename: 'ReviewComments.json',
          context: {
            prd: prContextMd,
            sourceCode: diff,
            scenario: 'github',
          },
          signal,
        });

        if (signal.aborted) return;

        if (reviewResult.error) {
          get().setAgentStatus('review', 'error', reviewResult.error);
          get().addEvent({
            agentId: 'agent-review',
            taskId,
            kind: 'fail',
            message: `Tạm dừng Audit tại review: ${reviewResult.error}`,
            severity: 'error',
          });
          set({ isRealRunning: false, streamingStage: null });
          return;
        }

        set((s) => ({
          realArtifacts: {
            ...s.realArtifacts,
            review: {
              filename: reviewResult.filename || 'ReviewComments.json',
              language: reviewResult.language || 'json',
              content: reviewResult.content || '',
            },
          },
        }));

        get().setAgentStatus('review', 'idle', reviewResult.speech || 'Hoàn thành Review.');
        get().addEvent({
          agentId: 'agent-review',
          taskId,
          kind: 'pass',
          message: reviewResult.speech || 'Đã hoàn thành ReviewComments.json',
          severity: 'ok',
        });

        // 2. DAG FORK: Phân nhánh song song Review ➔ (QA ∥ DevSecOps)
        const qaCourierId = get().addCourier({
          type: 'forward',
          fromRole: 'review',
          toRole: 'qa',
          boxType: 'pr',
          label: 'PR Diff for Test Suite',
        });
        const secCourierId = get().addCourier({
          type: 'forward',
          fromRole: 'review',
          toRole: 'security',
          boxType: 'deploy',
          label: 'PR Diff for SAST Audit',
        });

        if (qaCourierId && secCourierId) {
          await Promise.all([
            waitForCourierArrival(qaCourierId, signal),
            waitForCourierArrival(secCourierId, signal),
          ]);
        }

        get().updateTask(taskId, { stage: 'qa' });
        get().setAgentStatus('qa', 'working', `Đang sinh Unit Tests cho PR #${pr.number} (QA ∥ Security)...`);
        get().setAgentStatus('security', 'working', `Đang quét SAST & OWASP cho PR #${pr.number} (QA ∥ Security)...`);
        sfx.playTyping();
        get().updateTelemetry({ cpuUsage: 80, latencyMs: 22, tps: 180 });

        const [qaResult, secResult] = await Promise.all([
          streamStageFromApi({
            prompt: prTitle,
            stage: 'qa',
            defaultFilename: 'test-suite.spec.ts',
            context: {
              prd: prContextMd,
              sourceCode: diff,
              reviewComments: get().realArtifacts.review?.content || '',
              scenario: 'github',
            },
            signal,
          }),
          streamStageFromApi({
            prompt: prTitle,
            stage: 'security',
            defaultFilename: 'SecurityAudit.json',
            context: {
              prd: prContextMd,
              sourceCode: diff,
              reviewComments: get().realArtifacts.review?.content || '',
              scenario: 'github',
            },
            signal,
          }),
        ]);

        if (signal.aborted) return;

        set((s) => ({
          realArtifacts: {
            ...s.realArtifacts,
            qa: {
              filename: qaResult.filename || 'test-suite.spec.ts',
              language: qaResult.language || 'typescript',
              content: qaResult.content || '',
            },
            security: {
              filename: secResult.filename || 'SecurityAudit.json',
              language: secResult.language || 'json',
              content: secResult.content || '',
            },
          },
        }));

        get().setAgentStatus('qa', 'idle', qaResult.speech || 'Hoàn thành QA.');
        get().setAgentStatus('security', 'idle', secResult.speech || 'Hoàn thành Security Audit.');
        get().addEvent({
          agentId: 'agent-qa',
          taskId,
          kind: 'pass',
          message: qaResult.speech || 'Đã tạo xong test-suite.spec.ts',
          severity: 'ok',
        });
        get().addEvent({
          agentId: 'agent-security',
          taskId,
          kind: 'pass',
          message: secResult.speech || 'Đã kiểm toán SAST 0 High CVEs',
          severity: 'ok',
        });

        // 3. DAG JOIN: QA + Security đồng thời gửi Artifacts về Release Eng (DevOps)
        const qaToDevopsId = get().addCourier({
          type: 'forward',
          fromRole: 'qa',
          toRole: 'devops',
          boxType: 'ticket',
          label: 'test-suite.spec.ts',
        });
        const secToDevopsId = get().addCourier({
          type: 'forward',
          fromRole: 'security',
          toRole: 'devops',
          boxType: 'deploy',
          label: 'SecurityAudit.json',
        });

        if (qaToDevopsId && secToDevopsId) {
          await Promise.all([
            waitForCourierArrival(qaToDevopsId, signal),
            waitForCourierArrival(secToDevopsId, signal),
          ]);
        }

        // 4. Giai đoạn DevOps: Canary Dockerfile & Release
        get().updateTask(taskId, { stage: 'devops' });
        get().setAgentStatus('devops', 'working', `Đang cấu hình Dockerfile & Canary Release cho PR #${pr.number}...`);
        sfx.playTyping();
        get().updateTelemetry({ cpuUsage: 54, latencyMs: 17, tps: 240 });

        const devopsResult = await streamStageFromApi({
          prompt: prTitle,
          stage: 'devops',
          defaultFilename: 'Dockerfile',
          context: {
            prd: prContextMd,
            sourceCode: diff,
            reviewComments: get().realArtifacts.review?.content || '',
            testReport: get().realArtifacts.qa?.content || '',
            scenario: 'github',
          },
          signal,
        });

        if (signal.aborted) return;

        set((s) => ({
          realArtifacts: {
            ...s.realArtifacts,
            devops: {
              filename: devopsResult.filename || 'Dockerfile',
              language: devopsResult.language || 'dockerfile',
              content: devopsResult.content || '',
            },
          },
        }));

        get().setAgentStatus('devops', 'idle', devopsResult.speech || 'Hoàn thành Dockerfile.');
        get().addEvent({
          agentId: 'agent-devops',
          taskId,
          kind: 'pass',
          message: devopsResult.speech || 'Đã tạo Dockerfile cho PR',
          severity: 'ok',
        });

        set({ streamingStage: null });
        get().setAgentStatus(
          'devops',
          'waiting',
          `Audit PR #${pr.number} hoàn tất! Chờ Tech Lead phê duyệt triển khai Production!`
        );
        get().createApproval(taskId);
        get().openApprovalModal(true);
      } catch (err: unknown) {
        if (signal.aborted || (err instanceof DOMException && err.name === 'AbortError')) {
          return;
        }
        const msg = err instanceof Error ? err.message : 'Lỗi kết nối GitHub PR Audit.';
        get().addEvent({
          agentId: 'agent-orchestrator',
          taskId,
          kind: 'fail',
          message: msg,
          severity: 'error',
        });
        set({ isRealRunning: false, streamingStage: null });
      }
    },

    runRealPipeline: async (userPrompt: string, scenario: ScenarioMode = 'feature') => {
      if (scenario === 'chaos') {
        get().runChaosSimulation();
        return;
      }
      if (scenario === 'github') {
        get().runGitHubPrAudit(userPrompt);
        return;
      }

      const state = get();
      if (state.isRealRunning) return;

      if (activePipelineAbortController) {
        activePipelineAbortController.abort();
      }
      const abortController = new AbortController();
      activePipelineAbortController = abortController;
      const { signal } = abortController;

      state.setIsSimulating(false);
      set({
        isPromptModalOpen: false,
        isRealRunning: true,
        streamingStage: null,
        streamingContent: '',
        streamingFilename: '',
        realArtifacts: {
          orchestrator: null,
          pm: null,
          dev: null,
          review: null,
          qa: null,
          security: null,
          devops: null,
          monitor: null,
        },
      });

      const taskId = `task-real-${Date.now()}`;
      const task: Task = {
        id: taskId,
        type: 'ticket',
        title: userPrompt,
        refNo: `AI-${Math.floor(Math.random() * 900 + 100)}`,
        stage: 'orchestrator',
        state: 'in_progress',
        payload: { scenario },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      state.addTask(task);
      state.setActiveTaskId(taskId);

      state.addEvent({
        agentId: 'agent-orchestrator',
        taskId,
        kind: 'start',
        message: `Khởi tạo pipeline (${scenario.toUpperCase()}) cho task: ${userPrompt}`,
        severity: 'ok',
      });

      const initialStages: {
        stage: AgentRole;
        defaultFilename: string;
        workingMsg: string;
        courierTo?: AgentRole;
        boxType?: 'spec' | 'pr' | 'ticket' | 'deploy' | 'bug';
        courierLabel?: string;
      }[] = [
        {
          stage: 'orchestrator',
          defaultFilename: 'MilestonePlan.json',
          workingMsg: 'Đang phân tích yêu cầu & lập MilestonePlan...',
          courierTo: 'pm',
          boxType: 'spec',
          courierLabel: 'MilestonePlan.json',
        },
        {
          stage: 'pm',
          defaultFilename: 'PRD.md',
          workingMsg: 'Đang soạn thảo tài liệu PRD & tiêu chí Gherkin...',
          courierTo: 'dev',
          boxType: 'spec',
          courierLabel: 'PRD.md',
        },
        {
          stage: 'dev',
          defaultFilename: 'source-code.diff',
          workingMsg: 'Đang lập trình TypeScript & xuất bản vá Git Diff...',
          courierTo: 'review',
          boxType: 'pr',
          courierLabel: 'source-code.diff',
        },
        {
          stage: 'review',
          defaultFilename: 'ReviewComments.json',
          workingMsg: 'Đang kiểm tra chất lượng code & review PR diff...',
        },
      ];

      try {
        for (const step of initialStages) {
          if (signal.aborted) return;
          const { stage, defaultFilename, workingMsg, courierTo, boxType, courierLabel } = step;

          get().updateTask(taskId, { stage });
          get().setAgentStatus(stage, 'working', workingMsg);
          sfx.playTyping();

          if (stage === 'pm') get().updateTelemetry({ cpuUsage: 24, latencyMs: 14, tps: 340 });
          if (stage === 'dev') get().updateTelemetry({ cpuUsage: 48, latencyMs: 16, tps: 290 });
          if (stage === 'review') get().updateTelemetry({ cpuUsage: 36, latencyMs: 15, tps: 310 });

          const currentArtifacts = get().realArtifacts;
          const data = await streamStageFromApi({
            prompt: userPrompt,
            stage,
            defaultFilename,
            context: {
              prd:
                currentArtifacts.pm?.content ||
                currentArtifacts.orchestrator?.content ||
                '',
              sourceCode: currentArtifacts.dev?.content || '',
              reviewComments: currentArtifacts.review?.content || '',
              testReport: currentArtifacts.qa?.content || '',
              scenario,
            },
            signal,
          });

          if (signal.aborted) return;

          if (data.error) {
            const errMsg = data.error;
            get().setAgentStatus(stage, 'error', errMsg);
            get().addEvent({
              agentId: `agent-${stage}`,
              taskId,
              kind: 'fail',
              message: `Lỗi tại ${stage}: ${errMsg}`,
              severity: 'error',
            });
            if (
              errMsg.toLowerCase().includes('api key') ||
              errMsg.toLowerCase().includes('gemini_api_key')
            ) {
              get().openApiKeyModal(true);
            }
            set({ isRealRunning: false, streamingStage: null });
            return;
          }

          set((s) => ({
            realArtifacts: {
              ...s.realArtifacts,
              [stage]: {
                filename: data.filename || defaultFilename,
                language: data.language || 'text',
                content: data.content || '',
              },
            },
          }));

          get().setAgentStatus(stage, 'idle', data.speech || 'Hoàn thành.');
          get().addEvent({
            agentId: `agent-${stage}`,
            taskId,
            kind: 'pass',
            message: data.speech || `Đã hoàn thành ${data.filename}`,
            severity: 'ok',
          });

          if (courierTo && boxType && courierLabel) {
            const forwardCourierId = get().addCourier({
              type: 'forward',
              fromRole: stage,
              toRole: courierTo,
              boxType,
              label: courierLabel,
            });
            if (forwardCourierId) {
              await waitForCourierArrival(forwardCourierId, signal);
            }
          }
        }

        if (signal.aborted) return;

        // ========================================================
        // DAG FORK: Phân nhánh song song Review ➔ (QA ∥ DevSecOps)
        // ========================================================
        const qaCourierId = get().addCourier({
          type: 'forward',
          fromRole: 'review',
          toRole: 'qa',
          boxType: 'ticket',
          label: 'PR for Automation Tests',
        });
        const secCourierId = get().addCourier({
          type: 'forward',
          fromRole: 'review',
          toRole: 'security',
          boxType: 'deploy',
          label: 'PR for SAST Audit',
        });

        if (qaCourierId && secCourierId) {
          await Promise.all([
            waitForCourierArrival(qaCourierId, signal),
            waitForCourierArrival(secCourierId, signal),
          ]);
        }

        get().updateTask(taskId, { stage: 'qa' });
        get().setAgentStatus('qa', 'working', 'Đang tạo bộ test cases tự động (QA ∥ Security song song)...');
        get().setAgentStatus('security', 'working', 'Đang quét SAST & kiểm tra OWASP Top 10 (QA ∥ Security song song)...');
        sfx.playTyping();
        get().updateTelemetry({ cpuUsage: 84, latencyMs: 23, tps: 175 });

        const currentArtifactsAfterReview = get().realArtifacts;
        const sharedContext = {
          prd: currentArtifactsAfterReview.pm?.content || currentArtifactsAfterReview.orchestrator?.content || '',
          sourceCode: currentArtifactsAfterReview.dev?.content || '',
          reviewComments: currentArtifactsAfterReview.review?.content || '',
          scenario,
        };

        const [qaData, secData] = await Promise.all([
          streamStageFromApi({
            prompt: userPrompt,
            stage: 'qa',
            defaultFilename: 'test-suite.spec.ts',
            context: sharedContext,
            signal,
          }),
          streamStageFromApi({
            prompt: userPrompt,
            stage: 'security',
            defaultFilename: 'SecurityAudit.json',
            context: sharedContext,
            signal,
          }),
        ]);

        if (signal.aborted) return;

        set((s) => ({
          realArtifacts: {
            ...s.realArtifacts,
            qa: {
              filename: qaData.filename || 'test-suite.spec.ts',
              language: qaData.language || 'typescript',
              content: qaData.content || '',
            },
            security: {
              filename: secData.filename || 'SecurityAudit.json',
              language: secData.language || 'json',
              content: secData.content || '',
            },
          },
        }));

        get().setAgentStatus('qa', 'idle', qaData.speech || 'Hoàn thành QA.');
        get().setAgentStatus('security', 'idle', secData.speech || 'Hoàn thành Security Audit.');
        get().addEvent({
          agentId: 'agent-qa',
          taskId,
          kind: 'pass',
          message: qaData.speech || 'Đã tạo xong test-suite.spec.ts',
          severity: 'ok',
        });
        get().addEvent({
          agentId: 'agent-security',
          taskId,
          kind: 'pass',
          message: secData.speech || 'Đã kiểm toán SAST 0 High CVEs',
          severity: 'ok',
        });

        // Kịch bản Feedback Loop 1: QA bắt bug -> Shipper chạy ngược về Dev vá lỗi thật qua AI
        if (scenario === 'bug') {
          sfx.playBugAlert();
          get().setAgentStatus('qa', 'error', 'Test fail: 2/48 case (lỗi hết hạn token refresh) 🐛');
          get().addEvent({
            agentId: 'agent-qa',
            taskId,
            kind: 'fail',
            message: 'QA phát hiện 2 test cases thất bại: Token refresh chưa bắt exception!',
            severity: 'error',
          });
          const bugCourierId = get().addCourier({
            type: 'feedback',
            fromRole: 'qa',
            toRole: 'dev',
            boxType: 'bug',
            label: 'Bug: Token Refresh',
          });
          if (bugCourierId) {
            await waitForCourierArrival(bugCourierId, signal);
          }

          get().setAgentStatus('dev', 'debugging', 'Nhận Bug report từ QA: Đang viết bản vá lỗi token refresh...');
          sfx.playTyping();

          const hotfixResult = await streamStageFromApi({
            prompt: userPrompt,
            stage: 'dev',
            defaultFilename: 'source-code.diff',
            context: {
              feedbackNote:
                'QA Test fail 2/48: Lỗi token refresh hết hạn không bắt exception. Bổ sung catch block, renew retry và try/catch an toàn.',
              sourceCode: get().realArtifacts.dev?.content || '',
              prd: get().realArtifacts.pm?.content || '',
              scenario: 'bug',
            },
            signal,
          });

          if (hotfixResult.content) {
            set((s) => ({
              realArtifacts: {
                ...s.realArtifacts,
                dev: {
                  filename: 'source-code.diff',
                  language: 'diff',
                  content: hotfixResult.content || '',
                },
              },
            }));
          }

          get().setAgentStatus('dev', 'idle', 'Đã fix xong bug và push bản vá PR!');
          const hotfixCourierId = get().addCourier({
            type: 'forward',
            fromRole: 'dev',
            toRole: 'qa',
            boxType: 'pr',
            label: 'Hotfix PR Diff',
          });
          if (hotfixCourierId) {
            await waitForCourierArrival(hotfixCourierId, signal);
          }

          get().setAgentStatus('qa', 'idle', '48/48 test cases PASSED (Coverage 98.4%) ✅');
          get().addEvent({
            agentId: 'agent-qa',
            taskId,
            kind: 'pass',
            message: 'Re-test thành công sau bản vá AI của Dev: 100% test cases PASSED.',
            severity: 'ok',
          });
        }

        // Kịch bản Feedback Loop 2: AppSec Audit phát hiện rủi ro SAST/CVE -> Dev vá bảo mật OWASP thật qua AI
        if (scenario === 'security') {
          sfx.playBugAlert();
          get().setAgentStatus(
            'security',
            'error',
            'Cảnh báo SAST: Phát hiện rủi ro OWASP Injection & CVE dependency 🛡️'
          );
          get().addEvent({
            agentId: 'agent-security',
            taskId,
            kind: 'alert',
            message: 'DevSecOps phát hiện thiếu input sanitization & gói phụ thuộc dính CVE. Yêu cầu Dev vá gấp!',
            severity: 'warn',
          });
          const secCourierId = get().addCourier({
            type: 'feedback',
            fromRole: 'security',
            toRole: 'dev',
            boxType: 'bug',
            label: 'SAST CVE Report',
          });
          if (secCourierId) {
            await waitForCourierArrival(secCourierId, signal);
          }

          get().setAgentStatus(
            'dev',
            'debugging',
            'Nhận cảnh báo từ DevSecOps: Đang bổ sung sanitize input & nâng cấp package...'
          );
          sfx.playTyping();

          const secHotfixResult = await streamStageFromApi({
            prompt: userPrompt,
            stage: 'dev',
            defaultFilename: 'source-code.diff',
            context: {
              feedbackNote:
                'DevSecOps SAST Alert: Phát hiện rủi ro Injection & dependency lỗi thời. Hãy bổ sung validate/sanitize input, parameterized query và loại bỏ secrets.',
              sourceCode: get().realArtifacts.dev?.content || '',
              prd: get().realArtifacts.pm?.content || '',
              scenario: 'security',
            },
            signal,
          });

          if (secHotfixResult.content) {
            set((s) => ({
              realArtifacts: {
                ...s.realArtifacts,
                dev: {
                  filename: 'source-code.diff',
                  language: 'diff',
                  content: secHotfixResult.content || '',
                },
              },
            }));
          }

          get().setAgentStatus('dev', 'idle', 'Đã hoàn tất bản vá bảo mật OWASP!');
          const patchCourierId = get().addCourier({
            type: 'forward',
            fromRole: 'dev',
            toRole: 'security',
            boxType: 'pr',
            label: 'OWASP Security Patch',
          });
          if (patchCourierId) {
            await waitForCourierArrival(patchCourierId, signal);
          }

          get().setAgentStatus('security', 'idle', 'Quét lại SAST: 0 High CVEs · OWASP Top 10 Compliant 🛡️');
          get().addEvent({
            agentId: 'agent-security',
            taskId,
            kind: 'pass',
            message: 'DevSecOps xác nhận bản vá hợp lệ: 0 High/Critical CVEs.',
            severity: 'ok',
          });
        }

        // ========================================================
        // DAG JOIN: QA + Security đồng thời gửi Artifacts tới DevOps
        // ========================================================
        const qaToDevopsId = get().addCourier({
          type: 'forward',
          fromRole: 'qa',
          toRole: 'devops',
          boxType: 'ticket',
          label: 'test-suite.spec.ts (Passed)',
        });
        const secToDevopsId = get().addCourier({
          type: 'forward',
          fromRole: 'security',
          toRole: 'devops',
          boxType: 'deploy',
          label: 'SecurityAudit.json (0 CVE)',
        });

        if (qaToDevopsId && secToDevopsId) {
          await Promise.all([
            waitForCourierArrival(qaToDevopsId, signal),
            waitForCourierArrival(secToDevopsId, signal),
          ]);
        }

        // ========================================================
        // Giai đoạn Release Eng (DevOps): Dockerfile & Canary Rollout
        // ========================================================
        get().updateTask(taskId, { stage: 'devops' });
        get().setAgentStatus('devops', 'working', 'Đang đóng gói Dockerfile & cấu hình Canary rollout...');
        sfx.playTyping();
        get().updateTelemetry({ cpuUsage: 59, latencyMs: 18, tps: 220 });

        const latestArtifacts = get().realArtifacts;
        const devopsData = await streamStageFromApi({
          prompt: userPrompt,
          stage: 'devops',
          defaultFilename: 'Dockerfile',
          context: {
            prd: latestArtifacts.pm?.content || latestArtifacts.orchestrator?.content || '',
            sourceCode: latestArtifacts.dev?.content || '',
            reviewComments: latestArtifacts.review?.content || '',
            testReport: latestArtifacts.qa?.content || '',
            scenario,
          },
          signal,
        });

        if (signal.aborted) return;

        if (devopsData.error) {
          get().setAgentStatus('devops', 'error', devopsData.error);
          set({ isRealRunning: false, streamingStage: null });
          return;
        }

        set((s) => ({
          realArtifacts: {
            ...s.realArtifacts,
            devops: {
              filename: devopsData.filename || 'Dockerfile',
              language: devopsData.language || 'dockerfile',
              content: devopsData.content || '',
            },
          },
        }));

        get().setAgentStatus('devops', 'idle', devopsData.speech || 'Hoàn thành Dockerfile.');
        get().addEvent({
          agentId: 'agent-devops',
          taskId,
          kind: 'pass',
          message: devopsData.speech || 'Đã đóng gói Dockerfile thành công',
          severity: 'ok',
        });

        set({ streamingStage: null });
        get().setAgentStatus(
          'devops',
          'waiting',
          'Canary build sẵn sàng. Yêu cầu phê duyệt triển khai Production!'
        );
        get().createApproval(taskId);
        get().openApprovalModal(true);
      } catch (err: unknown) {
        if (signal.aborted || (err instanceof DOMException && err.name === 'AbortError')) {
          return;
        }
        console.error('Real Pipeline Error:', err);
        const msg = err instanceof Error ? err.message : 'Lỗi kết nối AI Server.';
        get().addEvent({
          agentId: 'agent-orchestrator',
          taskId,
          kind: 'fail',
          message: msg,
          severity: 'error',
        });
        set({ isRealRunning: false, streamingStage: null });
      }
    },

    updateTelemetry: (metrics) =>
      set((state) => ({
        ...state,
        ...metrics,
      })),
  };
});
