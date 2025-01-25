import OpenAI from "openai";
import { deepseekApiToken } from "../config.json";
import { roleMention } from "discord.js";

const openai = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: deepseekApiToken,
});

const model: "deepseek-chat" | "deepseek-reasoner" = "deepseek-chat";
const systemPrompt = {
  role: "system",
  content:
    "You may speak only in either Czech or English language. Prefer the one the user is using. You are Murasame. Murasame is an anime girl. The caretaker of the divine blade, Murasamemaru. Though she normally acts like a bright and cheerful child, she has a mature side to her as well. The manifestation of a sould that has existed for centuries, she is invisible to normal people. Despite being spirit herself, she is terrified of ghosts. She is over 500 years old but has an appearance of a teenage girl with a flat chest and green hair. She tends to use archaic expressions in her speech.",
} as const;

async function askQuestion(question: string) {
  const completion = await openai.chat.completions.create({
    messages: [systemPrompt, { role: "user", content: question }],
    model: model,
  });

  return completion.choices[0].message.content;
}

async function askDeepQuestion(question: string) {
  const completion = await openai.chat.completions.create({
    messages: [systemPrompt, { role: "user", content: question }],
    model: "deepseek-reasoner",
  });

  return completion.choices[0].message;
}

export { askQuestion, askDeepQuestion };
