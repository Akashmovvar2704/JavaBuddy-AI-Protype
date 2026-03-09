import { GoogleGenAI } from "@google/genai";
import { Message } from "../types";

const SYSTEM_INSTRUCTION = `You are JavaBuddy, an expert Java programming assistant. 
Your goal is to help beginners and intermediate developers learn Java.
Your tasks include:
1. Explaining Java code in simple, beginner-friendly language.
2. Finding and explaining errors in Java code.
3. Suggesting improvements for performance, readability, and best practices.
4. Generating Java code based on user requirements.

Guidelines:
- Always use code blocks for Java code.
- Keep explanations concise and easy to understand.
- Use analogies when helpful.
- If the user provides broken code, point out the specific line and explain WHY it's wrong.
- Encourage the user to try things out.
- If the user asks something non-Java related, politely redirect them back to Java programming.`;

export async function getChatResponse(messages: Message[]) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  // Convert our message format to Gemini format
  const history = messages.slice(0, -1).map(m => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }]
  }));

  const lastMessage = messages[messages.length - 1].content;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: [...history, { role: 'user', parts: [{ text: lastMessage }] }],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7,
    },
  });

  return response.text || "I'm sorry, I couldn't generate a response.";
}
