export interface GeminiCallParams {
  prompt: string;
  systemInstruction?: string;
  apiKey?: string;
  temperature?: number;
}

export async function callGemini({
  prompt,
  systemInstruction,
  apiKey,
  temperature = 0.4,
}: GeminiCallParams): Promise<string> {
  const key = apiKey || process.env.GEMINI_API_KEY;

  if (!key || key.trim() === '') {
    throw new Error('Chưa cấu hình GEMINI_API_KEY. Vui lòng nhập API Key trên giao diện hoặc trong file .env.local.');
  }

  // Active models supporting generateContent on v1beta
  const models = [
    'gemini-3.5-flash',
    'gemini-3.7-flash',
    'gemini-flash-latest',
    'gemini-2.5-flash',
  ];

  let lastError: any = null;

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key.trim()}`;
      const body: any = {
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

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const status = response.status;
        const msg = errorData.error?.message || `HTTP ${status}`;

        // If rate limit (429) or overloaded (503), wait 1s before trying next fallback model
        if (status === 429 || status === 503) {
          await new Promise((r) => setTimeout(r, 1000));
        }

        throw new Error(msg);
      }

      const data = await response.json();
      const candidate = data.candidates?.[0];
      const text = candidate?.content?.parts?.[0]?.text;

      if (!text) {
        throw new Error(`Model ${model} không trả về nội dung hợp lệ.`);
      }

      return text;
    } catch (err: any) {
      lastError = err;
      // Try next model
      continue;
    }
  }

  throw lastError || new Error('Không thể kết nối tới Google Gemini API.');
}
