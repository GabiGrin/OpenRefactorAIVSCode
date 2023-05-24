import { generateRefactoredCode } from "./generateRefactoredCode";
import * as vscode from "vscode";

export async function applyRefactoring(
  instructions: string,
  selection: vscode.Selection
): Promise<{ tokensUsed: number }> {
  const selectedText =
    vscode.window.activeTextEditor?.document.getText(selection);

  if (!selectedText) {
    throw new Error(
      "Unexpected state: no text selected when applying refactoring"
    );
  }

  const now = Date.now();

  const { tokensUsed, result } = await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: "OpenRefactorAI Progress",
    },
    async (progress) => {
      let lastValue = 0;
      return generateRefactoredCode(
        selectedText,
        instructions,
        (progressValue) => {
          const delta = Math.max(0, progressValue - lastValue);
          progress.report({
            increment: Math.round(delta * 100),
            message: `${(progressValue * 100).toFixed(
              1
            )}% (guesstimated progress)`,
          });
          lastValue = progressValue;
        }
      );
    }
  );

  const timeTaken = Date.now() - now;

  vscode.window.showInformationMessage(
    `Refactoring complete. ${tokensUsed} tokens used. Took ${timeTaken}ms. Estimated cost: $${(
      (tokensUsed / 1000) *
      0.002
    ).toFixed(5)}`
  );

  vscode.window.activeTextEditor?.edit((editBuilder) => {
    editBuilder.replace(selection, result);
  });

  return { tokensUsed };
}
