"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLogConfig = void 0;
var analytics_core_1 = require("@amplitude/analytics-core");
var local_config_1 = require("./config/local-config");
var session_replay_1 = require("./session-replay");
var getLogConfig = function (sessionReplay) { return function () {
    var config = sessionReplay.config;
    var _a = config || (0, local_config_1.getDefaultConfig)(), logger = _a.loggerProvider, logLevel = _a.logLevel;
    return {
        logger: logger,
        logLevel: logLevel,
    };
}; };
exports.getLogConfig = getLogConfig;
var createInstance = function () {
    var sessionReplay = new session_replay_1.SessionReplay();
    return {
        init: (0, analytics_core_1.debugWrapper)(sessionReplay.init.bind(sessionReplay), 'init', (0, exports.getLogConfig)(sessionReplay)),
        evaluateTargetingAndCapture: (0, analytics_core_1.debugWrapper)(sessionReplay.evaluateTargetingAndCapture.bind(sessionReplay), 'evaluateTargetingAndRecord', (0, exports.getLogConfig)(sessionReplay)),
        setSessionId: (0, analytics_core_1.debugWrapper)(sessionReplay.setSessionId.bind(sessionReplay), 'setSessionId', (0, exports.getLogConfig)(sessionReplay)),
        getSessionId: (0, analytics_core_1.debugWrapper)(sessionReplay.getSessionId.bind(sessionReplay), 'getSessionId', (0, exports.getLogConfig)(sessionReplay)),
        getSessionReplayProperties: (0, analytics_core_1.debugWrapper)(sessionReplay.getSessionReplayProperties.bind(sessionReplay), 'getSessionReplayProperties', (0, exports.getLogConfig)(sessionReplay)),
        flush: (0, analytics_core_1.debugWrapper)(sessionReplay.flush.bind(sessionReplay), 'flush', (0, exports.getLogConfig)(sessionReplay)),
        shutdown: (0, analytics_core_1.debugWrapper)(sessionReplay.shutdown.bind(sessionReplay), 'shutdown', (0, exports.getLogConfig)(sessionReplay)),
    };
};
exports.default = createInstance();
//# sourceMappingURL=session-replay-factory.js.map