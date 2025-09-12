import { SessionReplayEventsManager as AmplitudeSessionReplayEventsManager, EventsManagerWithType } from '../typings/session-replay';
/**
 * "Registers" events managers internally. When an event is added this class routes the event to the correct
 * manager. For all send or flush methods this will invoke the event for all registered managers.
 */
export declare class MultiEventManager<EventType, EventDataType> implements AmplitudeSessionReplayEventsManager<EventType, EventDataType> {
    private managers;
    constructor(...managers: EventsManagerWithType<EventType, EventDataType>[]);
    sendStoredEvents(opts: {
        deviceId: string;
    }): Promise<void>;
    addEvent({ sessionId, event, deviceId, }: {
        sessionId: number;
        event: {
            type: EventType;
            data: EventDataType;
        };
        deviceId: string;
    }): void;
    sendCurrentSequenceEvents({ sessionId, deviceId }: {
        sessionId: number;
        deviceId: string;
    }): void;
    flush(useRetry?: boolean | undefined): Promise<void>;
}
//# sourceMappingURL=multi-manager.d.ts.map