import { useTreeMemo } from "../hooks/useTreeMemo";
import { FileTreeNode } from "../utils/fileTree";

import FileExplorerNode from "./FileExplorerNode";

import '../css/FileExplorerTree.css';

interface FileExplorerTreeProps {
    treePath?: string
}

function FileExplorerTree(props: FileExplorerTreeProps) {
    const childNodes = useTreeMemo(props.treePath || "");
    
    return (
        <ul className="FileTree" key={[props.treePath, "-", "tree"].join()}>
            {
                childNodes.map((node: FileTreeNode) => 
                    <FileExplorerNode key={[node.filePath, "-", "123"].join()}
                        nodeName={node.baseName} nodePath={node.filePath} />
                )
            }
        </ul>
    );
}

export default FileExplorerTree