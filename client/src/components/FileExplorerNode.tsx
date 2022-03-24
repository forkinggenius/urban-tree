import { FileTreeNode } from "../utils/fileTree";
import FileExplorerTree from "./FileExplorerTree";

interface FileExplorerNodeProps {
    node: FileTreeNode
}

function FileExplorerNode(props: FileExplorerNodeProps) {
    return (
        <>
            <li>
                <div>
                    <span>{props.node.baseName}</span>
                </div>
            </li>
            <FileExplorerTree treeRoot={props.node} />
        </>
    );
}

export default FileExplorerNode