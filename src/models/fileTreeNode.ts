import fs from 'fs';
import path from 'path';

export class FileTreeNode {
    static memo = new Map<string, FileTreeNode>();

    filePath = "";
    baseName = "";

    isDirectory = false;
    childNodes: FileTreeNode[] = [];

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

    private collectChildNodes() {
        fs.readdirSync(this.filePath).forEach(childFileName => {
            const childFilePath = path.join(this.filePath, childFileName);

            this.childNodes.push(FileTreeNode.get(childFilePath));
        });
    }
}