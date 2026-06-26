import { aiService } from "./aiService";

export async function askHealthAssistant(message) {
  return aiService.sendMessage({ message });
}

// Replace this implementation with a secure backend call. Never expose an
// OpenAI API key in Vite client environment variables.
export async function askOpenAIThroughBackend(message) {
  return aiService.sendToOpenAIBackend({ message });
}
