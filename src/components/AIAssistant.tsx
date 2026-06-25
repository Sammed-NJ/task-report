import React, { useState } from "react";
import { Sparkles, Loader2, ArrowRightLeft, FilePlus } from "lucide-react";
import { Task } from "../types";

interface AIAssistantProps {
  employeeName: string;
  onTasksGenerated: (newTasks: Omit<Task, "id">[], mode: "append" | "replace") => void;
  addToast: (text: string, type: "success" | "error" | "info") => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({
  employeeName,
  onTasksGenerated,
  addToast,
}) => {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<"append" | "replace">("append");

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      addToast("Please enter some task descriptions or bullet points first", "error");
      return;
    }

    setIsLoading(true);
    addToast("Generating tasks using Gemini AI...", "info");

    try {
      const response = await fetch("/api/generate-tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          employeeName: employeeName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate tasks");
      }

      if (data.tasks && Array.isArray(data.tasks)) {
        onTasksGenerated(data.tasks, mode);
        setPrompt("");
        addToast(`Successfully generated ${data.tasks.length} tasks!`, "success");
      } else {
        throw new Error("Invalid response format from server");
      }
    } catch (err: any) {
      console.error(err);
      addToast(err?.message || "An error occurred during task generation", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-gray-900/40 border border-[#e2e8f0] dark:border-gray-700 rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-600 text-white rounded-lg shadow-sm">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Gemini Task Assistant
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Paste raw bullet points or thoughts to generate formatted tasks.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <textarea
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={`e.g. 
- Finished the allocating sheet UI enhancements (#1138), took about 2 and a half hours.
- Then worked on approved timesheet entries voucher generation (#1139) - 3.5 hrs.
- Migrated cost center integration into accounts transactions and ran verification tests (2 hours)`}
          className="w-full text-xs p-3 bg-white dark:bg-gray-800 border border-[#e2e8f0] dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 resize-none"
        />

        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-gray-800 p-1 border border-[#e2e8f0] dark:border-gray-700 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setMode("append")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold text-[11px] transition-all ${
                mode === "append"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              <FilePlus className="h-3 w-3" />
              <span>Append</span>
            </button>
            <button
              type="button"
              onClick={() => setMode("replace")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold text-[11px] transition-all ${
                mode === "replace"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              <ArrowRightLeft className="h-3 w-3" />
              <span>Replace All</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 dark:disabled:bg-gray-800 text-white disabled:text-slate-400 dark:disabled:text-gray-500 rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>AI is structuring...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                <span>Structure Tasks</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
