// Random delay (default: 0–10 seconds)
export const randomDelay = (time = Math.floor(Math.random() * 10000)) =>
    new Promise(resolve => setTimeout(resolve, time));

// Random workflow result generator
export const randomWorkflowResult = () => ({
    workflowId: Math.floor(Math.random() * 1000000),
    status: ["SUCCESS", "COMPLETED", "DONE"][Math.floor(Math.random() * 3)],
    timestamp: new Date().toISOString(),
    logs: [
        "Initializing workflow...",
        "Validating inputs...",
        "Fetching dependencies...",
        "Processing job...",
        "Finalizing workflow...",
        "Workflow completed successfully."
    ].slice(0, Math.floor(Math.random() * 6) + 1),
    metrics: {
        duration: (Math.random() * 10).toFixed(2) + "s",
        cpuUsage: (Math.random() * 80 + 10).toFixed(2) + "%",
        memoryUsed: (Math.random() * 400 + 100).toFixed(2) + "MB"
    },
    outputs: {
        resultCount: Math.floor(Math.random() * 1000),
        qualityScore: (Math.random() * 100).toFixed(2),
        message: ["All good", "Minor warnings", "Optimized run"][Math.floor(Math.random() * 3)]
    }
});

// Validate headers, params, and body
export const validateRequest = (req) => {
    const requiredHeaders = ["x-api-key", "content-type"];
    for (const header of requiredHeaders) {
        if (!req.headers[header]) return `Missing required header: ${header}`;
    }

    // if (!req.params.jobId) return "Missing required path parameter: jobId";
    if (!req.body?.workflowName) return "Missing required field in body: workflowName";

    return null;
};
