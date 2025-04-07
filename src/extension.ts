// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { ViewProvider } from './util/ViewProvider';
import { FileManager } from './util/FileManager';
import { NoteManager } from './util/NoteManager';

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

		await vscode.window.showTextDocument(uri, { preview: false, viewColumn: getSideEditor()});

		await vscode.commands.executeCommand("markdown.showPreview", uri);

		var folder : string = "";

		const options: vscode.OpenDialogOptions = {
			canSelectMany: false,
			canSelectFiles: false,
			canSelectFolders: true,
			openLabel: 'Open',
			filters: {
			   'All files': ['*']
		   }
	   	};
		
		await vscode.window.showOpenDialog(options).then(folderUri => {
			if (folderUri && folderUri[0]) {
				folder = folderUri[0].fsPath;
				console.log('Selected folder: ' + folderUri[0].fsPath);

			}
		});

		let items: vscode.QuickPickItem[] = await NoteManager.getFiles(folder);

		var bob = await vscode.window.showQuickPick(items);

		console.log(bob);
	});

	let cmdAddNotes = vscode.commands.registerCommand('notes-viewer.add-notes', async () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Entering File Prompt...');

		const options: vscode.OpenDialogOptions = {
			canSelectMany: false,
			openLabel: 'Open',
			filters: {
			   'Markdown files': ['md'],
			   'All files': ['*']
		   }
	   	};

		var inputUri = "";

	   	await vscode.window.showOpenDialog(options).then(fileUri => {
			if (fileUri && fileUri[0]) {
				inputUri = fileUri[0].fsPath;
				console.log('Selected file: ' + fileUri[0].fsPath);

			}
		});

		const namePrompt = await vscode.window.showInputBox({
			placeHolder: "Type the Name of Your Notes",
			value: "my_notes.md"
		});

		const nameNotes = namePrompt === undefined ? "" : namePrompt;

		const fileContents = await FileManager.readFile(inputUri)

		const assetsUri = vscode.Uri.joinPath(context.extensionUri, "assets", nameNotes);

		await FileManager.writeFile(fileContents, assetsUri.fsPath);
	});

	context.subscriptions.push(
		cmdEditNotes,
		cmdViewNotes,
		cmdAddNotes
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
