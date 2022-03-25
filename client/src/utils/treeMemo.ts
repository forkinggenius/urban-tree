import path from 'path-browserify';

import { FileTreeNode, getChildrenNodesAsArray } from "../utils/fileTree";

export class TreeMemo {
    static memo: Map<string, FileTreeNode[]> = new Map<string, FileTreeNode[]>();

    private static _resetTreeMemo = () => this.memo.clear();

    private static _memoizeTree(node: FileTreeNode) {
        const nodeInMemo: boolean = this.memo.has(node.filePath);
        const childNodes: FileTreeNode[] = getChildrenNodesAsArray(node);
        if (!nodeInMemo) {
            this.memo.set(node.filePath, childNodes);
        }
    
        childNodes.forEach((child: FileTreeNode) => this._memoizeTree(child));
    }

    public static get(nodePath: string) {
        return this.memo.get(nodePath) || [];
    }

    public static update(node: FileTreeNode) {
        this._resetTreeMemo();

        this._memoizeTree(node);
    }

    public static add(nodePath: string, node: FileTreeNode) {
        const parentPath: string = path.dirname(nodePath);
        const siblingNodes: FileTreeNode[] = this.memo.get(parentPath) || [];
    
        this.memo.set(parentPath, siblingNodes.concat([node]));
    }

    public static unlink(nodePath: string) {
        if (this.memo.has(nodePath)) {
            this.memo.delete(nodePath);
        }
    
        const parentPath: string = path.dirname(nodePath);
        const siblingNodes: FileTreeNode[] = this.memo.get(parentPath) || [];
        if (this.memo.has(parentPath)) {
            this.memo.set(parentPath, siblingNodes.filter((node) => node.filePath != nodePath));
        }
    }
}