import { ILogger, LogLevel } from '@amplitude/analytics-core';
export declare class SafeLoggerProvider implements ILogger {
    private logger;
    log: typeof console.log;
    warn: typeof console.warn;
    error: typeof console.error;
    debug: typeof console.debug;
    constructor(loggerProvider: ILogger);
    private getSafeMethod;
    enable(logLevel: LogLevel): void;
    disable(): void;
}
//# sourceMappingURL=logger.d.ts.map