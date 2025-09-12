"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SafeLoggerProvider = exports.evaluateTargetingAndCapture = exports.shutdown = exports.flush = exports.getSessionReplayProperties = exports.getSessionId = exports.setSessionId = exports.init = void 0;
var tslib_1 = require("tslib");
var session_replay_factory_1 = tslib_1.__importDefault(require("./session-replay-factory"));
exports.init = session_replay_factory_1.default.init, exports.setSessionId = session_replay_factory_1.default.setSessionId, exports.getSessionId = session_replay_factory_1.default.getSessionId, exports.getSessionReplayProperties = session_replay_factory_1.default.getSessionReplayProperties, exports.flush = session_replay_factory_1.default.flush, exports.shutdown = session_replay_factory_1.default.shutdown, exports.evaluateTargetingAndCapture = session_replay_factory_1.default.evaluateTargetingAndCapture;
var logger_1 = require("./logger");
Object.defineProperty(exports, "SafeLoggerProvider", { enumerable: true, get: function () { return logger_1.SafeLoggerProvider; } });
//# sourceMappingURL=index.js.map