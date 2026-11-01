import { NextRequest, NextResponse } from 'next/server';
import { callGemini, streamGemini } from '../../../lib/ai/gemini';
import { callDeepSeek, streamDeepSeek } from '../../../lib/ai/deepseek';
import { AgentRole } from '../../../lib/pipeline/stages';
import {
  buildEffectiveSystemPrompt,
  PipelineContext,
  STAGE_PROMPT_CONFIGS,
} from '../../../lib/pipeline/prompts';

interface RequestBody {
  prompt: string;
  stage: AgentRole;
  apiKey?: string;
  deepseekApiKey?: string;
  modelProvider?: 'auto' | 'gemini' | 'deepseek';
  stream?: boolean;
  context?: PipelineContext;
  customSystemPrompt?: string;
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
    const cleaned = rawResult
      .replace(/^```json\s*/im, '')
      .replace(/^```\s*/im, '')
      .replace(/```\s*$/im, '')
      .trim();

    let parsedObj: Record<string, unknown> | null = null;
    try {
      parsedObj = JSON.parse(cleaned);
    } catch {
      const firstBrace = cleaned.indexOf('{');
      const lastBrace = cleaned.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace > firstBrace) {
        try {
          parsedObj = JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
        } catch {
          parsedObj = null;
        }
      }
    }

    if (parsedObj) {
      if (typeof parsedObj.speech === 'string' && parsedObj.speech.trim()) {
        speech = parsedObj.speech.trim().replace(/^\[|\]$/g, '');
      }
      content = JSON.stringify(parsedObj, null, 2);
    } else {
      content = cleaned || rawResult;
    }
  } else {
    if (rawResult.includes('---SPEECH---:')) {
      const parts = rawResult.split('---SPEECH---:');
      content = parts[0].trim();
      const rawSpeech = parts[1].trim().replace(/^\[|\]$/g, '');
      if (rawSpeech) speech = rawSpeech;
    }

    if (config.language === 'typescript' || config.language === 'dockerfile') {
      content = content
        .replace(/^```(?:typescript|ts|javascript|js|dockerfile|docker)?\s*\n?/i, '')
        .replace(/\n?```\s*$/i, '')
        .trim();
    }
  }

  if (stage === 'dev' && config.language === 'diff') {
    content = ensureUnifiedDiff(content);
  }

  return { content, speech };
}

export async function POST(req: NextRequest) {
  try {
    const body: RequestBody = await req.json();
    const { prompt, stage, apiKey, deepseekApiKey, modelProvider, stream, context, customSystemPrompt } = body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0 || !stage) {
      return NextResponse.json(
        { error: 'Thiếu hoặc sai định dạng tham số prompt/stage.' },
        { status: 400 }
      );
    }

    if (prompt.length > 20000) {
      return NextResponse.json(
        { error: 'Độ dài prompt vượt quá giới hạn tối đa cho phép (20,000 ký tự).' },
        { status: 400 }
      );
    }

    const config = STAGE_PROMPT_CONFIGS[stage];
    if (!config) {
      return NextResponse.json(
        { error: `Stage không hợp lệ: ${stage}` },
        { status: 400 }
      );
    }

    const effectiveSystemPrompt = buildEffectiveSystemPrompt(stage, customSystemPrompt);
    const userPromptFormatted = config.formatUserPrompt(prompt, context);

    // Resolve API Keys & Multi-Model Engine
    const geminiKey =
      (apiKey?.startsWith('AIza') ? apiKey.trim() : '') ||
      process.env.GEMINI_API_KEY?.trim() ||
      (apiKey?.trim() && !apiKey.startsWith('sk-') ? apiKey.trim() : '');

    const deepseekKey =
      (deepseekApiKey?.startsWith('sk-') ? deepseekApiKey.trim() : '') ||
      (apiKey?.startsWith('sk-') ? apiKey.trim() : '') ||
      process.env.DEEPSEEK_API_KEY?.trim() ||
      '';

    let chosenProvider: 'gemini' | 'deepseek' = 'gemini';
    if (modelProvider === 'deepseek') {
      if (deepseekKey) chosenProvider = 'deepseek';
      else if (geminiKey) chosenProvider = 'gemini';
    } else if (modelProvider === 'gemini') {
      if (geminiKey) chosenProvider = 'gemini';
      else if (deepseekKey) chosenProvider = 'deepseek';
    } else {
      // Auto provider selection based on key availability
      if (deepseekKey && !geminiKey) chosenProvider = 'deepseek';
      else chosenProvider = 'gemini';
    }

    const activeKey = chosenProvider === 'deepseek' ? deepseekKey : geminiKey;
    let modelName = chosenProvider === 'deepseek' ? 'DeepSeek V3' : 'Gemini 3.8 Flash';

    if (!activeKey) {
      return NextResponse.json(
        {
          error:
            'Chưa cấu hình API Key phù hợp. Vui lòng nhập Gemini API Key (AIza...) hoặc DeepSeek API Key (sk-...).',
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
            const generator =
              chosenProvider === 'deepseek'
                ? streamDeepSeek({
                    prompt: userPromptFormatted,
                    systemInstruction: effectiveSystemPrompt,
                    apiKey: activeKey,
                    temperature: 0.3,
                    signal: req.signal,
                  })
                : streamGemini({
                    prompt: userPromptFormatted,
                    systemInstruction: effectiveSystemPrompt,
                    apiKey: activeKey,
                    temperature: 0.3,
                    signal: req.signal,
                    onModelResolved: (resolved) => {
                      modelName = resolved;
                    },
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
                model: modelName,
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
    if (chosenProvider === 'deepseek') {
      rawResult = await callDeepSeek({
        prompt: userPromptFormatted,
        systemInstruction: effectiveSystemPrompt,
        apiKey: activeKey,
        temperature: 0.3,
        signal: req.signal,
      });
    } else {
      const geminiRes = await callGemini({
        prompt: userPromptFormatted,
        systemInstruction: effectiveSystemPrompt,
        apiKey: activeKey,
        temperature: 0.3,
        signal: req.signal,
        onModelResolved: (resolved) => {
          modelName = resolved;
        },
      });
      rawResult = geminiRes.text;
    }

    const { content, speech } = finalizeStageOutput(stage, config, rawResult);

    return NextResponse.json({
      success: true,
      stage,
      model: modelName,
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
