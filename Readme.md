
# Listen to chrome websocket debugging interface

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
    - [Runtime channel](https://chromedevtools.github.io/devtools-protocol/tot/Runtime) 
    ```js
        ws.send(
            JSON.stringigy({{id: 1, method: 'Runtime.enable'}}))
    ```

    - [Network profiler](https://chromedevtools.github.io/devtools-protocol/tot/Network) 
    ```js
    ws.send(
        JSON.stringigy({{id: 1, method: 'Network.enable'}}))
    ```


7. Listen for incoming messages:
```js
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

```js
ws.send({
    "id": 2,
    "method": "Runtime.evaluate",
    "params": {
        "expression": "1 + 2"
    }
})
...
// Resulting in
{
    "id":2,
    "result":
    {
        "result":
        {
            "type":"number",
            "value":22,
            "description":"22"
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


#### Write to file every network event
```js
...
 ws.on('open', function open() {

    ws.send(JSON.stringify({id: 3, method: 'Network.enable'}))

  });
 ...


  ws.on('message', function incoming(data) {
    
    fs.writeSync(log, data + "\n")
    
    
  });
  ...

```

#### Received message in websocket channel

```json
{"method":"Network.requestWillBeSent","params":{"requestId":"1000030826.88","loaderId":"3235B2C4912F7A6ED2399E4DBA41FC05","documentURL":"https://www.kth.se/","request":{"url":"https://www.kth.se/social/static/personal-menu/dialog-arrow.png","method":"GET","headers":{"Sec-Fetch-Mode":"no-cors","Referer":"https://www.kth.se/social/static/css/personal_menu.2103bf917fdb.css","User-Agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36"},"mixedContentType":"none","initialPriority":"Low","referrerPolicy":"origin-when-cross-origin"},"timestamp":242923.625405,"wallTime":1566127870.094745,"initiator":{"type":"other"},"type":"Image","frameId":"AE2F0012EB1E27F036C1C761D8BE7BAD","hasUserGesture":false}}{"method":"Network.resourceChangedPriority","params":{"requestId":"1000030826.88","newPriority":"High","timestamp":242923.626345}}{"method":"Network.responseReceived","params":{"requestId":"1000030826.88","loaderId":"3235B2C4912F7A6ED2399E4DBA41FC05","timestamp":242923.628486,"type":"Image","response":{"url":"https://www.kth.se/social/static/personal-menu/dialog-arrow.png","status":200,"statusText":"OK","headers":{"Date":"Sat, 17 Aug 2019 13:55:20 GMT","Via":"CACHE-NS","Referrer-Policy":"origin-when-cross-origin","Last-Modified":"Thu, 18 Jul 2019 14:13:33 GMT","Server":"Apache/2.4.6 (Red Hat Enterprise Linux) OpenSSL/1.0.2k-fips mod_wsgi/4.5.18 Python/2.7","Content-Type":"image/png","Access-Control-Allow-Origin":"*","Cache-Control":"max-age=31536000","Accept-Ranges":"bytes","Content-Length":"663","Expires":"Sun, 16 Aug 2020 13:55:20 GMT"},"mimeType":"image/png","connectionReused":false,"connectionId":0,"remoteIPAddress":"130.237.28.40","remotePort":443,"fromDiskCache":true,"fromServiceWorker":false,"fromPrefetchCache":false,"encodedDataLength":0,"timing":{"requestTime":242923.626526,"proxyStart":-1,"proxyEnd":-1,"dnsStart":-1,"dnsEnd":-1,"connectStart":-1,"connectEnd":-1,"sslStart":-1,"sslEnd":-1,"workerStart":-1,"workerReady":-1,"sendStart":0.227,"sendEnd":0.227,"pushStart":0,"pushEnd":0,"receiveHeadersEnd":1.109},"protocol":"http/1.1","securityState":"secure","securityDetails":{"protocol":"TLS 1.2","keyExchange":"ECDHE_RSA","keyExchangeGroup":"P-256","cipher":"AES_256_GCM","certificateId":0,"subjectName":"ns-vip-01.sys.kth.se","sanList":["ns-vip-01.sys.kth.se","kth.se","www.kth.se"],"issuer":"TERENA SSL High Assurance CA 3","validFrom":1543795200,"validTo":1576065600,"signedCertificateTimestampList":[],"certificateTransparencyCompliance":"unknown"}},"frameId":"AE2F0012EB1E27F036C1C761D8BE7BAD"}}{"method":"Network.dataReceived","params":{"requestId":"1000030826.88","timestamp":242923.628611,"dataLength":663,"encodedDataLength":0}}{"method":"Network.loadingFinished","params":{"requestId":"1000030826.88","timestamp":242923.628081,"encodedDataLength":0,"shouldReportCorbBlocking":false}}{"method":"Inspector.detached","params":{"reason":"Render process gone."}}{ "method": "Inspector.detached", "params": { "reason": "target_closed"} }{"id":3,"result":{}}
{"method":"Network.responseReceived","params":{"requestId":"7B6BBC299B63767B4D44A0F1A01BE9F9","loaderId":"7B6BBC299B63767B4D44A0F1A01BE9F9","timestamp":242994.054668,"type":"Document","response":{"url":"https://www.kth.se/","status":200,"statusText":"","headers":{"Via":"HTTP/1.1 PageCache","ETag":"\"f4207ada4d0eaf466fbbd83d9754124b\"","X-Content-Type-Options":"nosniff","X-XSS-Protection":"1; mode=block","X-Frame-Options":"SAMEORIGIN","Content-Type":"text/html;charset=UTF-8","Content-Language":"sv-SE","Date":"Sun, 18 Aug 2019 11:32:20 GMT","Referrer-Policy":"origin-when-cross-origin","Strict-Transport-Security":"max-age=31536000","Cache-Control":"private","Content-Encoding":"gzip","Transfer-Encoding":"chunked"},"mimeType":"text/html","connectionReused":true,"connectionId":64,"remoteIPAddress":"130.237.28.40","remotePort":443,"fromDiskCache":false,"fromServiceWorker":false,"fromPrefetchCache":false,"encodedDataLength":444,"timing":{"requestTime":242994.0242,"proxyStart":-1,"proxyEnd":-1,"dnsStart":-1,"dnsEnd":-1,"connectStart":-1,"connectEnd":-1,"sslStart":-1,"sslEnd":-1,"workerStart":-1,"workerReady":-1,"sendStart":0.507,"sendEnd":0.561,"pushStart":0,"pushEnd":0,"receiveHeadersEnd":26.939},"protocol":"http/1.1","securityState":"secure","securityDetails":{"protocol":"TLS 1.2","keyExchange":"ECDHE_RSA","keyExchangeGroup":"P-256","cipher":"AES_256_GCM","certificateId":0,"subjectName":"ns-vip-01.sys.kth.se","sanList":["ns-vip-01.sys.kth.se","kth.se","www.kth.se"],"issuer":"TERENA SSL High Assurance CA 3","validFrom":1543795200,"validTo":1576065600,"signedCertificateTimestampList":[{"status":"Verified","origin":"Embedded in certificate","logDescription":"Google 'Skydiver' log","logId":"BBD9DFBC1F8A71B593942397AA927B473857950AAB52E81A909664368E1ED185","timestamp":1543830894979,"hashAlgorithm":"SHA-256","signatureAlgorithm":"ECDSA","signatureData":"30460221009A46C5AB908ECF8EECD09F0781BA2BABFE31E19055402CBE01113B4357649849022100B6FE98C70463053454759C2A7FF2E89FC1EE2036C56589300707A5E7F503FD24"},{"status":"Verified","origin":"Embedded in certificate","logDescription":"DigiCert Log Server","logId":"5614069A2FD7C2ECD3F5E1BD44B23EC74676B9BC99115CC0EF949855D689D0DD","timestamp":1543830895055,"hashAlgorithm":"SHA-256","signatureAlgorithm":"ECDSA","signatureData":"304402207E68D9E6E746325E760EB93832F2E8C135542A7DDC2FA6CF1E65372CCFCE6E5702201F2599173D94E7DF2AD8C184B2723C4DAE6B73D68099042047BB14FD89CE44CF"}],"certificateTransparencyCompliance":"compliant"}},"frameId":"AB130CEAB9C1704B0D5F8FFBA37A5E35"}}
{"method":"Network.dataReceived","params":{"requestId":"7B6BBC299B63767B4D44A0F1A01BE9F9","timestamp":242994.072804,"dataLength":65536,"encodedDataLength":0}}
{"method":"Network.dataReceived","params":{"requestId":"7B6BBC299B63767B4D44A0F1A01BE9F9","timestamp":242994.091283,"dataLength":48362,"encodedDataLength":0}}
{"method":"Network.loadingFinished","params":{"requestId":"7B6BBC299B63767B4D44A0F1A01BE9F9","timestamp":242994.052631,"encodedDataLength":20027,"shouldReportCorbBlocking":false}}

```

- [Complete log file for Kth.se site](log_demo.txt)


#### [Demo script](index.js)

