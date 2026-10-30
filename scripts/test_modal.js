const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userDataDir = 'C:\\Users\\Admin\\AppData\\Local\\Temp\\chrome_capture_modal_' + Date.now();
const port = 9345;

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
  const ws = new WebSocket(target.webSocketDebuggerUrl);

  ws.onopen = () => {
    ws.send(JSON.stringify({ id: 1, method: 'Page.enable' }));
    ws.send(JSON.stringify({ id: 2, method: 'Runtime.enable' }));
    ws.send(JSON.stringify({ id: 3, method: 'Page.navigate', params: { url: 'http://localhost:3000' } }));
  };

  ws.onmessage = async (event) => {
    const data = JSON.parse(event.data);
    if (data.method === 'Page.loadEventFired') {
      console.log('Page loaded! Waiting 2s, then opening Claude Code modal...');
      setTimeout(() => {
        // Click on the first role chip to open Claude Code modal
        ws.send(
          JSON.stringify({
            id: 20,
            method: 'Runtime.evaluate',
            params: {
              expression: `(() => {
                const buttons = document.querySelectorAll('button');
                const hubBtn = Array.from(buttons).find(b => b.innerText.includes('Claude Code'));
                if (hubBtn) hubBtn.click();
                return !!hubBtn;
              })()`,
            },
          })
        );

        setTimeout(() => {
          console.log('Taking screenshot of open modal...');
          ws.send(
            JSON.stringify({
              id: 100,
              method: 'Page.captureScreenshot',
              params: { format: 'png' },
            })
          );
        }, 1200);
      }, 2000);
    }
    if (data.id === 20) {
      console.log('Clicked Hub button:', data.result?.result?.value);
    }
    if (data.id === 100 && data.result?.data) {
      const buffer = Buffer.from(data.result.data, 'base64');
      const outPath = path.resolve(__dirname, '../screenshot_modal_fixed.png');
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
