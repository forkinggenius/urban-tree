import { useState, useEffect } from "react";
import { useTreeStream } from './useTreeStream';

import { FileTreeNode, FileTreeModification } from '../utils/fileTree';
import { TreeMemo } from '../utils/treeMemo';

export function useTreeMemo(requestedPath: string) {
    const [treeBranch, setTreeBranch] = useState<FileTreeNode[]>(
        TreeMemo.get(requestedPath));
    const updateTreeBranch = () => setTreeBranch(TreeMemo.get(requestedPath));

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