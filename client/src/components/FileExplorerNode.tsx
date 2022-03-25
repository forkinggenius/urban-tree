import { useState } from "react";

import { FileTreeNode } from "../utils/fileTree";
import FileExplorerTree from "./FileExplorerTree";

interface FileExplorerNodeProps {
    nodeName: string,
    nodePath: string,
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
                    <span>{props.nodeName}</span>
                </div>
            </li>
            {
                !collapsed &&
                    <FileExplorerTree treePath={props.nodePath} />
            }
        </>
    );
}

export default FileExplorerNode