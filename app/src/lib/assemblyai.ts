import { AssemblyAI } from "assemblyai";

export const assembly = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY || "" });

export async function mockTranscribe(): Promise<{ text: string; speakers?: string[] }> {
  return { text: "[Mock transcript] Hello world.", speakers: ["Speaker A", "Speaker B"] };
}



