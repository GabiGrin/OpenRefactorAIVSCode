# OpenRefactorAI

Always wanted to refactor a piece of code using the power of AI without leaving your IDE? Now you can!

![Demo](https://github.com/GabiGrin/OpenRefactorAIVSCode/assets/3727015/47ce902b-ea62-4f91-80da-0d8914a8731a)

OpenRefactorAI is a VSCode extension that uses OpenAI to refactor your code according to your instructions. With OpenRefactorAI, you can leverage the power of AI to refactor pieces of code with ease and precision.

## Features

- Select a piece of code and refactor it using OpenAI
- Save refactoring instructions for future use

## Roadmap

- Support refactoring across multiple files
- Better progress indication using a stream response

## How to use

1. Install OpenRefactorAI from the VSCode marketplace.

2. After installing the extension, you will need to set your OpenAI API key. To do this, open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P` on Mac) and enter `OpenRefactorAI: Set OpenAI API key`.

3. Once you've set your API key, select a piece of code you want to refactor, open the Command Palette, and enter `OpenRefactorAI: Refactor`. You will then be asked to provide refactoring instructions.

4. The extension will show a progress bar in the status bar during the refactoring process and inform you when it's complete.

## Requirements

OpenRefactorAI requires an OpenAI API key. To get one, you'll need to sign up for an account on the OpenAI website.

## Extension Settings

This extension contributes the following settings:

- `OpenRefactorAI.apiKey`: Set your OpenAI API key.

## Known Issues

Please report any issues you find on the GitHub issues page at https://github.com/GabiGrin/OpenRefactorAIVSCode/issues.

## Contributing

If you'd like to contribute to OpenRefactorAI, please fork the repository and submit a pull request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
