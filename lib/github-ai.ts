export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface GitHubAIOptions {
  model?: string;
  temperature?: number;
  top_p?: number;
}

/**
 * Calls the AI inference endpoint synchronously using AI_API_KEY.
 */
export async function callGitHubAI(
  messages: ChatMessage[],
  options: GitHubAIOptions = {}
): Promise<string> {
  const token = process.env.AI_API_KEY;
  if (!token) {
    throw new Error("AI_API_KEY is not configured in environment variables.");
  }

  const endpoint = process.env.AI_BASE_URL;
  if (!endpoint) {
    throw new Error("AI_BASE_URL is not configured in environment variables.");
  }
  const model = options.model || process.env.AI_MODEL;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({
      messages,
      temperature: options.temperature ?? 1.0,
      top_p: options.top_p ?? 1.0,
      model,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI Inference error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}
