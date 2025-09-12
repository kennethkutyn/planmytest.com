import { SessionReplayJoinedConfig } from './config/types';
import { SessionReplayDestinationSessionMetadata } from './typings/session-replay';
/**
 * For very small payloads it's preferable to use the [Beacon API](https://developer.mozilla.org/en-US/docs/Web/API/Beacon_API).
 * While it doesn't provide 100% guarantees on sends, it greatly helps with overall reliability and page load performance. As
 * the Beacon API has a potential to fail due to size constraints we want to fall back to XHR if need be. This is mostly to
 * be used with 'pagehide' or 'beforeunload' events.
 *
 * Note there are only 3 CORS safelisted Content-Types you can send:
 *
 * - application/x-www-form-urlencoded
 * - multipart/form-data
 * - text/plain
 *
 * If we do not send one of these, some browsers like Chrome may not send this at all. Also we incur the overhead of a preflight
 * request. In our case we will add no additional content-type header. If you are trying to ping a server that requires this
 * header, you may want to use the regular fetch API or a different mechanism.
 */
export declare class BeaconTransport<T> {
    private sendBeacon;
    private sendXhr;
    private readonly basePageUrl;
    private readonly context;
    private readonly apiKey;
    constructor(context: Omit<SessionReplayDestinationSessionMetadata, 'deviceId'>, config: SessionReplayJoinedConfig);
    send(deviceId: string, payload: T): void;
}
//# sourceMappingURL=beacon-transport.d.ts.map