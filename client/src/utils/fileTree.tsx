export class FileTreeNode {
    filePath = '';
    baseName = '';

    isDirectory = false;
    childNodes = new Map<string, FileTreeNode>();

    constructor(childNodes?: Map<string, FileTreeNode>, isDirectory?: boolean) {
        if (childNodes) {
            this.childNodes = childNodes;
        }

        if (isDirectory) {
            this.isDirectory = isDirectory;
        }
    }
}

export class FileTreeModification {
    action = ''
    path = ''
    node: FileTreeNode = new FileTreeNode()
}

function addNode(rootNode: FileTreeNode, parentPath: string, node: FileTreeNode): FileTreeNode {
    const childNodes: FileTreeNode[] = Object.values(rootNode.childNodes);

    childNodes.forEach((childNode: FileTreeNode) => {
        // checks if node is indirect or direct parent
        const isParentDir = parentPath.startsWith(childNode.filePath);

        // checks if is direct parent
        const isDirectParentDir = childNode.filePath == parentPath;

        if (isDirectParentDir) {
            rootNode.childNodes[node.filePath] = node;
        } else if (isParentDir) {
            const updatedChildNode = addNode(childNode, parentPath, node);

            rootNode.childNodes[childNode.filePath] = updatedChildNode;
        }
    });

    return rootNode;
}

function unlinkNode(rootNode: FileTreeNode, nodePath: string): FileTreeNode {
    const childNodes: FileTreeNode[] = Object.values(rootNode.childNodes);

    childNodes.forEach((childNode: FileTreeNode) => {
        // checks if is direct or indirect parent
        const isParentDir = nodePath.startsWith(childNode.filePath);

        // checks if the node path is at the current child node
        const isCurrentDir = childNode.filePath == nodePath;

        if (isCurrentDir) {
            delete rootNode.childNodes[childNode.filePath];
        } else if (isParentDir) {
            const updatedChildNode = unlinkNode(childNode, nodePath);

            rootNode.childNodes[childNode.filePath] = updatedChildNode;
        }
    });

    return rootNode;
}

export function modifyTree(rootNode: FileTreeNode, modification: FileTreeModification): FileTreeNode {
    const action = modification.action;
    const path = modification.path;
    const node = modification.node;

    let newRootNode = rootNode;
    if (action.startsWith('add')) {
        newRootNode = addNode(rootNode, path, node);
    } else if (action.startsWith('unlink')) {
        newRootNode = unlinkNode(rootNode, path);
    }

    return newRootNode;
}

export function getChildrenNodesAsArray(node: FileTreeNode): FileTreeNode[] {
    return Object.values(node.childNodes);
}