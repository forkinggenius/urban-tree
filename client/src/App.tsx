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

                const updatedTreeRoot = new FileTreeNode(parsedData, true);
                setTreeRoot(updatedTreeRoot);
            });
            eventSource.addEventListener('modify', (event) => {
                const parsedData = JSON.parse(event.data);
                
                const modifiedTreeRoot = modifyTree(prevTreeRoot.current, parsedData);
                setTreeRoot(modifiedTreeRoot);
            });

            eventSource.onerror = () => {
                setListening(false);
                
                eventSource.close();
            };

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