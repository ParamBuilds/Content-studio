# Implementation Plan: Switch Image/Video Generation to OpenRouter (Claude-Led)

The user wants to migrate image and video generation from the Replicate API to OpenRouter, specifically leveraging the Claude API for orchestration and prompt enhancement.

## User Review Required

> [!IMPORTANT]
> **Video Generation Transition**: OpenRouter's video generation is currently in experimental/alpha stages for some models. I will implement integration for `minimax/video-01` or similar available models on OpenRouter.
> **Claude Model selection**: I will use `anthropic/claude-3.5-sonnet` for prompt expansion as it provides better results than `claude-3-haiku`, provided the user has access.

## Proposed Changes

### Backend (Server)

#### [MODIFY] [server.ts](file:///d:/Anitgravity/Content-studio/server.ts)
- Update `/api/generate/image` to ensure it uses a premium OpenRouter model via the MCP bridge (or direct fetch if needed for specific models).
- Update `/api/generate/video` to use OpenRouter's API instead of Replicate. This involves:
    - Changing the base URL from `api.replicate.com` to `openrouter.ai/api/v1`.
    - Updating the payload structure to match OpenRouter's video generation schema.
    - Updating the polling logic to use OpenRouter's status endpoint.
- Enhance the "Director" phase in both routes to use `anthropic/claude-3.5-sonnet` via OpenRouter.

## Open Questions

- **Models**: Do you have a preferred image/video model on OpenRouter (e.g., Flux Pro, Minimax, Veo)?
- **MCP Bridge**: The current MCP bridge uses `@stabgan/openrouter-mcp-multimodal`. I will try to use its tools first, but if video generation isn't supported there, I will use direct `fetch` calls to the OpenRouter API.

## Verification Plan

### Automated Tests
- I will create a test script in `scratch/test_openrouter_gen.ts` to verify the OpenRouter calls for both image and video.

### Manual Verification
- Trigger image generation from the UI and verify the response.
- Trigger video generation from the UI and verify the polling and final result.
