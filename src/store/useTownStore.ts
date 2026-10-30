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

let activePipelineAbortController: AbortController | null = null;

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
  isRealRunning: boolean;
  streamingStage: AgentRole | null;
  streamingFilename: string;
  streamingContent: string;
  realArtifacts: Record<AgentRole, { filename: string; language: string; content: string } | null>;

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
  setShowLabels: (show: boolean) => void;
  toggleLabels: () => void;
  setShowBubbles: (show: boolean) => void;
  toggleBubbles: () => void;
  setIsSimulating: (sim: boolean) => void;
  toggleSimulating: () => void;
  setSimSpeed: (speed: number) => void;
  cycleSimSpeed: () => void;

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
  addCourier: (courier: Omit<Courier, 'id' | 'progress'>) => void;
  updateCourierProgress: (id: string, progress: number) => void;
  removeCourier: (id: string) => void;

  createApproval: (taskId: string) => void;
  resolveApproval: (approvalId: string, status: 'approved' | 'rejected') => void;

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
    set({
      streamingStage: stage,
      streamingFilename: defaultFilename,
      streamingContent: '',
    });

    const activeKey =
      get().apiKey ||
      (typeof window !== 'undefined' ? localStorage.getItem('AGENT_TOWN_GEMINI_KEY') || '' : '');

    const res = await fetch('/api/pipeline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        stage,
        apiKey: activeKey,
        stream: true,
        context,
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

    apiKey: typeof window !== 'undefined' ? localStorage.getItem('AGENT_TOWN_GEMINI_KEY') || '' : '',
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
      set((state) => ({
        couriers: [
          ...state.couriers,
          {
            id: `courier-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            progress: 0,
            ...courierData,
          },
        ],
      }));
    },

    updateCourierProgress: (id, progress) =>
      set((state) => ({
        couriers: state.couriers.map((c) => (c.id === id ? { ...c, progress } : c)),
      })),

    removeCourier: (id) =>
      set((state) => ({
        couriers: state.couriers.filter((c) => c.id !== id),
      })),

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

    resolveApproval: (approvalId, status) => {
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
          state.addCourier({
            type: 'forward',
            fromRole: 'devops',
            toRole: 'monitor',
            boxType: 'deploy',
            label: 'Production Release',
          });

          fetch('/api/pipeline', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt,
              stage: 'monitor',
              apiKey:
                state.apiKey ||
                (typeof window !== 'undefined' ? localStorage.getItem('AGENT_TOWN_GEMINI_KEY') : ''),
            }),
          })
            .then((r) => r.json())
            .then((data) => {
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
              }
            })
            .catch((err) => {
              console.error('Monitor stage error:', err);
            })
            .finally(() => {
              set({ isRealRunning: false, streamingStage: null });
            });
        } else {
          sfx.playBugAlert();
          set({ isRealRunning: false, streamingStage: null });
          state.updateTask(currentApproval.taskId, { state: 'failed', stage: 'dev' });
          state.setAgentStatus('devops', 'error', 'Release bị từ chối.');
          state.setAgentStatus('dev', 'debugging', 'Bị từ chối tại cổng duyệt: đang review lại code...');
          state.addCourier({
            type: 'feedback',
            fromRole: 'devops',
            toRole: 'dev',
            boxType: 'bug',
            label: 'Release Rejected',
          });
        }
      }
    },

    setApiKey: (apiKey: string) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('AGENT_TOWN_GEMINI_KEY', apiKey);
      }
      set({ apiKey });
    },

    openApiKeyModal: (isApiKeyModalOpen: boolean) => set({ isApiKeyModalOpen }),
    openPromptModal: (isPromptModalOpen: boolean) => set({ isPromptModalOpen }),

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

        get().addCourier({
          type: 'forward',
          fromRole: 'dev',
          toRole: 'review',
          boxType: 'pr',
          label: `PR-${pr.number}.diff`,
        });

        await abortableSleep(900, signal);

        const auditStages: {
          stage: AgentRole;
          defaultFilename: string;
          workingMsg: string;
          courierTo?: AgentRole;
          boxType?: 'spec' | 'pr' | 'ticket' | 'deploy' | 'bug';
          courierLabel?: string;
        }[] = [
          {
            stage: 'review',
            defaultFilename: 'ReviewComments.json',
            workingMsg: `Đang review diff thực tế của PR #${pr.number}...`,
            courierTo: 'qa',
            boxType: 'pr',
            courierLabel: 'Reviewed PR Diff',
          },
          {
            stage: 'qa',
            defaultFilename: 'test-suite.spec.ts',
            workingMsg: `Đang sinh bộ Regression & Unit Tests cho PR #${pr.number}...`,
            courierTo: 'security',
            boxType: 'ticket',
            courierLabel: 'test-suite.spec.ts',
          },
          {
            stage: 'security',
            defaultFilename: 'SecurityAudit.json',
            workingMsg: `Đang quét SAST & OWASP Top 10 trên diff PR #${pr.number}...`,
            courierTo: 'devops',
            boxType: 'deploy',
            courierLabel: 'SecurityAudit.json',
          },
          {
            stage: 'devops',
            defaultFilename: 'Dockerfile',
            workingMsg: `Đang chuẩn bị cấu hình Canary Release cho PR #${pr.number}...`,
          },
        ];

        for (const step of auditStages) {
          if (signal.aborted) return;

          get().updateTask(taskId, { stage: step.stage });
          get().setAgentStatus(step.stage, 'working', step.workingMsg);
          sfx.playTyping();

          if (step.stage === 'review') get().updateTelemetry({ cpuUsage: 42, latencyMs: 16, tps: 310 });
          if (step.stage === 'qa') get().updateTelemetry({ cpuUsage: 76, latencyMs: 23, tps: 165 });
          if (step.stage === 'security') get().updateTelemetry({ cpuUsage: 64, latencyMs: 19, tps: 215 });
          if (step.stage === 'devops') get().updateTelemetry({ cpuUsage: 54, latencyMs: 17, tps: 240 });

          const currentArtifacts = get().realArtifacts;
          const result = await streamStageFromApi({
            prompt: prTitle,
            stage: step.stage,
            defaultFilename: step.defaultFilename,
            context: {
              prd: prContextMd,
              sourceCode: diff,
              reviewComments: currentArtifacts.review?.content || '',
              testReport: currentArtifacts.qa?.content || '',
              scenario: 'github',
            },
            signal,
          });

          if (signal.aborted) return;

          if (result.error) {
            get().setAgentStatus(step.stage, 'error', result.error);
            get().addEvent({
              agentId: `agent-${step.stage}`,
              taskId,
              kind: 'fail',
              message: `Tạm dừng Audit tại ${step.stage}: ${result.error} (Diff PR #${pr.number} vẫn đã lưu tại trạm Dev!)`,
              severity: 'error',
            });
            if (
              result.error.toLowerCase().includes('api key') ||
              result.error.toLowerCase().includes('gemini_api_key')
            ) {
              get().openApiKeyModal(true);
            }
            set({ isRealRunning: false, streamingStage: null });
            return;
          }

          set((s) => ({
            realArtifacts: {
              ...s.realArtifacts,
              [step.stage]: {
                filename: result.filename || step.defaultFilename,
                language: result.language || 'text',
                content: result.content || '',
              },
            },
          }));

          get().setAgentStatus(step.stage, 'idle', result.speech || 'Hoàn thành kiểm toán.');
          get().addEvent({
            agentId: `agent-${step.stage}`,
            taskId,
            kind: 'pass',
            message: result.speech || `Hoàn thành ${step.defaultFilename}`,
            severity: 'ok',
          });

          if (step.courierTo && step.boxType && step.courierLabel) {
            get().addCourier({
              type: 'forward',
              fromRole: step.stage,
              toRole: step.courierTo,
              boxType: step.boxType,
              label: step.courierLabel,
            });
          }
        }

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

      const pipelineStages: {
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
          courierTo: 'qa',
          boxType: 'pr',
          courierLabel: 'Approved PR',
        },
        {
          stage: 'qa',
          defaultFilename: 'test-suite.spec.ts',
          workingMsg: 'Đang tạo bộ test cases tự động (unit & edge cases)...',
          courierTo: 'security',
          boxType: 'ticket',
          courierLabel: 'test-suite.spec.ts',
        },
        {
          stage: 'security',
          defaultFilename: 'SecurityAudit.json',
          workingMsg: 'Đang quét SAST & kiểm tra bảo mật OWASP Top 10...',
          courierTo: 'devops',
          boxType: 'deploy',
          courierLabel: 'SecurityAudit.json',
        },
        {
          stage: 'devops',
          defaultFilename: 'Dockerfile',
          workingMsg: 'Đang đóng gói Dockerfile & cấu hình Canary rollout...',
        },
      ];

      try {
        for (const step of pipelineStages) {
          if (signal.aborted) return;
          const { stage, defaultFilename, workingMsg, courierTo, boxType, courierLabel } = step;

          get().updateTask(taskId, { stage });
          get().setAgentStatus(stage, 'working', workingMsg);
          sfx.playTyping();

          if (stage === 'pm') get().updateTelemetry({ cpuUsage: 24, latencyMs: 14, tps: 340 });
          if (stage === 'dev') get().updateTelemetry({ cpuUsage: 48, latencyMs: 16, tps: 290 });
          if (stage === 'review') get().updateTelemetry({ cpuUsage: 36, latencyMs: 15, tps: 310 });
          if (stage === 'qa') get().updateTelemetry({ cpuUsage: 78, latencyMs: 24, tps: 150 });
          if (stage === 'security') get().updateTelemetry({ cpuUsage: 65, latencyMs: 19, tps: 210 });
          if (stage === 'devops') get().updateTelemetry({ cpuUsage: 59, latencyMs: 18, tps: 220 });

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

          // Kịch bản Feedback Loop 1: QA bắt bug -> Shipper chạy ngược về Dev vá lỗi
          if (scenario === 'bug' && stage === 'qa') {
            sfx.playBugAlert();
            get().setAgentStatus('qa', 'error', 'Test fail: 2/48 case (lỗi hết hạn token refresh) 🐛');
            get().addEvent({
              agentId: 'agent-qa',
              taskId,
              kind: 'fail',
              message: 'QA phát hiện 2 test cases thất bại: Token refresh chưa bắt exception!',
              severity: 'error',
            });
            get().addCourier({
              type: 'feedback',
              fromRole: 'qa',
              toRole: 'dev',
              boxType: 'bug',
              label: 'Bug: Token Refresh',
            });
            get().setAgentStatus('dev', 'debugging', 'Nhận Bug report từ QA: Đang viết bản vá lỗi token refresh...');
            await abortableSleep(2600, signal);
            sfx.playTyping();
            get().setAgentStatus('dev', 'working', 'Đang cập nhật lại diff PR và hoàn tất bản vá...');
            get().addCourier({
              type: 'forward',
              fromRole: 'dev',
              toRole: 'qa',
              boxType: 'pr',
              label: 'Hotfix PR Diff',
            });
            await abortableSleep(1300, signal);
            get().setAgentStatus('dev', 'idle', 'Đã fix xong bug và push bản vá PR!');
            get().setAgentStatus('qa', 'idle', '48/48 test cases PASSED (Coverage 98.4%) ✅');
            get().addEvent({
              agentId: 'agent-qa',
              taskId,
              kind: 'pass',
              message: 'Re-test thành công sau bản vá của Dev: 100% test cases PASSED.',
              severity: 'ok',
            });
          }

          // Kịch bản Feedback Loop 2: AppSec Audit phát hiện rủi ro SAST/CVE -> Dev vá bảo mật OWASP
          if (scenario === 'security' && stage === 'security') {
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
            get().addCourier({
              type: 'feedback',
              fromRole: 'security',
              toRole: 'dev',
              boxType: 'bug',
              label: 'SAST CVE Report',
            });
            get().setAgentStatus(
              'dev',
              'debugging',
              'Nhận cảnh báo từ DevSecOps: Đang bổ sung sanitize input & nâng cấp package...'
            );
            await abortableSleep(2500, signal);
            sfx.playTyping();
            get().setAgentStatus('dev', 'working', 'Đang đóng gói bản vá bảo mật chuẩn OWASP Top 10...');
            get().addCourier({
              type: 'forward',
              fromRole: 'dev',
              toRole: 'security',
              boxType: 'pr',
              label: 'OWASP Security Patch',
            });
            await abortableSleep(1300, signal);
            get().setAgentStatus('dev', 'idle', 'Đã hoàn tất bản vá bảo mật OWASP!');
            get().setAgentStatus('security', 'idle', 'Quét lại SAST: 0 High CVEs · OWASP Top 10 Compliant 🛡️');
            get().addEvent({
              agentId: 'agent-security',
              taskId,
              kind: 'pass',
              message: 'DevSecOps xác nhận bản vá hợp lệ: 0 High/Critical CVEs.',
              severity: 'ok',
            });
          }

          if (courierTo && boxType && courierLabel) {
            get().addCourier({
              type: 'forward',
              fromRole: stage,
              toRole: courierTo,
              boxType,
              label: courierLabel,
            });
          }
        }

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
