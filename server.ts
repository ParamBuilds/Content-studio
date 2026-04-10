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
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";
  const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY || "";
  const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN || "";

  app.use(express.json());

  // ── Health ────────────────────────────────
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      keys: {
        openrouter: !!OPENROUTER_API_KEY,
        together: !!TOGETHER_API_KEY,
        replicate: !!REPLICATE_API_TOKEN,
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
  // 1. TEXT GENERATION  →  OpenRouter
  //    Models: mistralai/mistral-7b-instruct (free), meta-llama/llama-3-8b-instruct (free)
  //    Docs:   https://openrouter.ai/docs
  // ────────────────────────────────────────────────────────────────────────────
  app.post("/api/generate/text", async (req, res) => {
    try {
      const { prompt, model = "mistralai/mistral-7b-instruct", platform = "general" } = req.body;

      const systemPrompts: Record<string, string> = {
        twitter: "Write concise, engaging tweets under 280 characters. Use hashtags naturally.",
        instagram: "Write vibrant Instagram captions with emojis and 5-10 relevant hashtags.",
        reddit: "Write informative Reddit posts with a clear title and body. Use proper formatting.",
        facebook: "Write friendly Facebook posts. Conversational, 1-3 short paragraphs.",
        general: "You are an expert social media content writer.",
      };

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Content Studio",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompts[platform] || systemPrompts.general },
            { role: "user", content: prompt },
          ],
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`OpenRouter error: ${err}`);
      }

      const data = await response.json();
      res.json({ output: data.choices[0].message.content });
    } catch (error: any) {
      console.error("Text generation error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Keep old route working too
  app.post("/api/generate", async (req, res) => {
    req.body.platform = req.body.platform || "general";
    return app._router.handle({ ...req, url: "/api/generate/text" }, res, () => { });
  });

  // ────────────────────────────────────────────────────────────────────────────
  // 2. TEXT-TO-IMAGE  →  Together AI  (FLUX.1-schnell — FREE tier available)
  //    Docs:   https://docs.together.ai/docs/images
  //    Other models: "black-forest-labs/FLUX.1-dev", "stabilityai/stable-diffusion-xl-base-1.0"
  // ────────────────────────────────────────────────────────────────────────────
  app.post("/api/generate/image", async (req, res) => {
    try {
      const {
        prompt,
        model = "black-forest-labs/FLUX.1-schnell-Free",
        width = 1024,
        height = 1024,
        steps = 4,
      } = req.body;

      const response = await fetch("https://api.together.xyz/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${TOGETHER_API_KEY}`,
        },
        body: JSON.stringify({ model, prompt, width, height, steps, n: 1 }),
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`Together AI error: ${err}`);
      }

      const data = await response.json();
      // Returns base64 or URL depending on model
      const imageUrl = data.data?.[0]?.url || data.data?.[0]?.b64_json;
      res.json({ url: imageUrl, b64: data.data?.[0]?.b64_json });
    } catch (error: any) {
      console.error("Image generation error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ────────────────────────────────────────────────────────────────────────────
  // 3. TEXT-TO-VIDEO  →  Replicate  (minimax/video-01 or stability/stable-video-diffusion)
  //    Docs:   https://replicate.com/docs/reference/http
  //    Pay-per-run: ~$0.002–$0.05 per video
  // ────────────────────────────────────────────────────────────────────────────
  app.post("/api/generate/video", async (req, res) => {
    try {
      const { prompt, image_url } = req.body;

      // Step 1: Create prediction
      const createRes = await fetch("https://api.replicate.com/v1/models/minimax/video-01/predictions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${REPLICATE_API_TOKEN}`,
          "Prefer": "wait", // Wait up to 60s for result
        },
        body: JSON.stringify({
          input: {
            prompt,
            ...(image_url ? { first_frame_image: image_url } : {}),
          },
        }),
      });

      if (!createRes.ok) {
        const err = await createRes.text();
        throw new Error(`Replicate error: ${err}`);
      }

      const prediction = await createRes.json();

      // If "wait" header worked and it's done
      if (prediction.status === "succeeded") {
        return res.json({ url: prediction.output, id: prediction.id, status: "succeeded" });
      }

      // Otherwise return the prediction ID for polling
      res.json({ id: prediction.id, status: prediction.status, poll_url: prediction.urls?.get });
    } catch (error: any) {
      console.error("Video generation error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Poll video status
  app.get("/api/generate/video/:id", async (req, res) => {
    try {
      const response = await fetch(`https://api.replicate.com/v1/predictions/${req.params.id}`, {
        headers: { "Authorization": `Bearer ${REPLICATE_API_TOKEN}` },
      });
      const data = await response.json();
      res.json({ status: data.status, url: data.output, error: data.error });
    } catch (error: any) {
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
    console.log(`🎬  Replicate  : ${REPLICATE_API_TOKEN ? "✓ loaded" : "✗ missing"}\n`);
  });
}

startServer();