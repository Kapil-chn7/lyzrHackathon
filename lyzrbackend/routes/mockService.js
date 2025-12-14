import express from "express";
import { randomDelay, randomWorkflowResult, validateRequest } from "../utility/mockUtils.mjs";

const router = express.Router();

router.post("/mockService/", async (req, res) => {
    console.log("📥 Incoming /mockService request");

    // 1️⃣ Validate request
    const validationError = validateRequest(req);
    if (validationError) {
        console.warn("❌ Validation error:", validationError);
        return res.status(400).json({ error: validationError });
    }

    // 2️⃣ Simulate random delay (0–10 sec)
    const delay = Math.floor(Math.random() * 10000);
    console.log(`🕒 Simulating delay of ${delay / 1000}s...`);
    await randomDelay(delay);

    // 3️⃣ Generate random workflow result
    const result = randomWorkflowResult();
    console.log("✅ Workflow completed successfully:", result);

    // 4️⃣ Randomize message and response type
    const messages = [
        "Workflow executed successfully.",
        "Job completed with optimal performance.",
        "Process finished — all systems nominal.",
        "Run completed with adjusted parameters.",
        "Mock service returned simulated success."
    ];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    // 5️⃣ Return random response
    return res.status(200).json({
        message: randomMessage,
        workflow: result,
        apiKeyUsed: req.headers["x-api-key"],
        processedAt: new Date().toISOString(),
        executionTimeMs: delay
    });
});

export default router;
