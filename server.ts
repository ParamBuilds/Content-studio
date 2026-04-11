import dotenv from "dotenv";
// mcpBridge is removed in favor of direct OpenRouter API

dotenv.config();

import express from "express";
import path from "path";
import net from "net";
import { createServer as createViteServer } from "vite";

// ─────────────────────────────────────────────
// Helper: find a free port starting from `start`
// ─────────────────────────────────────────────
function findFreePort(start: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(start, "0.0.0.0", () => {
      const addr = server.address() as net.AddressInfo;
      server.close(() => resolve(addr.port));
    });
    server.on("error", () => {
      console.warn(`⚠️  Port ${start} in use, trying ${start + 1}…`);
      findFreePort(start + 1).then(resolve).catch(reject);
    });
  });
}

async function startServer() {
  const app = express();

  // ── Env vars ──────────────────────────────
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "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";
  const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY || "tgp_v1_9CLjIZszFX4jJ8QpPgVNuu1nGgqyIikf9q-9NIEsJz8";
  // Replicate is deprecated in favor of OpenRouter
  // const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN || "";

  app.use(express.json());

  // ── Health ────────────────────────────────
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      keys: {
        openrouter: !!OPENROUTER_API_KEY,
        together: !!TOGETHER_API_KEY,
        replicate: "deprecated",
      },
    });
  });

  // ── Mock OAuth ────────────────────────────
  app.get("/api/auth/:platform", (req, res) => {
    const { platform } = req.params;
    res.json({ status: "connected", platform, account: `Demo User (${platform})` });
  });

  // ── Prompt Management ─────────────────────
  app.get("/api/prompts/:id", async (req, res) => {
    try {
      const fs = await import("fs/promises");
      const filePath = path.join(process.cwd(), "prompts", `${req.params.id}.md`);
      const content = await fs.readFile(filePath, "utf-8");
      res.json({ content });
    } catch {
      res.status(404).json({ error: "Prompt not found" });
    }
  });

  app.post("/api/prompts/:id", async (req, res) => {
    try {
      const fs = await import("fs/promises");
      const { content } = req.body;
      const filePath = path.join(process.cwd(), "prompts", `${req.params.id}.md`);
      await fs.writeFile(filePath, content, "utf-8");
      res.json({ success: true });
    } catch {
      res.status(500).json({ error: "Failed to save prompt" });
    }
  });

  // ────────────────────────────────────────────────────────────────────────────
  // 1. TEXT GENERATION → Direct OpenRouter (Claude)
  // ────────────────────────────────────────────────────────────────────────────
  app.post("/api/generate/text", async (req, res) => {
    try {
      const { prompt, model = "google/gemma-4-26b-a4b-it:free", platform = "general" } = req.body;
      
      console.log(`🎬 OpenRouter: Generating ${platform} post...`);

      const systemPrompts: Record<string, string> = {
        twitter: "Write concise, engaging tweets under 280 characters. Use hashtags naturally.",
        instagram: "Write vibrant Instagram captions with emojis and 5-10 relevant hashtags.",
        reddit: "Write informative Reddit posts with a clear title and body. Use proper formatting.",
        facebook: "Write friendly Facebook posts. Conversational, 1-3 short paragraphs.",
        general: "You are an expert social media content writer.",
      };

      const finalPrompt = `${systemPrompts[platform] || systemPrompts.general}\n\n${prompt}`;

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": "https://content-studio.ai",
          "X-Title": "Content Studio"
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: finalPrompt }]
        })
      });

      if (!response.ok) throw new Error(`OpenRouter Error: ${await response.text()}`);
      
      const data = await response.json();
      const output = data.choices[0].message.content;

      res.json({ output });
    } catch (error: any) {
      console.error("Text generation error:", error.message);
      res.status(500).json({ error: error.message });
    }
  });

  // Legacy route alias
  app.post("/api/generate", async (req, res) => {
    return res.redirect(307, "/api/generate/text");
  });

  // ────────────────────────────────────────────────────────────────────────────
  // 2. IMAGE GENERATION → Claude-Enhanced OpenRouter Generation
  // ────────────────────────────────────────────────────────────────────────────
  app.post("/api/generate/image", async (req, res) => {
    try {
      const { prompt, size = "1K", model = "black-forest-labs/flux-pro" } = req.body;
      if (!prompt) return res.status(400).json({ error: "Prompt is required." });

      console.log(`🎨 Enhancing Image Prompt: "${prompt}"...`);

      // Step 1: Director Expansion (Gemma 4 via OpenRouter)
      const expansionMsg = `Transform this basic image prompt into a 3-sentence high-detail cinematic description. Focus on lighting, style, textures, and 4k resolution details. Output ONLY the expanded prompt string. Basic prompt: ${prompt}`;
      
      const enhanceRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        },
        body: JSON.stringify({
          model: "google/gemma-4-26b-a4b-it:free",
          messages: [{ role: "user", content: expansionMsg }]
        }),
      });

      let enhancedPrompt = prompt;
      if (enhanceRes.ok) {
        const data = await enhanceRes.json();
        enhancedPrompt = data.choices[0].message.content.trim();
        console.log(`✨ Claude Direction: ${enhancedPrompt}`);
      } else {
        const errorText = await enhanceRes.text();
        console.warn(`⚠️ Claude enhancement failed: ${errorText}. Using original.`);
      }

      // Step 2: Generation (Flux or high-quality image model)
      console.log(`🎨 Generating Image via "${model}"...`);
      const genRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: enhancedPrompt }],
          // OpenRouter handles modality if the model supports it
        })
      });

      if (!genRes.ok) throw new Error(`Image Gen Error: ${await genRes.text()}`);
      
      const genData = await genRes.json();
      const imageUrl = genData.choices[0].message.content; // Some models return URL string directly or list it

      // Step 3: Serve via asset proxy
      const proxyUrl = `/api/asset?url=${encodeURIComponent(imageUrl)}`;
      res.json({ url: proxyUrl });
    } catch (error: any) {
      console.error("Image generation error:", error.message);
      res.status(500).json({ error: error.message });
    }
  });

  // ────────────────────────────────────────────────────────────────────────────
  // 3. UNIVERSAL ASSET PROXY
  //    Fetches an external image/video and serves it from our domain.
  //    Fixes "broken" assets caused by CORS or browser-side blocking.
  // ────────────────────────────────────────────────────────────────────────────
  app.get("/api/asset", async (req, res) => {
    try {
      const assetUrl = req.query.url as string;
      if (!assetUrl) return res.status(400).send("URL is required");

      // Retry logic for robustness
      let response;
      for (let i = 0; i < 2; i++) {
        response = await fetch(assetUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
            "Referer": "https://pollinations.ai/"
          }
        });
        if (response.ok) break;
        if (i === 0) await new Promise(r => setTimeout(r, 1000));
      }

      if (!response?.ok) throw new Error(`Proxy failed: ${response?.statusText}`);

      const contentType = response.headers.get("content-type") || "application/octet-stream";
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      res.setHeader("Content-Type", contentType);
      res.setHeader("Cache-Control", "public, max-age=86400");
      res.send(buffer);
    } catch (error: any) {
      console.error("Proxy error:", error.message);
      res.status(500).send(error.message);
    }
  });

  // Legacy redirects
  app.get("/api/proxy-image", (req, res) => res.redirect(`/api/asset?url=${req.query.url}`));
  app.get("/api/proxy-asset", (req, res) => res.redirect(`/api/asset?url=${req.query.url}`));

  // ────────────────────────────────────────────────────────────────────────────
  // 4. TEXT-TO-VIDEO & IMAGE-TO-VIDEO → Claude-Led OpenRouter Generation
  //    Uses Claude 3.5 Sonnet as a cinematic director, then generates via OpenRouter.
  // ────────────────────────────────────────────────────────────────────────────
  app.post("/api/generate/video", async (req, res) => {
    try {
      let { prompt, image_url, model = "google/veo-1" } = req.body;

      if (!prompt && !image_url) {
        return res.status(400).json({ error: "Prompt or image_url is required." });
      }

      console.log(`🎬 Enhancing video prompt for "${model}": "${prompt || 'Image-based'}"`);

      // Step 1: Director Expansion (Gemma 4 via OpenRouter)
      const systemPrompt = "You are a cinematic director and AI video prompter. Expand the user's input into a highly detailed description of motion, lighting, and camera work for a 5-second video. Output ONLY the enhanced prompt. No prefixes.";
      const userMessage = image_url 
        ? `Analyze this image idea and describe the most natural cinematic motion continuation: ${prompt || 'Make it come alive'}. Base image URL: ${image_url}`
        : `Expand this into a cinematic video prompt: ${prompt}`;

      const enhanceRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        },
        body: JSON.stringify({
          model: "google/gemma-4-26b-a4b-it:free",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage }
          ],
        }),
      });

      let enhancedPrompt = prompt;
      if (enhanceRes.ok) {
        const data = await enhanceRes.json();
        enhancedPrompt = data.choices[0].message.content.trim();
        console.log(`✨ Claude Direction: ${enhancedPrompt}`);
      } else {
        const errorText = await enhanceRes.text();
        console.warn(`⚠️ Claude enhancement failed: ${errorText}. Using original.`);
      }

      // Step 2: Create OpenRouter video generation request
      console.log(`📺 Requesting Video Generation via "${model}"...`);
      const createRes = await fetch("https://openrouter.ai/api/v1/videos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": "https://content-studio.ai",
          "X-Title": "Content Studio"
        },
        body: JSON.stringify({
          model,
          prompt: enhancedPrompt,
          ...(image_url ? { image_url: image_url } : {}),
        }),
      });

      if (!createRes.ok) {
        const err = await createRes.text();
        console.error(`❌ OpenRouter Video Error: ${err}`);
        throw new Error(`OpenRouter Error: ${err}`);
      }

      const generation = await createRes.json();
      console.log(`📡 Job Created: ${generation.id || generation.job_id}`);

      res.json({ 
        id: generation.id || generation.job_id, 
        status: generation.status || "starting", 
        url: generation.url || null,
        poll_url: `/api/generate/video/${generation.id || generation.job_id}`
      });
    } catch (error: any) {
      console.error("Video generation error:", error.message);
      res.status(500).json({ error: error.message });
    }
  });

  // Poll video status from OpenRouter
  app.get("/api/generate/video/:id", async (req, res) => {
    try {
      const response = await fetch(`https://openrouter.ai/api/v1/videos/${req.params.id}`, {
        headers: { "Authorization": `Bearer ${OPENROUTER_API_KEY}` },
      });
      
      if (!response.ok) throw new Error(`Polling failed: ${await response.text()}`);

      const data = await response.json();
      const status = data.status || "queued";
      let videoUrl = data.url || (data.unsigned_urls && data.unsigned_urls[0]);

      const proxyUrl = videoUrl ? `/api/proxy-asset?url=${encodeURIComponent(videoUrl)}` : null;
      
      res.json({ 
        status: (status === "completed" || status === "succeeded") ? "succeeded" : status, 
        url: proxyUrl, 
        error: data.error 
      });
    } catch (error: any) {
      console.error("Polling error:", error.message);
      res.status(500).json({ error: error.message });
    }
  });

  // ── Vite middleware ───────────────────────
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  // ── Auto port selection (fixes EADDRINUSE) ─
  const PORT = await findFreePort(Number(process.env.PORT) || 3000);
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n✅  Server running on http://localhost:${PORT}`);
    console.log(`🔑  OpenRouter : ${OPENROUTER_API_KEY ? "✓ loaded" : "✗ missing"}`);
    console.log(`🎨  Together AI: ${TOGETHER_API_KEY ? "✓ loaded" : "✗ missing"}`);
    console.log(`🎬  Replicate  : deprecated (using OpenRouter)\n`);
  });
}

startServer();
