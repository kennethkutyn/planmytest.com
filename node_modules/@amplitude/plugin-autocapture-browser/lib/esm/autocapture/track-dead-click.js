import { __assign, __read, __spreadArray } from "tslib";
import { filter, map, merge, take, mergeMap, race, Observable, throttleTime } from 'rxjs';
import { filterOutNonTrackableEvents } from '../helpers';
import { AMPLITUDE_ELEMENT_DEAD_CLICKED_EVENT } from '../constants';
var DEAD_CLICK_TIMEOUT = 3000; // 3 seconds to wait for an activity to happen
// allow override of dead click config for testing only
export function _overrideDeadClickConfig(deadClickTimeout) {
    DEAD_CLICK_TIMEOUT = deadClickTimeout;
}
export function trackDeadClick(_a) {
    var amplitude = _a.amplitude, allObservables = _a.allObservables, getEventProperties = _a.getEventProperties, shouldTrackDeadClick = _a.shouldTrackDeadClick;
    var clickObservable = allObservables.clickObservable, mutationObservable = allObservables.mutationObservable, navigateObservable = allObservables.navigateObservable;
    var filteredClickObservable = clickObservable.pipe(filter(filterOutNonTrackableEvents), filter(function (clickEvent) {
        // Only track change on elements that should be tracked
        return shouldTrackDeadClick('click', clickEvent.closestTrackedAncestor);
    }));
    var changeObservables = [mutationObservable];
    if (navigateObservable) {
        changeObservables.push(navigateObservable);
    }
    var mutationOrNavigate = merge.apply(void 0, __spreadArray([], __read(changeObservables), false));
    var actionClicks = filteredClickObservable.pipe(mergeMap(function (click) {
        // Create a timer that emits after 500ms
        var timeoutId;
        var timer = new Observable(function (subscriber) {
            timeoutId = setTimeout(function () { return subscriber.next(click); }, DEAD_CLICK_TIMEOUT);
            return function () {
                clearTimeout(timeoutId);
            };
        });
        // Race between the timer and any mutations/navigation
        // if the timer wins, the click is dead so we emit it
        return race(timer, mutationOrNavigate.pipe(take(1), map(function () { return null; }))).pipe(filter(function (value) { return value !== null; }));
    }), 
    // Only allow one dead click event every 3 seconds
    throttleTime(DEAD_CLICK_TIMEOUT));
    return actionClicks.subscribe(function (actionClick) {
        var deadClickEvent = {
            '[Amplitude] X': actionClick.event.clientX,
            '[Amplitude] Y': actionClick.event.clientY,
        };
        amplitude.track(AMPLITUDE_ELEMENT_DEAD_CLICKED_EVENT, __assign(__assign({}, getEventProperties('click', actionClick.closestTrackedAncestor)), deadClickEvent), { time: actionClick.timestamp });
    });
}
//# sourceMappingURL=track-dead-click.js.map