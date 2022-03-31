export class FileTreeNode {
    filePath = '';
    baseName = '';

    isDirectory = false;
    childNodes = new Map<string, FileTreeNode>();

    constructor(
        filePath: string,
        baseName: string,
        isDirectory: boolean,
        childNodes?: Map<string, FileTreeNode>,
    ) {
        this.filePath = filePath;
        this.baseName = baseName;
        this.isDirectory = isDirectory;

        if (childNodes) {
            Object.values(childNodes).forEach((childObject) => {
                const node: FileTreeNode = FileTreeNode.fromObject(childObject);
                
                this.childNodes.set(node.filePath, node);
            });
        }
    }

    getChildNodesAsArray(): FileTreeNode[] {
        return Array.from(this.childNodes.values());
    }

    static fromObject(nodeObject: FileTreeNode) {
        return new FileTreeNode(
            nodeObject.filePath,
            nodeObject.baseName,
            nodeObject.isDirectory,
            nodeObject.childNodes,
        );
    }
}

export class FileTreeModification {
    action = ''
    path = ''
    node = ''
}