# Making your own integration test tool using Chrome DevTool interface

How puppeteer and other integration test tools work? Can we create our integration test tool?. What if we execute custom JavaScript commands in the page context, like filling inputs or clicking buttons?


JavaScript code can be executed in chrome page using DevTool interface. To execute JavaScript code we need to call the method ```Runtime.evaluate``` through the websocket channel. 


In this concrete example we.

1. Open a chrome page in address ```google.com```
2. Fill the query input with some text

```js
ws.send(JSON.stringify({
    id: 10, 
    method: 'Runtime.evaluate',
    params: {
        expression: `document.querySelector("[name=q]").value = "Writing from external script call"`
    }
}))
}
```

Voila !!

![](pic.png)


## How to run the example
1. Set an alias for your chrome binary ```export chrome=chrome-browser```
2. Run ```npm install```
3. Run ```npm run start```

