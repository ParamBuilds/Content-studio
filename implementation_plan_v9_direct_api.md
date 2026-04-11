# Implementation Plan: Direct OpenRouter Integration

The initial attempt to move to OpenRouter encountered issues with the MCP bridge initialization on Windows and incorrect model IDs. This revised plan shifts to direct API integration for maximum reliability.

## User Review Required

> [!IMPORTANT]
> **MCP Bridge Removal**: I will move away from the local MCP bridge for image generation and use direct OpenRouter `fetch` calls. This removes a point of failure (sidecar process spawning).
> **Model Selection**: 
> - **Text Enhancement**: `anthropic/claude-3.5-sonnet` (or fallback to `claude-3-haiku` if sonnet is unavailable).
> - **Image**: `black-forest-labs/flux-1.1-pro` or similar via OpenRouter.
> - **Video**: `google/veo-1` or `alibaba/wan-2.1-video` (as confirmed by recent searches).

## Proposed Changes

### Backend (Server)

#### [MODIFY] [server.ts](file:///d:/Anitgravity/Content-studio/server.ts)
- Replace all `mcpBridge.callTool` calls with a helper function `callOpenRouter(model, messages, options)`.
- Update `/api/generate/image` to use the helper with an image-output model ID.
- Update `/api/generate/video` to use the helper or a specialized fetch to `/api/v1/videos`.
- Fix polling logic to reliably handle OpenRouter's asynchronous response format.

### Cleanup

#### [DELETE] [mcp-bridge.ts](file:///d:/Anitgravity/Content-studio/mcp-bridge.ts) (Optional, but recommended if unused)

## Open Questions

- **Video Model**: OpenRouter video models are occasionally in alpha. Do you have a specific model ID you know works with your account (e.g., `google/veo-1`, `luma/dream-machine-v1`)?

## Verification Plan

### Automated Tests
- Update `scratch/test_api.ts` to verify the direct OpenRouter calls.

### Manual Verification
- Test image and video generation through the UI.
