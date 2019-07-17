const WebSocket = require('ws');
const { exec, spawn } = require('child_process');
const req = require("request");
var sleep = require('system-sleep')
// Open browser in a clean session

/*
--no-sandbox --no-default-browser-check -user-data-dir=. 
--js-flags=" --print-bytecode"  (mutation-url|original-url) 
& sleep 10; kill $!
*/

// ./Users/javiercabrera/Applications/Chromium.app/Contents/MacOS/Chrome

const port = 9222;
const waitFor = 5;// 5 seconds
const timeout = (60 + waitFor)*1000; //10 seconds

const chrome = spawn('/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome',[
  '--remote-debugging-port='+port,
  '--user-data-dir=demo/temp',
  process.argv[2]
]);


console.log(Date.now())

let interval = setTimeout(()=>{
  chrome.kill()
  clearInterval(interval)
}, timeout)

// Asking for opened tabs

sleep(waitFor*1000)
console.log(Date.now())

req(`http://localhost:${port}/json`,function (error, response, body) {
    
  const tab = JSON.parse(body)[0];

  const url = tab.webSocketDebuggerUrl;

  const ws = new WebSocket(url);


  ws.on('open', function open() {

    ws.send(JSON.stringify({id: 3, method: 'Debugger.enable'}))
    ws.send(JSON.stringify({id: 1, method: 'Runtime.enable'}))

    ws.send(JSON.stringify({
      id: 2,
      method: 'Runtime.addBinding', // Beta feature, trying to detect the use of eval global function
      params: {
        name: "eval"
      }
    }))
  });

  ws.on('message', function incoming(data) {
    console.log(data);
  });
});
