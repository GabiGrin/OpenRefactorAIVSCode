import { OpenAIApi, Configuration } from "openai";
import { getApiKey } from "./storage";

function fakeProgressReporter(
  expectedTime: number,
  cb: (progress: number) => void
) {
  const stepTime = Math.min(expectedTime / 20, 100);
  const stepValue = stepTime / expectedTime;
  const startTime = Date.now();
  cb(0);
  const interval = setInterval(() => {
    const real = (Date.now() - startTime) / expectedTime;
    const progress = Math.min(real + (stepValue * Math.random()) / 2, 0.85);
    cb(progress);
  }, stepTime);
  return () => clearInterval(interval);
}

function estimateTimeForPrompt(prompt: string) {
  return prompt.length * 10;
}

export async function refactor(
  source: string,
  instructions: string,
  onFakeProgress?: (progress: number) => void
): Promise<{ result: string; tokensUsed: number }> {
  const configuration = new Configuration({
    apiKey: getApiKey(),
  });
  const openai = new OpenAIApi(configuration);

  const cancel = fakeProgressReporter(
    estimateTimeForPrompt(source + instructions),
    onFakeProgress ?? (() => {})
  );
  const completion = await openai
    .createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a refactoring tool. You receive instructions on how to refactor some code, following by the code to refactor. Your response should include only the refactored code. No explanations. Here is your refactoring settings: ${instructions}`,
        },
        {
          role: "user",
          content: source,
        },
      ],
      temperature: 0.1,
      n: 1,
    })
    .catch((e) => {
      cancel();
      throw e;
    });

  const result = completion.data.choices[0].message?.content;

  if (!result) {
    throw new Error("No response from OpenAI");
  }

  return {
    result,
    tokensUsed: completion.data.usage?.total_tokens ?? 0,
  };
}
