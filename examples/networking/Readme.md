# Register network events

We can listen for network events enabling ```Network``` namespace through the DevTool interface. Every networking event has a ```requestId```, representing the unique network, i.e., every external resource declaration like stylesheets and scripts, will trigger a networking event. In this concrete example, we group every event by requestId, and then we save it to a JSON file (group.json). Also, we log how many domains are involved in the page requests, how many requests belong to scripts, CSS, or images.



## How to run the example
1. Set an alias for your chrome binary ```export chrome=chrome-browser```
2. Run ```npm install```
3. Run ```node index.js <url>```

