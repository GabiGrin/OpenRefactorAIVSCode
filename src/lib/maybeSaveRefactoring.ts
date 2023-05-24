import * as vscode from "vscode";
import { saveNewRefactor } from "./savedRefactorings";

export async function maybeSaveRefactoring(
  instructions: string,
  tokensUsed: number
) {
  // suggest to save it
  const save = await vscode.window.showInformationMessage(
    "Would you like to save this refactoring? it will be saved locally in your workspace in the .open-refactor folder",
    "Yes",
    "No"
  );

  if (save === "Yes") {
    const name = await vscode.window.showInputBox({
      placeHolder: "Enter a name for this refactoring",
      prompt: "Enter a name for this refactoring",
    });

    if (!name) {
      vscode.window.showInformationMessage("No name provided");
      return;
    }

    try {
      await saveNewRefactor({
        name,
        instructions,
        totalTokensUsed: tokensUsed,
      });
      vscode.window.showInformationMessage(
        "Refactoring saved! You can load it later with the 'OpenRefactorAI: Load Refactor' command"
      );
    } catch (e) {
      vscode.window.showInformationMessage(
        `Error saving refactor: ${
          e instanceof Error ? e.message : new Error("unknown error").message
        }`
      );
    }
  }
}
