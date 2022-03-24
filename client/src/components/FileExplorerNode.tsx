import { useState } from "react";

import { FileTreeNode } from "../utils/fileTree";
import FileExplorerTree from "./FileExplorerTree";

interface FileExplorerNodeProps {
    node: FileTreeNode
}

function FileExplorerNode(props: FileExplorerNodeProps) {
    const [collapsed, setCollapsed] = useState(false);

    const toggle = () => {
        setCollapsed(!collapsed);
    }

    return (
        <>
            <li>
                <div onClick={toggle}>
                    <span>{props.node.baseName}</span>
                </div>
            </li>
            {
                !collapsed &&
                    <FileExplorerTree treeRoot={props.node} />
            }
        </>
    );
}

export default FileExplorerNode