const { spawn } = require('child_process');

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9337',
  '--user-data-dir=C:\\Users\\Admin\\AppData\\Local\\Temp\\chrome_dbg_dump2',
  '--no-first-run',
  '--disable-extensions',
  'about:blank'
]);

setTimeout(async () => {
  const res = await fetch('http://127.0.0.1:9337/json');
  const pages = await res.json();
  const target = pages.find((p) => p.type === 'page') || pages[0];
  const ws = new WebSocket(target.webSocketDebuggerUrl);

  ws.onopen = () => {
    ws.send(JSON.stringify({ id: 1, method: 'Page.enable' }));
    ws.send(JSON.stringify({ id: 2, method: 'Runtime.enable' }));
    ws.send(JSON.stringify({ id: 3, method: 'Page.navigate', params: { url: 'http://localhost:3000' } }));
  };

  ws.onmessage = (e) => {
    const data = JSON.parse(e.data);
    if (data.method === 'Page.loadEventFired') {
      setTimeout(() => {
        ws.send(JSON.stringify({
          id: 10,
          method: 'Runtime.evaluate',
          params: {
            expression: `({
              title: document.title,
              html: document.body.innerHTML.slice(0, 1000),
              canvasExists: !!document.querySelector('canvas')
            })`,
            returnByValue: true
          }
        }));
      }, 2000);
    }
    if (data.id === 10) {
      console.log('DOM RESULT:', JSON.stringify(data.result?.result?.value, null, 2));
      chrome.kill();
      process.exit(0);
    }
  };
}, 1000);
