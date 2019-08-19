
# Listen to chrome websocket debugging interface

## Basic workflow

0. Choose the debugging port: i.e. 9222
1. Open your browser with --remote-debugging-port=9222
3. Execute query to http://localhost:9222/json
4. The resulting json is something like this:
    ```json
    [ {
    "description": "",
    "devtoolsFrontendUrl": "/devtools/inspector.html?ws=localhost:9222/devtools/page/926A781407E057C7AE6A2C6F1E61B371",
    "id": "926A781407E057C7AE6A2C6F1E61B371",
    "title": "Document",
    "type": "page",
    "url": "https://kth.se",
    "webSocketDebuggerUrl": "ws://localhost:9222/devtools/page/926A781407E057C7AE6A2C6F1E61B371"
    } ]
    ```
    Every tab in the broser session will be represented in this json object as an array entry. The properties of each entry are: page description, id, title of the page, url of the page and the websocket address to access the debugging interface.
5. Then, open a websocket channel targeting the tab **webSocketDebuggerUrl**
6. Start to talking to chrome debugging interface like Runtime.enable method call <https://chromedevtools.github.io/devtools-protocol/v8/Runtime> at open channel event.
    - [Runtime channel](https://chromedevtools.github.io/devtools-protocol/tot/Runtime) 
    ```js
    // NodeJS example

        ws.send(
            JSON.stringigy({{id: 1, method: 'Runtime.enable'}}))
    ```

    - [Network profiler](https://chromedevtools.github.io/devtools-protocol/tot/Network) 
    ```js
    // NodeJS example

    ws.send(
        JSON.stringigy({{id: 1, method: 'Network.enable'}}))
    ```


7. Listen for incoming messages:
```js
// NodeJS example
ws.on('message', function incoming(data) {
    console.log(data);
});
```

## How to execute remote methods ?

Following the DevTools [documentation](https://chromedevtools.github.io/devtools-protocol/v8/Profiler), basically to run it, you need to send a WS message as follows:

```json
{
    "id": "RequestUniqueID",
    "method": "MethodName",
    "params": {
        "key": "value" // For each value described as parameter in documentation
    }
}
```


The call result is showed in the Runtime listener with the unique sent Id as identifier

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

Example: Execute JavaScript code in specific page

```js
// NodeJS example

ws.send({
    "id": 4,
    "method": "Runtime.enable"
})

ws.send({
    "id": 2,
    "method": "Runtime.evaluate",
    "params": {
        "expression": "1 + 2"
    }
})

```
Result 

```json
{
    "id":2,
    "result":
    {
        "result":
        {
            "type":"number",
            "value":2,
            "description":"2"
        }
    }
}
```

## Examples

- Create your own integration test tool from scratch [Link](examples/IT_demo)
- Processing network events [Link](examples/networking)
- Capture screen images [Link](examples/recording)