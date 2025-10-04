// src/chat.js
import { ChatGroq } from "@langchain/groq";
import { HumanMessage } from "@langchain/core/messages";

// Use Vite env variable
const groqApiKey = import.meta.env.VITE_GROQ_API_KEY;

if (!groqApiKey) {
  throw new Error("GROQ API Key not found! Add it to your .env file.");
}

const groq = new ChatGroq({
  apiKey: groqApiKey,
  model: "llama-3.3-70b-versatile",
});

export async function sendMsgToOpenAI(message) {
  try {
    const res = await groq.invoke([new HumanMessage(message)]);
    return res.content;
  } catch (error) {
    console.error("Groq API Error:", error);
    return "Error: Unable to get response.";
  }
}
