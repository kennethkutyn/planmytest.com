"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionIdentifiers = void 0;
var helpers_1 = require("./helpers");
var SessionIdentifiers = /** @class */ (function () {
    function SessionIdentifiers(_a) {
        var sessionId = _a.sessionId, deviceId = _a.deviceId;
        this.deviceId = deviceId;
        this.sessionId = sessionId;
        if (sessionId && deviceId) {
            this.sessionReplayId = (0, helpers_1.generateSessionReplayId)(sessionId, deviceId);
        }
    }
    return SessionIdentifiers;
}());
exports.SessionIdentifiers = SessionIdentifiers;
//# sourceMappingURL=identifiers.js.map