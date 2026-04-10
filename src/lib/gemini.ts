import { Platform, Tone, AIReviewResponse } from "../types";

// ──────────────────────────────────────────────────────────────
// Internal helper: call the server-side text generation endpoint
// (uses OpenRouter on the back-end)
// ──────────────────────────────────────────────────────────────
const generateText = async (
  prompt: string,
  systemPrompt?: string
): Promise<string> => {
  const response = await fetch("/api/generate/text", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, systemPrompt }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(err.error || "Text generation failed");
  }

  const data = await response.json();
  return data.text || "";
};

// ──────────────────────────────────────────────────────────────
// Fetch a prompt template from the server's /api/prompts/:id
// ──────────────────────────────────────────────────────────────
const fetchPrompt = async (id: string, variables: Record<string, any>) => {
  try {
    const response = await fetch(`/api/prompts/${id}`);
    const data = await response.json();
    let content = data.content || "";
    // Remove markdown header if present
    content = content.replace(/^# .*\n/, "");
    // Replace template variables
    Object.entries(variables).forEach(([key, value]) => {
      content = content.replaceAll(`\${${key}}`, String(value));
    });
    return content;
  } catch (error) {
    console.error(`Failed to fetch prompt ${id}:`, error);
    return "";
  }
};

// ──────────────────────────────────────────────────────────────
// Extract a JSON structure from an LLM response that may contain
// markdown code fences or extra prose.
// ──────────────────────────────────────────────────────────────
const extractJson = (text: string): string => {
  // Strip ```json ... ``` or ``` ... ``` blocks
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  // Look for first { ... } or [ ... ] block
  const obj = text.match(/\{[\s\S]*\}/);
  if (obj) return obj[0];
  const arr = text.match(/\[[\s\S]*\]/);
  if (arr) return arr[0];
  return text;
};

// ──────────────────────────────────────────────────────────────
// Public API – same signatures as before
// ──────────────────────────────────────────────────────────────

export const generateCopy = async (
  platform: Platform,
  topic: string,
  tone: Tone,
  _existingCopy?: string
) => {
  let prompt = await fetchPrompt(`${platform}_copy`, { topic, tone });

  if (!prompt) {
    prompt = `Write a ${tone} social media post for ${platform} about: "${topic}".
Rules:
- Match the tone (${tone}) and platform norms for ${platform}
- ${platform === "twitter" ? "Keep it under 280 characters." : ""}
- Return ONLY the post body. No hashtags, no preamble, no quotes.`;
  }

  return await generateText(prompt);
};

export const generateRedditTitle = async (topic: string) => {
  const prompt = `You are writing a Reddit post title about: "${topic}".
Rules:
- Maximum 200 characters
- Make it curiosity-driven or value-clear
- Avoid clickbait. Reddit users are perceptive.
- Do not use "I" as the first word unless it adds authenticity
- Return only the title text. No quotes, no preamble.`;

  return await generateText(prompt);
};

export const generateHashtags = async (
  platform: Platform,
  topic: string,
  count: number = 5
) => {
  let prompt = await fetchPrompt("hashtags", { platform, topic, count });

  if (!prompt) {
    prompt = `Generate ${count} relevant hashtags for a ${platform} post about "${topic}".
Return ONLY a JSON array of strings, e.g. ["#tag1", "#tag2"]. No explanation.`;
  }

  const systemPrompt =
    'Respond with a valid JSON array of hashtag strings only. Example: ["#marketing", "#growth"]';

  try {
    const text = await generateText(prompt, systemPrompt);
    return JSON.parse(extractJson(text)) as string[];
  } catch {
    return [];
  }
};

export const generateVisualIdeas = async (
  platform: Platform,
  topic: string,
  count: number = 3
) => {
  let prompt = await fetchPrompt("visual_ideas", { platform, topic, count });

  if (!prompt) {
    prompt = `Suggest ${count} creative visual concepts for a ${platform} post about "${topic}".
Return ONLY a JSON array of strings, each describing one visual idea concisely. No extra explanation.`;
  }

  const systemPrompt =
    'Respond with a valid JSON array of strings only. Example: ["A bold flat-design infographic", "A candid behind-the-scenes photo"]';

  try {
    const text = await generateText(prompt, systemPrompt);
    return JSON.parse(extractJson(text)) as string[];
  } catch {
    return [];
  }
};

export const reviewPost = async (
  platform: Platform,
  fullPost: string
): Promise<AIReviewResponse> => {
  const prompt = `You are a social media editor. Review this ${platform} post draft and provide actionable feedback.

Post:
"""
${fullPost}
"""

Evaluate:
1. Hook strength — does it grab attention in the first line?
2. Clarity — is the message clear and specific?
3. CTA — is there a clear next action for the reader?
4. Platform fit — does this match ${platform}'s tone and norms?
5. Length — is it appropriately sized for ${platform}?

Return ONLY a JSON object with this exact structure (no markdown, no code fences):
{
  "score": <number 1-10>,
  "strengths": ["...", "..."],
  "improvements": ["...", "..."],
  "revised_version": "Optional improved version of the post"
}`;

  const systemPrompt =
    "You are a social media expert. Return only raw valid JSON, no markdown code blocks, no extra text.";

  try {
    const text = await generateText(prompt, systemPrompt);
    return JSON.parse(extractJson(text)) as AIReviewResponse;
  } catch {
    return { score: 0, strengths: [], improvements: [] };
  }
};

export const generateImage = async (
  prompt: string,
  _size: "1K" | "2K" | "4K" = "1K",
  _aspectRatio: string = "1:1"
) => {
  const response = await fetch("/api/generate/image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const err = await response
      .json()
      .catch(() => ({ error: response.statusText }));
    throw new Error(err.error || "Image generation failed");
  }

  const data = await response.json();
  return data.url || "";
};

export const generateVideo = async (
  _prompt: string,
  _aspectRatio: "16:9" | "9:16" = "16:9"
) => {
  // Video generation requires a specialized (paid) service not available via RapidAPI.
  // Return empty so the caller can show an appropriate message.
  console.warn(
    "Video generation is not available with the current API configuration."
  );
  return "";
};

export const analyzeVideo = async (_videoUri: string) => {
  // Requires Gemini Vision — not available with OpenRouter/RapidAPI setup.
  return [] as number[];
};

export const searchGrounding = async (query: string) => {
  return await generateText(
    `Summarize the most relevant and up-to-date information about: "${query}". Be concise and factual.`
  );
};
