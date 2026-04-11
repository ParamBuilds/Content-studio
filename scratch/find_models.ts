
import { mcpBridge } from "../mcp-bridge";

async function main() {
    try {
        await mcpBridge.init();
        
        console.log("Searching for image models...");
        const imageModels = await mcpBridge.callTool("search_models", { query: "image" });
        console.log("Image Models:", JSON.stringify(imageModels, null, 2));

        console.log("\nSearching for video models...");
        const videoModels = await mcpBridge.callTool("search_models", { query: "video" });
        console.log("Video Models:", JSON.stringify(videoModels, null, 2));

    } catch (err) {
        console.error("Error finding models:", err);
    } finally {
        mcpBridge.cleanup();
    }
}

main();
