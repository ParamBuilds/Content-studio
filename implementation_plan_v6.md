# Gemma 4 Image Director Plan

The goal is to integrate Google's latest **Gemma 4** model (via OpenRouter) as a "Director" for all image generation. This will turn simple user prompts like "a neon city" into high-detail, cinematic descriptions before they are sent to the image engine.

## User Review Required

> [!NOTE]
> **Gemma 4 "Director" Layer**: Currently, your images are generated directly from your prompts. This change will add a fast AI preprocessing step where Gemma 4 expands your idea into a professional-grade image prompt (covering lighting, texture, and composition).
> 
> **Model Selection**: I'll use the `google/gemma-4-31b-it:free` model which is currently available for free on OpenRouter.

## Proposed Changes

### [Server]

#### [MODIFY] [server.ts](file:///d:/Anitgravity/Content-studio/server.ts)
- Update `/api/generate/image` to include an enhancement step:
    - Call OpenRouter with the `google/gemma-4-31b-it:free` model.
    - Ask Gemma 4 to act as an "Image Director" and expand the prompt.
    - I will merge the instructions into the user message to ensure maximum compatibility with the Gemma 4 API.
- Use the resulting enhanced prompt for the Pollinations.ai generation.

## Verification Plan

### Automated Tests
- Test the image generation endpoint with a simple prompt and verify in the server logs that Gemma 4 successfully expanded the text.

### Manual Verification
- Generate an image for "a futuristic knight" and observe the increased detail in the resulting visual compared to standard generation.
