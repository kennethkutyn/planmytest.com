import { debugWrapper } from '@amplitude/analytics-core';
import { getDefaultConfig } from './config/local-config';
import { SessionReplay } from './session-replay';
export var getLogConfig = function (sessionReplay) { return function () {
    var config = sessionReplay.config;
    var _a = config || getDefaultConfig(), logger = _a.loggerProvider, logLevel = _a.logLevel;
    return {
        logger: logger,
        logLevel: logLevel,
    };
}; };
var createInstance = function () {
    var sessionReplay = new SessionReplay();
    return {
        init: debugWrapper(sessionReplay.init.bind(sessionReplay), 'init', getLogConfig(sessionReplay)),
        evaluateTargetingAndCapture: debugWrapper(sessionReplay.evaluateTargetingAndCapture.bind(sessionReplay), 'evaluateTargetingAndRecord', getLogConfig(sessionReplay)),
        setSessionId: debugWrapper(sessionReplay.setSessionId.bind(sessionReplay), 'setSessionId', getLogConfig(sessionReplay)),
        getSessionId: debugWrapper(sessionReplay.getSessionId.bind(sessionReplay), 'getSessionId', getLogConfig(sessionReplay)),
        getSessionReplayProperties: debugWrapper(sessionReplay.getSessionReplayProperties.bind(sessionReplay), 'getSessionReplayProperties', getLogConfig(sessionReplay)),
        flush: debugWrapper(sessionReplay.flush.bind(sessionReplay), 'flush', getLogConfig(sessionReplay)),
        shutdown: debugWrapper(sessionReplay.shutdown.bind(sessionReplay), 'shutdown', getLogConfig(sessionReplay)),
    };
};
export default createInstance();
//# sourceMappingURL=session-replay-factory.js.map