const WebSocket = require('ws');

// To open chrome as child process
const {  spawn } = require('child_process');

const req = require("request");
var sleep = require('system-sleep')
const fs = require("fs");


const port = 9222;
const waitFor = 3;// 5 seconds
const timeout = (60 + waitFor)*1000; //10 seconds

const chrome = spawn('chromium',[
  '--remote-debugging-port='+port,
  '--user-data-dir=demo/temp',
  process.argv[2]
]);

let interval = setTimeout(()=>{
  chrome.kill()
  clearInterval(interval)
}, timeout)

// Asking for opened tabs

sleep(waitFor)

const log = fs.openSync("log.txt", 'a')

// Accessing chrome publish websocket address
req(`http://localhost:${port}/json`,function (error, response, body) {
    
  const tab = JSON.parse(body)[0];

  console.log("Enabled websockets")
  console.log(tab)

  const url = tab.webSocketDebuggerUrl;

  const ws = new WebSocket(url);


  ws.on('open', function open() {

    ws.send(JSON.stringify({id: 3, method: 'Network.enable'}))

  });
 
  ws.on('message', function incoming(data) {
    
    fs.writeSync(log, data + "\n")
    
    
  });
});
