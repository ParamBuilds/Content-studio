# Claude-Enhanced Video Generation Plan

The goal is to use Claude (via OpenRouter) to enhance the quality of video generation by acting as a "Cinematic Director." Claude will expand simple user prompts into highly detailed, motion-focused descriptions before sending them to the video generation model (Replicate).

## User Review Required

> [!IMPORTANT]
> **API Key Costs**: This will add a small overhead to each video generation as it now involves two AI calls: one to OpenRouter (Claude) for prompt enhancement and one to Replicate for the actual video.
> 
> **Image-to-Video**: For image-to-video, I will use Claude 3.5 Sonnet's vision capabilities to analyze your uploaded image and suggest the most natural-looking motion.

## Proposed Changes

### [Server]

#### [MODIFY] [server.ts](file:///d:/Anitgravity/Content-studio/server.ts)
- **Implement `enhanceVideoPrompt` Helper**:
    - A server-side function that calls OpenRouter/Claude.
    - Prompt Claude with a "Director's Persona" to turn a simple prompt like "a cat running" into "Cinematic close-up of a fluffy ginger cat sprinting through high grass, golden hour lighting, slow-motion fur movement, 4k ultra-detailed."
- **Update `/api/generate/video` Endpoint**:
    - If `image_url` is present: Send the image to Claude (Sonnet 3.5) and ask for a description of what should happen in the next 5 seconds.
    - If not: Call the `enhanceVideoPrompt` for the text description.
    - Pass the resulting enhanced prompt to the Replicate API call.

### [Frontend Lib]

#### [MODIFY] [gemini.ts](file:///d:/Anitgravity/Content-studio/src/lib/gemini.ts)
- Update `generateVideo` to handle potential extra metadata if needed, though current signature should work fine with the server-side enhancement.

## Verification Plan

### Automated Tests
- Test the `/api/generate/video` endpoint with a simple prompt and verify in the server logs that a much longer, more detailed prompt is being sent to Replicate.

### Manual Verification
- Generate a video for "a bird flying" and verify it looks more cinematic than a standard generation.
- Test an image-to-video generation by uploading an image and providing a motion prompt.
