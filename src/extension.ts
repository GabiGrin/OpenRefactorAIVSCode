/* eslint-disable @typescript-eslint/naming-convention */
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { CommandTypes, setCommandsRouter } from "./commandsRouter";
import { setApiKey } from "./lib/apiKeyStorage";

import {
  SavedRefactoring,
  getSavedRefactors,
  saveRefactorUsage,
} from "./lib/savedRefactorings";
import { maybeSaveRefactoring } from "./lib/maybeSaveRefactoring";
import { assertRefactorPrerequisites } from "./lib/assertRefactorPrerequisites";
import { applyRefactoring } from "./lib/applyRefactoring";
import { pickSavedRefactoring } from "./lib/pickSavedRefactoring";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  setCommandsRouter(
    {
      [CommandTypes.setOpenAiKey]: async () => {
        const apiKeyFromUser = await vscode.window.showInputBox({
          placeHolder: "Enter your OpenAI API key",
          prompt: "Enter your OpenAI API key",
          password: true,
        });
        setApiKey(apiKeyFromUser ?? "");
        vscode.window.showInformationMessage("OpenAI API key set");
      },
      [CommandTypes.resetOpenAiKey]: async () => {
        setApiKey("");
        vscode.window.showInformationMessage("OpenAI API key removed");
      },
      [CommandTypes.refactor]: async () => {
        assertRefactorPrerequisites();

        const pick = await pickSavedRefactoring();

        if (!pick) {
          vscode.window.showInformationMessage("No option selected");
          return;
        } else if (pick.type === "new") {
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

          try {
            const { tokensUsed } = await applyRefactoring(
              instructions,
              vscode.window.activeTextEditor?.selection!
            );

            await maybeSaveRefactoring(instructions, tokensUsed);
          } catch (e) {
            vscode.window.showInformationMessage(
              `Error from OpenAI: ${
                e instanceof Error
                  ? e.message
                  : new Error("unknown error").message
              }`
            );
          }
        } else {
          try {
            const { tokensUsed } = await applyRefactoring(
              pick.refactoring.instructions,
              vscode.window.activeTextEditor?.selection!
            );

            await saveRefactorUsage(pick.refactoring.name, tokensUsed);
          } catch (e) {
            vscode.window.showInformationMessage(
              `Error from OpenAI: ${
                e instanceof Error
                  ? e.message
                  : new Error("unknown error").message
              }`
            );
          }
        }
      },
    },
    context
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}
