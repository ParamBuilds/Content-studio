# MCP Integration Plan (Multimodal OpenRouter)

This plan replaces the existing direct AI calls with a centralized `@stabgan/openrouter-mcp-multimodal` service. It introduces **Claude** as the hardcoded "Director of Quality" for all operations and adds new **Audio (TTS & Transcription)** capabilities.

## User Review Required

> [!IMPORTANT]
> **Complete Replacement**: All existing direct calls to Pollinations and Replicate (Video) will now route through the MCP bridge.
> 
> **Claude as Director**: We will hardcode **Claude (Anthropic/OpenRouter)** as the "Director" model to ensure consistent high-quality prompting and character persona.
> 
> **Audio Tabs**: Two new tabs will be added to the Content Studio: **TTS (Speech)** and **Transcription (Listen)**.

## Proposed Changes

### [Backend]

#### [NEW] [mcp-bridge.ts](file:///d:/Anitgravity/Content-studio/mcp-bridge.ts)
- Implement an MCP Client that:
    - Spawns the `@stabgan/openrouter-mcp-multimodal` binary.
    - Connects via StdioTransport.
    - Exposes a helper `callTool(toolName, arguments)` function.

#### [MODIFY] [server.ts](file:///d:/Anitgravity/Content-studio/server.ts)
- Update all generation endpoints (`/api/generate/*`) to use the MCP bridge.
- Add new endpoints:
    - `POST /api/mcp/chat`: Maps to `chat_completion`.
    - `POST /api/mcp/image/generate`: Maps to `generate_image`.
    - `POST /api/mcp/image/analyze`: Maps to `analyze_image`.
    - `POST /api/mcp/audio/generate`: Maps to `generate_audio` (TTS).
    - `POST /api/mcp/audio/analyze`: Maps to `analyze_audio` (STT).

### [Frontend]

#### [NEW] [useMCP.ts](file:///d:/Anitgravity/Content-studio/src/hooks/useMCP.ts)
- Centralized React hook for all MCP functionality.

#### [NEW] [AudioEngine.tsx](file:///d:/Anitgravity/Content-studio/src/components/AudioEngine.tsx)
- New component for handling Text-to-Speech and Audio Analysis.

#### [MODIFY] [VisualEngine.tsx](file:///d:/Anitgravity/Content-studio/src/components/VisualEngine.tsx)
- Refactor to use the `useMCP` hook and support multi-modal outputs.

#### [MODIFY] [Index.tsx](file:///d:/Anitgravity/Content-studio/src/pages/Index.tsx)
- Add new navigation tabs for **Audio Studio**.

## Verification Plan

### Automated Tests
- Script a basic test that calls the MCP bridge directly to ensure it can reach OpenRouter via the child process.

### Manual Verification
- Verify **Claude Director**: Ensure prompts are expanded correctly before generation.
- Verify **Audio**: Test TTS generation and check if researchers/users can play the audio back.
