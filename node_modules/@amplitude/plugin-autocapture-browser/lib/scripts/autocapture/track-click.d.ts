import { AllWindowObservables, AutoCaptureOptionsWithDefaults } from 'src/autocapture-plugin';
import { type evaluateTriggersFn } from 'src/helpers';
import { BrowserClient } from '@amplitude/analytics-core';
import { shouldTrackEvent } from '../helpers';
export declare function trackClicks({ amplitude, allObservables, options, shouldTrackEvent, evaluateTriggers, }: {
    amplitude: BrowserClient;
    allObservables: AllWindowObservables;
    options: AutoCaptureOptionsWithDefaults;
    shouldTrackEvent: shouldTrackEvent;
    evaluateTriggers: evaluateTriggersFn;
}): import("rxjs").Subscription;
//# sourceMappingURL=track-click.d.ts.map