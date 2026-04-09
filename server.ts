import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Mock OAuth endpoints for demo
  app.get("/api/auth/:platform", (req, res) => {
    const { platform } = req.params;
    res.json({ status: "connected", platform, account: `Demo User (${platform})` });
  });

  // Prompt Management API
  app.get("/api/prompts/:id", async (req, res) => {
    try {
      const fs = await import("fs/promises");
      const filePath = path.join(process.cwd(), "prompts", `${req.params.id}.md`);
      const content = await fs.readFile(filePath, "utf-8");
      res.json({ content });
    } catch (error) {
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
    } catch (error) {
      res.status(500).json({ error: "Failed to save prompt" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
