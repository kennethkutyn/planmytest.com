import { Logger as ILogger } from '@amplitude/analytics-types';
import { DBSchema, IDBPDatabase } from 'idb';
export declare const MAX_IDB_STORAGE_LENGTH: number;
export interface SessionReplayTargetingDB extends DBSchema {
    sessionTargetingMatch: {
        key: string;
        value: {
            sessionId: string;
            targetingMatch: boolean;
            lastUpdated: number;
        };
    };
}
export declare class TargetingIDBStore {
    dbs: {
        [apiKey: string]: IDBPDatabase<SessionReplayTargetingDB>;
    };
    createStore: (dbName: string) => Promise<IDBPDatabase<SessionReplayTargetingDB>>;
    openOrCreateDB: (apiKey: string) => Promise<IDBPDatabase<SessionReplayTargetingDB>>;
    getTargetingMatchForSession: ({ loggerProvider, apiKey, sessionId, }: {
        loggerProvider: ILogger;
        apiKey: string;
        sessionId: string | number;
    }) => Promise<boolean | undefined>;
    storeTargetingMatchForSession: ({ loggerProvider, apiKey, sessionId, targetingMatch, }: {
        loggerProvider: ILogger;
        apiKey: string;
        sessionId: string | number;
        targetingMatch: boolean;
    }) => Promise<string | undefined>;
    clearStoreOfOldSessions: ({ loggerProvider, apiKey, currentSessionId, }: {
        loggerProvider: ILogger;
        apiKey: string;
        currentSessionId: string | number;
    }) => Promise<void>;
}
export declare const targetingIDBStore: TargetingIDBStore;
//# sourceMappingURL=targeting-idb-store.d.ts.map