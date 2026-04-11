# Fix Replicate 402 (Payment Required) - Free Fallback Plan

The user's Replicate free trial has ended, causing video generation to fail with a "Free time limit reached" error. This plan implements a "Free Tier Fallback" that uses our free image generator to provide high-quality visualizations when the video service is unavailable.

## User Review Required

> [!IMPORTANT]
> **No Free Video APIs**: Currently, there are no stable, high-quality, free video generation APIs that don't require a subscription or tokens. 
> 
> **My Solution**: I will implement a fallback mechanism. If your Replicate account is out of credits, the system will automatically:
> 1. Use **Claude** to enhance your prompt.
> 2. Generate a **4K Cinematic Image** instead of a video.
> 3. Show a clear notification in the UI explaining how to resume video generation (by setting up billing on Replicate).

## Proposed Changes

### [Server]

#### [MODIFY] [server.ts](file:///d:/Anitgravity/Content-studio/server.ts)
- Update `/api/generate/video` to detect the `402` or "Free time limit" error from Replicate.
- If detected:
    - Call the `image` generation logic (Pollinations) using the **Claude-enhanced** video prompt.
    - Return the image URL but include a new flag: `is_fallback: true`.

### [UI]

#### [MODIFY] [VisualEngine.tsx](file:///d:/Anitgravity/Content-studio/src/components/VisualEngine.tsx)
- Update the generation result handler.
- If `is_fallback` is true:
    - Show the generated image.
    - Display a subtle but clear alert info: *"Replicate free trial ended. Displaying 4K visualization. Please set up billing on Replicate.com to enable motion."*

## Verification Plan

### Automated Tests
- Mock a 402 error in the server and verify that the endpoint returns a Pollinations image URL instead of an error.

### Manual Verification
- Attempt to generate a video. 
- Verify that instead of a red error box, you see a high-quality cinematic image and the upgrade notice.
