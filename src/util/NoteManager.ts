import { errorMonitor } from 'events';
import * as fs from 'fs';
import * as path from 'path';
import { PerformanceObserverEntryList } from 'perf_hooks';
import * as vscode from "vscode"

export class NoteManager{
 
    constructor(){}   

    public static async getConfigurationAttribute(attribute : string, extension : string = "notes-viewer") : Promise<any>{
        const config : vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration(extension);

        let configValue = await config.get(attribute);

        if(configValue === undefined)
            throw new Error("Could not read configuration!");

        return configValue;
    }

    public static async writeConfigurationAttribute(attribute : string, value : string, extension : string = "notes-viewer"){
        const config : vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration(extension);

        if(value === null || value === undefined || value === "")
            throw new Error("Value is Empty!");

        await config.update(attribute, value, vscode.ConfigurationTarget.Global);
    }

    public static async getFiles(folderPath : string) : Promise<vscode.QuickPickItem[]>{
        var files : vscode.QuickPickItem[] = [];

        //for each file in the folder
        fs.readdirSync(folderPath).forEach(
            file => {
                // If the file DOES NOT end with .md skip
                if(!file.endsWith(".md")){
                    return;
                }

                //create new item
                var item : vscode.QuickPickItem = {
                    label: file
                    //   description: "Test1 Description",
                    //   detail: "$(files) Test1 Detail with icon",
                };

                //append this item to the list of all items
                files.push(item);
            }
        );

        // If there are no files, then throw error
        if(files.length === 0){
            throw new Error("No files present!");
        }

        return files;
    };

    public static async getSubFolders(rootFolder : string, ignoreHiddenFolders = true, includeDoubleDots = true) : Promise<vscode.QuickPickItem[]>{
        var folders : vscode.QuickPickItem[] = [];

        // For each element in the folder,
        // If the element is a folder, then add it to the list
        fs.readdirSync(rootFolder, {withFileTypes: true}).forEach(
            element => {
                
                // If the element isn't a directory
                // Then skip
                if(!element.isDirectory()){
                    return;
                }

                // If ignore hidden folders
                // Then check if the name starts with "." indicating a hidden folder
                // and skip it if it does
                if(ignoreHiddenFolders && element.name.startsWith('.')){
                    return;
                }

                //create new item
                var item : vscode.QuickPickItem = {
                    label: element.name,
                    description: "Folder"
                };
                    folders.push(item);
            }
        ); 

        // If include double dots
        // Then add to the list
        if(includeDoubleDots){
            folders.unshift(
                {
                    label: "..",
                    description: "Folder"
                }
            );
        }

        // If there aren't any folders
        // Then throw an error
        // NOTE: If `includeDoubleDots = true` then the length will always >= 1
        if(folders.length === 0){
            throw new Error("No files present!");
        }

        // Return the list of folders
        return folders;
    }

    public static async promptUser(placeHolder : string, value : string, mustEndWith : string = "") : Promise<string>{

        // Prompt the user for their input
        var promptValue = await vscode.window.showInputBox({
            placeHolder: placeHolder,
            value: value
        });

        // If the user didn't enter anything
        // Then throw an error
        if(promptValue === undefined){
            throw new Error("Unable to get User Input!");
        }

        // If the user input a name with the file extension
        // Then just return it
        if(promptValue.endsWith(mustEndWith)){
            return promptValue;
        }
        // If the user didn't put the file extension
        // Then append it to the input and return it
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
        
        // Ask for a folder, then set the value equal to the folder variable
        await vscode.window.showOpenDialog(options).then(folderUri => {
            if (folderUri && folderUri[0]) {
                folder = folderUri[0].fsPath;
                console.log('Selected folder: ' + folderUri[0].fsPath);

            }
        });

        // If the folder name is empty then throw error
        if(folder === ""){
            throw new Error("Unable to open folder!");
        }

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

    public static async askForFileInFolder(folder : string, defaultFile : string = "") : Promise<string>{
        let items: vscode.QuickPickItem[] = await NoteManager.getFiles(folder);

        var defaultItem : vscode.QuickPickItem = {label: defaultFile, description: "Default File"};

        // If there is a default option, display it
        // at the top of the list (unshift)
        if(defaultItem.label !== ""){
            items.unshift(defaultItem);
        }
        
        //ask for the file and set it equal to this variable
        var outputFile = await vscode.window.showQuickPick(items);

        //if no file has been selected then throw error
        if(outputFile === undefined)
            throw new Error("Unable to open file!");

        var file : string = outputFile.label;

        return file;
    }

    public static async askForElementInFolder(parentFolder : string, defaultFile : string = "") : Promise<string>{

        let parentURI : vscode.Uri = vscode.Uri.file(parentFolder);
        
        let subdirectoryPath : vscode.Uri = vscode.Uri.file("");

        while(true)
        {
            let items: vscode.QuickPickItem[] = [];

            let files: vscode.QuickPickItem[] = [];

            // Try to get files
            try{

                console.log(vscode.Uri.joinPath(parentURI, subdirectoryPath.path).fsPath);

                files = await NoteManager.getFiles(
                    vscode.Uri.joinPath(parentURI, subdirectoryPath.path).fsPath
                );

                console.log(files.length);
            }
            catch(error : any){

                // If the folder has no files and you're not at root 
                // Then move up a directory
                if(files.length === 0 && subdirectoryPath.path !== "/"){

                    // Move up a directory and skip
                    subdirectoryPath = vscode.Uri.joinPath(subdirectoryPath, '..');

                    // Tell the user that the subdir doesn't have valid elements
                    vscode.window.showInformationMessage('Subdirectory did not contain any valid files!');
                    continue;
                }
            }

            let folders: vscode.QuickPickItem[] = [];

            // Try to get folders
            try{
                folders = await NoteManager.getSubFolders(
                    vscode.Uri.joinPath(parentURI, subdirectoryPath.path).fsPath
                );
            }
            catch(error : any){}

            // If there's no folders nor files
            // Then throw an error
            if(folders.length === 0 && files.length === 0){
                throw new Error("No Items in Directory!");
            }
            
            // Get the default file
            var defaultItem : vscode.QuickPickItem = {
                label: defaultFile,
                description: "Default File"
            };

            // Folders first then files
            items = items.concat(folders).concat(files);

            // If there is a default option, display it
            // at the top of the list (unshift)
            if(defaultItem.label !== ""){
                items.unshift(defaultItem);
            }

            // Prompt the user to select an element
            var selectedElement = await vscode.window.showQuickPick(items);
            
            // If nothing has been selected 
            // Then throw error
            if(selectedElement === undefined){
                throw new Error("Unable to open file!");
            }

            // If user selected a folder, then restart the
            // Quick Pick list with the new folder as the root
            if(selectedElement.description === "Folder"){
                subdirectoryPath = vscode.Uri.joinPath(subdirectoryPath, selectedElement.label);

                continue;
            }

            else{
                var file : string = vscode.Uri.joinPath(subdirectoryPath, selectedElement.label).path;

                return file;
            }
        }
    }
}