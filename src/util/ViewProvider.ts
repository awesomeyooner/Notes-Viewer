import * as vscode from "vscode";

export class ViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "vscodeSidebar.openview";

  private view?: vscode.WebviewView;

  constructor(private readonly extensionUri: vscode.Uri) {}

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext<unknown>,
    token: vscode.CancellationToken
  ): void | Thenable<void> {
    this.view = webviewView;

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,
      localResourceRoots: [this.extensionUri],
    };
    webviewView.webview.html = this.getHTML(webviewView.webview);
  }

  private getHTML(webview: vscode.Webview): string {
    // Get the local path to main script run in the webview,
    // then convert it to a uri we can use in the webview.
    const uriCheatSheet = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, "assets", "markdown_cheatsheet.jpg"));

    return `<!DOCTYPE html>
			<html lang="en">

                <head>
                    <meta charset="UTF-8">
                </head>

                <body>
                    <p> hello world </p>
                    <img src="${uriCheatSheet}">
                </body>

			</html>`;
  }
}