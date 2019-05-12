
# Listen for chrome websocket debugging interface

**Understanding [chrome-remote-interface](https://github.com/cyrus-and/chrome-remote-interface/blob/master/README.md) package implementation**

## Basic workflow (Based on <https://www.igvita.com/2012/04/09/driving-google-chrome-via-websocket-api/>)


1. Open your browser with --remote-debugging-port=(port)
3. Execute query to http://localhost:9222/json
4. The resulting json is something like this:
    ```json
    [ {
    "description": "",
    "devtoolsFrontendUrl": "/devtools/inspector.html?ws=localhost:9222/devtools/page/926A781407E057C7AE6A2C6F1E61B371",
    "id": "926A781407E057C7AE6A2C6F1E61B371",
    "title": "Document",
    "type": "page",
    "url": "http://localhost:8000/",
    "webSocketDebuggerUrl": "ws://localhost:9222/devtools/page/926A781407E057C7AE6A2C6F1E61B371"
    } ]
    ```
    Where each array entry is a tab (the devtools panel too if its open)
5. Then, open a websocket channel targeting the tab **webSocketDebuggerUrl**
6. Start to talking to chrome debugging interface like Runtime.enable method call <https://chromedevtools.github.io/devtools-protocol/v8/Runtime> at open channel event.
```js
ws.send(
    JSON.stringigy({{id: 1, method: 'Runtime.enable'}}))
```
This will enable the runtime listening capability

7. Listen for incoming messages:
```js
ws.on('message', function incoming(data) {
    console.log(data);
});
```

## How to execute remote method

Following the DevTools [documentation](https://chromedevtools.github.io/devtools-protocol/v8/Profiler), basically to run it, we have to send a WS message as follows:

```json
{
    "id": "RequestUniqueID",
    "method": "MethodName",
    "params": {
        "key": "value" // For each value described as parameter in documentation
    }
}
```


The call result can be seen in the Runtime listener with the unique sent Id as identification

```json
{
    "id":"RequestUniqueID",
    "result":
        {
            "result":
            {
                "type":"undefined"
            }
        }
}
```

You can see index.js file for NodeJS listener process demo

## Run demo

```bash
npm run start (url)
```

## Example

#### Executed javascript code in browser
```js
function a(){
    b();
}

function b(){
    console.log("I am b")
}

a();
b();

console.log(123)
```

#### Received message in websocket channel
```json
{"method":"Runtime.consoleAPICalled","params":{"type":"log","args":[{"type":"string","value":"I am b"}],"executionContextId":16,"timestamp":1557496455630.506,"stackTrace":{"callFrames":[{"functionName":"b","scriptId":"39","url":"http://localhost:8000/demo.js","lineNumber":5,"columnNumber":12},{"functionName":"a","scriptId":"39","url":"http://localhost:8000/demo.js","lineNumber":1,"columnNumber":4},{"functionName":"","scriptId":"39","url":"http://localhost:8000/demo.js","lineNumber":8,"columnNumber":0}]}}}
{"method":"Runtime.consoleAPICalled","params":{"type":"log","args":[{"type":"string","value":"I am b"}],"executionContextId":16,"timestamp":1557496455630.791,"stackTrace":{"callFrames":[{"functionName":"b","scriptId":"39","url":"http://localhost:8000/demo.js","lineNumber":5,"columnNumber":12},{"functionName":"","scriptId":"39","url":"http://localhost:8000/demo.js","lineNumber":9,"columnNumber":0}]}}}
{"method":"Runtime.consoleAPICalled","params":{"type":"log","args":[{"type":"number","value":123,"description":"123"}],"executionContextId":16,"timestamp":1557496455630.993,"stackTrace":{"callFrames":[{"functionName":"","scriptId":"39","url":"http://localhost:8000/demo.js","lineNumber":11,"columnNumber":8}]}}}
```

