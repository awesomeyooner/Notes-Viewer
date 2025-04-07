import * as fs from 'fs';
import * as path from 'path';
import * as vscode from "vscode"

export class NoteManager{
 
    constructor(){}   

    public static async getFiles(folderPath : string) : Promise<vscode.QuickPickItem[]>{
        var files : vscode.QuickPickItem[] = [];

        fs.readdirSync(folderPath).forEach(file => {
            var item : vscode.QuickPickItem = {
                label: file
                //   description: "Test1 Description",
			    //   detail: "$(files) Test1 Detail with icon",
            };

            files.push(item);
        })

        return files;
    };

    public static async askForFolder() : Promise<string>{
        var folder : string = "";
        
        const options: vscode.OpenDialogOptions = {
            canSelectMany: false,
            canSelectFiles: false,
            canSelectFolders: true,
            openLabel: 'Open',
            filters: {
                'All Folders': ['*']
            }
        };
        
        await vscode.window.showOpenDialog(options).then(folderUri => {
            if (folderUri && folderUri[0]) {
                folder = folderUri[0].fsPath;
                console.log('Selected folder: ' + folderUri[0].fsPath);

            }
        });

        return folder;
    }

    public static async askForFileInFolder(folder : string) : Promise<string>{
        let items: vscode.QuickPickItem[] = await NoteManager.getFiles(folder);
        
        var outputFile = await vscode.window.showQuickPick(items);

        var file : string = outputFile === undefined ? "" : outputFile.label;

        return file;
    }
}