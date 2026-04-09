import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";
import { Platform, Tone, AIReviewResponse } from "../types";

// Standard AI instance for general tasks
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Helper to get a fresh AI instance for models requiring user-selected keys
const getHighQualityAI = () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const fetchPrompt = async (id: string, variables: Record<string, any>) => {
  try {
    const response = await fetch(`/api/prompts/${id}`);
    const data = await response.json();
    let content = data.content || "";
    // Remove markdown header if present
    content = content.replace(/^# .*\n/, "");
    // Replace variables
    Object.entries(variables).forEach(([key, value]) => {
      content = content.replaceAll(`\${${key}}`, String(value));
    });
    return content;
  } catch (error) {
    console.error(`Failed to fetch prompt ${id}:`, error);
    return "";
  }
};

export const generateCopy = async (
  platform: Platform,
  topic: string,
  tone: Tone,
  existingCopy?: string
) => {
  const prompt = await fetchPrompt(`${platform}_copy`, { topic, tone });

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });

  return response.text || "";
};

export const generateRedditTitle = async (topic: string) => {
  const prompt = `You are writing a Reddit post title about: "${topic}".
Rules:
- Maximum 200 characters
- Make it curiosity-driven or value-clear
- Avoid clickbait. Reddit users are perceptive.
- Do not use "I" as the first word unless it adds authenticity
- Return only the title text. No quotes, no preamble.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });

  return response.text || "";
};

export const generateHashtags = async (platform: Platform, topic: string, count: number = 5) => {
  const prompt = await fetchPrompt("hashtags", { platform, topic, count });

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });

  try {
    return JSON.parse(response.text || "[]") as string[];
  } catch (e) {
    return [];
  }
};

export const generateVisualIdeas = async (platform: Platform, topic: string, count: number = 3) => {
  const prompt = await fetchPrompt("visual_ideas", { platform, topic, count });

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });

  try {
    return JSON.parse(response.text || "[]") as string[];
  } catch (e) {
    return [];
  }
};

export const reviewPost = async (platform: Platform, fullPost: string): Promise<AIReviewResponse> => {
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

Return a JSON object:
{
  "score": 1-10,
  "strengths": ["..."],
  "improvements": ["..."],
  "revised_version": "Optional improved version of the post"
}
No markdown, no explanation, just the JSON object.`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
          revised_version: { type: Type.STRING }
        },
        required: ["score", "strengths", "improvements"]
      } as any
    }
  });

  try {
    return JSON.parse(response.text || "{}") as AIReviewResponse;
  } catch (e) {
    return { score: 0, strengths: [], improvements: [] };
  }
};

export const generateVideo = async (prompt: string, aspectRatio: '16:9' | '9:16' = '16:9') => {
  const hqAi = getHighQualityAI();
  let operation = await hqAi.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    config: {
      numberOfVideos: 1,
      resolution: '1080p',
      aspectRatio: aspectRatio
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    operation = await hqAi.operations.getVideosOperation({ operation });
  }

  return operation.response?.generatedVideos?.[0]?.video?.uri || "";
};

export const generateImage = async (prompt: string, size: '1K' | '2K' | '4K' = '1K', aspectRatio: string = '1:1') => {
  const hqAi = getHighQualityAI();
  const response = await hqAi.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: { parts: [{ text: prompt }] },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio as any,
        imageSize: size as any
      }
    }
  });
  
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return "";
};

export const analyzeVideo = async (videoUri: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: [
      { text: "Analyze this video and identify the 5 most visually compelling frames. Return timestamps in seconds for each selected frame." },
      { fileData: { fileUri: videoUri, mimeType: "video/mp4" } }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.NUMBER }
      }
    }
  });

  try {
    return JSON.parse(response.text || "[]") as number[];
  } catch (e) {
    return [];
  }
};

export const searchGrounding = async (query: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: query,
    config: {
      tools: [{ googleSearch: {} }]
    }
  });
  return response.text || "";
};
