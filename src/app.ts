import express from 'express';

import { FileTreeNode } from './models/fileTreeNode';

const app = express();
const port = 3000;

const rootDirectoryNodes: FileTreeNode[] = [];

const queuedDirectories = process.argv.splice(2);
console.debug(`queued directories: ${queuedDirectories}`);

queuedDirectories.forEach(
    directoryPath => rootDirectoryNodes.push(new FileTreeNode(directoryPath)));

app.get('/', (req, res) => {
    res.json(
        {
            directories: rootDirectoryNodes,
        }
    );
});

app.listen(port, () => {
    return console.log(`Express server is listening at http://localhost:${port}`);
});