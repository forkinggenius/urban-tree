import { useTreeMemo } from "../hooks/treeMemo";
import { 
    getChildrenNodesAsArray,    
    FileTreeNode,
} from "../utils/fileTree";

import FileExplorerNode from "./FileExplorerNode";

interface FileExplorerTreeProps {
    treePath: string
}

function FileExplorerTree(props: FileExplorerTreeProps) {
    const childNodes = useTreeMemo(props.treePath || "");
    
    return (
        <ul>
            {
                childNodes.map((node: FileTreeNode) => 
                    <FileExplorerNode key={node.filePath}
                        nodeName={node.baseName} nodePath={node.filePath} />
                )
            }
        </ul>
    );
}

export default FileExplorerTree