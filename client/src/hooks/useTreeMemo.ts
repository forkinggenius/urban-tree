import { useState, useEffect } from "react";
import { useTreeStream } from './useTreeStream';

import { FileTreeNode } from '../utils/fileTree';
import { TreeMemo } from '../utils/treeMemo';

export function useTreeMemo(requestedPath: string) {
    const [treeBranch, setTreeBranch] = useState<FileTreeNode[]>(
        TreeMemo.getChildren(requestedPath));
    const updateTreeBranch = () => setTreeBranch(
        TreeMemo.getChildren(requestedPath));
    
    useTreeStream((event: Event) => updateTreeBranch());

    // clean the state after unmounting
    // this helps avoid any memory leaks
    useEffect(() => {
        return () => {
            setTreeBranch([]);
        };
    }, []);

    return treeBranch;
}