import { useEffect } from "react";

import { FileTreeModification, FileTreeNode } from "../utils/fileTree";
import { TreeMemo } from "../utils/treeMemo";

const SSE_ENDPOINT_URL = 'http://localhost:3001/events';

let eventSource: EventSource | undefined;

type EventSourceCallback = (this: EventSource, ev: Event) => any;

export function useTreeStream(eventHandler: EventSourceCallback) {
    useEffect(() => {
        if (eventSource === undefined) {
            eventSource = new EventSource(SSE_ENDPOINT_URL);

            eventSource.addEventListener('update', (event) => {
                TreeMemo.update(
                    new FileTreeNode('', '', true, JSON.parse(event.data)));
            });

            eventSource.addEventListener('modify', (event) => {
                const parsedData: FileTreeModification = JSON.parse(event.data);

                const action = parsedData.action;
                const actionPath = parsedData.path;
                const node = parsedData.node;
                
                if (action.startsWith('add')) {
                    TreeMemo.add(actionPath,
                        FileTreeNode.fromObject(JSON.parse(node)));
                } else if (action.startsWith('unlink')) {
                    TreeMemo.unlink(actionPath);
                }
            });

            eventSource.onerror = () => {
                if (eventSource) {
                    eventSource.close();
                    
                    eventSource = undefined;
                }
            };
        }

        eventSource.addEventListener('update', eventHandler);
        eventSource.addEventListener('modify', eventHandler);
    }, []);
}