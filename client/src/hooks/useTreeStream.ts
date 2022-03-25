import { useEffect } from "react";

const SSE_ENDPOINT_URL = 'http://localhost:3001/events';

let eventSource: EventSource | undefined;

let eventSourceOnUpdate: EventSourceCallback | null = null;
let eventSourceOnModify: EventSourceCallback | null = null;

type EventSourceCallback = (this: EventSource, ev: Event) => any;

export function useTreeStream(onUpdate: EventSourceCallback, onModify: EventSourceCallback) {
    useEffect(() => {
        if (eventSource === undefined) {
            eventSource = new EventSource(SSE_ENDPOINT_URL);

            if (!eventSourceOnUpdate) {
                eventSourceOnUpdate = onUpdate;
                eventSource.addEventListener('update', eventSourceOnUpdate);
            }

            if (!eventSourceOnModify) {
                eventSourceOnModify = onModify;
                eventSource.addEventListener('modify', eventSourceOnModify);
            }

            eventSource.onerror = () => {
                if (eventSource) {
                    if (eventSourceOnUpdate) {
                        eventSource.removeEventListener('update', eventSourceOnUpdate);
                    }

                    if (eventSourceOnModify) {
                        eventSource.removeEventListener('modify', eventSourceOnModify);
                    }

                    eventSourceOnUpdate = null;
                    eventSourceOnModify = null;

                    eventSource.close();
                    
                    eventSource = undefined;
                }
            };
        }
    }, []);
}