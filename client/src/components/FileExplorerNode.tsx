import { useState } from "react";

import { TreeMemo } from "../utils/treeMemo";
import { FileTreeNode } from "../utils/fileTree";
import FileExplorerTree from "./FileExplorerTree";

import '../css/FileExplorerNode.css';

interface FileExplorerNodeProps {
    nodeName: string,
    nodePath: string,
}

function FileExplorerNode(props: FileExplorerNodeProps) {
    const [collapsed, setCollapsed] = useState(false);

    const toggle = () => {
        setCollapsed(!collapsed);
    }

    const nodePath = props.nodePath;
    const nodeName = props.nodeName;
    const hasChildren = TreeMemo.hasChildren(nodePath);

    return (
        <>
            <li key={[props.nodePath, "-", "node"].join()}
                    className={hasChildren ? collapsed ? 
                        "FileNode CollapsedFileNode" : "FileNode CollapsableFileNode" : "FileNode"}>
                <label className="FileNodeLabel" onClick={hasChildren ? toggle : void 0}>{props.nodeName}</label>
                {
                    hasChildren && !collapsed &&
                        <FileExplorerTree key={[props.nodePath, "-", "subtree"].join()}
                            treePath={props.nodePath} />
                }
            </li>
        </>
    );
}

export default FileExplorerNode