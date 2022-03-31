import path from 'path-browserify';

import { FileTreeNode } from "../utils/fileTree";

export class TreeMemo {
    static memo: Map<string, FileTreeNode> = new Map<string, FileTreeNode>();

    private static _resetTreeMemo = () => this.memo.clear();

    private static _memoizeTree(node: FileTreeNode) {
        if (!node.isDirectory) return;

        const nodeInMemo: boolean = this.memo.has(node.filePath);
        const childNodes: FileTreeNode[] = node.getChildNodesAsArray();

        if (!nodeInMemo) {
            this.memo.set(node.filePath, node);
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
        if (node.isDirectory) {
            this.memo.set(nodePath, node);
        }

        const parentPath: string = path.dirname(nodePath);
        const parentNode: FileTreeNode | undefined = this.memo.get(parentPath);

        if (parentNode === undefined) return;

        parentNode.childNodes.set(nodePath, node);

        this.memo.set(parentPath, parentNode);
    }

    public static unlink(nodePath: string) {
        if (this.memo.has(nodePath)) {
            this.memo.delete(nodePath);
        }
    
        const parentPath: string = path.dirname(nodePath);
        const parentNode: FileTreeNode | undefined = this.memo.get(parentPath);

        if (parentNode === undefined) return;
        
        parentNode.childNodes.delete(nodePath);
        this.memo.set(parentPath, parentNode);
    }

    public static isDirectory(nodePath: string): boolean {
        const node: FileTreeNode | undefined = this.memo.get(nodePath);
        console.log(nodePath, node);

        if (node === undefined) return false;

        return node.isDirectory;
    }

    public static getChildren(nodePath: string): FileTreeNode[] {
        const node: FileTreeNode | undefined = this.memo.get(nodePath);
        
        if (node === undefined) return [];

        return node.getChildNodesAsArray();
    }
}