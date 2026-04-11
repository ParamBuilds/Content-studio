# Synchronize Frontend with New Server Overhaul

The user has implemented a major update to `server.ts`, changing the API contract, adding new providers (Together AI, Replicate), and implementing auto-port selection. However, these changes broke the existing connection with the frontend (`gemini.ts`) and removed environment variable loading.

## User Review Required

> [!IMPORTANT]
> **New API Keys Required**: The new server uses Together AI and Replicate. You will need to add `TOGETHER_API_KEY` and `REPLICATE_API_TOKEN` to your `.env` file for images and videos to work.
> 
> **Response Format Change**: The text generation endpoint now returns `{ output: ... }` instead of `{ text: ... }`. The frontend must be updated to match.

## Proposed Changes

### [Server]

#### [MODIFY] [server.ts](file:///d:/Anitgravity/Content-studio/server.ts)
- Re-add `import dotenv from "dotenv"; dotenv.config();` at the top. The current `npm run dev` (running `tsx server.ts`) will not load environment variables without it unless a CLI flag is used.

### [Frontend Lib]

#### [MODIFY] [gemini.ts](file:///d:/Anitgravity/Content-studio/src/lib/gemini.ts)
- Update `generateText` to expect `{ output }` instead of `{ text }`.
- Pass the `platform` parameter to `/api/generate/text` so the server can use its new platform-specific system prompts.
- Update `generateImage` to match the Together AI response format (`{ url }`).
- Implement `generateVideo` to use the new `/api/generate/video` endpoint and handle polling.

### [Environment]

#### [MODIFY] [.env](file:///d:/Anitgravity/Content-studio/.env)
- Add placeholders for `TOGETHER_API_KEY` and `REPLICATE_API_TOKEN`.

## Verification Plan

### Automated Tests
- Run `npm run dev` and verify server startup logs show "Server running on http://localhost:XXXX".
- Use `Invoke-RestMethod` to test the updated `/api/generate/text` endpoint.

### Manual Verification
- Verify that clicking "AI Generate" on any platform tab correctly populates the text field.
- Verify that image generation works (requires `TOGETHER_API_KEY`).
- Verify that video generation works (requires `REPLICATE_API_TOKEN`).
