# Fix Broken and Stale Image Generation

The user reports that generated images appear broken (placeholder icon) and sometimes don't change when a new prompt is sent. This plan fixes these issues using a combination of UI state management and a server-side image proxy.

## User Review Required

> [!NOTE]
> **Image Proxy Architecture**: I will be adding an `/api/proxy-image` endpoint. Instead of giving the browser a direct link to an external AI service (which can be blocked or unstable), our server will download the image and serve it directly. This makes the generation much more reliable for the end-user.

## Proposed Changes

### [Server]

#### [MODIFY] [server.ts](file:///d:/Anitgravity/Content-studio/server.ts)
-   **New Endpoint**: `/api/proxy-image`.
    -   Takes a `url` query parameter.
    -   Fetches the image from that URL.
    -   Sets appropriate headers (`Content-Type`, `Cache-Control`).
    -   Pipes the image data to the response.
-   **Update Image Generation**:
    -   Modify `/api/generate/image` to return a URL pointing to our local proxy: `/api/proxy-image?url=...`.
    -   This ensures the browser only communicates with your local server.

### [UI]

#### [MODIFY] [VisualEngine.tsx](file:///d:/Anitgravity/Content-studio/src/components/VisualEngine.tsx)
-   Update `handleGenerate`:
    -   Call `setGeneratedUrl(null)` immediately.
    -   Call `setError(null)` immediately.
-   This clears the previous image and error message, showing the loading spinner correctly for every new click.

## Verification Plan

### Automated Tests
-   Test the `/api/proxy-image` endpoint with a known image URL to ensure it correctly returns the image/png data.
-   Test the `/api/generate/image` endpoint to verify it returns a local-proxy URL.

### Manual Verification
-   Click "Generate" multiple times in the UI.
-   Verify that the previous image disappears immediately and a loading spinner appears.
-   Verify that the new image loads successfully without a broken icon.
