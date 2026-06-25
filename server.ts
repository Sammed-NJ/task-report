import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

dotenv.config();

async function startServer() {
  const app = express();
  app.use(express.json());

  const PORT = 3000;

  // API Route for AI-assisted task generation using Groq
  app.post("/api/generate-tasks", async (req: express.Request, res: express.Response) => {
    try {
      const { prompt, employeeName } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      const apiKey = process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ 
          error: "GROQ_API_KEY or GEMINI_API_KEY is not configured on the server. Please configure it in your Settings or Secrets." 
        });
      }

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "system",
              content: `You are an expert project manager and productivity assistant. You convert raw task descriptions or bullet points into highly professional structured timesheet tasks.
Make sure description is concise, professional, and clear. If employee name (${employeeName || "the employee"}) is provided, tailor any appropriate details if necessary. Ensure estimated hours are numbers (decimals allowed, e.g., 1.5, 2.0).

You MUST return a JSON object with a single key "tasks" containing an array of tasks. Each task in the array MUST contain the following keys:
- "project": The name of the project. If not mentioned, infer a logical project name (usually from the context or a default) or use 'General'.
- "module": The module or area of the project (e.g. UI, Database, Auth, Allocation). If not mentioned, infer or use 'General'.
- "taskId": The task ID, starting with '#' if numerical, e.g. #1138. If not mentioned, make one up or leave empty.
- "description": A professional, clear, and action-oriented description of what was done or is being done.
- "estimatedHours": The estimated hours to complete the task (as a number). Default to 1.0 or 2.0 if not specified.

Example output format:
{
  "tasks": [
    {
      "project": "DELISIA",
      "module": "Auth",
      "taskId": "#1001",
      "description": "Implemented login page authentication and session verification.",
      "estimatedHours": 2.5
    }
  ]
}`
            },
            {
              role: "user",
              content: `For any missing fields (like Project, Module, Task ID, or Estimated Hours), make intelligent guesses based on the context, or use standard defaults. Task ID can be empty or auto-generated sequentially starting with #1001 if no IDs are specified.
Here is the raw text describing the tasks:
"""
${prompt}
"""`
            }
          ],
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Groq API responded with status ${response.status}`);
      }

      const result = await response.json();
      const content = result.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error("No response generated from Groq.");
      }

      const parsedData = JSON.parse(content);
      res.json({ tasks: parsedData.tasks || [] });
    } catch (error: any) {
      console.error("AI Task Generation Error:", error);
      res.status(500).json({ error: error?.message || "Failed to generate tasks using Groq." });
    }
  });

  // Serve Vite or static files
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
