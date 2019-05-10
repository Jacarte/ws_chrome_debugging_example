const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:9222/devtools/page/926A781407E057C7AE6A2C6F1E61B371');

ws.on('open', function open() {

    ws.send(JSON.stringify({id: 1, method: 'Runtime.enable'}))
});

ws.on('message', function incoming(data) {
  console.log(data);
});