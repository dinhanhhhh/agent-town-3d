import { IEventSource } from './EventSource';
import { useTownStore } from '../../store/useTownStore';
import { AgentRole, PIPELINE_PROBABILITIES, STAGE_ORDER, Task } from '../pipeline/stages';

const FEATURE_TASKS = [
  {
    title: 'Xác thực đăng nhập Google OAuth 2.0 & JWT',
    refNo: 'TICK-142',
    prNo: 'PR-87',
    qaTests: 48,
  },
  {
    title: 'Tối ưu hóa Database query với Redis Caching',
    refNo: 'TICK-143',
    prNo: 'PR-88',
    qaTests: 36,
  },
  {
    title: 'Bổ sung thanh toán Stripe Webhook & bảo mật HMAC',
    refNo: 'TICK-144',
    prNo: 'PR-89',
    qaTests: 52,
  },
  {
    title: 'Xuất báo cáo PDF giao dịch doanh nghiệp',
    refNo: 'TICK-145',
    prNo: 'PR-90',
    qaTests: 28,
  },
];

export class MockSimulator implements IEventSource {
  private timer: NodeJS.Timeout | null = null;
  private currentStageIndex = 0;
  private currentTaskIndex = 0;
  private isWaitingApproval = false;
  private pendingTaskId: string | null = null;
  private pendingApprovalId: string | null = null;
  private retryCount = 0;

  start() {
    if (this.timer) return;
    useTownStore.getState().setIsSimulating(true);

    // Initial kick-off if no active tasks
    const { tasks } = useTownStore.getState();
    if (tasks.length === 0) {
      this.initiateNewTask();
    }

    this.timer = setInterval(() => {
      this.tick();
    }, 100);
  }

  pause() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    useTownStore.getState().setIsSimulating(false);
  }

  reset() {
    this.pause();
    this.currentStageIndex = 0;
    this.isWaitingApproval = false;
    this.pendingTaskId = null;
    this.pendingApprovalId = null;
    this.retryCount = 0;
    this.start();
  }

  step() {
    this.advanceStage();
  }

  dispatchTask(title: string) {
    const store = useTownStore.getState();
    const newTask: Task = {
      id: `task-${Date.now()}`,
      type: 'ticket',
      title,
      refNo: `CUSTOM-${Math.floor(Math.random() * 900 + 100)}`,
      stage: 'orchestrator',
      state: 'in_progress',
      payload: {},
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    store.addTask(newTask);
    this.currentStageIndex = 0;
    this.isWaitingApproval = false;
    this.retryCount = 0;

    store.setAgentStatus(
      'orchestrator',
      'working',
      `Tiếp nhận task mới: "${title}". Bắt đầu phân rã milestone...`
    );
    store.addEvent({
      agentId: 'agent-orchestrator',
      taskId: newTask.id,
      kind: 'start',
      message: `Prompt mới: ${title}`,
      severity: 'ok',
    });
  }

  resolveApproval(approvalId: string, status: 'approved' | 'rejected') {
    const store = useTownStore.getState();
    store.resolveApproval(approvalId, status);
    this.isWaitingApproval = false;

    if (status === 'approved') {
      store.setAgentStatus(
        'devops',
        'working',
        'Tech Lead đã duyệt! Đang thực hiện Canary release lên Production...'
      );
      store.addEvent({
        agentId: 'agent-devops',
        taskId: this.pendingTaskId || 'task',
        kind: 'pass',
        message: 'Tech Lead đã bấm duyệt release Production. Deploy thành công!',
        severity: 'ok',
      });

      // Spawn courier to Monitoring
      store.addCourier({
        type: 'forward',
        fromRole: 'devops',
        toRole: 'monitor',
        boxType: 'deploy',
        label: 'Production Release v1.4',
      });

      this.currentStageIndex = 7; // Move to monitor
    } else {
      // Rejected: return to Dev
      store.setAgentStatus(
        'devops',
        'error',
        'Bản release bị từ chối. Trả về Dev để điều chỉnh!'
      );
      store.setAgentStatus('dev', 'debugging', 'Bị từ chối tại cổng duyệt: đang review lại code...');
      store.addEvent({
        agentId: 'agent-devops',
        taskId: this.pendingTaskId || 'task',
        kind: 'fail',
        message: 'Release bị từ chối tại cổng duyệt. Trả ngược về Dev.',
        severity: 'warn',
      });

      // Spawn feedback courier
      store.addCourier({
        type: 'feedback',
        fromRole: 'devops',
        toRole: 'dev',
        boxType: 'bug',
        label: 'Release Rejected: Refactor',
      });

      this.currentStageIndex = 2; // Return to dev
    }
  }

  private tick() {
    const store = useTownStore.getState();
    if (!store.isSimulating) return;

    // 1. Advance couriers progress
    const couriers = [...store.couriers];
    const speed = 0.04 * store.simSpeed;

    for (const courier of couriers) {
      const nextProgress = courier.progress + speed;
      if (nextProgress >= 1) {
        store.removeCourier(courier.id);
        this.onCourierArrived(courier.fromRole, courier.toRole, courier.boxType);
      } else {
        store.updateCourierProgress(courier.id, nextProgress);
      }
    }

    // 2. Telemetry jitter for realistic APM
    if (Math.random() < 0.2) {
      store.updateTelemetry({
        latencyMs: Math.floor(12 + Math.random() * 6),
        tps: Math.floor(320 + Math.random() * 45),
        cpuUsage: Math.floor(22 + Math.random() * 12),
      });
    }
  }

  private onCourierArrived(from: AgentRole, to: AgentRole, boxType: string) {
    const store = useTownStore.getState();

    // Reset sender agent to idle/ready
    if (store.agents[from].status === 'walking') {
      store.setAgentStatus(from, 'idle');
    }

    // Activate receiver agent
    if (to === 'dev' && boxType === 'bug') {
      store.setAgentStatus(to, 'debugging', 'Đang nhận bug report: sửa lỗi và tạo bản vá mới...');
      setTimeout(() => {
        if (!useTownStore.getState().isSimulating) return;
        this.advanceStage();
      }, 2500 / store.simSpeed);
    } else {
      store.setAgentStatus(to, 'working');
      setTimeout(() => {
        if (!useTownStore.getState().isSimulating) return;
        this.advanceStage();
      }, 2000 / store.simSpeed);
    }
  }

  private initiateNewTask() {
    const taskSpec = FEATURE_TASKS[this.currentTaskIndex % FEATURE_TASKS.length];
    this.currentTaskIndex++;

    const newTask: Task = {
      id: `task-${Date.now()}`,
      type: 'ticket',
      title: taskSpec.title,
      refNo: taskSpec.refNo,
      stage: 'orchestrator',
      state: 'in_progress',
      payload: { ...taskSpec },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const store = useTownStore.getState();
    store.addTask(newTask);
    this.currentStageIndex = 0;
    this.retryCount = 0;

    store.setAgentStatus(
      'orchestrator',
      'working',
      `Orchestrator: Bắt đầu điều phối "${taskSpec.title}" (${taskSpec.refNo})`
    );
    store.addEvent({
      agentId: 'agent-orchestrator',
      taskId: newTask.id,
      kind: 'start',
      message: `Khởi tạo pipeline cho task: ${taskSpec.title}`,
      severity: 'ok',
    });

    setTimeout(() => {
      if (!useTownStore.getState().isSimulating) return;
      this.advanceStage();
    }, 1800 / store.simSpeed);
  }

  private advanceStage() {
    if (this.isWaitingApproval) return;
    const store = useTownStore.getState();
    const currentRole = STAGE_ORDER[this.currentStageIndex];

    switch (currentRole) {
      case 'orchestrator': {
        store.setAgentStatus('orchestrator', 'idle', 'Đã phân rã specs: gửi sang trạm PM · BA');
        store.setAgentStatus('pm', 'working', 'Đang đặc tả PRD & Acceptance Criteria...');
        store.addCourier({
          type: 'forward',
          fromRole: 'orchestrator',
          toRole: 'pm',
          boxType: 'spec',
          label: 'MilestonePlan.json',
        });
        this.currentStageIndex = 1;
        break;
      }

      case 'pm': {
        store.setAgentStatus('pm', 'idle', 'Đã chốt specs PRD & 3 User Stories!');
        store.setAgentStatus('dev', 'working', 'Đang code implement business logic & tests...');
        store.addCourier({
          type: 'forward',
          fromRole: 'pm',
          toRole: 'dev',
          boxType: 'ticket',
          label: 'PRD.md + Stories',
        });
        store.addEvent({
          agentId: 'agent-pm',
          taskId: store.activeTaskId || '',
          kind: 'handoff',
          message: 'PM đã hoàn thành PRD.md và chuyển giao sang Dev.',
          severity: 'ok',
        });
        this.currentStageIndex = 2;
        break;
      }

      case 'dev': {
        store.setAgentStatus('dev', 'idle', 'Đã commit và tạo Pull Request #87 sẵn sàng review');
        store.setAgentStatus('review', 'working', 'Đang kiểm tra diff PR #87 & clean code...');
        store.addCourier({
          type: 'forward',
          fromRole: 'dev',
          toRole: 'review',
          boxType: 'pr',
          label: 'PR #87: Clean Code Diff',
        });
        store.addEvent({
          agentId: 'agent-dev',
          taskId: store.activeTaskId || '',
          kind: 'handoff',
          message: 'Dev đã tạo PR #87 và gửi tới Tech Reviewer.',
          severity: 'ok',
        });
        this.currentStageIndex = 3;
        break;
      }

      case 'review': {
        const shouldReject = Math.random() < PIPELINE_PROBABILITIES.reviewRejectChance && this.retryCount === 0;

        if (shouldReject) {
          this.retryCount++;
          store.setAgentStatus('review', 'error', 'PR cần sửa 2 điểm: thiếu boundary check & try/catch');
          store.addCourier({
            type: 'feedback',
            fromRole: 'review',
            toRole: 'dev',
            boxType: 'bug',
            label: 'Review Request Changes',
          });
          store.addEvent({
            agentId: 'agent-review',
            taskId: store.activeTaskId || '',
            kind: 'fail',
            message: 'Tech Review từ chối PR: Yêu cầu bổ sung exception handling.',
            severity: 'warn',
          });
          this.currentStageIndex = 2; // return to dev
        } else {
          store.setAgentStatus('review', 'idle', 'PR #87 LGTM! Đã approve và merge vào main');
          store.setAgentStatus('qa', 'working', 'Đang chạy tự động 48 test suites...');
          store.addCourier({
            type: 'forward',
            fromRole: 'review',
            toRole: 'qa',
            boxType: 'pr',
            label: 'Merged Branch: Main',
          });
          store.addEvent({
            agentId: 'agent-review',
            taskId: store.activeTaskId || '',
            kind: 'pass',
            message: 'PR #87 được chấp thuận. Merge vào nhánh main.',
            severity: 'ok',
          });
          this.currentStageIndex = 4;
        }
        break;
      }

      case 'qa': {
        const shouldFail = Math.random() < PIPELINE_PROBABILITIES.qaFailChance && this.retryCount === 0;

        if (shouldFail) {
          this.retryCount++;
          store.setAgentStatus('qa', 'error', 'Test fail: 2/48 case (lỗi token expiration) 🐛');
          store.addCourier({
            type: 'feedback',
            fromRole: 'qa',
            toRole: 'dev',
            boxType: 'bug',
            label: 'BugReport.json (2 Fails)',
          });
          store.addEvent({
            agentId: 'agent-qa',
            taskId: store.activeTaskId || '',
            kind: 'fail',
            message: 'Kiểm thử thất bại: 2/48 test cases failed. Kích hoạt Feedback Loop về Dev!',
            severity: 'error',
          });
          this.currentStageIndex = 2; // return to dev
        } else {
          store.setAgentStatus('qa', 'idle', '48/48 test cases PASSED (Coverage 98.4%) ✅');
          store.setAgentStatus('security', 'working', 'Đang quét SAST & kiểm tra CVE dependencies...');
          store.addCourier({
            type: 'forward',
            fromRole: 'qa',
            toRole: 'security',
            boxType: 'pr',
            label: 'Passed TestReport.json',
          });
          store.addEvent({
            agentId: 'agent-qa',
            taskId: store.activeTaskId || '',
            kind: 'pass',
            message: 'Tất cả 48 test cases vượt qua thành công với coverage 98.4%.',
            severity: 'ok',
          });
          this.currentStageIndex = 5;
        }
        break;
      }

      case 'security': {
        const hasWarning = Math.random() < PIPELINE_PROBABILITIES.securityAlertChance;

        if (hasWarning) {
          store.setAgentStatus('security', 'idle', 'Cảnh báo: 1 CVE trung bình (lodash) - Đã auto-patch 🛡️');
          store.addEvent({
            agentId: 'agent-security',
            taskId: store.activeTaskId || '',
            kind: 'alert',
            message: 'Phát hiện CVE-2024-lodash trung bình. Áp dụng bản vá tự động.',
            severity: 'warn',
          });
        } else {
          store.setAgentStatus('security', 'idle', '0 lỗ hổng nghiêm trọng · Security Audit Passed 🛡️');
          store.addEvent({
            agentId: 'agent-security',
            taskId: store.activeTaskId || '',
            kind: 'pass',
            message: 'SAST Audit hoàn tất không phát hiện rủi ro bảo mật.',
            severity: 'ok',
          });
        }

        store.setAgentStatus('devops', 'working', 'Đang build multi-stage Docker container...');
        store.addCourier({
          type: 'forward',
          fromRole: 'security',
          toRole: 'devops',
          boxType: 'pr',
          label: 'SecurityAudit_Passed.json',
        });
        this.currentStageIndex = 6;
        break;
      }

      case 'devops': {
        // PRODUCTION APPROVAL GATE
        this.isWaitingApproval = true;
        this.pendingTaskId = store.activeTaskId || 'task-release';
        store.setAgentStatus(
          'devops',
          'waiting',
          'Dừng tại cổng duyệt: Chờ Tech Lead duyệt release Production ⏳'
        );
        store.createApproval(this.pendingTaskId);
        store.addEvent({
          agentId: 'agent-devops',
          taskId: this.pendingTaskId,
          kind: 'approve_needed',
          message: 'Canary build sẵn sàng. Yêu cầu phê duyệt triển khai Production!',
          severity: 'warn',
        });
        break;
      }

      case 'monitor': {
        store.setAgentStatus(
          'monitor',
          'working',
          'CPU 24% · Latency 14ms · Telemetry Production ổn định 100% 📡'
        );
        store.setAgentStatus('orchestrator', 'idle', 'Sprint hoàn tất! Sẵn sàng nhận yêu cầu mới.');
        store.addEvent({
          agentId: 'agent-monitor',
          taskId: store.activeTaskId || '',
          kind: 'pass',
          message: 'Bản phát hành hoạt động ổn định trên cụm Production. Metrics bình thường.',
          severity: 'ok',
        });

        // Loop to next feature after delay
        setTimeout(() => {
          if (!useTownStore.getState().isSimulating) return;
          this.initiateNewTask();
        }, 5000 / store.simSpeed);
        break;
      }
    }
  }
}

export const simulator = new MockSimulator();
