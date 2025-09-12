"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackDeadClick = exports._overrideDeadClickConfig = void 0;
var tslib_1 = require("tslib");
var rxjs_1 = require("rxjs");
var helpers_1 = require("../helpers");
var constants_1 = require("../constants");
var DEAD_CLICK_TIMEOUT = 3000; // 3 seconds to wait for an activity to happen
// allow override of dead click config for testing only
function _overrideDeadClickConfig(deadClickTimeout) {
    DEAD_CLICK_TIMEOUT = deadClickTimeout;
}
exports._overrideDeadClickConfig = _overrideDeadClickConfig;
function trackDeadClick(_a) {
    var amplitude = _a.amplitude, allObservables = _a.allObservables, getEventProperties = _a.getEventProperties, shouldTrackDeadClick = _a.shouldTrackDeadClick;
    var clickObservable = allObservables.clickObservable, mutationObservable = allObservables.mutationObservable, navigateObservable = allObservables.navigateObservable;
    var filteredClickObservable = clickObservable.pipe((0, rxjs_1.filter)(helpers_1.filterOutNonTrackableEvents), (0, rxjs_1.filter)(function (clickEvent) {
        // Only track change on elements that should be tracked
        return shouldTrackDeadClick('click', clickEvent.closestTrackedAncestor);
    }));
    var changeObservables = [mutationObservable];
    if (navigateObservable) {
        changeObservables.push(navigateObservable);
    }
    var mutationOrNavigate = rxjs_1.merge.apply(void 0, tslib_1.__spreadArray([], tslib_1.__read(changeObservables), false));
    var actionClicks = filteredClickObservable.pipe((0, rxjs_1.mergeMap)(function (click) {
        // Create a timer that emits after 500ms
        var timeoutId;
        var timer = new rxjs_1.Observable(function (subscriber) {
            timeoutId = setTimeout(function () { return subscriber.next(click); }, DEAD_CLICK_TIMEOUT);
            return function () {
                clearTimeout(timeoutId);
            };
        });
        // Race between the timer and any mutations/navigation
        // if the timer wins, the click is dead so we emit it
        return (0, rxjs_1.race)(timer, mutationOrNavigate.pipe((0, rxjs_1.take)(1), (0, rxjs_1.map)(function () { return null; }))).pipe((0, rxjs_1.filter)(function (value) { return value !== null; }));
    }), 
    // Only allow one dead click event every 3 seconds
    (0, rxjs_1.throttleTime)(DEAD_CLICK_TIMEOUT));
    return actionClicks.subscribe(function (actionClick) {
        var deadClickEvent = {
            '[Amplitude] X': actionClick.event.clientX,
            '[Amplitude] Y': actionClick.event.clientY,
        };
        amplitude.track(constants_1.AMPLITUDE_ELEMENT_DEAD_CLICKED_EVENT, tslib_1.__assign(tslib_1.__assign({}, getEventProperties('click', actionClick.closestTrackedAncestor)), deadClickEvent), { time: actionClick.timestamp });
    });
}
exports.trackDeadClick = trackDeadClick;
//# sourceMappingURL=track-dead-click.js.map