
import { mcpBridge } from "../mcp-bridge";

async function main() {
    try {
        await mcpBridge.init();
        const tools = await mcpBridge.listTools();
        console.log("Tools available:", JSON.stringify(tools, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        mcpBridge.cleanup();
    }
}

main();
