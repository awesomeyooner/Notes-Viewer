import * as fs from 'fs';
import * as path from 'path';
import * as vscode from "vscode"

export class NoteManager{
 
    constructor(){}   

    public static async getFiles(folderPath : string) : Promise<vscode.QuickPickItem[]>{
        var files : vscode.QuickPickItem[] = [];

        //for each file in the folder
        fs.readdirSync(folderPath).forEach(file => {

            //if the file DOES NOT end with .md skip
            if(!file.endsWith(".md"))
                return;

            //create new item
            var item : vscode.QuickPickItem = {
                label: file
                //   description: "Test1 Description",
			    //   detail: "$(files) Test1 Detail with icon",
            };

            //append this item to the list of all items
            files.push(item);
        })

        //if there are no files then throw error
        if(files.length === 0)
            throw new Error("No files present!");

        return files;
    };

    public static async promptUser(placeHolder : string, value : string, mustEndWith : string = "") : Promise<string>{
        var promptValue = await vscode.window.showInputBox({
            placeHolder: placeHolder,
            value: value
        });

        if(promptValue === undefined)
            throw new Error("Unable to get User Input!");

        if(promptValue.endsWith(mustEndWith))
            return promptValue;
        else{
            return promptValue += mustEndWith;
        }
    }

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
        
        //ask for a folder, then set the value equal to the folder variable
        await vscode.window.showOpenDialog(options).then(folderUri => {
            if (folderUri && folderUri[0]) {
                folder = folderUri[0].fsPath;
                console.log('Selected folder: ' + folderUri[0].fsPath);

            }
        });

        //if the folder name is empty then throw error
        if(folder === "")
            throw new Error("Unable to open folder!");

        return folder;
    }

    public static async askForFile() : Promise<string>{

        var file = "";

        const options: vscode.OpenDialogOptions = {
            canSelectMany: false,
            canSelectFiles: true,
            canSelectFolders: false,
            openLabel: 'Open',
            filters: {
                'Markdown Files': ['md'],
                'All Files': ['*']
            }
        };

        await vscode.window.showOpenDialog(options).then(fileUri => {
            if (fileUri && fileUri[0]) {
                file = fileUri[0].fsPath;
                console.log('Selected file: ' + fileUri[0].fsPath);

            }
        });

        if(file === "")
            throw new Error("Unable to open file!");

        return file;
    }

    public static async askForFileInFolder(folder : string) : Promise<string>{
        let items: vscode.QuickPickItem[] = await NoteManager.getFiles(folder);
        
        //ask for the file and set it equal to this variable
        var outputFile = await vscode.window.showQuickPick(items);

        //if no file has been selected then throw error
        if(outputFile === undefined)
            throw new Error("Unable to open file!");

        var file : string = outputFile.label;

        return file;
    }
}