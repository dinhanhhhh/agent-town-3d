const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userDataDir = 'C:\\Users\\Admin\\AppData\\Local\\Temp\\chrome_capture_' + Date.now();
const port = 9360;

console.log('Spawning Chrome on port', port);
const chrome = spawn(
  chromePath,
  [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--enable-webgl',
    '--window-size=1440,900',
    'about:blank',
  ],
  { stdio: 'ignore' }
);

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function capture() {
  let pages = null;
  for (let i = 0; i < 20; i++) {
    await wait(500);
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json`);
      pages = await res.json();
      if (pages && pages.length > 0) break;
    } catch (e) {}
  }

  const target = pages.find((p) => p.type === 'page') || pages[0];
  console.log('Target page:', target.url);

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  let id = 1;

  ws.onopen = () => {
    console.log('Connected to CDP. Navigating to http://localhost:3000...');
    ws.send(JSON.stringify({ id: id++, method: 'Page.enable' }));
    ws.send(JSON.stringify({ id: id++, method: 'Runtime.enable' }));
    ws.send(JSON.stringify({ id: id++, method: 'Page.navigate', params: { url: 'http://localhost:3000' } }));
  };

  ws.onmessage = async (event) => {
    const data = JSON.parse(event.data);
    if (data.method === 'Runtime.consoleAPICalled') {
      console.log('BROWSER CONSOLE:', data.params.type, ...data.params.args.map((a) => a.value || a.description));
    }
    if (data.method === 'Runtime.exceptionThrown') {
      console.error('BROWSER EXCEPTION:', data.params.exceptionDetails.text, data.params.exceptionDetails.exception?.description);
    }
    if (data.method === 'Page.loadEventFired') {
      console.log('Page loaded! Waiting 3.5s for React Three Fiber rendering...');
      setTimeout(() => {
        // Inspect DOM
        ws.send(JSON.stringify({
          id: 50,
          method: 'Runtime.evaluate',
          params: { expression: 'document.querySelector("canvas") ? "Canvas found: " + document.querySelector("canvas").clientWidth + "x" + document.querySelector("canvas").clientHeight : "NO CANVAS"' }
        }));

        setTimeout(() => {
          console.log('Taking screenshot...');
          ws.send(JSON.stringify({ id: 100, method: 'Page.captureScreenshot', params: { format: 'png' } }));
        }, 500);
      }, 3500);
    }
    if (data.id === 50) {
      console.log('DOM EVAL:', data.result?.result?.value);
    }
    if (data.id === 100 && data.result?.data) {
      const buffer = Buffer.from(data.result.data, 'base64');
      const outPath = path.resolve(__dirname, '../screenshot_latest.png');
      fs.writeFileSync(outPath, buffer);
      console.log('SUCCESS: Saved screenshot to', outPath, `(${buffer.length} bytes)`);
      ws.close();
      chrome.kill();
      process.exit(0);
    }
  };
}

capture().catch((err) => {
  console.error(err);
  chrome.kill();
  process.exit(1);
});
