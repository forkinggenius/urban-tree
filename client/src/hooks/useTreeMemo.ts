import { useState } from "react";
import { useTreeStream } from './useTreeStream';

import { FileTreeNode, FileTreeModification } from '../utils/fileTree';
import {
    treeMemo,
    resetTreeMemo,
    memoizeTree,
    addToMemo,
    unlinkFromMemo
} from '../utils/treeMemo';

export function useTreeMemo(requestedPath: string) {
    const [treeBranch, setTreeBranch] = useState<FileTreeNode[]>(
            treeMemo.get(requestedPath) || []);
    const updateTreeBranch = () => {
        setTreeBranch(
            treeMemo.get(requestedPath) || []);
    };

    const streamEventOnUpdate = (event: Event) => {
        const parsedData: Map<string, FileTreeNode> = JSON.parse(event.data);

        const treeRoot = new FileTreeNode(parsedData);

        resetTreeMemo();
        memoizeTree(treeRoot);
        
        updateTreeBranch();
    };

    const streamEventOnModify = (event: Event) => {
        const parsedData: FileTreeModification = JSON.parse(event.data);
        
        const action = parsedData.action;
        const actionPath = parsedData.path;
        
        if (action.startsWith('add')) {
            addToMemo(actionPath, parsedData.node);
        } else if (action.startsWith('unlink')) {
            unlinkFromMemo(actionPath);
        }

        updateTreeBranch();
    }

    useTreeStream(streamEventOnUpdate, streamEventOnModify);

    return treeBranch;
}