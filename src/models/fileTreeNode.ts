import fs from 'fs';
import path from 'path';

import { JsonMap as Map } from '../utils/jsonMap';

export class FileTreeNode {
    static memo = new Map<string, FileTreeNode>();

    filePath = "";
    baseName = "";

    isDirectory = false;
    childNodes = new Map<string, FileTreeNode>();

    private constructor(filePath: string) {
        this.filePath = filePath;
        this.baseName = path.parse(filePath).base;

        // ensure file exists before checking if it is a directory
        // otherwise an error is thrown
        if (fs.existsSync(this.filePath) && 
                fs.lstatSync(this.filePath).isDirectory()) {
            this.isDirectory = true;
            this.collectChildNodes();
        }
    }

    static get(filePath: string) {
        if (!this.memo.has(filePath)) {
            this.memo.set(filePath, new FileTreeNode(filePath));
        }

        return this.memo.get(filePath);
    }

    private static deleteFromMemo(node: FileTreeNode) {
        this.memo.delete(node.filePath);
    }

    static add(filePath: string) {
        const parentFilePath = path.dirname(filePath);
        const newlyAddedNode = this.get(filePath);

        this.addNodeToParent(parentFilePath, newlyAddedNode);
    }

    private static addNodeToParent(parentFilePath: string, node: FileTreeNode) {
        const parentNode = this.get(parentFilePath);

        parentNode.childNodes.set(node.baseName, node);

        console.debug(`adding node: ${node.baseName}`);
        console.debug(JSON.stringify(parentNode, null, 4));
    }

    static unlink(filePath: string) {
        const currentNode = this.get(filePath);

        this.unlinkNodeFromParent(currentNode);
    }

    private static unlinkNodeFromParent(node: FileTreeNode) {
        const parentFilePath = path.dirname(node.filePath);
        const parentNode = this.get(parentFilePath);

        parentNode.childNodes.delete(node.baseName);

        this.deleteFromMemo(node);
        node.childNodes.forEach(childNode => {
            this.deleteFromMemo(childNode);
        });

        console.debug(`unlinking node: ${node.baseName}`);
        console.debug(JSON.stringify(parentNode, null, 4));
    }

    private collectChildNodes() {
        fs.readdirSync(this.filePath).forEach(childFileName => {
            const childFilePath = path.join(this.filePath, childFileName);
            const node = FileTreeNode.get(childFilePath);

            this.childNodes.set(node.baseName, node);
        });
    }
}