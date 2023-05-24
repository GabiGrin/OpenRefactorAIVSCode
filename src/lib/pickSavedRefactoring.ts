import { SavedRefactoring, getSavedRefactors } from "./savedRefactorings";

import * as vscode from "vscode";

export type SavedRefactoringPick =
  | {
      type: "saved";
      refactoring: SavedRefactoring;
    }
  | {
      type: "new";
    }
  | undefined;

export async function pickSavedRefactoring(): Promise<SavedRefactoringPick> {
  const saved = await getSavedRefactors();

  const quickPicks = saved.map<vscode.QuickPickItem & SavedRefactoringPick>(
    (refactoring) => ({
      label: refactoring.name,
      description: refactoring.instructions,
      detail: `Used: ${refactoring.timesUsed} times | Total tokens used: ${refactoring.totalTokensUsed}`,
      name: refactoring.name,
      refactoring,
      type: "saved",
    })
  );

  const selectedQuickPick = await vscode.window.showQuickPick([
    {
      label: "Create new refactor",
      type: "new",
    } as (typeof quickPicks)[0],
    { kind: vscode.QuickPickItemKind.Separator, label: "", type: "new" },
    ...quickPicks,
  ] as typeof quickPicks);

  if (!selectedQuickPick) {
    vscode.window.showInformationMessage("No refactor selected");
    return;
  }

  return selectedQuickPick;
}
