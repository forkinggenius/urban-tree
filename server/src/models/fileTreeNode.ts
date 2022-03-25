import fs from 'fs';
import path from 'path';

import { JsonMap as Map } from '../utils/jsonMap';

export class FileTreeNode {
    filePath = "";
    baseName = "";

    isDirectory = false;
    childNodes = new Map<string, FileTreeNode>();

    constructor(filePath: string) {
        this.filePath = filePath;
        this.baseName = path.parse(filePath).base;

        // ensure file exists before checking if it is a directory
        // otherwise an error is thrown
        if (fs.existsSync(this.filePath) && 
                fs.lstatSync(this.filePath).isDirectory()) {
            this.isDirectory = true;
        }
    }
}