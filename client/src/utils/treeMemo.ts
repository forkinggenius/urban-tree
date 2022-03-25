import path from 'path-browserify';

import { FileTreeNode, getChildrenNodesAsArray } from "../utils/fileTree";

export const treeMemo: Map<string, FileTreeNode[]> = new Map<string, FileTreeNode[]>();

export const resetTreeMemo = () => treeMemo.clear();

export const memoizeTree = (node: FileTreeNode) => {
    const nodeInMemo: boolean = treeMemo.has(node.filePath);
    const childNodes: FileTreeNode[] = getChildrenNodesAsArray(node);
    if (!nodeInMemo) {
        treeMemo.set(node.filePath, childNodes);
    }

    childNodes.forEach((child: FileTreeNode) => memoizeTree(child));
};

export const addToMemo = (nodePath: string, node: FileTreeNode) => {
    const parentPath: string = path.dirname(nodePath);
    const siblingNodes: FileTreeNode[] = treeMemo.get(parentPath) || [];

    treeMemo.set(parentPath, siblingNodes.concat([node]));
};

export const unlinkFromMemo = (nodePath: string) => {
    if (treeMemo.has(nodePath)) {
        treeMemo.delete(nodePath);
    }

    const parentPath: string = path.dirname(nodePath);
    const siblingNodes: FileTreeNode[] = treeMemo.get(parentPath) || [];
    if (treeMemo.has(parentPath)) {
        treeMemo.set(parentPath, siblingNodes.filter((node) => node.filePath != nodePath));
    }
};