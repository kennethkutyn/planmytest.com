var SafeLoggerProvider = /** @class */ (function () {
    function SafeLoggerProvider(loggerProvider) {
        this.logger = loggerProvider;
        this.log = this.getSafeMethod('log');
        this.warn = this.getSafeMethod('warn');
        this.error = this.getSafeMethod('error');
        this.debug = this.getSafeMethod('debug');
    }
    SafeLoggerProvider.prototype.getSafeMethod = function (method) {
        var _a;
        if (!this.logger) {
            return (function () {
                // No-op function fallback
            });
        }
        var fn = this.logger[method];
        if (typeof fn === 'function') {
            var originalFn = (_a = fn.__rrweb_original__) !== null && _a !== void 0 ? _a : fn;
            return originalFn.bind(this.logger);
        }
        return (function () {
            // No-op function fallback
        });
    };
    SafeLoggerProvider.prototype.enable = function (logLevel) {
        this.logger.enable(logLevel);
    };
    SafeLoggerProvider.prototype.disable = function () {
        this.logger.disable();
    };
    return SafeLoggerProvider;
}());
export { SafeLoggerProvider };
//# sourceMappingURL=logger.js.map