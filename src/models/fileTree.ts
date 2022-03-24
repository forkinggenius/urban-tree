import fs from 'fs';
import path from 'path';

import { FileTreeNode } from "./fileTreeNode";
import { JsonMap as Map } from "../utils/jsonMap";

export class FileTree {
    static memo = new Map<string, FileTreeNode>();
    static roots = new Map<string, FileTreeNode>();

    static initialize(rootDirectories: string[]) {
        rootDirectories.forEach(directoryPath => {
            FileTree.roots.set(directoryPath, FileTree.getNode(directoryPath));
        });
    }

    static getNode(filePath: string) {
        if (!this.memo.has(filePath)) {
            this.memo.set(filePath, FileTree.createNode(filePath));
        }

        return this.memo.get(filePath);
    }

    private static getParentFilePathFromFilePath(filePath: string) {
        return path.dirname(filePath);
    }

    static getParentNode(filePath: string) {
        const parentFilePath = this.getParentFilePathFromFilePath(filePath);
        const parentNode = this.getNode(parentFilePath);

        return parentNode;
    }

    private static createNode(filePath: string) {
        const newNode = new FileTreeNode(filePath);
        
        if (newNode.isDirectory) {
            fs.readdirSync(filePath).forEach(childFileName => {
                const childFilePath = path.join(filePath, childFileName);
                const childNode = FileTree.getNode(childFilePath);
    
                newNode.childNodes.set(childNode.filePath, childNode);
            });
        }

        return newNode;
    }

    static addNode(filePath: string) {
        const parentNode = this.getParentNode(filePath);
        const newNode = this.getNode(filePath);

        this.addNodeToParent(parentNode, newNode);

        console.debug(`added node: ${newNode.filePath}`);
    }

    private static addNodeToParent(parentNode: FileTreeNode, node: FileTreeNode) {
        parentNode.childNodes.set(node.filePath, node);

        console.debug(JSON.stringify(parentNode, null, 4));
    }

    static unlinkNode(filePath: string) {
        const currentNode = this.getNode(filePath);
        
        const isRootNode = this.roots.has(filePath);
        if (isRootNode) {
            this.roots.delete(filePath);
        }

        this.unlinkNodeFromParentIfHasParent(currentNode);

        this.memo.delete(filePath);
        currentNode.childNodes.forEach(childNode => {
            this.memo.delete(childNode.filePath);
        });

        console.debug(`unlinked node: ${currentNode.filePath}`);
    }

    private static unlinkNodeFromParentIfHasParent(node: FileTreeNode) {
        const parentFilePath = this.getParentFilePathFromFilePath(node.filePath);

        const hasParent = this.memo.has(parentFilePath);
        if (!hasParent) {
            return;
        }

        const parentNode = this.getParentNode(node.filePath);
        parentNode.childNodes.delete(node.filePath);

        console.debug(JSON.stringify(parentNode, null, 4));
    }
}