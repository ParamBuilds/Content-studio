
import fetch from "node-fetch";

async function testImage() {
    console.log("Testing Image Generation...");
    const res = await fetch("http://localhost:3002/api/generate/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: "A beautiful electric fox in a neon forest" })
    });
    const data = await res.json();
    console.log("Image Result:", data);
}

async function testVideo() {
    console.log("\nTesting Video Generation...");
    const res = await fetch("http://localhost:3002/api/generate/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: "The electric fox runs through the neon forest", model: "hailuo/minimax-video-01" })
    });
    const data = await res.json();
    console.log("Video Submission Result:", data);

    if (data.id) {
        console.log("Polling for 30 seconds...");
        for (let i = 0; i < 6; i++) {
            await new Promise(r => setTimeout(r, 5000));
            const pollRes = await fetch(`http://localhost:3002/api/generate/video/${data.id}`);
            const pollData = await pollRes.json();
            console.log(`Poll ${i+1}:`, pollData);
            if (pollData.status === "succeeded" || pollData.status === "failed") break;
        }
    }
}

// Note: Ensure server is running before running this
testImage();
testVideo();
