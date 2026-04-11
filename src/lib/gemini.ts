import { Platform, Tone, AIReviewResponse } from "../types";

// ──────────────────────────────────────────────────────────────
// Internal helper: call the server-side text generation endpoint
// ──────────────────────────────────────────────────────────────
const generateText = async (
  prompt: string,
  platform: string = "general",
  model?: string
): Promise<string> => {
  const response = await fetch("/api/generate/text", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, platform, model }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(err.error || "Text generation failed");
  }

  const data = await response.json();
  // New server returns { output: ... }
  return data.output || data.text || "";
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
// Extract a JSON structure from an LLM response 
// ──────────────────────────────────────────────────────────────
const extractJson = (text: string): string => {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  const obj = text.match(/\{[\s\S]*\}/);
  if (obj) return obj[0];
  const arr = text.match(/\[[\s\S]*\]/);
  if (arr) return arr[0];
  return text;
};

// ──────────────────────────────────────────────────────────────
// Public API
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
- Match the tone (${tone})
- Return ONLY the post body. No preamble, no quotes.`;
  }

  return await generateText(prompt, platform);
};

export const generateRedditTitle = async (topic: string) => {
  const prompt = `Write a compelling Reddit post title about: "${topic}". 
Return only the title text. No quotes.`;

  return await generateText(prompt, "reddit");
};

export const generateHashtags = async (
  platform: Platform,
  topic: string,
  count: number = 5
) => {
  let prompt = await fetchPrompt("hashtags", { platform, topic, count });

  if (!prompt) {
    prompt = `Generate ${count} relevant hashtags for a ${platform} post about "${topic}".
Return ONLY a JSON array of strings.`;
  }

  try {
    const text = await generateText(prompt, platform);
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
    prompt = `Suggest ${count} visual concepts for a ${platform} post about "${topic}".
Return ONLY a JSON array of strings.`;
  }

  try {
    const text = await generateText(prompt, platform);
    return JSON.parse(extractJson(text)) as string[];
  } catch {
    return [];
  }
};

export const reviewPost = async (
  platform: Platform,
  fullPost: string
): Promise<AIReviewResponse> => {
  const prompt = `Review this ${platform} post draft and provide feedback.
Post: "${fullPost}"
Return ONLY a JSON object: { "score": 1-10, "strengths": [], "improvements": [], "revised_version": "" }`;

  try {
    const text = await generateText(prompt, platform);
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
    body: JSON.stringify({ prompt, size: _size, aspectRatio: _aspectRatio }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(err.error || "Image generation failed");
  }

  const data = await response.json();
  return data.url || "";
};

export const generateVideo = async (
  prompt: string,
  image_url?: string
) => {
  const response = await fetch("/api/generate/video", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, image_url }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(err.error || "Video generation failed");
  }

  const data = await response.json();
  let { id, status, url, is_fallback, notice } = data;

  // Poll if not immediately finished
  if (status !== "succeeded" && id) {
    while (status !== "succeeded" && status !== "failed") {
      await new Promise(r => setTimeout(r, 5000));
      const pollRes = await fetch(`/api/generate/video/${id}`);
      const pollData = await pollRes.json();
      status = pollData.status;
      url = pollData.url;
      if (pollData.error) throw new Error(pollData.error);
    }
  }

  return { 
    url: url || "", 
    isFallback: is_fallback || false, 
    notice: notice || null 
  };
};

export const analyzeVideo = async (_videoUri: string) => {
  return [] as number[];
};

export const searchGrounding = async (query: string) => {
  return await generateText(
    `Summarize information about: "${query}".`,
    "general"
  );
};
