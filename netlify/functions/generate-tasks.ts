export default async (req: Request) => {
  // Only allow POST requests
  if (req.method !== "POST" && req.method !== "OPTIONS") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
      }
    });
  }

  try {
    const { prompt, employeeName } = await req.json();
    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const apiKey = process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ 
        error: "GROQ_API_KEY or GEMINI_API_KEY is not configured in Netlify Environment Variables. Please set it in your site dashboard settings." 
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
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
    return new Response(JSON.stringify({ tasks: parsedData.tasks || [] }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    });
  } catch (error: any) {
    console.error("AI Task Generation Error:", error);
    return new Response(JSON.stringify({ error: error?.message || "Failed to generate tasks using Groq." }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
};
