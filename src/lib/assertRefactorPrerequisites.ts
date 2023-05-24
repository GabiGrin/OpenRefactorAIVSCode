import * as vscode from "vscode";
import { getApiKey } from "./apiKeyStorage";

export function assertRefactorPrerequisites() {
  if (!getApiKey()) {
    vscode.window.showInformationMessage(
      "No OpenAI API key set. Please use the command 'OpenRefactorAI: Set OpenAI API key' to set your key."
    );
    return;
  }

  const selection = vscode.window.activeTextEditor?.selection;

  if (vscode.window.activeTextEditor?.selections.length !== 1) {
    vscode.window.showInformationMessage(
      "Please select a single block of text to refactor"
    );
    return;
  }

  const selectedText =
    vscode.window.activeTextEditor?.document.getText(selection);

  if (!selectedText || !selection) {
    vscode.window.showInformationMessage("No text selected");
    return;
  }
}
