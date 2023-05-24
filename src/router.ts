import * as vscode from "vscode";

export enum CommandTypes {
  SET_OPEN_AI_KEY = "openrefactorai.setOpenAiKey",
  REMOVE_OPEN_AI_KEY = "openrefactorai.removeOpenAiKey",
  REFACTOR = "openrefactorai.refactor",
}

type CommandCallback = Parameters<typeof vscode.commands.registerCommand>[1];

export function setCommandsRouter(
  commands: Record<CommandTypes, CommandCallback>,
  context: vscode.ExtensionContext
): void {
  Object.entries(commands).forEach(([command, callback]) => {
    const disposable = vscode.commands.registerCommand(command, callback);
    context.subscriptions.push(disposable);
  });
}
