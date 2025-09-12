import { generateSessionReplayId } from './helpers';
var SessionIdentifiers = /** @class */ (function () {
    function SessionIdentifiers(_a) {
        var sessionId = _a.sessionId, deviceId = _a.deviceId;
        this.deviceId = deviceId;
        this.sessionId = sessionId;
        if (sessionId && deviceId) {
            this.sessionReplayId = generateSessionReplayId(sessionId, deviceId);
        }
    }
    return SessionIdentifiers;
}());
export { SessionIdentifiers };
//# sourceMappingURL=identifiers.js.map