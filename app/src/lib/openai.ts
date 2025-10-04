import OpenAI from "openai";

export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function mockRewrite(input: string): Promise<string> {
  // Placeholder until API is wired
  return `Rewritten: ${input.slice(0, 200)}...`;
}



