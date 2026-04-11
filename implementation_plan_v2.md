# Fix Broken Images and Implement 4K Support

The user is seeing broken images in the "Asset Generation" tab and wants 4K quality support. 

## Proposed Changes

### [Frontend Lib]

#### [MODIFY] [gemini.ts](file:///d:/Anitgravity/Content-studio/src/lib/gemini.ts)
- Update `generateImage` to pass `size` and `aspectRatio` to the backend. Currently, it only sends the `prompt`.

### [Server]

#### [MODIFY] [server.ts](file:///d:/Anitgravity/Content-studio/server.ts)
- Update `/api/generate/image` to:
    - Parse `size` (1K, 2K, 4K) and `aspectRatio` (1:1, 16:9, etc.).
    - Map these to exact pixel dimensions (e.g., 4K + 16:9 = 3840x2160).
    - Construct the Pollinations.ai URL with these dimensions.
    - Add `enhance=true` and `model=flux` (if supported) for better quality.
- Ensure the URL returned is valid and potentially use a small delay or retry logic if the external service is slow.

## Verification Plan

### Automated Tests
- Test the endpoint with `Invoke-RestMethod` using different sizes and aspect ratios.
- Verify the returned URL contains the correct width/height parameters.

### Manual Verification
- Generate a 4K 16:9 image and verify it loads in the UI.
