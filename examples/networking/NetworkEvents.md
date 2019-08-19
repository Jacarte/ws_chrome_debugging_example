## Observed events in Network profiling


- **requestWillBeSent** Fired when page is about to send HTTP request.

    - PARAMETERS
        - requestId: Request identifier.
        - loaderId: LoaderId Loader identifier. Empty string if the request is fetched from worker.
        - documentURL: string. URL of the document this request is loaded for.
        - request: Request. Request data.
        - timestamp: MonotonicTime.Timestamp.
        - wallTime: TimeSinceEpoch. Timestamp.
        - initiator: Initiator. Request initiator.
        - redirectResponse: Response. Redirect response data.
        - type: ResourceType. Type of this resource.
        - frameId: Page.FrameId. Frame identifier.
        - hasUserGesture. boolean. Whether the request is initiated by a user gesture. Defaults to false. (Interesting. How many requestes are triggered by human interaction? Can be this a measure to detect potential malwares? )

-  **dataReceived** Fired when data chunk was received over the network.

    - PARAMETERS
        - requestId: RequestId. Request identifier.
        - timestamp. MonotonicTime. Timestamp.
        - dataLength. integer. Data chunk length.
        - encodedDataLength. integer. Actual bytes received (might be less than dataLength for compressed encodings).

- **responseReceived** Fired when HTTP response is available.

   - PARAMETERS
        - requestId. RequestId. Request identifier.
        - loaderId. LoaderId.  Loader identifier. Empty string if the request is fetched from worker.
        - timestamp. MonotonicTime. Timestamp.
        - type. ResourceType. Resource type.
        - response. Response. Response data.
        - frameId. Page.FrameId.Frame identifier.