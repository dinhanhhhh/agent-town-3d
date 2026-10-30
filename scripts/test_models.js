const key = 'AIzaSyAs5g4qwy9JfUo-aYsGIvXqkr1gVSC-bkU';
const prompt = 'Phân tích yêu cầu: Phòng chat thời gian thực WebSocket';

async function test(model) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      })
    });
    const data = await res.json();
    console.log(model, res.status, data.error ? data.error.message.slice(0, 80) : 'SUCCESS');
  } catch (err) {
    console.log(model, 'ERROR', err.message);
  }
}

async function run() {
  await test('gemini-2.5-flash');
  await test('gemini-flash-latest');
  await test('gemini-3.5-flash');
  await test('gemini-3.7-flash');
}

run();
