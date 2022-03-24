import chokidar from 'chokidar';
import express from 'express';

import { FileTree } from './models/fileTree';

const app = express();
const port = 3000;

const queuedRootDirectories = process.argv.splice(2);
console.debug(`queued directories: ${queuedRootDirectories}`);

FileTree.initialize(queuedRootDirectories);

// no need to specify every sub-directory, because library already traverses
// in depth. so it's only necessary to put the top-level directory
// also no need to worry about passing a directory and a sub-directory, because
// this is a single watcher, meaning it ignores duplicates
// use `ignoreInitial` so we don't get add events when watcher is getting ready
const directoryChangeWatcher = chokidar.watch(queuedRootDirectories, {
    followSymlinks: false,
    ignoreInitial: true,
});

directoryChangeWatcher
    .on('add', path => FileTree.addNode(path))
    .on('addDir', path => FileTree.addNode(path))
    .on('unlink', path => FileTree.unlinkNode(path))
    .on('unlinkDir', path => FileTree.unlinkNode(path));

app.get('/', (req, res) => {
    res.json(
        {
            directories: FileTree.roots,
        }
    );
});

app.listen(port, () => {
    return console.log(`Express server is listening at http://localhost:${port}`);
});