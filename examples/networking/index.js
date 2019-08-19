const WebSocket = require('ws');

// To open chrome as child process
const {  spawn } = require('child_process');

const req = require("request");
var sleep = require('system-sleep')
const fs = require("fs");


const port = 9222;
const waitFor = 1000;// milliseconds
const timeout = (60 + waitFor)*1000; //10 seconds

// /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome
const chrome = spawn('chrome',[
  '--remote-debugging-port='+port,
  '--user-data-dir=temp',
  process.argv[2]
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
  
      ws.send(JSON.stringify({id: 3, method: 'Network.enable'}))
  
    });
   
    const group = {}
  
    ws.on("close", function(){
      
      fs.writeFileSync("group.json", JSON.stringify(group, null, 4))
  
  
      // How many domains?
      let domainCount = {}
      const re = /^https?:\/\/([\w\.]+)\//
  
      let js, css, other, img;
  
      js = 0
      css = 0
      other = 0
      img = 0
  
      let userGeneratedRequeests = 0
  
      for(var r in group)
      {
        const events = group[r]
        for(const event of events){
          if(event.method === "Network.requestWillBeSent"){
            let url = event.params.request.url;
  
  
            if(url.match(re))
              domainCount[url.match(re)[1]] = 1
  
            switch(event.params.type){
              case "Script":
                js++;
                break;
              case "Other":
                other++;
                break;
              case "Stylesheet":
                css++;
                break;
  
              case "Image":
                  img++;
                  break;
  
            }
  
            if(event.params.hasUserGesture){
              userGeneratedRequeests++;
            }
          }
        }
      }    
      
      // How many web request ?
      console.log("This session had", Object.keys(group).length, "different web requests")
      console.log("\tScripts", js)
      console.log("\tCSS", css)
      console.log("\tOther", other)
      console.log("\timage", img)
       
      // How many domains ?
      console.log("This session reachs", Object.keys(domainCount).length, "different domains:\n\t", Object.keys(domainCount).join("\n\t"))
  
      // User generated requests
      console.log("User generated requests",userGeneratedRequeests)
  
  
      process.exit(0)
    })
  
    ws.on('message', function incoming(data) {
      
      fs.writeSync(log, data + "\n")
      const obj = JSON.parse(data)
      
      if("params" in obj){
        
        const id = obj.params.requestId
  
        if(id){
          if(!(id in group)){
            group[id] = []
          }
  
          group[id].push(obj)
  
        }
      }
      
      
    });
  
  });
  

  clearTimeout(interval2)
}, waitFor)

