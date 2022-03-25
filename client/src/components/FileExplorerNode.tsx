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
            <li key={[props.nodePath, "-", "node", "-", "label"].join()}>
                <div onClick={toggle}>
                    <span>{props.nodeName}</span>
                </div>
            </li>
            {
                !collapsed &&
                    <FileExplorerTree key={[props.nodePath, "-", "subtree"].join()}
                        treePath={props.nodePath} />
            }
        </>
    );
}

export default FileExplorerNode