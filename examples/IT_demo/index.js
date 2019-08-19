const WebSocket = require('ws');

// To open chrome as child process
const {  spawn } = require('child_process');

const req = require("request");
var sleep = require('system-sleep')
const fs = require("fs");


const port = 9222;
const waitFor = 1000;// milliseconds
const timeout = (60 + waitFor)*1000; //10 seconds

const chrome = spawn('chrome',[
  '--remote-debugging-port='+port,
  '--user-data-dir=temp',
  "google.com"
]);

chrome.stdout.on('data', function(data) {
  console.log(data.toString());
});

let interval = setTimeout(()=>{
  chrome.kill()
  clearTimeout(interval)
}, timeout)

// Asking for opened tabs

let interval2 = setTimeout(() => {

  const log = fs.openSync("log.txt", 'a')

  // Accessing chrome publish websocket address
  req(`http://localhost:${port}/json`,function (error, response, body) {
      
    const tab = JSON.parse(body)[0];
  
    console.log("Enabled websockets")
    console.log(tab)
  
    const url = tab.webSocketDebuggerUrl;
  
    const ws = new WebSocket(url);
  
    ws.on('open', function open() {
  
        console.log("Enabling runtime namespace")
      ws.send(JSON.stringify({id: 3, method: 'Runtime.enable'}))


  
    });
   
  
    ws.on('message', function incoming(data) {
      
      fs.writeSync(log, data + "\n")
      const obj = JSON.parse(data)
      
    console.log(obj)

      if(obj.id === 3){

        ws.send(JSON.stringify({
            id: 10, 
            method: 'Runtime.evaluate',
            params: {
                expression: `document.querySelector("[name=q]").value = "Writing from external script call"`
            }

        }))
      }
      
    });
  
  });
  

    clearTimeout(interval2)
}, waitFor)

