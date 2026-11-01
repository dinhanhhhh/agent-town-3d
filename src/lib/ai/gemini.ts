export interface GeminiCallParams {
  prompt: string;
  systemInstruction?: string;
  apiKey?: string;
  temperature?: number;
  signal?: AbortSignal;
  onModelResolved?: (model: string) => void;
}

// Current active Gemini Flash models (prioritizing Gemini 3.8 / 3.5 Flash)
export const GEMINI_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
];

function buildRequestBody(prompt: string, systemInstruction?: string, temperature = 0.4) {
  const body: Record<string, unknown> = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature,
      maxOutputTokens: 4096,
    },
  };

  if (systemInstruction) {
    body.systemInstruction = {
      parts: [{ text: systemInstruction }],
    };
  }

  return body;
}

export async function callGemini({
  prompt,
  systemInstruction,
  apiKey,
  temperature = 0.4,
  signal,
  onModelResolved,
}: GeminiCallParams): Promise<{ text: string; model: string }> {
  const key = apiKey || process.env.GEMINI_API_KEY;

  if (!key || key.trim() === '') {
    throw new Error(
      'Chưa cấu hình GEMINI_API_KEY. Vui lòng nhập API Key trên giao diện hoặc trong file .env.local.'
    );
  }

  let lastError: unknown = null;

  for (const model of GEMINI_MODELS) {
    if (signal?.aborted) {
      throw new Error('Đã hủy yêu cầu AI Pipeline.');
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key.trim()}`;
      const body = buildRequestBody(prompt, systemInstruction, temperature);

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const status = response.status;
        const msg = errorData.error?.message || `HTTP ${status}`;

        if (status === 429 || status === 503) {
          await new Promise((r) => setTimeout(r, 800));
        }
        throw new Error(msg);
      }

      const data = await response.json();
      const candidate = data.candidates?.[0];
      const text = candidate?.content?.parts?.map((p: { text?: string }) => p.text || '').join('');

      if (!text) {
        throw new Error(`Model ${model} không trả về nội dung hợp lệ.`);
      }

      onModelResolved?.(model);
      return { text, model };
    } catch (err: unknown) {
      if (signal?.aborted) throw err;
      lastError = err;
      continue;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('Không thể kết nối tới Google Gemini API.');
}

export async function* streamGemini({
  prompt,
  systemInstruction,
  apiKey,
  temperature = 0.4,
  signal,
  onModelResolved,
}: GeminiCallParams): AsyncGenerator<string, void, unknown> {
  const key = apiKey || process.env.GEMINI_API_KEY;

  if (!key || key.trim() === '') {
    throw new Error(
      'Chưa cấu hình GEMINI_API_KEY. Vui lòng nhập API Key trên giao diện hoặc trong file .env.local.'
    );
  }

  let lastError: unknown = null;

  for (const model of GEMINI_MODELS) {
    if (signal?.aborted) {
      return;
    }

    let yieldedAny = false;
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${key.trim()}`;
      const body = buildRequestBody(prompt, systemInstruction, temperature);

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal,
      });

      if (!response.ok || !response.body) {
        const errorData = await response.json().catch(() => ({}));
        const status = response.status;
        const msg = errorData.error?.message || `HTTP ${status}`;
        if (status === 429 || status === 503) {
          await new Promise((r) => setTimeout(r, 800));
        }
        throw new Error(msg);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      onModelResolved?.(model);

      const extractChunksFromLine = (rawLine: string): string[] => {
        const line = rawLine.trim();
        if (!line.startsWith('data:')) return [];
        const jsonStr = line.slice(5).trim();
        if (!jsonStr || jsonStr === '[DONE]') return [];
        try {
          const parsed = JSON.parse(jsonStr);
          const parts = parsed.candidates?.[0]?.content?.parts || [];
          const texts: string[] = [];
          for (const part of parts) {
            if (typeof part.text === 'string' && part.text.length > 0) {
              texts.push(part.text);
            }
          }
          return texts;
        } catch {
          return [];
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const rawLine of lines) {
          for (const chunk of extractChunksFromLine(rawLine)) {
            yieldedAny = true;
            yield chunk;
          }
        }
      }

      if (buffer.trim()) {
        for (const chunk of extractChunksFromLine(buffer)) {
          yieldedAny = true;
          yield chunk;
        }
      }

      if (yieldedAny) {
        return;
      }
      throw new Error(`Model ${model} không trả về stream hợp lệ.`);
    } catch (err: unknown) {
      if (signal?.aborted) return;
      if (yieldedAny) throw err;
      lastError = err;
      continue;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('Không thể kết nối stream tới Google Gemini API.');
}
