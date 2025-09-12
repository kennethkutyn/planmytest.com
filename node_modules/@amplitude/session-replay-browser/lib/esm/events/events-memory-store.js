import { __awaiter, __extends, __generator, __read, __spreadArray } from "tslib";
import { BaseEventsStore } from './base-events-store';
var InMemoryEventsStore = /** @class */ (function (_super) {
    __extends(InMemoryEventsStore, _super);
    function InMemoryEventsStore() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.finalizedSequences = {};
        _this.sequences = {};
        _this.sequenceId = 0;
        return _this;
    }
    InMemoryEventsStore.prototype.resetCurrentSequence = function (sessionId) {
        this.sequences[sessionId] = [];
    };
    InMemoryEventsStore.prototype.addSequence = function (sessionId) {
        var sequenceId = this.sequenceId++;
        var events = __spreadArray([], __read(this.sequences[sessionId]), false);
        this.finalizedSequences[sequenceId] = { sessionId: sessionId, events: events };
        this.resetCurrentSequence(sessionId);
        return { sequenceId: sequenceId, events: events, sessionId: sessionId };
    };
    InMemoryEventsStore.prototype.getSequencesToSend = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Object.entries(this.finalizedSequences).map(function (_a) {
                        var _b = __read(_a, 2), sequenceId = _b[0], _c = _b[1], sessionId = _c.sessionId, events = _c.events;
                        return ({
                            sequenceId: Number(sequenceId),
                            sessionId: sessionId,
                            events: events,
                        });
                    })];
            });
        });
    };
    InMemoryEventsStore.prototype.storeCurrentSequence = function (sessionId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!this.sequences[sessionId]) {
                    return [2 /*return*/, undefined];
                }
                return [2 /*return*/, this.addSequence(sessionId)];
            });
        });
    };
    InMemoryEventsStore.prototype.addEventToCurrentSequence = function (sessionId, event) {
        return __awaiter(this, void 0, void 0, function () {
            var sequenceReturn;
            return __generator(this, function (_a) {
                if (!this.sequences[sessionId]) {
                    this.resetCurrentSequence(sessionId);
                }
                if (this.shouldSplitEventsList(this.sequences[sessionId], event)) {
                    sequenceReturn = this.addSequence(sessionId);
                }
                this.sequences[sessionId].push(event);
                return [2 /*return*/, sequenceReturn];
            });
        });
    };
    InMemoryEventsStore.prototype.storeSendingEvents = function (sessionId, events) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.finalizedSequences[this.sequenceId] = { sessionId: sessionId, events: events };
                return [2 /*return*/, this.sequenceId++];
            });
        });
    };
    InMemoryEventsStore.prototype.cleanUpSessionEventsStore = function (_sessionId, sequenceId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (sequenceId !== undefined) {
                    delete this.finalizedSequences[sequenceId];
                }
                return [2 /*return*/];
            });
        });
    };
    return InMemoryEventsStore;
}(BaseEventsStore));
export { InMemoryEventsStore };
//# sourceMappingURL=events-memory-store.js.map