export class FileTreeNode {
    filePath = '';
    baseName = '';

    isDirectory = false;
    childNodes = new Map<string, FileTreeNode>();

    constructor(childNodes?: Map<string, FileTreeNode>) {
        if (childNodes) {
            this.childNodes = childNodes;
        }
    }
}

export class FileTreeModification {
    action = ''
    path = ''
    node: FileTreeNode = new FileTreeNode()
}

export function getChildrenNodesAsArray(node: FileTreeNode): FileTreeNode[] {
    return Object.values(node.childNodes);
}