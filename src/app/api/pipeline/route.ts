import { NextRequest, NextResponse } from 'next/server';
import { callGemini } from '../../../lib/ai/gemini';
import { callDeepSeek } from '../../../lib/ai/deepseek';
import { AgentRole } from '../../../lib/pipeline/stages';

interface RequestBody {
  prompt: string;
  stage: AgentRole;
  apiKey?: string;
  context?: {
    prd?: string;
    sourceCode?: string;
    reviewComments?: string;
    testReport?: string;
  };
}

const STAGE_CONFIGS: Record<
  AgentRole,
  {
    systemPrompt: string;
    filename: string;
    language: string;
    formatUserPrompt: (userPrompt: string, ctx?: any) => string;
  }
> = {
  orchestrator: {
    filename: 'MilestonePlan.json',
    language: 'json',
    systemPrompt: `Bạn là Orchestrator chính của hệ thống DevOps tự trị (Claude Code Hub). 
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
    filename: 'source-code.ts',
    language: 'typescript',
    systemPrompt: `Bạn là Senior Full-Stack Engineer.
Nhiệm vụ: Dựa trên tài liệu PRD, viết mã nguồn sạch (Clean Architecture, Clean Code), xử lý đầy đủ validation, error handling (try/catch), boundary checks, không hardcode secrets, viết code TypeScript có thể chạy được.
Định dạng: Trả về toàn bộ source code sạch. Cuối phản hồi thêm dòng:
---SPEECH---: [1 câu ngắn dưới 15 từ thông báo đã lập trình xong và tạo Pull Request]`,
    formatUserPrompt: (prompt, ctx) =>
      `Dựa trên PRD sau đây, hãy viết toàn bộ mã nguồn TypeScript hoàn chỉnh:\n\n${ctx?.prd || prompt}`,
  },

  review: {
    filename: 'ReviewComments.json',
    language: 'json',
    systemPrompt: `Bạn là Principal Code Reviewer / Tech Lead.
Nhiệm vụ: Rà soát tỉ mỉ diff mã nguồn do Dev gửi lên. Đánh giá tính sạch sẽ (Clean Code), code smells, memory leak, thiếu boundary check, hoặc thiếu try/catch.
Định dạng đầu ra: Trả về JSON hợp lệ:
{
  "pullRequest": 87,
  "verdict": "APPROVED" | "REQUEST_CHANGES",
  "score": 9.5,
  "summary": "Tóm tắt đánh giá chất lượng",
  "comments": [
    { "file": "source-code.ts", "line": 15, "note": "Nhận xét chi tiết" }
  ],
  "speech": "1 câu ngắn dưới 15 từ (VD: 'PR #87 LGTM! Đã approve' hoặc 'PR cần bổ sung try/catch')"
}`,
    formatUserPrompt: (_, ctx) =>
      `Hãy review đoạn mã nguồn sau đây:\n\n\`\`\`typescript\n${ctx?.sourceCode || '// No code'}\n\`\`\``,
  },

  qa: {
    filename: 'test-suite.spec.ts',
    language: 'typescript',
    systemPrompt: `Bạn là Lead QA Automation Engineer.
Nhiệm vụ: Đọc mã nguồn do Dev viết và viết một bộ Unit Test tự động hoàn chỉnh (Jest / Vitest) bao phủ:
1. Happy path (trường hợp chạy đúng)
2. Negative path (trường hợp đầu vào sai)
3. Boundary & edge cases (rỗng, null, timeout, expired token).
Định dạng: Trả về code file test hoàn chỉnh. Cuối phản hồi thêm dòng:
---SPEECH---: [1 câu ngắn dưới 15 từ thông báo tổng số test cases PASSED (Coverage %)]`,
    formatUserPrompt: (_, ctx) =>
      `Hãy viết trọn bộ Unit Test tự động cho mã nguồn sau:\n\n\`\`\`typescript\n${ctx?.sourceCode || '// No code'}\n\`\`\``,
  },

  security: {
    filename: 'SecurityAudit.json',
    language: 'json',
    systemPrompt: `Bạn là Cybersecurity & DevSecOps Specialist.
Nhiệm vụ: Quét bảo mật tĩnh (SAST), kiểm tra OWASP Top 10, rà soát rò rỉ API secrets, injection rủi ro trong mã nguồn.
Định dạng đầu ra: Trả về JSON hợp lệ:
{
  "status": "PASSED" | "WARNING" | "CRITICAL",
  "cveCount": 0,
  "vulnerabilities": [],
  "compliance": ["OWASP Top 10", "Zero Secret Leak"],
  "speech": "1 câu ngắn dưới 15 từ thông báo kết quả audit bảo mật"
}`,
    formatUserPrompt: (_, ctx) =>
      `Quét lỗ hổng bảo mật cho đoạn mã nguồn sau:\n\n\`\`\`typescript\n${ctx?.sourceCode || '// No code'}\n\`\`\``,
  },

  devops: {
    filename: 'Dockerfile',
    language: 'dockerfile',
    systemPrompt: `Bạn là Senior Release DevOps & SRE.
Nhiệm vụ: Viết file Dockerfile chuẩn production (tối ưu multi-stage build, alpine, non-root user) và cấu hình triển khai Kubernetes / ArgoCD Canary.
Định dạng: Trả về nội dung Dockerfile hoàn chỉnh. Cuối phản hồi thêm dòng:
---SPEECH---: [1 câu ngắn dưới 15 từ thông báo container đã đóng gói và sẵn sàng Canary release]`,
    formatUserPrompt: (prompt, ctx) =>
      `Viết Dockerfile production và tóm tắt deployment cho ứng dụng:\n"${prompt}"\nMã nguồn:\n${ctx?.sourceCode?.slice(0, 500) || ''}`,
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
    const { prompt, stage, apiKey, context } = body;

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

    let rawResult = '';
    if (activeKey.startsWith('sk-')) {
      rawResult = await callDeepSeek({
        prompt: userPromptFormatted,
        systemInstruction: config.systemPrompt,
        apiKey: activeKey,
        temperature: 0.3,
      });
    } else {
      rawResult = await callGemini({
        prompt: userPromptFormatted,
        systemInstruction: config.systemPrompt,
        apiKey: activeKey,
        temperature: 0.3,
      });
    }

    // Parse speech line if marked with ---SPEECH---
    let speech = 'Hoàn thành khâu xử lý.';
    let content = rawResult;

    if (config.language === 'json') {
      try {
        // Clean markdown backticks if returned
        const cleaned = rawResult.replace(/^```json/m, '').replace(/```$/m, '').trim();
        const parsed = JSON.parse(cleaned);
        if (parsed.speech) speech = parsed.speech;
        content = JSON.stringify(parsed, null, 2);
      } catch (e) {
        content = rawResult;
      }
    } else if (rawResult.includes('---SPEECH---:')) {
      const parts = rawResult.split('---SPEECH---:');
      content = parts[0].trim();
      speech = parts[1].trim();
    }

    return NextResponse.json({
      success: true,
      stage,
      filename: config.filename,
      language: config.language,
      content,
      speech,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: err.message || 'Lỗi xử lý AI Agent.',
      },
      { status: 500 }
    );
  }
}
