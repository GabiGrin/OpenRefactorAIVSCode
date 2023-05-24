/* eslint-disable @typescript-eslint/naming-convention */
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { CommandTypes, setCommandsRouter } from "./router";
import { getApiKey, setApiKey } from "./storage";
import { refactor } from "./refactor";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  setCommandsRouter(
    {
      [CommandTypes.SET_OPEN_AI_KEY]: async () => {
        const apiKeyFromUser = await vscode.window.showInputBox({
          placeHolder: "Enter your OpenAI API key",
          prompt: "Enter your OpenAI API key",
          password: true,
        });
        setApiKey(apiKeyFromUser ?? "");
        vscode.window.showInformationMessage("OpenAI API key set");
      },
      [CommandTypes.REMOVE_OPEN_AI_KEY]: async () => {
        setApiKey("");
        vscode.window.showInformationMessage("OpenAI API key removed");
      },
      [CommandTypes.REFACTOR]: async () => {
        const apiKey = getApiKey();
        if (!apiKey) {
          vscode.window.showInformationMessage(
            "No OpenAI API key set. Please use the command 'OpenRefactorAI: Set OpenAI API key' to set your key."
          );
          return;
        }

        const selection = vscode.window.activeTextEditor?.selection;

        const selectedText =
          vscode.window.activeTextEditor?.document.getText(selection);

        if (!selectedText || !selection) {
          vscode.window.showInformationMessage("No text selected");
          return;
        }

        const instructions = await vscode.window.showInputBox({
          placeHolder:
            "change all occurrences of 'foo' to 'bar' and all occurrences of 'baz' to 'qux'",
          prompt:
            "Please provide instructions on the refactoring. Provide examples for best results",
        });

        if (!instructions || instructions?.length < 10) {
          vscode.window.showInformationMessage("Instructions too short");
          return;
        }

        vscode.window.showInformationMessage(
          "Refactoring in progress. This may take a while"
        );

        try {
          const now = Date.now();
          await vscode.window.withProgress(
            {
              location: vscode.ProgressLocation.Notification,
              title: "OpenRefactorAI Progress",
            },
            async (progress) => {
              let lastValue = 0;
              const { result, tokensUsed } = await refactor(
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
            }
          );
        } catch (e) {
          vscode.window.showInformationMessage(
            `Error from OpenAI: ${
              e instanceof Error
                ? e.message
                : new Error("unknown error").message
            }`
          );
        }
      },
    },
    context
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}
