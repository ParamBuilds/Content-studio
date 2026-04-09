# Hashtags Prompt
Generate ${count} hashtags for a ${platform} post about: "${topic}".
Rules:
- Mix broad reach tags with niche community tags
- Twitter: 2–5 tags, high-signal, topic-specific
- Instagram: 10–20 tags, mix of 100K–1M and <100K posts for discoverability
- Facebook: 3–5 tags, broad and brand-relevant

Return ONLY a valid JSON array of strings, each starting with #.
Example: ["#ProductivityApp", "#RemoteWork", "#StartupLife"]
No markdown, no explanation, no preamble.
