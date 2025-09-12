import { AllWindowObservables } from 'src/autocapture-plugin';
import { BrowserClient } from '@amplitude/analytics-core';
import { shouldTrackEvent } from '../helpers';
export declare function trackRageClicks({ amplitude, allObservables, shouldTrackRageClick, }: {
    amplitude: BrowserClient;
    allObservables: AllWindowObservables;
    shouldTrackRageClick: shouldTrackEvent;
}): import("rxjs").Subscription;
//# sourceMappingURL=track-rage-click.d.ts.map