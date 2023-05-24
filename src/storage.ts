import * as vscode from "vscode";

export function setApiKey(key: string): void {
  const config = vscode.workspace.getConfiguration();
  config.update("openrefactorai.openAiKey", key, true);
}

export function getApiKey(): string | undefined {
  const config = vscode.workspace.getConfiguration();
  return config.get("openrefactorai.openAiKey") || undefined;
}
