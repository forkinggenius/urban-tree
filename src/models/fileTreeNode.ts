import fs from 'fs';
import path from 'path';

export class FileTreeNode {
    filePath = "";
    baseName = "";

    isDirectory = false;
    child_nodes: FileTreeNode[] = [];

    constructor(filePath: string) {
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

    private collectChildNodes() {
        fs.readdirSync(this.filePath).forEach(childFileName => {
            const childFilePath = path.join(this.filePath, childFileName);

            this.child_nodes.push(new FileTreeNode(childFilePath));
        });
    }
}