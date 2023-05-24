import * as vscode from "vscode";
import * as z from "zod";

export interface SavedRefactoring {
  name: string;
  createdAt: number;
  instructions: string;
  timesUsed: number;
  totalTokensUsed: number;
}

function getSavedRefactorsFolder(): vscode.Uri {
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0].uri;
  if (!workspaceRoot) {
    throw new Error("Cannot find workspace root");
  }
  return vscode.Uri.joinPath(workspaceRoot, ".open-refactor");
}

const savedRefactorSchema = z.object({
  name: z.string(),
  createdAt: z.number(),
  instructions: z.string(),
  timesUsed: z.number(),
  totalTokensUsed: z.number(),
});

export async function readRefactor(
  path: vscode.Uri
): Promise<SavedRefactoring> {
  const file = await vscode.workspace.fs.readFile(path);
  const savedRefactor = JSON.parse(file.toString());

  savedRefactorSchema.parse(savedRefactor);

  return savedRefactor;
}

export async function getSavedRefactors(): Promise<SavedRefactoring[]> {
  try {
    const root = getSavedRefactorsFolder();
    const stat = await vscode.workspace.fs.stat(root);
    if (stat.type !== vscode.FileType.Directory) {
      throw new Error(`${root.fsPath} is not a directory`);
    }
    const files = await vscode.workspace.fs.readDirectory(root);
    return Promise.all(
      files.map<Promise<SavedRefactoring | null>>(
        async ([name, type]: [string, vscode.FileType]) => {
          const path = vscode.Uri.joinPath(root, name);

          try {
            const savedRefactor = await readRefactor(path);
            return savedRefactor;
          } catch (e) {
            return null;
          }
        }
      )
    ).then((refactors) =>
      refactors.filter(
        (refactor): refactor is SavedRefactoring => refactor !== null
      )
    );
  } catch (e) {
    return [];
  }
}

export async function saveNewRefactor(
  refactor: Omit<SavedRefactoring, "createdAt" | "timesUsed">
): Promise<void> {
  const savedRefactor: SavedRefactoring = {
    ...refactor,
    createdAt: Date.now(),
    timesUsed: 1,
  };
  const root = getSavedRefactorsFolder();

  try {
    await vscode.workspace.fs.createDirectory(root);
  } catch (e) {
    const stat = await vscode.workspace.fs.stat(root);
    if (stat.type !== vscode.FileType.Directory) {
      throw new Error(`${root.fsPath} is not a directory`);
    }
  }

  const file = vscode.Uri.joinPath(root, `${refactor.name}.json`);

  await vscode.workspace.fs.writeFile(
    file,
    Buffer.from(JSON.stringify(savedRefactor, null, 2))
  );
}

export async function saveRefactorUsage(name: string, tokensUsed: number) {
  const root = getSavedRefactorsFolder();

  const filePath = vscode.Uri.joinPath(root, `${name}.json`);

  let refactor = await readRefactor(filePath);

  refactor = {
    ...refactor,
    timesUsed: refactor.timesUsed + 1,
    totalTokensUsed: refactor.totalTokensUsed + tokensUsed,
  };

  await vscode.workspace.fs.writeFile(
    filePath,
    Buffer.from(JSON.stringify(refactor, null, 2))
  );
}
