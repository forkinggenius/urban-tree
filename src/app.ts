import chokidar from 'chokidar';
import express from 'express';

import { FileTreeNode } from './models/fileTreeNode';

const app = express();
const port = 3000;

const rootDirectoryNodes: FileTreeNode[] = [];

const queuedDirectories = process.argv.splice(2);
console.debug(`queued directories: ${queuedDirectories}`);

queuedDirectories.forEach(
    directoryPath => rootDirectoryNodes.push(FileTreeNode.get(directoryPath)));

// no need to specify every sub-directory, because library already traverses
// in depth. so it's only necessary to put the top-level directory
// also no need to worry about passing a directory and a sub-directory, because
// this is a single watcher, meaning it ignores duplicates
// use `ignoreInitial` so we don't get add events when watcher is getting ready
const directoryChangeWatcher = chokidar.watch(queuedDirectories, {
    followSymlinks: false,
    ignoreInitial: true,
});

directoryChangeWatcher
    .on('add', path => FileTreeNode.add(path))
    .on('addDir', path => FileTreeNode.add(path))
    .on('unlink', path => FileTreeNode.unlink(path))
    .on('unlinkDir', path => FileTreeNode.unlink(path));

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