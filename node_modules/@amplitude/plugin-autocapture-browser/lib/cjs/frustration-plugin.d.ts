import { BrowserClient, BrowserConfig, EnrichmentPlugin, FrustrationInteractionsOptions } from '@amplitude/analytics-core';
type BrowserEnrichmentPlugin = EnrichmentPlugin<BrowserClient, BrowserConfig>;
export declare const frustrationPlugin: (options?: FrustrationInteractionsOptions) => BrowserEnrichmentPlugin;
export {};
//# sourceMappingURL=frustration-plugin.d.ts.map