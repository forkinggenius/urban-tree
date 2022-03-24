import { 
    getChildrenNodesAsArray,    
    FileTreeNode,
} from "../utils/fileTree";

import FileExplorerNode from "./FileExplorerNode";

interface FileExplorerTreeProps {
    treeRoot: FileTreeNode
}

function FileExplorerTree(props: FileExplorerTreeProps) {
    return (
        <ul>
            {
                getChildrenNodesAsArray(props.treeRoot).map((node: FileTreeNode) => 
                    <FileExplorerNode node={node} key={node.filePath} />
                )
            }
        </ul>
    );
}

export default FileExplorerTree