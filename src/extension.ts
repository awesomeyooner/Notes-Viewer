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

	let cmdEditNotes = vscode.commands.registerCommand('notes-viewer.edit-notes', async () => {
		vscode.window.showInformationMessage('Editting...');

		const assetsFolder = vscode.Uri.joinPath(context.extensionUri, "assets");

		const defaultNote = await NoteManager.getConfigurationAttribute("default_note");

		const file = await NoteManager.askForFileInFolder(assetsFolder.fsPath, defaultNote);

		await NoteManager.writeConfigurationAttribute("default_note", file);

		const fullFilePath = vscode.Uri.joinPath(assetsFolder, file);

		vscode.window.showTextDocument(fullFilePath, { preview: false, viewColumn: getSideEditor()});
	});

	let cmdViewNotes = vscode.commands.registerCommand('notes-viewer.view-notes', async () => {
		
		vscode.window.showInformationMessage('Entering View Mode...');

		const assetsFolder = vscode.Uri.joinPath(context.extensionUri, "assets");

		const defaultNote = await NoteManager.getConfigurationAttribute("default_note");

		const file = await NoteManager.askForFileInFolder(assetsFolder.fsPath, defaultNote);

		await NoteManager.writeConfigurationAttribute("default_note", file);
		
		var fullFilePath = vscode.Uri.joinPath(assetsFolder, file);

		await vscode.window.showTextDocument(fullFilePath, { preview: false, viewColumn: getSideEditor()});

		await vscode.commands.executeCommand("markdown.showPreview", fullFilePath);
	});

	let cmdAddNotes = vscode.commands.registerCommand('notes-viewer.add-notes', async () => {

		vscode.window.showInformationMessage('Adding Notes...');

		const filePath = await NoteManager.askForFile();
		const newName = await NoteManager.promptUser("Type the Name of Your Notes", "my_notes.md", ".md");

		const fileContents = await FileManager.readFile(filePath);

		const assetsUri = vscode.Uri.joinPath(context.extensionUri, "assets", newName);

		await FileManager.writeFile(fileContents, assetsUri.fsPath);
	});

	let cmdRemoveNotes = vscode.commands.registerCommand('notes-viewer.remove-notes', async () => {

		vscode.window.showInformationMessage('Entering View Mode...');

		const assetsFolder = vscode.Uri.joinPath(context.extensionUri, "assets");

		const file = await NoteManager.askForFileInFolder(assetsFolder.fsPath);

		const fullFilePath = vscode.Uri.joinPath(assetsFolder, file);

		await FileManager.deleteFile(fullFilePath.fsPath);
	});

	context.subscriptions.push(
		cmdEditNotes,
		cmdViewNotes,
		cmdAddNotes,
		cmdRemoveNotes
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
