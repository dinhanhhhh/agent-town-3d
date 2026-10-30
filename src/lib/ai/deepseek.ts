export interface DeepSeekCallParams {
  prompt: string;
  systemInstruction?: string;
  apiKey?: string;
  temperature?: number;
  signal?: AbortSignal;
}

export async function callDeepSeek({
  prompt,
  systemInstruction,
  apiKey,
  temperature = 0.3,
  signal,
}: DeepSeekCallParams): Promise<string> {
  const key = apiKey || process.env.DEEPSEEK_API_KEY;

  if (!key || key.trim() === '') {
    throw new Error('Chưa cấu hình DEEPSEEK_API_KEY. Vui lòng nhập API Key.');
  }

  const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [];
  if (systemInstruction) {
    messages.push({ role: 'system', content: systemInstruction });
  }
  messages.push({ role: 'user', content: prompt });

  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key.trim()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages,
      temperature,
      max_tokens: 4096,
    }),
    signal,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.error) {
    if (
      data.error?.type === 'insufficient_balance_error' ||
      data.error?.message?.includes('Insufficient Balance')
    ) {
      throw new Error(
        'Tài khoản DeepSeek này đã HẾT SỐ DƯ (Insufficient Balance). Vui lòng nạp tiền tại platform.deepseek.com hoặc đổi sang dùng Google Gemini miễn phí 100% tại aistudio.google.com/apikey.'
      );
    }
    throw new Error(data.error?.message || `Lỗi DeepSeek API (HTTP ${response.status})`);
  }

  const text = data.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error('DeepSeek không trả về nội dung hợp lệ.');
  }

  return text;
}

export async function* streamDeepSeek({
  prompt,
  systemInstruction,
  apiKey,
  temperature = 0.3,
  signal,
}: DeepSeekCallParams): AsyncGenerator<string, void, unknown> {
  const key = apiKey || process.env.DEEPSEEK_API_KEY;

  if (!key || key.trim() === '') {
    throw new Error('Chưa cấu hình DEEPSEEK_API_KEY. Vui lòng nhập API Key.');
  }

  const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [];
  if (systemInstruction) {
    messages.push({ role: 'system', content: systemInstruction });
  }
  messages.push({ role: 'user', content: prompt });

  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key.trim()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages,
      temperature,
      max_tokens: 4096,
      stream: true,
    }),
    signal,
  });

  if (!response.ok || !response.body) {
    const data = await response.json().catch(() => ({}));
    if (
      data.error?.type === 'insufficient_balance_error' ||
      data.error?.message?.includes('Insufficient Balance')
    ) {
      throw new Error(
        'Tài khoản DeepSeek này đã HẾT SỐ DƯ (Insufficient Balance). Vui lòng đổi sang dùng Google Gemini miễn phí 100% tại aistudio.google.com/apikey.'
      );
    }
    throw new Error(data.error?.message || `Lỗi DeepSeek API (HTTP ${response.status})`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line.startsWith('data:')) continue;
      const jsonStr = line.slice(5).trim();
      if (!jsonStr || jsonStr === '[DONE]') continue;
      try {
        const parsed = JSON.parse(jsonStr);
        const delta = parsed.choices?.[0]?.delta?.content;
        if (typeof delta === 'string' && delta.length > 0) {
          yield delta;
        }
      } catch {
        // Ignore partial chunk
      }
    }
  }
}
