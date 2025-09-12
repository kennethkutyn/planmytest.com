import { Events, SendingSequencesReturn } from '../typings/session-replay';
import { BaseEventsStore } from './base-events-store';
export declare class InMemoryEventsStore extends BaseEventsStore<number> {
    private finalizedSequences;
    private sequences;
    private sequenceId;
    private resetCurrentSequence;
    private addSequence;
    getSequencesToSend(): Promise<SendingSequencesReturn<number>[] | undefined>;
    storeCurrentSequence(sessionId: string | number): Promise<SendingSequencesReturn<number> | undefined>;
    addEventToCurrentSequence(sessionId: number, event: string): Promise<SendingSequencesReturn<number> | undefined>;
    storeSendingEvents(sessionId: number, events: Events): Promise<number | undefined>;
    cleanUpSessionEventsStore(_sessionId: number, sequenceId?: number): Promise<void>;
}
//# sourceMappingURL=events-memory-store.d.ts.map