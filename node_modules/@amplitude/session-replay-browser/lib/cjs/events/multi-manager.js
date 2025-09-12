"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiEventManager = void 0;
var tslib_1 = require("tslib");
/**
 * "Registers" events managers internally. When an event is added this class routes the event to the correct
 * manager. For all send or flush methods this will invoke the event for all registered managers.
 */
var MultiEventManager = /** @class */ (function () {
    function MultiEventManager() {
        var managers = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            managers[_i] = arguments[_i];
        }
        var managersMap = new Map();
        managers.forEach(function (t) {
            managersMap.set(t.name, t.manager);
        });
        this.managers = managersMap;
    }
    MultiEventManager.prototype.sendStoredEvents = function (opts) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var promises;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        promises = [];
                        this.managers.forEach(function (manager) {
                            promises.push(manager.sendStoredEvents(opts));
                        });
                        return [4 /*yield*/, Promise.all(promises)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    MultiEventManager.prototype.addEvent = function (_a) {
        var _b;
        var sessionId = _a.sessionId, event = _a.event, deviceId = _a.deviceId;
        (_b = this.managers.get(event.type)) === null || _b === void 0 ? void 0 : _b.addEvent({ sessionId: sessionId, event: event, deviceId: deviceId });
    };
    MultiEventManager.prototype.sendCurrentSequenceEvents = function (_a) {
        var sessionId = _a.sessionId, deviceId = _a.deviceId;
        this.managers.forEach(function (manager) {
            manager.sendCurrentSequenceEvents({ sessionId: sessionId, deviceId: deviceId });
        });
    };
    MultiEventManager.prototype.flush = function (useRetry) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var promises;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        promises = [];
                        this.managers.forEach(function (manager) {
                            promises.push(manager.flush(useRetry));
                        });
                        return [4 /*yield*/, Promise.all(promises)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return MultiEventManager;
}());
exports.MultiEventManager = MultiEventManager;
//# sourceMappingURL=multi-manager.js.map