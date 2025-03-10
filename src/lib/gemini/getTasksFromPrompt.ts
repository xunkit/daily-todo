"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function getTasksFromPrompt(prompt: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  const instruction = process.env.GEMINI_GET_TASKS_FROM_PROMPT_INSTRUCTION;
  if (!apiKey) {
    throw new Error("API Key not found");
  }

  if (!instruction) {
    throw new Error("Instruction not found");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const input: string = `${instruction} ${prompt}`;

  try {
    const output = (await model.generateContent(input)).response.text();
    const cleanedOutput = output
      .toString()
      .replace("```json\n", "") // Remove the backticks and "json"
      .replace("```", "") // Remove the trailing backticks
      .trim(); // Remove any leading/trailing whitespace
    try {
      const outputJSON = JSON.parse(cleanedOutput);
      return outputJSON;
    } catch (jsonError) {
      if (jsonError instanceof SyntaxError) {
        throw new Error("Invalid Request. Please try a different prompt.");
      }
    }
  } catch (error) {
    throw error;
  }
}
