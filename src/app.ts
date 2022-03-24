import chokidar from 'chokidar';
import cors from 'cors';
import express from 'express';

import { FileTree } from './models/fileTree';

const SSE_HEADERS = {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache'
};

const app = express();
const PORT = 3001;

app.use(cors());

let clients = [];

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

// we watch for all events because it's the cleanest way to always post events
// to our clients, without having to repeat any code in a really ugly manner
directoryChangeWatcher.on('all', (event, path) => {
    // matches ['add', 'addDir']
    const isAddEvent = event.startsWith('add');
    
    // matches ['unlink', 'unlinkDir'] 
    const isUnlinkEvent = event.startsWith('unlink');
    
    // if is either add or unlink, we need to publish event
    if (isAddEvent || isUnlinkEvent) {
        const data = {
            action: '',
            path: path,
            node: '',
        };

        if (isAddEvent) {
            FileTree.addNode(path);

            data.action = 'add';
            data.node = JSON.stringify(FileTree.getNode(path));
        } else if (isUnlinkEvent) {
            data.action = 'unlink';

            FileTree.unlinkNode(path);
        }

        clients.forEach(client => {
            client.res.write(`data: ${JSON.stringify(data)}\n\n`)
        });
    }
});

app.get('/status', (req, res) => res.json({clients: clients.length}));

app.get('/events', (req, res) => {
    res.writeHead(200, SSE_HEADERS);
    res.write(`data: ${JSON.stringify(FileTree.roots)}\n\n`);

    const clientId = Date.now();
    
    const newClient = {
        id: clientId,
        res,
    };
    clients.push(newClient);

    req.on('close', () => {
        console.debug(`connection closed: ${clientId}`);
        clients = clients.filter(client => client.id !== clientId);
    });
});

app.listen(PORT, () => {
    return console.log(`Express server is listening at http://localhost:${PORT}`);
});