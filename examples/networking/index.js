const WebSocket = require('ws');

// To open chrome as child process
const { spawn } = require('child_process');
const crypto = require('crypto')

const req = require("request");
var sleep = require('system-sleep')
const fs = require("fs");
const { del } = require('request');


const port = 9222;
const waitFor = 500;// milliseconds
const timeout = (10 + waitFor) * 1000; //10 seconds

let ID = 51;

let LISTENERS = {

}

function getID() {
  return ID++;
}

let HASHES = {

}


function sanitize(identifier) {
  let r = identifier;

  let last = null;

  while (last != r) {
    last = r;
    r = r.replace("http://", "")
    r = r.replace("https://", "")
    r = r.replace("wasm://", "")
    r = r.replace("/", "_")
  }

  return last
}

function saveIfUnique(data, identifier) {
  let hash = crypto.createHash('md5').update(data).digest("hex")
  if (hash in HASHES) {
    HASHES[hash].push(identifier)
    console.log(`${identifier} already present`)
  } else {
    console.log(`Saving ${identifier}`);

    HASHES[hash] = [identifier]
    let sanitized = sanitize(identifier);
    console.log(sanitized)
    // Save as file
    fs.writeFileSync(`out/${sanitized}.wasm`, data);
  }
}

// /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome
const chrome = spawn('/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome', [
  '--remote-debugging-port=' + port,
  '--user-data-dir=temp',
  process.argv[2]
]);

chrome.stdout.on('data', function (data) {
  console.log(data.toString());
});

let interval = setTimeout(() => {
  chrome.kill()
  clearTimeout(interval)
}, timeout)

// Asking for opened tabs

let interval2 = setTimeout(() => {

  const log = fs.openSync("log.txt", 'a')

  // Accessing chrome publish websocket address

  req(`http://127.0.0.1:${port}/json`, function (error, response, body) {

    console.log(response, body, error)
    const tab = JSON.parse(body)[0];

    console.log("Enabled websockets")
    console.log(tab)

    const url = tab.webSocketDebuggerUrl;

    const ws = new WebSocket(url);


    ws.on('open', function open() {

      ws.send(JSON.stringify({ id: 3, method: 'Network.enable' }))
      ws.send(JSON.stringify({ id: 4, method: 'Runtime.enable' }))
      ws.send(JSON.stringify({ id: 5, method: 'Debugger.enable' }))

    });

    ws.on("close", function () {

      process.exit(0)
    })

    ws.on('message', function incoming(data) {

      fs.writeSync(log, data + "\n")
      const obj = JSON.parse(data)

      //if ("params" in obj) {

      //const id = obj.params.requestId

      // Parse returns
      if (obj.id in LISTENERS) {
        let [cb, req] = LISTENERS[obj.id]
        cb(obj, req)
        delete LISTENERS[obj.id]
      }
      // Parse events
      if (obj.method === "Debugger.scriptParsed") {
        // Get the code
        if (obj.params.scriptLanguage === "WebAssembly") {
          let id = getID();
          let req = JSON.stringify({
            id, method: "Debugger.getScriptSource", params: {
              scriptId: obj.params.scriptId
            }
          });
          LISTENERS[id] = [(ret, req) => {
            let buff = new Buffer(ret.result.bytecode, 'base64');
            saveIfUnique(buff, req.params.url)
          }, obj]
          console.log(req);
          ws.send(req)
        }
      }

    });

  });


  clearTimeout(interval2)
}, waitFor)

