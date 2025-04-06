import * as vscode from "vscode";
import * as marked from "marked";
import * as fs from 'fs';
import { FileManager } from "./FileManager";

export class ViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = "vscodeSidebar.openview";

    private view?: vscode.WebviewView;

    private fileManager: FileManager;

    constructor(private readonly extensionUri: vscode.Uri) {
        this.fileManager = new FileManager();
    }

    resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext<unknown>,
        token: vscode.CancellationToken
    ): void | Thenable<void> {
        const uriNotes = webviewView.webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, "assets", "notes.md"));

        this.fileManager.loadFile(uriNotes.fsPath);

        this.view = webviewView;

        webviewView.webview.options = {
        // Allow scripts in the webview
        enableScripts: true,
        localResourceRoots: [this.extensionUri],
        };
        webviewView.webview.html = this.getHTML(webviewView.webview);

        webviewView.onDidChangeVisibility(ev => {
            webviewView.webview.html = this.getHTML(webviewView.webview);
            console.log("Hello!");
        });

        const message = "Loaded View!";
        vscode.window.showInformationMessage(message);

        console.log(message);
    }

    private getHTML(webview: vscode.Webview): string{
        // Get the local path to main script run in the webview,
        // then convert it to a uri we can use in the webview.
        const uriCheatSheet = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, "assets", "markdown_cheatsheet.jpg"));

        const uriMarkdown = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, "assets", "notes.md"));

        const markdownContents = "";//marked.parse(this.fileManager.getFile());

        return `<!DOCTYPE html>
                <html lang="en">

                    <head>
                        <meta charset="UTF-8">
                    </head>

                    <body>
                        <img src="${uriCheatSheet}">
                    </body>

                    <div id="content">
                        ${markdownContents}
                    </div>

                </html>`;
    }
}