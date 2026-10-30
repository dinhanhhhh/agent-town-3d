import { NextRequest, NextResponse } from 'next/server';
import { callGemini, streamGemini } from '../../../lib/ai/gemini';
import { callDeepSeek, streamDeepSeek } from '../../../lib/ai/deepseek';
import { AgentRole } from '../../../lib/pipeline/stages';

interface PipelineContext {
  prd?: string;
  sourceCode?: string;
  reviewComments?: string;
  testReport?: string;
  scenario?: 'feature' | 'bug' | 'security' | 'chaos' | 'github';
}

interface RequestBody {
  prompt: string;
  stage: AgentRole;
  apiKey?: string;
  stream?: boolean;
  context?: PipelineContext;
}

/**
 * Chuẩn hóa mã nguồn Dev sinh ra thành Unified Git Diff hợp lệ
 * để GitDiffViewer luôn hiển thị mượt ở cả chế độ Unified và Split 2 cột.
 */
function ensureUnifiedDiff(raw: string): string {
  const stripped = raw
    .replace(/^```(?:diff|typescript|ts|javascript|js)?\s*\n?/i, '')
    .replace(/\n?```\s*$/i, '')
    .trim();

  if (
    stripped.includes('diff --git ') ||
    (stripped.includes('--- ') && stripped.includes('+++ ') && stripped.includes('@@ '))
  ) {
    return stripped;
  }

  const lines = stripped.split('\n');
  const diffLines = lines.map((line) => (line.startsWith('+') || line.startsWith('-') ? line : `+${line}`));
  return [
    'diff --git a/src/feature.service.ts b/src/feature.service.ts',
    'index 0000000..4b825dc 100644',
    '--- a/src/feature.service.ts',
    '+++ b/src/feature.service.ts',
    `@@ -0,0 +1,${lines.length} @@`,
    ...diffLines,
  ].join('\n');
}

function finalizeStageOutput(
  stage: AgentRole,
  config: { filename: string; language: string },
  rawResult: string
): { content: string; speech: string } {
  let speech = 'Hoàn thành khâu xử lý.';
  let content = rawResult;

  if (config.language === 'json') {
    try {
      const cleaned = rawResult
        .replace(/^```json\s*/im, '')
        .replace(/^```\s*/im, '')
        .replace(/```\s*$/im, '')
        .trim();
      const parsed = JSON.parse(cleaned);
      if (parsed.speech) speech = parsed.speech;
      content = JSON.stringify(parsed, null, 2);
    } catch {
      content = rawResult;
    }
  } else if (rawResult.includes('---SPEECH---:')) {
    const parts = rawResult.split('---SPEECH---:');
    content = parts[0].trim();
    speech = parts[1].trim() || speech;
  }

  if (stage === 'dev' && config.language === 'diff') {
    content = ensureUnifiedDiff(content);
  }

  return { content, speech };
}

const STAGE_CONFIGS: Record<
  AgentRole,
  {
    systemPrompt: string;
    filename: string;
    language: string;
    formatUserPrompt: (userPrompt: string, ctx?: PipelineContext) => string;
  }
> = {
  orchestrator: {
    filename: 'MilestonePlan.json',
    language: 'json',
    systemPrompt: `Bạn là Orchestrator chính của hệ thống DevOps tự trị (Claude Code Command Center). 
Nhiệm vụ: Nhận yêu cầu tính năng từ người dùng, phân tích phạm vi bài toán, phân rã thành Milestone và danh sách User Stories có thể thực thi tuần tự.
Định dạng đầu ra: Hãy trả về JSON hợp lệ (không kèm giải thích bên ngoài):
{
  "milestone": "Tên Sprint / Milestone",
  "goal": "Mục tiêu tổng quát",
  "userStories": [
    { "id": "US-1", "title": "Tiêu đề story", "assignedTo": "Dev", "priority": "HIGH" }
  ],
  "speech": "1 câu tóm tắt ngắn (dưới 15 từ) để agent nói lên bong bóng 3D"
}`,
    formatUserPrompt: (prompt) => `Phân tích yêu cầu tính năng sau thành MilestonePlan: "${prompt}"`,
  },

  pm: {
    filename: 'PRD.md',
    language: 'markdown',
    systemPrompt: `Bạn là Senior Product Manager & Business Analyst.
Nhiệm vụ: Chuyển hóa yêu cầu và Milestone thành tài liệu đặc tả sản phẩm (PRD) chi tiết, chặt chẽ gồm:
1. Mục tiêu sản phẩm (Objectives)
2. User Flows & Functional Requirements
3. Tiêu chí nghiệm thu chuẩn Gherkin format (Given - When - Then) bao quát cả Happy Path và Edge Cases.
Định dạng: Trả về tài liệu Markdown chuẩn. Cuối tài liệu, hãy thêm dòng đặc biệt:
---SPEECH---: [1 câu ngắn dưới 15 từ thông báo đã hoàn thành PRD]`,
    formatUserPrompt: (prompt, ctx) =>
      `Viết tài liệu PRD cho tính năng sau:\n"${prompt}"\n\nKế hoạch phân rã:\n${ctx?.prd || ''}`,
  },

  dev: {
    filename: 'source-code.diff',
    language: 'diff',
    systemPrompt: `Bạn là Senior Full-Stack Engineer.
Nhiệm vụ: Dựa trên tài liệu PRD, viết mã nguồn TypeScript sạch (Clean Architecture, validation, try/catch error handling, boundary checks, không hardcode secrets) dưới định dạng Git Unified Diff Patch chuẩn (bắt đầu bằng diff --git a/src/... b/src/..., có ---, +++, @@ -...,... +...,... @@ và tiền tố + cho các dòng thêm mới, - cho các dòng cũ được refactor).
Định dạng: Trả về bản Git Unified Diff hoàn chỉnh (không bọc ngoài markdown). Cuối phản hồi thêm dòng:
---SPEECH---: [1 câu ngắn dưới 15 từ thông báo đã lập trình xong và tạo Pull Request diff]`,
    formatUserPrompt: (prompt, ctx) =>
      `Dựa trên PRD sau đây, hãy tạo bản Git Unified Diff (.diff) triển khai mã nguồn TypeScript hoàn chỉnh:\n\n${ctx?.prd || prompt}`,
  },

  review: {
    filename: 'ReviewComments.json',
    language: 'json',
    systemPrompt: `Bạn là Principal Code Reviewer / Tech Lead.
Nhiệm vụ: Rà soát tỉ mỉ bản diff Pull Request. Đánh giá Clean Code, code smells, memory leak, boundary check, hoặc xử lý lỗi try/catch.
Định dạng đầu ra: Trả về JSON hợp lệ:
{
  "pullRequest": 87,
  "verdict": "APPROVED" | "REQUEST_CHANGES",
  "score": 9.5,
  "summary": "Tóm tắt đánh giá chất lượng",
  "comments": [
    { "file": "src/feature.ts", "line": 15, "note": "Nhận xét chi tiết" }
  ],
  "speech": "1 câu ngắn dưới 15 từ (VD: 'PR #87 LGTM! Đã approve (9.5/10)' hoặc 'PR cần bổ sung try/catch')"
}`,
    formatUserPrompt: (prompt, ctx) =>
      `Hãy review bản Pull Request Diff sau đây cho tác vụ "${prompt}":\n\n\`\`\`diff\n${ctx?.sourceCode || '// No diff provided'}\n\`\`\``,
  },

  qa: {
    filename: 'test-suite.spec.ts',
    language: 'typescript',
    systemPrompt: `Bạn là Lead QA Automation Engineer.
Nhiệm vụ: Đọc bản diff mã nguồn và viết một bộ Unit Test tự động hoàn chỉnh (Jest / Vitest) bao phủ:
1. Happy path (trường hợp chạy đúng)
2. Negative path (trường hợp đầu vào sai)
3. Boundary & edge cases (rỗng, null, timeout, expired token).
Định dạng: Trả về code file test hoàn chỉnh. Cuối phản hồi thêm dòng:
---SPEECH---: [1 câu ngắn dưới 15 từ thông báo tổng số test cases PASSED (Coverage %)]`,
    formatUserPrompt: (prompt, ctx) =>
      `Hãy viết trọn bộ Unit Test tự động cho thay đổi mã nguồn (${prompt}) sau:\n\n\`\`\`diff\n${ctx?.sourceCode || '// No code'}\n\`\`\``,
  },

  security: {
    filename: 'SecurityAudit.json',
    language: 'json',
    systemPrompt: `Bạn là Cybersecurity & DevSecOps Specialist.
Nhiệm vụ: Quét bảo mật tĩnh (SAST), kiểm tra OWASP Top 10, rà soát rò rỉ API secrets, injection rủi ro trong bản diff mã nguồn.
Định dạng đầu ra: Trả về JSON hợp lệ:
{
  "status": "PASSED" | "WARNING" | "CRITICAL",
  "cveCount": 0,
  "vulnerabilities": [],
  "compliance": ["OWASP Top 10", "Zero Secret Leak"],
  "speech": "1 câu ngắn dưới 15 từ thông báo kết quả audit bảo mật"
}`,
    formatUserPrompt: (prompt, ctx) => {
      const extraNote =
        ctx?.scenario === 'security'
          ? '\nLưu ý: Đây là kịch bản AppSec Audit chuyên sâu, hãy kiểm tra thật gắt gao các nguy cơ OWASP Top 10, input sanitization, token lifecycle và ghi nhận khuyến nghị bảo mật chi tiết.'
          : '';
      return `Quét lỗ hổng bảo mật SAST & OWASP cho bản diff sau (${prompt}):${extraNote}\n\n\`\`\`diff\n${ctx?.sourceCode || '// No code'}\n\`\`\``;
    },
  },

  devops: {
    filename: 'Dockerfile',
    language: 'dockerfile',
    systemPrompt: `Bạn là Senior Release DevOps & SRE.
Nhiệm vụ: Viết file Dockerfile chuẩn production (tối ưu multi-stage build, alpine, non-root user) và cấu hình triển khai Kubernetes / ArgoCD Canary.
Định dạng: Trả về nội dung Dockerfile hoàn chỉnh. Cuối phản hồi thêm dòng:
---SPEECH---: [1 câu ngắn dưới 15 từ thông báo container đã đóng gói và sẵn sàng Canary release]`,
    formatUserPrompt: (prompt, ctx) =>
      `Viết Dockerfile production và tóm tắt deployment cho ứng dụng:\n"${prompt}"\nTrích đoạn diff:\n${ctx?.sourceCode?.slice(0, 700) || ''}`,
  },

  monitor: {
    filename: 'ClusterHealth.json',
    language: 'json',
    systemPrompt: `Bạn là SRE Monitoring Watchdog.
Nhiệm vụ: Đọc telemetry sau khi tính năng đã release lên Production, đánh giá độ ổn định cụm máy chủ và trạng thái các pods.
Định dạng đầu ra: Trả về JSON:
{
  "cluster": "k8s-production-us-central",
  "status": "HEALTHY",
  "p99Latency": "14ms",
  "cpuUsage": "24%",
  "tps": 342,
  "speech": "CPU 24% · Latency 14ms · Hệ thống ổn định 100% 📡"
}`,
    formatUserPrompt: (prompt) => `Sinh dữ liệu APM Telemetry sau khi deploy tính năng: "${prompt}"`,
  },
};

export async function POST(req: NextRequest) {
  try {
    const body: RequestBody = await req.json();
    const { prompt, stage, apiKey, stream, context } = body;

    if (!prompt || !stage) {
      return NextResponse.json(
        { error: 'Thiếu tham số prompt hoặc stage.' },
        { status: 400 }
      );
    }

    const config = STAGE_CONFIGS[stage];
    if (!config) {
      return NextResponse.json(
        { error: `Stage không hợp lệ: ${stage}` },
        { status: 400 }
      );
    }

    const userPromptFormatted = config.formatUserPrompt(prompt, context);
    const activeKey =
      apiKey?.trim() ||
      process.env.GEMINI_API_KEY?.trim() ||
      process.env.DEEPSEEK_API_KEY?.trim();

    if (!activeKey) {
      return NextResponse.json(
        {
          error:
            'Chưa cấu hình API Key. Vui lòng nhập Gemini API Key (AIza...) hoặc DeepSeek API Key (sk-...).',
        },
        { status: 400 }
      );
    }

    // 1. Chế độ Live SSE Token Streaming
    if (stream) {
      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          const sendEvent = (payload: Record<string, unknown>) => {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
          };

          try {
            let fullRaw = '';
            const generator = activeKey.startsWith('sk-')
              ? streamDeepSeek({
                  prompt: userPromptFormatted,
                  systemInstruction: config.systemPrompt,
                  apiKey: activeKey,
                  temperature: 0.3,
                  signal: req.signal,
                })
              : streamGemini({
                  prompt: userPromptFormatted,
                  systemInstruction: config.systemPrompt,
                  apiKey: activeKey,
                  temperature: 0.3,
                  signal: req.signal,
                });

            for await (const delta of generator) {
              if (req.signal.aborted) break;
              fullRaw += delta;
              sendEvent({ type: 'chunk', delta });
            }

            if (!req.signal.aborted) {
              const { content, speech } = finalizeStageOutput(stage, config, fullRaw);
              sendEvent({
                type: 'done',
                success: true,
                stage,
                filename: config.filename,
                language: config.language,
                content,
                speech,
              });
            }
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Lỗi kết nối stream AI Agent.';
            sendEvent({ type: 'error', error: msg });
          } finally {
            controller.close();
          }
        },
      });

      return new Response(readable, {
        headers: {
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-cache, no-transform',
          Connection: 'keep-alive',
        },
      });
    }

    // 2. Chế độ JSON tiêu chuẩn (Backwards-compatible)
    let rawResult = '';
    if (activeKey.startsWith('sk-')) {
      rawResult = await callDeepSeek({
        prompt: userPromptFormatted,
        systemInstruction: config.systemPrompt,
        apiKey: activeKey,
        temperature: 0.3,
        signal: req.signal,
      });
    } else {
      rawResult = await callGemini({
        prompt: userPromptFormatted,
        systemInstruction: config.systemPrompt,
        apiKey: activeKey,
        temperature: 0.3,
        signal: req.signal,
      });
    }

    const { content, speech } = finalizeStageOutput(stage, config, rawResult);

    return NextResponse.json({
      success: true,
      stage,
      filename: config.filename,
      language: config.language,
      content,
      speech,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Lỗi xử lý AI Agent.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
