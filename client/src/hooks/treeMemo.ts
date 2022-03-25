import path from 'path';

import { useRef, useState, useEffect } from "react";
import { FileTreeModification, FileTreeNode, getChildrenNodesAsArray } from "../utils/fileTree";

const SSE_ENDPOINT_URL = 'http://localhost:3001/events';

export function useTreeMemo(requestedPath: string) {
    const treeMemo: Map<string, FileTreeNode[]> = new Map<string, FileTreeNode[]>();

    const resetTreeMemo = () => treeMemo.clear();

    const memoizeTree = (node: FileTreeNode) => {
        const nodeInMemo: boolean = treeMemo.has(node.filePath);
        const childNodes: FileTreeNode[] = getChildrenNodesAsArray(node);
        if (!nodeInMemo) {
            treeMemo.set(node.filePath, childNodes);
        }

        childNodes.forEach((child: FileTreeNode) => memoizeTree(child));
    };

    const addToMemo = (parentPath: string, node: FileTreeNode) => {
        const siblingNodes: FileTreeNode[] = treeMemo.get(parentPath) || [];

        treeMemo.set(parentPath, siblingNodes.concat([node]));
    };

    const unlinkFromMemo = (nodePath: string) => {
        if (treeMemo.has(nodePath)) {
            treeMemo.delete(nodePath);
        }

        const parentPath: string = path.dirname(nodePath);
        const siblingNodes: FileTreeNode[] = treeMemo.get(parentPath) || [];
        if (treeMemo.has(parentPath)) {
            treeMemo.set(parentPath, siblingNodes.filter((node) => node.filePath != nodePath));
        }
    };

    const [treeBranch, setTreeBranch] = useState<FileTreeNode[]>([]);
    const [listening, setListening] = useState<boolean>(false);

    const updateTreeBranch = () => {
        setTreeBranch(treeMemo.get(requestedPath) || []);

        console.log(treeMemo.get(requestedPath) || []);
    };

    useEffect(() => {
        if (!listening) {
            const eventSource = new EventSource(SSE_ENDPOINT_URL);
    
            eventSource.addEventListener('update', (event) => {
                const parsedData: Map<string, FileTreeNode> = JSON.parse(event.data);
    
                const treeRoot = new FileTreeNode(parsedData, true);

                resetTreeMemo();
                memoizeTree(treeRoot);
                
                updateTreeBranch();
            });

            eventSource.addEventListener('modify', (event) => {
                const parsedData: FileTreeModification = JSON.parse(event.data);
                
                const action = parsedData.action;
                const actionPath = parsedData.path;
                
                if (action.startsWith('add')) {
                    addToMemo(actionPath, parsedData.node);
                } else if (action.startsWith('unlink')) {
                    unlinkFromMemo(actionPath);
                }

                updateTreeBranch();
            });
    
            eventSource.onerror = () => {
                setListening(false);
                
                eventSource.close();
            };
    
            setListening(true);
        }
    }, [listening]);

    return treeBranch;
}