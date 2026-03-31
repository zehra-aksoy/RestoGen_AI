import { GoogleGenerativeAI } from "@google/generative-ai";

export function getGeminiModel() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY tanımlı değil.");
  }
  const modelName = process.env.GEMINI_MODEL || "gemini-1.5-pro";
  const genAI = new GoogleGenerativeAI(key);
  return genAI.getGenerativeModel({ model: modelName });
}

export async function runVisionJsonPrompt(params: {
  prompt: string;
  mimeType: string;
  base64: string;
}): Promise<string> {
  const model = getGeminiModel();
  const result = await model.generateContent([
    params.prompt,
    {
      inlineData: {
        mimeType: params.mimeType,
        data: params.base64,
      },
    },
  ]);
  const text = result.response.text();
  return text.trim();
}

export async function runTextPrompt(prompt: string): Promise<string> {
  const model = getGeminiModel();
  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}
