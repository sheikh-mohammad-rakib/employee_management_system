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
 * Calls the GitHub AI Models inference endpoint synchronously using GITHUB_TOKEN.
 */
export async function callGitHubAI(
  messages: ChatMessage[],
  options: GitHubAIOptions = {}
): Promise<string> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("GITHUB_TOKEN is not configured in environment variables.");
  }

  const endpoint = "https://models.github.ai/inference/chat/completions";
  const model = options.model || "openai/gpt-4.1-mini";

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
    throw new Error(`GitHub AI Inference error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}
