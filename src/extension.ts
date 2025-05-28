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

		try{
			const folder = await getDefaultFolder(context);

			const defaultNote = await NoteManager.getConfigurationAttribute("default_note");

			const file = await NoteManager.askForFileInFolder(folder.fsPath, defaultNote);

			await NoteManager.writeConfigurationAttribute("default_note", file);

			const fullFilePath = vscode.Uri.joinPath(folder, file);

			vscode.window.showTextDocument(fullFilePath, { preview: false, viewColumn: getSideEditor()});
		}
		catch(error : any){
			return;
		}
	});

	let cmdViewNotes = vscode.commands.registerCommand('notes-viewer.view-notes', async () => {
		
		vscode.window.showInformationMessage('Entering View Mode...');

		try{
			const folder = await getDefaultFolder(context);

			const defaultNote = await NoteManager.getConfigurationAttribute("default_note");

			const file = await NoteManager.askForFileInFolder(folder.fsPath, defaultNote);

			await NoteManager.writeConfigurationAttribute("default_note", file);
			
			const fullFilePath = vscode.Uri.joinPath(folder, file);

			await vscode.window.showTextDocument(fullFilePath, { preview: false, viewColumn: getSideEditor()});

			await vscode.commands.executeCommand("markdown.showPreview", fullFilePath);
		}
		catch(error : any){
			return;
		}
	});

	let cmdAddNotes = vscode.commands.registerCommand('notes-viewer.add-notes', async () => {

		vscode.window.showInformationMessage('Adding Notes...');

		try{
			const filePath = await NoteManager.askForFile();
			const fileContents = await FileManager.readFile(filePath);

			const newName = await NoteManager.promptUser("Type the Name of Your Notes", "my_notes.md", ".md");

			const fullUri = vscode.Uri.joinPath(await getDefaultFolder(context), newName);

			await FileManager.writeFile(fileContents, fullUri.fsPath);
		}
		catch(error : any){
			return;
		}
	});

	let cmdCreateNew = vscode.commands.registerCommand('notes-viewer.create-new', async () => {

		vscode.window.showInformationMessage('Create New Notes...');

		try{
			const folder = await getDefaultFolder(context);

			const name = await NoteManager.promptUser("Type the Name of Your Notes", "my_notes.md", ".md");

			const fullUri = vscode.Uri.joinPath(folder, name);

			await FileManager.writeFile("", fullUri.fsPath);

			await vscode.window.showTextDocument(fullUri, { preview: false, viewColumn: getSideEditor()});

			await vscode.commands.executeCommand("markdown.showPreview", fullUri);
		}
		catch(error : any){
			return;
		}
	});

	let cmdRemoveNotes = vscode.commands.registerCommand('notes-viewer.remove-notes', async () => {

		vscode.window.showInformationMessage('Entering View Mode...');

		try{
			const folder = await getDefaultFolder(context);

			const file = await NoteManager.askForFileInFolder(folder.fsPath);

			const fullFilePath = vscode.Uri.joinPath(folder, file);

			await FileManager.deleteFile(fullFilePath.fsPath);
		}
		catch(error : any){
			return;
		}
	});

	let cmdSetDefaultFolder = vscode.commands.registerCommand('notes-viewer.set-default-folder', async () => {

		vscode.window.showInformationMessage('Setting Default Folder...');

		try{
			const folder = await NoteManager.askForFolder();

			await NoteManager.writeConfigurationAttribute("default_folder", folder);
		}
		catch(error : any){
			return;
		}
	});

	context.subscriptions.push(
		cmdEditNotes,
		cmdViewNotes,
		cmdAddNotes,
		cmdCreateNew,
		cmdRemoveNotes,
		cmdSetDefaultFolder
	);
}

async function getDefaultFolder(context? : vscode.ExtensionContext) : Promise<vscode.Uri>{

	const folder = await NoteManager.getConfigurationAttribute("default_folder");

	if(folder === "" && context !== undefined)
		return vscode.Uri.joinPath(context.extensionUri, "assets");

	return vscode.Uri.file(folder);
}

function getSideEditor(): vscode.ViewColumn{
	const editor = vscode.window.activeTextEditor;

	if(!editor){
		return vscode.ViewColumn.Active;
	}

	const indexOfActive = editor.viewColumn;
	const totalColumns = vscode.window.visibleTextEditors.length;

	const indexOfWanted = indexOfActive === 1 ? 2 : 1;

	return vscode.ViewColumn.Two;
}

// This method is called when your extension is deactivated
export function deactivate() {}
