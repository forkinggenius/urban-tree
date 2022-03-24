import React, { useState, useEffect, useRef } from "react";

import FileExplorerTree from "./components/FileExplorerTree";
import { modifyTree, FileTreeNode } from "./utils/fileTree";

import './App.css'

const SSE_ENDPOINT_URL = 'http://localhost:3001/events';

function App() {
    const prevTreeRoot = useRef(new FileTreeNode());
    const [treeRoot, setTreeRoot] = useState(new FileTreeNode());
    const [listening, setListening] = useState(false);
    
    useEffect(() => {
        if (!listening) {
            const eventSource = new EventSource(SSE_ENDPOINT_URL);

            eventSource.addEventListener('update', (event) => {
                const parsedData = JSON.parse(event.data);
                
                setTreeRoot(
                    modifyTree(prevTreeRoot.current, parsedData));
            });

            eventSource.addEventListener('message', (event) => {
                const parsedData = JSON.parse(event.data);

                setTreeRoot(
                    new FileTreeNode(parsedData, true));
            });

            eventSource.onerror = () => eventSource.close();

            setListening(true);
        }
    }, [listening, treeRoot, prevTreeRoot]);

    useEffect(() => {
        prevTreeRoot.current = treeRoot;
    }, [treeRoot]);
    
    return (
        <div className="App">
            <FileExplorerTree treeRoot={treeRoot} />
        </div>
    )
}

export default App
