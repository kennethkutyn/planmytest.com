import { SessionIdentifiers as ISessionIdentifiers } from './typings/session-replay';
export declare class SessionIdentifiers implements ISessionIdentifiers {
    deviceId?: string;
    sessionId?: string | number;
    sessionReplayId?: string;
    constructor({ sessionId, deviceId }: {
        sessionId?: string | number;
        deviceId?: string;
    });
}
//# sourceMappingURL=identifiers.d.ts.map