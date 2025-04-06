// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { ViewProvider } from './util/ViewProvider';
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "notes-viewer" is now active!');

	const provider = new ViewProvider(context.extensionUri);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
			ViewProvider.viewType,
		  provider
		)
	  );

	context.subscriptions.push(
	vscode.commands.registerCommand("vscodeSidebar.menu.view", () => {
		const message = "Menu/Title of extension is clicked !";
		vscode.window.showInformationMessage(message);
	})
	);

	let openWebView = vscode.commands.registerCommand('vscodeSidebar.openview', () => {
		// Display a message box to the user
		vscode.window.showInformationMessage('Command " Sidebar View [vscodeSidebar.openview] " called.');
	});

	context.subscriptions.push(openWebView);

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let cmdEditNotes = vscode.commands.registerCommand('notes-viewer.edit-notes', async () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Editting...');

		const uri = vscode.Uri.joinPath(context.extensionUri, "assets", "notes.md");

		vscode.window.showTextDocument(uri, { preview: false, viewColumn: getSideEditor()});

		// await vscode.commands.executeCommand("markdown.showPreview", uri);
	});

	let cmdViewNotes = vscode.commands.registerCommand('notes-viewer.view-notes', async () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Editting...');

		const uri = vscode.Uri.joinPath(context.extensionUri, "assets", "notes.md");

		vscode.window.showTextDocument(uri, { preview: false, viewColumn: getSideEditor()});

		await vscode.commands.executeCommand("markdown.showPreview", uri);
	});

	context.subscriptions.push(
		cmdEditNotes,
		cmdViewNotes
	);
}

function getSideEditor(): vscode.ViewColumn{
	const editor = vscode.window.activeTextEditor;

	if(!editor)
		return vscode.ViewColumn.Active;

	const indexOfActive = editor.viewColumn;
	const totalColumns = vscode.window.visibleTextEditors.length;

	const indexOfWanted = indexOfActive === 1 ? 2 : 1;

	return vscode.ViewColumn.Two;
}

// This method is called when your extension is deactivated
export function deactivate() {}
