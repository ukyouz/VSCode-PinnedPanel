// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';


class FileNode extends vscode.TreeItem {
	constructor(
		public readonly label: string,
		private folder: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly tab: any,
	) {
		super(label, collapsibleState);
		this.tooltip = path.join(this.folder, label);
		this.description = this.folder;
		this.tab = tab;
	}

	iconPath = new vscode.ThemeIcon('pinned')
}


export class PinnedFilesProvider implements vscode.TreeDataProvider<FileNode> {

	getTreeItem(element: FileNode): vscode.TreeItem {
		return element;
	}

	getChildren(element?: FileNode): vscode.ProviderResult<FileNode[]> {
		return Promise.resolve(this.getPinnedFiles());
	}

	private getPinnedFiles(): FileNode[] {
		const tabArray = vscode.window.tabGroups.all[0].tabs;

		return tabArray.filter(t => t.isPinned).map(t => {
			let node = new FileNode(t.label, path.dirname((t.input as vscode.TabInputText).uri.fsPath), vscode.TreeItemCollapsibleState.None, t);
			// ref: https://www.codingwiththomas.com/blog/typescript-vs-code-api-lets-create-a-tree-view-part-2
			node.command = {
				command: 'treenode.on_item_clicked',
				title : 'open file',
				arguments: [node.tab],
			};
			return node;
		});
	}

	private changeEvent = new vscode.EventEmitter<void>();

	public get onDidChangeTreeData(): vscode.Event<void> {
		return this.changeEvent.event;
	}

	refresh(): void {
		this.changeEvent.fire();
	}
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	vscode.commands.registerCommand('treenode.on_item_clicked', async tab => {
		await vscode.window.showTextDocument(tab.input.uri);
	});

	console.log('Congratulations, your extension "helloworld" is now active!');

	const pinnedProvider = new PinnedFilesProvider()
	const tree = vscode.window.createTreeView('packagePinnedExplorer', {
		treeDataProvider: pinnedProvider,
		showCollapseAll: false
	});

	vscode.window.tabGroups.onDidChangeTabs(unused => {
		pinnedProvider.refresh();
	});
}

// this method is called when your extension is deactivated
export function deactivate() { }
