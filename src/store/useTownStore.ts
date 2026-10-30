import { create } from 'zustand';
import { Agent, AgentRole, AgentStatus, Approval, PipelineEvent, STAGE_ORDER, Task } from '../lib/pipeline/stages';
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

  // Real LLM Pipeline
  apiKey: string;
  isRealRunning: boolean;
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
  runRealPipeline: (userPrompt: string, scenario?: 'feature' | 'bug' | 'security' | 'chaos') => Promise<void>;
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

  selectAgent: (role: AgentRole | null) => void;
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
    speech: 'Lâu đài chỉ huy: Sẵn sàng nhận yêu cầu mới...',
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
    speech: 'Xưởng lập trình: Sẵn sàng nhận ticket...',
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

export const useTownStore = create<TownState>((set, get) => ({
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
  resetCamera: () => set({ cameraPreset: 'default', cameraTarget: [0, 0, 0], cameraZoom: 30, selectedAgentRole: null }),

  selectAgent: (role) => {
    sfx.playPop();
    if (role) {
      set({ selectedAgentRole: role, cameraZoom: 45, isDossierModalOpen: true });
    } else {
      set({ selectedAgentRole: null, cameraZoom: 30, cameraTarget: [0, 0, 0], isDossierModalOpen: false });
    }
  },
  openApprovalModal: (isApprovalModalOpen) => set({ isApprovalModalOpen }),
  openArtifactModal: (isArtifactModalOpen) => set({ isArtifactModalOpen }),
  openDossierModal: (isDossierModalOpen) => set({ isDossierModalOpen }),
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

    set((state) => ({
      approvals: state.approvals.map((a) =>
        a.id === approvalId ? { ...a, status, decidedAt: Date.now() } : a
      ),
      isApprovalModalOpen: false,
    }));

    if (state.isRealRunning && currentApproval) {
      if (status === 'approved') {
        sfx.playSuccessFanfare();
        const prompt = state.tasks.find((t) => t.id === currentApproval.taskId)?.title || 'Tính năng mới';
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
            apiKey: state.apiKey || (typeof window !== 'undefined' ? localStorage.getItem('AGENT_TOWN_GEMINI_KEY') : ''),
          }),
        })
          .then((r) => r.json())
          .then((data) => {
            if (data.content) {
              try {
                const parsed = JSON.parse(data.content);
                state.updateTelemetry({
                  cpuUsage: parseInt(parsed.cpuUsage) || 24,
                  latencyMs: parseInt(parsed.p99Latency) || 14,
                  tps: parsed.tps || 342,
                });
              } catch (e) {}
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
            set({ isRealRunning: false });
          });
      } else {
        sfx.playBugAlert();
        set({ isRealRunning: false });
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

  runChaosSimulation: async () => {
    const state = get();
    if (state.isChaosRunning || state.isRealRunning) return;

    set({ isChaosRunning: true });
    state.setIsSimulating(false);

    // 1. Alert from APM Watchdog
    sfx.playBugAlert();
    state.updateTelemetry({ cpuUsage: 96, latencyMs: 168, tps: 2500 });
    state.setAgentStatus('monitor', 'error', '🚨 BÁO ĐỘNG ĐỎ: Bão request 10x! TPS vọt 2,500, Latency 168ms!');
    state.addEvent({
      agentId: 'agent-monitor',
      taskId: 'chaos-traffic-surge',
      kind: 'fail',
      message: '🚨 [CHAOS ALERT] Phát hiện đột biến tải 10x: TPS 2,500, Latency 168ms (vượt ngưỡng P99 160ms), CPU cụm 96%!',
      severity: 'error',
    });

    await new Promise((r) => setTimeout(r, 1600));

    // 2. DevOps triggers HPA Auto-scaler
    sfx.playTyping();
    state.setAgentStatus('devops', 'working', '⚡ Kích hoạt HPA Auto-scaler: scale từ 3 lên 12 pods (ScaleUp.yaml)...');
    state.addEvent({
      agentId: 'agent-devops',
      taskId: 'chaos-traffic-surge',
      kind: 'start',
      message: 'DevOps tự động kích hoạt HPA: Tạo ScaleUp.yaml, tăng số replicas từ 3 lên 12 worker pods',
      severity: 'warn',
    });

    // 3. Dispatch Courier from DevOps to Monitor
    state.addCourier({
      type: 'forward',
      fromRole: 'devops',
      toRole: 'monitor',
      boxType: 'deploy',
      label: 'ScaleUp.yaml (12 Pods)',
    });

    await new Promise((r) => setTimeout(r, 3000));

    // 4. Stabilize cluster & cool down
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

  runRealPipeline: async (userPrompt: string, scenario: 'feature' | 'bug' | 'security' | 'chaos' = 'feature') => {
    if (scenario === 'chaos') {
      get().runChaosSimulation();
      return;
    }
    const state = get();
    if (state.isRealRunning) return;

    // Pause mock simulation loop & close prompt modal for full 3D view
    state.setIsSimulating(false);
    set({
      isPromptModalOpen: false,
      isRealRunning: true,
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
      payload: {},
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    state.addTask(task);
    state.setActiveTaskId(taskId);

    state.addEvent({
      agentId: 'agent-orchestrator',
      taskId,
      kind: 'start',
      message: `Khởi tạo pipeline cho task: ${userPrompt}`,
      severity: 'ok',
    });

    const pipelineStages: {
      stage: AgentRole;
      workingMsg: string;
      courierTo?: AgentRole;
      boxType?: 'spec' | 'pr' | 'ticket' | 'deploy' | 'bug';
      courierLabel?: string;
    }[] = [
      {
        stage: 'orchestrator',
        workingMsg: 'Đang phân tích yêu cầu & lập MilestonePlan...',
        courierTo: 'pm',
        boxType: 'spec',
        courierLabel: 'MilestonePlan.json',
      },
      {
        stage: 'pm',
        workingMsg: 'Đang soạn thảo tài liệu PRD & tiêu chí Gherkin...',
        courierTo: 'dev',
        boxType: 'spec',
        courierLabel: 'PRD.md',
      },
      {
        stage: 'dev',
        workingMsg: 'Đang lập trình source code TypeScript sạch...',
        courierTo: 'review',
        boxType: 'pr',
        courierLabel: 'source-code.ts',
      },
      {
        stage: 'review',
        workingMsg: 'Đang kiểm tra chất lượng code & review PR...',
        courierTo: 'qa',
        boxType: 'pr',
        courierLabel: 'Approved PR',
      },
      {
        stage: 'qa',
        workingMsg: 'Đang tạo bộ test cases tự động (unit & edge cases)...',
        courierTo: 'security',
        boxType: 'ticket',
        courierLabel: 'test-suite.spec.ts',
      },
      {
        stage: 'security',
        workingMsg: 'Đang quét SAST & kiểm tra bảo mật OWASP...',
        courierTo: 'devops',
        boxType: 'deploy',
        courierLabel: 'SecurityAudit.json',
      },
      {
        stage: 'devops',
        workingMsg: 'Đang đóng gói Dockerfile & cấu hình triển khai...',
      },
    ];

    try {
      for (const step of pipelineStages) {
        const { stage, workingMsg, courierTo, boxType, courierLabel } = step;

        get().updateTask(taskId, { stage });
        get().setAgentStatus(stage, 'working', workingMsg);
        sfx.playTyping();

        // Cập nhật APM Telemetry biến thiên theo tải trọng từng giai đoạn
        if (stage === 'pm') get().updateTelemetry({ cpuUsage: 24, latencyMs: 14, tps: 340 });
        if (stage === 'dev') get().updateTelemetry({ cpuUsage: 48, latencyMs: 16, tps: 290 });
        if (stage === 'review') get().updateTelemetry({ cpuUsage: 36, latencyMs: 15, tps: 310 });
        if (stage === 'qa') get().updateTelemetry({ cpuUsage: 78, latencyMs: 24, tps: 150 });
        if (stage === 'security') get().updateTelemetry({ cpuUsage: 65, latencyMs: 19, tps: 210 });
        if (stage === 'devops') get().updateTelemetry({ cpuUsage: 59, latencyMs: 18, tps: 220 });

        const currentArtifacts = get().realArtifacts;
        const res = await fetch('/api/pipeline', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: userPrompt,
            stage,
            apiKey:
              get().apiKey ||
              (typeof window !== 'undefined'
                ? localStorage.getItem('AGENT_TOWN_GEMINI_KEY')
                : ''),
            context: {
              prd:
                currentArtifacts.pm?.content ||
                currentArtifacts.orchestrator?.content ||
                '',
              sourceCode: currentArtifacts.dev?.content || '',
              reviewComments: currentArtifacts.review?.content || '',
              testReport: currentArtifacts.qa?.content || '',
            },
          }),
        });

        const data = await res.json();

        if (!res.ok || data.error) {
          const errMsg = data.error || 'Lỗi khi gọi AI Agent.';
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
          set({ isRealRunning: false });
          return;
        }

        // Save artifact
        set((s) => ({
          realArtifacts: {
            ...s.realArtifacts,
            [stage]: {
              filename: data.filename,
              language: data.language,
              content: data.content,
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

        // Kịch bản mô phỏng Feedback Loop: QA bắt bug và Shipper chạy ngược về Dev
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
          // Chờ shipper chạy về Dev và Dev fix code
          await new Promise((r) => setTimeout(r, 2800));
          sfx.playTyping();
          get().setAgentStatus('dev', 'working', 'Đang cập nhật lại diff PR và hoàn tất bản vá...');
          await new Promise((r) => setTimeout(r, 1200));
          get().setAgentStatus('dev', 'idle', 'Đã fix xong bug và push bản vá PR!');
          get().setAgentStatus('qa', 'idle', '48/48 test cases PASSED (Coverage 98.4%) ✅');
        }

        // Spawn courier if applicable
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

      // Reached DevOps stage -> Wait for approval
      get().setAgentStatus(
        'devops',
        'waiting',
        'Canary build sẵn sàng. Yêu cầu phê duyệt triển khai Production!'
      );
      get().createApproval(taskId);
      get().openApprovalModal(true);
    } catch (err: any) {
      console.error('Real Pipeline Error:', err);
      get().addEvent({
        agentId: 'agent-orchestrator',
        taskId,
        kind: 'fail',
        message: err.message || 'Lỗi kết nối AI Server.',
        severity: 'error',
      });
      set({ isRealRunning: false });
    }
  },

  updateTelemetry: (metrics) => set((state) => ({ ...state, ...metrics })),
}));
