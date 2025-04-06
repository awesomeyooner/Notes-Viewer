import * as vscode from "vscode";
import * as marked from 'marked'

export class ViewProvider implements vscode.WebviewViewProvider{

    public static readonly viewType = "vscodeSidebar.openview";

    private view?: vscode.WebviewView;

    constructor(private readonly extensionUri: vscode.Uri){}

    resolveWebviewView(
        webviewView: vscode.WebviewView, 
        context: vscode.WebviewViewResolveContext, 
        token: vscode.CancellationToken
    ): Thenable<void> | void {
        this.view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this.extensionUri],
        };

        webviewView.webview.html = this.getHTML(webviewView.webview);
    }

    private getHTML(webview: vscode.Webview) : string{

        const uriCheatSheet = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, "assets", "markdown_cheatsheet.jpg"));

        return `
        <!DOCTYPE html>
        <html lang="en">
			<head>
            <meta charset="UTF-8">
            </head>

            <body>

                <img src='${uriCheatSheet}/>
            
            </body>
        `;
    }
}