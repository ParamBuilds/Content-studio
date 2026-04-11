# Premium Redesign & Image Fix Plan (21st.dev Style)

This plan addresses the broken image previews by stabilizing the backend proxy and implements a modern, high-performance dark/light theme inspired by **21st.dev** aesthetics (Glassmorphism, deep dark modes, and crisp typography).

## User Review Required

> [!IMPORTANT]
> **Proxy Refactor**: I will merge the image/video proxies into a single robust `api/asset` endpoint. This will solve the "Too Many Requests" and "Internal Server Error" issues found in the logs.
> 
> **Visual Identity**: I am choosing a **"Midnight Flux"** theme:
> - **Dark Mode**: Deep `#030303` background, subtle `#ffffff10` borders, and Inter typography.
> - **Accents**: Indigo/Violet gradients (`#6366f1` to `#8b5cf6`).
> - **Glassmorphism**: Translucent panels with backdrop-blur.

## Proposed Changes

### [Backend]

#### [MODIFY] [server.ts](file:///d:/Anitgravity/Content-studio/server.ts)
- Combine all proxy logic into a single `/api/asset` route.
- Add **Retry Logic**: If Pollinations fails once, retry with a slightly different seed or after a 500ms delay.
- Ensure proper headers (Referer, User-Agent) are sent to avoid being blocked by Pollock/Replicate.

### [Frontend - Style]

#### [MODIFY] [index.css](file:///d:/Anitgravity/Content-studio/src/index.css)
- Implement a comprehensive CSS variable system for Light/Dark modes.
- Define `.glass-panel` and `.glow-button` utility classes.
- Import **Inter** and **Outfit** fonts for a premium look.

#### [MODIFY] [VisualEngine.tsx](file:///d:/Anitgravity/Content-studio/src/components/VisualEngine.tsx)
- Redesign the generation area with a sleek "studio" layout.
- Add a custom **Loading Skeleton** that pulsates with the accent color.
- Ensure the image/video preview uses `object-cover` and rounded-xl corners with a subtle inner shadow.

### [Frontend - Components]

#### [MODIFY] [App.tsx](file:///d:/Anitgravity/Content-studio/src/App.tsx)
- Add a mesh gradient background (subtle animated SVG or CSS) to give the app depth.
- Refine the sidebar and top navigation to match the 21st.dev aesthetic.

## Verification Plan

### Automated Tests
- Test the new `/api/asset` endpoint with a known Pollinations URL to ensure it handles redirects and errors.

### Manual Verification
- Verify the "Gemma 4 Expanded" images load reliably.
- Toggle between light and dark modes to check color contrast and readability.
- Observe the "wow factor" of the new design.
