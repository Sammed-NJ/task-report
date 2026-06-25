import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

async function startServer() {
  const app = express();
  app.use(express.json());

  const PORT = 3000;
  const apiKey = process.env.GEMINI_API_KEY;

  // Initialize Google Gen AI
  const ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API Route for AI-assisted task generation
  app.post("/api/generate-tasks", async (req: express.Request, res: express.Response) => {
    try {
      const { prompt, employeeName } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      if (!apiKey) {
        return res.status(500).json({ 
          error: "GEMINI_API_KEY is not configured on the server. Please configure it in Settings > Secrets." 
        });
      }

      const promptContext = `You are an expert project manager and productivity assistant. Convert the following bullet points, raw text, or description of tasks into a structured list of work tasks suitable for a daily timesheet or work report.
For any missing fields (like Project, Module, Task ID, or Estimated Hours), make intelligent guesses based on the context, or use standard defaults like "General" for project/module and "1.0" or similar for hours if not specifiable. Task ID can be empty or auto-generated sequentially starting with #1001 if no IDs are specified.
Here is the raw text describing the tasks:
"""
${prompt}
"""`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptContext,
        config: {
          systemInstruction: `You convert raw task descriptions or bullet points into highly professional structured timesheet tasks. Make sure description is concise, professional, and clear. If employee name (${employeeName || "the employee"}) is provided, tailor any appropriate details if necessary. Ensure estimated hours are numbers (decimals allowed, e.g., 1.5, 2.0).`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                project: {
                  type: Type.STRING,
                  description: "The name of the project. If not mentioned, infer a logical project name or use 'General'."
                },
                module: {
                  type: Type.STRING,
                  description: "The module or area of the project (e.g. UI, Database, Auth, Allocation). If not mentioned, infer or use 'General'."
                },
                taskId: {
                  type: Type.STRING,
                  description: "The task ID, starting with '#' if numerical, e.g. #1138. If not mentioned, make one up or leave empty."
                },
                description: {
                  type: Type.STRING,
                  description: "A professional, clear, and action-oriented description of what was done or is being done."
                },
                estimatedHours: {
                  type: Type.NUMBER,
                  description: "The estimated hours to complete the task. Default to 1.0 or 2.0 if not specified."
                }
              },
              required: ["project", "module", "taskId", "description", "estimatedHours"]
            }
          }
        }
      });

      const resultText = response.text;
      if (!resultText) {
        throw new Error("No response generated from Gemini.");
      }

      const tasks = JSON.parse(resultText);
      res.json({ tasks });
    } catch (error: any) {
      console.error("AI Task Generation Error:", error);
      res.status(500).json({ error: error?.message || "Failed to generate tasks using Gemini." });
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
