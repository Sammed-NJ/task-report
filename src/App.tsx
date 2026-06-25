import React, { useState, useEffect, useRef } from "react";
import { 
  Plus, Trash2, Copy, ArrowUp, ArrowDown, Send, Check, 
  FileText, FileDown, Clock, User, Calendar, Terminal, 
  AlertCircle, Sparkles, CheckCircle2, RefreshCw, Layers, ShieldAlert, BadgeInfo,
  Search, ChevronDown, X, Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { downloadFile } from "./utils/helpers";


interface Task {
  id: string;
  project: string;
  description: string;
  hours: number | string;
  completed?: boolean;
}

interface WeeklyFocusItem {
  id: string;
  project: string;
  module: string;
  focus: string;
  completed?: boolean;
}

interface WeeklyAccomplishment {
  id: string;
  text: string;
  completed?: boolean;
}

// 32 Official Projects from the SOP Guide
const OFFICIAL_PROJECTS = [
  "BPP KUWAIT", "AJSONS", "C DESIGN", "MAB", "VANSALES", "CARDIA", 
  "KABANI FOODS", "DHC", "ADWAI", "LOAD KRISHNA", "NTC", "REDKNOX", 
  "VM - VYAPARI MITHRA", "WYNDHAM", "WITXML", "INHOUSE", "WE ARE FRESH", 
  "KK", "OZONE", "LEDGER X", "ACCOUNTS", "MERIDIAN", "DELISIA", "BMA", 
  "ARTISAN", "BLOOM", "HRMS", "COLLEGE PROJECT", "CRM", "FOSCHER", 
  "TAX TOTAL", "TASK MANAGEMENT"
];

// Default Date Generators
const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDateToDDMMYYYY = (dateStr: string): string => {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateStr;
};

// Searchable Project Select Component
interface SearchableProjectSelectProps {
  value: string;
  onChange: (val: string) => void;
  projects: string[];
  placeholder?: string;
}

function SearchableProjectSelect({ value, onChange, projects, placeholder = "Select Project..." }: SearchableProjectSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredProjects = projects.filter((proj) =>
    proj.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-xs font-mono bg-zinc-950 border border-zinc-850 rounded-lg px-2.5 py-2 text-zinc-200 flex items-center justify-between focus:outline-none focus:border-emerald-500/30 text-left min-h-[34px] cursor-pointer"
      >
        <span className={value ? "text-zinc-200" : "text-zinc-650"}>
          {value || placeholder}
        </span>
        <ChevronDown className={`h-3.5 w-3.5 text-zinc-550 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-lg shadow-xl overflow-hidden max-h-60 flex flex-col">
          {/* Search Input inside the dropdown */}
          <div className="p-2 border-b border-zinc-900 flex items-center gap-2 bg-zinc-900/50">
            <Search className="h-3 w-3 text-zinc-500 shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search project..."
              className="w-full bg-transparent text-[11px] font-mono text-zinc-200 focus:outline-none"
              autoFocus
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="text-zinc-500 hover:text-zinc-300"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Options List */}
          <div className="overflow-y-auto max-h-44 custom-scrollbar">
            {/* "Select None" option */}
            <button
              type="button"
              onClick={() => {
                onChange("");
                setSearchTerm("");
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-[10px] font-mono text-zinc-500 hover:bg-zinc-900/50 border-b border-zinc-900/30 flex items-center justify-between cursor-pointer"
            >
              <span>-- Select Project --</span>
              {!value && <Check className="h-3 w-3 text-emerald-400" />}
            </button>

            {filteredProjects.length > 0 ? (
              filteredProjects.map((proj) => (
                <button
                  key={proj}
                  type="button"
                  onClick={() => {
                    onChange(proj);
                    setSearchTerm("");
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-[11px] font-mono flex items-center justify-between transition-colors cursor-pointer ${
                    value === proj
                      ? "text-emerald-400 bg-emerald-950/20"
                      : "text-zinc-300 hover:bg-zinc-900"
                  }`}
                >
                  <span>{proj}</span>
                  {value === proj && <Check className="h-3 w-3 text-emerald-400" />}
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-[10px] font-mono text-zinc-650 text-center">
                No matching projects
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  // Enforce dark mode on mount
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      let hoursNum = now.getHours();
      const ampm = hoursNum >= 12 ? 'PM' : 'AM';
      hoursNum = hoursNum % 12;
      hoursNum = hoursNum ? hoursNum : 12; // conversion of '0' to '12'
      const hours = String(hoursNum).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setCurrentTime(`${day}-${month}-${year} | ${hours}:${minutes}:${seconds} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // --- Shared Metadata State ---
  const [employeeName, setEmployeeName] = useState<string>("");
  const [date, setDate] = useState<string>(getTodayDateString());

  // Available modes:
  // - "daily": Daily Task Update (with strict template format)
  // - "week-start": Weekly Planning (What I will do this week)
  // - "week-summary": Weekly Done (What I did this week)
  const [mode, setMode] = useState<"daily" | "week-start" | "week-summary">("daily");

  // --- Mobile Navigation Sub-Tab State ---
  const [mobileSubTab, setMobileSubTab] = useState<"edit" | "preview">("edit");

  const [copied, setCopied] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Focus Tracker: keeps track of which task card is currently active (so clicking official project tag injects it there)
  const [activeTaskIndex, setActiveTaskIndex] = useState<number>(0);

  // --- AI Sprint Assistant State ---
  const [aiPrompt, setAiPrompt] = useState<string>("");
  const [aiIsLoading, setAiIsLoading] = useState<boolean>(false);
  const [aiMode, setAiMode] = useState<"append" | "replace">("append");

  // --- 1. Daily Tasks State (Template A/B format) ---
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "d1",
      project: "",
      description: "",
      hours: "",
      completed: false
    }
  ]);

  // --- 2. Week Start Specific States (Weekly Focus Plan) ---
  const [weekRangeStart, setWeekRangeStart] = useState<string>("");
  const [weekStartRaw, setWeekStartRaw] = useState<string>("");
  const [weekEndRaw, setWeekEndRaw] = useState<string>("");
  const [weeklyFocusNote, setWeeklyFocusNote] = useState<string>("");
  const [weeklyFocusItems, setWeeklyFocusItems] = useState<WeeklyFocusItem[]>([
    {
      id: "wf-1",
      project: "",
      module: "",
      focus: "",
      completed: false
    }
  ]);

  // --- 3. Week Summary Specific States (Weekly Done Achievements) ---
  const [weekRangeSummary, setWeekRangeSummary] = useState<string>("");
  const [weekSummaryStartRaw, setWeekSummaryStartRaw] = useState<string>("");
  const [weekSummaryEndRaw, setWeekSummaryEndRaw] = useState<string>("");
  const [weeklyAccomplishments, setWeeklyAccomplishments] = useState<WeeklyAccomplishment[]>([
    { id: "wa-1", text: "", completed: false }
  ]);

  // --- Sync date pickers with Week Start text range ---
  useEffect(() => {
    if (weekStartRaw && weekEndRaw) {
      setWeekRangeStart(`${formatDateToDDMMYYYY(weekStartRaw)} to ${formatDateToDDMMYYYY(weekEndRaw)}`);
    } else if (weekStartRaw) {
      setWeekRangeStart(`${formatDateToDDMMYYYY(weekStartRaw)}`);
    }
  }, [weekStartRaw, weekEndRaw]);

  // --- Sync date pickers with Week Summary text range ---
  useEffect(() => {
    if (weekSummaryStartRaw && weekSummaryEndRaw) {
      setWeekRangeSummary(`${formatDateToDDMMYYYY(weekSummaryStartRaw)} – ${formatDateToDDMMYYYY(weekSummaryEndRaw)}`);
    } else if (weekSummaryStartRaw) {
      setWeekRangeSummary(`${formatDateToDDMMYYYY(weekSummaryStartRaw)}`);
    }
  }, [weekSummaryStartRaw, weekSummaryEndRaw]);

  // --- Calculations ---
  const totalDailyHours = tasks.reduce((sum, t) => sum + (Number(t.hours) || 0), 0);

  // --- Toast Manager ---
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // --- AI Sprint Assistant Handler ---
  const handleGenerateTasksWithAI = async () => {
    if (!aiPrompt.trim()) {
      showToast("Please enter some task descriptions or bullet points first");
      return;
    }

    setAiIsLoading(true);
    showToast("Generating tasks using Gemini AI...");

    try {
      const response = await fetch("/api/generate-tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: aiPrompt.trim(),
          employeeName: employeeName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate tasks");
      }

      if (data.tasks && Array.isArray(data.tasks)) {
        const mappedTasks: Task[] = data.tasks.map((t: any) => {
          let desc = t.description || "";
          if (t.module && t.module !== "General" && !desc.toLowerCase().includes(t.module.toLowerCase())) {
            desc = `[${t.module}] ${desc}`;
          }
          if (t.taskId && !desc.toLowerCase().includes(t.taskId.toLowerCase())) {
            desc = `${t.taskId}: ${desc}`;
          }
          return {
            id: Math.random().toString(36).substring(2, 9),
            project: (t.project || "INHOUSE").toUpperCase(),
            description: desc,
            hours: t.estimatedHours || 1,
            completed: false
          };
        });

        if (aiMode === "replace") {
          setTasks(mappedTasks);
          setActiveTaskIndex(0);
        } else {
          // If tasks has only one empty task, replace it
          if (tasks.length === 1 && !tasks[0].project && !tasks[0].description && !tasks[0].hours) {
            setTasks(mappedTasks);
            setActiveTaskIndex(0);
          } else {
            setTasks([...tasks, ...mappedTasks]);
            setActiveTaskIndex(tasks.length);
          }
        }
        setAiPrompt("");
        showToast(`Successfully generated ${data.tasks.length} tasks!`);
      } else {
        throw new Error("Invalid response format from server");
      }
    } catch (err: any) {
      console.error(err);
      showToast(err?.message || "An error occurred during task generation");
    } finally {
      setAiIsLoading(false);
    }
  };

  // --- Handlers for Daily Mode ---
  const handleAddTask = () => {
    const newTask: Task = {
      id: Math.random().toString(36).substring(2, 9),
      project: "",
      description: "",
      hours: "",
      completed: false
    };
    setTasks([...tasks, newTask]);
    setActiveTaskIndex(tasks.length); // auto-focus new row
    showToast("Added new Daily Task row.");
  };

  const handleUpdateTask = (id: string, updatedFields: Partial<Task>) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, ...updatedFields } : task)));
  };

  const handleRemoveTask = (id: string) => {
    if (tasks.length <= 1) {
      showToast("Keep at least one task row!");
      return;
    }
    const idx = tasks.findIndex((t) => t.id === id);
    setTasks(tasks.filter((task) => task.id !== id));
    if (activeTaskIndex >= tasks.length - 1) {
      setActiveTaskIndex(Math.max(0, tasks.length - 2));
    }
    showToast("Removed task row.");
  };

  const handleDuplicateTask = (taskToDup: Task) => {
    const duplicated: Task = {
      ...taskToDup,
      id: Math.random().toString(36).substring(2, 9),
    };
    const index = tasks.findIndex((t) => t.id === taskToDup.id);
    if (index !== -1) {
      const newTasks = [...tasks];
      newTasks.splice(index + 1, 0, duplicated);
      setTasks(newTasks);
      setActiveTaskIndex(index + 1);
      showToast("Duplicated daily task card.");
    }
  };

  const handleMoveTask = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === tasks.length - 1) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const newTasks = [...tasks];
    const temp = newTasks[index];
    newTasks[index] = newTasks[targetIndex];
    newTasks[targetIndex] = temp;
    setTasks(newTasks);
    setActiveTaskIndex(targetIndex);
  };

  // --- Handlers for Weekly Focus Mode ---
  const handleAddWeeklyFocus = () => {
    const newItem: WeeklyFocusItem = {
      id: Math.random().toString(36).substring(2, 9),
      project: "",
      module: "",
      focus: ""
    };
    setWeeklyFocusItems([...weeklyFocusItems, newItem]);
    showToast("Added focus objective.");
  };

  const handleUpdateWeeklyFocus = (id: string, updatedFields: Partial<WeeklyFocusItem>) => {
    setWeeklyFocusItems(weeklyFocusItems.map((item) => (item.id === id ? { ...item, ...updatedFields } : item)));
  };

  const handleRemoveWeeklyFocus = (id: string) => {
    if (weeklyFocusItems.length <= 1) {
      showToast("Keep at least one focus objective!");
      return;
    }
    setWeeklyFocusItems(weeklyFocusItems.filter((item) => item.id !== id));
    showToast("Removed focus row.");
  };

  const handleMoveWeeklyFocus = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === weeklyFocusItems.length - 1) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const newList = [...weeklyFocusItems];
    const temp = newList[index];
    newList[index] = newList[targetIndex];
    newList[targetIndex] = temp;
    setWeeklyFocusItems(newList);
  };

  // --- Handlers for Weekly Accomplishments Mode ---
  const handleAddAccomplishment = () => {
    const newItem: WeeklyAccomplishment = {
      id: Math.random().toString(36).substring(2, 9),
      text: ""
    };
    setWeeklyAccomplishments([...weeklyAccomplishments, newItem]);
    showToast("Added accomplishment bullet.");
  };

  const handleUpdateAccomplishment = (id: string, text: string) => {
    setWeeklyAccomplishments(weeklyAccomplishments.map((item) => (item.id === id ? { ...item, text } : item)));
  };

  const handleRemoveAccomplishment = (id: string) => {
    if (weeklyAccomplishments.length <= 1) {
      showToast("Keep at least one accomplishment line!");
      return;
    }
    setWeeklyAccomplishments(weeklyAccomplishments.filter((item) => item.id !== id));
    showToast("Removed accomplishment bullet.");
  };

  const handleMoveAccomplishment = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === weeklyAccomplishments.length - 1) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const newList = [...weeklyAccomplishments];
    const temp = newList[index];
    newList[index] = newList[targetIndex];
    newList[targetIndex] = temp;
    setWeeklyAccomplishments(newList);
  };

  const handleClearForm = () => {
    if (mode === "daily") {
      setTasks([
        {
          id: "d1",
          project: "",
          description: "",
          hours: "",
          completed: false
        }
      ]);
      setActiveTaskIndex(0);
    } else if (mode === "week-start") {
      setWeeklyFocusItems([
        {
          id: "wf-1",
          project: "",
          module: "",
          focus: "",
          completed: false
        }
      ]);
    } else {
      setWeeklyAccomplishments([
        {
          id: "wa-1",
          text: "",
          completed: false
        }
      ]);
    }
    showToast("Cleared active form data.");
  };

  const handleToggleTaskComplete = (id: string) => {
    setTasks(tasks.map((t) => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleToggleWeeklyFocusComplete = (id: string) => {
    setWeeklyFocusItems(weeklyFocusItems.map((item) => item.id === id ? { ...item, completed: !item.completed } : item));
  };

  const handleToggleAccomplishmentComplete = (id: string) => {
    setWeeklyAccomplishments(weeklyAccomplishments.map((item) => item.id === id ? { ...item, completed: !item.completed } : item));
  };

  // --- Injecting Official Project into current focused item ---
  const handleSelectOfficialProject = (project: string) => {
    if (mode === "daily") {
      if (tasks.length > 0 && activeTaskIndex >= 0 && activeTaskIndex < tasks.length) {
        handleUpdateTask(tasks[activeTaskIndex].id, { project });
        showToast(`Injected "${project}" into Active Task #${activeTaskIndex + 1}`);
      } else {
        // Fallback to active task
        handleUpdateTask(tasks[0].id, { project });
      }
    } else if (mode === "week-start") {
      // Inject to first empty or last item
      if (weeklyFocusItems.length > 0) {
        const lastIndex = weeklyFocusItems.length - 1;
        handleUpdateWeeklyFocus(weeklyFocusItems[lastIndex].id, { project });
        showToast(`Injected "${project}" to Weekly Focus Item #${lastIndex + 1}`);
      }
    }
  };

  // --- Output Compilation Engine ---
  const compileTemplateText = (): string => {
    const formattedDate = formatDateToDDMMYYYY(date);
    
    if (mode === "daily") {
      // STRICTLY ENFORCED DAILY TEMPLATE FORMAT
      // Date: [DD-MM-YYYY] | Name: [Your Name]
      // * [Project Name] | [Specific task description] | [Hours] hrs
      let report = `Date: ${formattedDate || "DD-MM-YYYY"} | Name: ${employeeName || "[Your Name]"}\n`;
      tasks.forEach((t) => {
        const projectClean = (t.project || "INHOUSE").toUpperCase();
        const descClean = t.description || "Specific task description";
        const hoursClean = t.hours || "0";
        report += `* ${projectClean} | ${descClean} | ${hoursClean} hrs\n`;
      });
      return report.trim();
    } else if (mode === "week-start") {
      // Week Start Template (Exactly as requested)
      let report = `*Week:* \`${weekRangeStart}\`\n`;
      report += `*Employee Name:* \`${employeeName || "[Your Name]"}\`\n\n`;
      report += `*Weekly Project Focus:*\n\n`;

      weeklyFocusItems.forEach((item, index) => {
        report += `${index + 1}. *Project:* \`${item.project || "N/A"}\` | *Module:* \`${item.module || "N/A"}\`\n`;
        report += `   *Focus:* \`${item.focus || "N/A"}\`\n\n`;
      });

      if (weeklyFocusNote.trim()) {
        report += `*Note:*\n\`${weeklyFocusNote}\``;
      }
      return report.trim();
    } else {
      // Week Summary Template (Exactly as requested)
      let report = `*Weekly Tasks Summary (${weekRangeSummary})*\n\n`;
      report += `*Employee Name:* \`${employeeName || "[Your Name]"}\`\n\n`;
      
      weeklyAccomplishments.forEach((item) => {
        const textToUse = item.text.trim();
        if (textToUse) {
          report += `* ${textToUse}\n`;
        }
      });
      return report.trim();
    }
  };

  const reportText = compileTemplateText();

  // --- Quick Clipboard Copy ---
  // --- Quick Clipboard Copy ---
  const handleCopyToClipboard = async () => {
    if (mode === "daily") {
      const hasEmptyDesc = tasks.some((t) => !t.description.trim());
      const hasZeroHours = tasks.some((t) => !t.hours || Number(t.hours) <= 0);
      const hasOverFour = tasks.some((t) => Number(t.hours) > 4);
      const hasVague = tasks.some((t) => t.description.trim().length > 0 && t.description.trim().length < 15);

      if (hasEmptyDesc) {
        showToast("⚠️ Warning: Some tasks have empty descriptions!");
      } else if (hasZeroHours) {
        showToast("⚠️ Warning: Some tasks have 0 hours allocated!");
      } else if (hasOverFour) {
        showToast("⚠️ Warning: The 4-Hour Rule is violated (max 4 hrs per task)!");
      } else if (hasVague) {
        showToast("⚠️ Warning: Some descriptions are vague (under 15 chars)!");
      }
    }

    try {
      await navigator.clipboard.writeText(reportText);
      setCopied(true);
      showToast("Compiled template copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      showToast("Manual select required. Clipboard access denied.");
    }
  };

  // --- Send to WhatsApp Integration ---
  const handleSendToWhatsApp = () => {
    if (mode === "daily") {
      const hasEmptyDesc = tasks.some((t) => !t.description.trim());
      const hasZeroHours = tasks.some((t) => !t.hours || Number(t.hours) <= 0);
      const hasOverFour = tasks.some((t) => Number(t.hours) > 4);
      const hasVague = tasks.some((t) => t.description.trim().length > 0 && t.description.trim().length < 15);

      if (hasEmptyDesc) {
        showToast("❌ Cannot send: Task description is required!");
        return;
      }
      if (hasZeroHours) {
        showToast("❌ Cannot send: All tasks must have hours > 0!");
        return;
      }
      if (hasOverFour) {
        showToast("❌ Cannot send: A task exceeds the 4-Hour maximum rule!");
        return;
      }
      if (hasVague) {
        showToast("❌ Cannot send: Vague task descriptions detected!");
        return;
      }
    }

    const encoded = encodeURIComponent(reportText);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(whatsappUrl, "_blank");
    showToast("Opening WhatsApp Web API redirect link...");
  };

  // --- Downloads ---
  const handleDownloadTXT = () => {
    const filename = `SOP_${mode}_report_${date || "draft"}.txt`;
    downloadFile(reportText, filename, "text/plain");
    showToast("Downloaded text file successfully.");
  };

  const handleDownloadMD = () => {
    const filename = `SOP_${mode}_report_${date || "draft"}.md`;
    downloadFile(reportText, filename, "text/markdown");
    showToast("Downloaded markdown file successfully.");
  };

  // --- QA SOP Checks for Warnings ---
  const hourAuditViolation = mode === "daily" && tasks.some((t) => Number(t.hours) > 4);
  const vagueTasksDetected = mode === "daily" && tasks.some((t) => t.description.trim().length > 0 && t.description.trim().length < 15);
  const emptyTasksDetected = mode === "daily" && tasks.some((t) => !t.description.trim());
  const zeroHoursDetected = mode === "daily" && tasks.some((t) => !t.hours || Number(t.hours) <= 0);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      
      {/* Absolute Header Overlay Toast alerts */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 bg-zinc-900 border border-emerald-500/40 text-emerald-400 px-4 py-3 rounded-md shadow-2xl flex items-center gap-2 text-xs font-mono"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <Terminal className="h-4 w-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6 space-y-4">
        
        {/* APP TITLE & TODAY'S DATE ROW */}
        <div className="flex items-center justify-center px-4 py-2.5 bg-zinc-900/25 border border-zinc-900/40 rounded-xl shadow-md">
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold tracking-wider">
            <Clock className="h-3.5 w-3.5 animate-pulse" />
            <span>{currentTime}</span>
          </div>
        </div>
        
        {/* TOP LEVEL COMPACT DASHBOARD HEADER - Integrated in Bento flow */}
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-1.5 flex gap-1 items-center shadow-lg">
          <button
            onClick={() => setMode("daily")}
            className={`flex-1 py-2 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer text-center ${
              mode === "daily"
                ? "bg-zinc-850 border border-emerald-500/30 text-emerald-400"
                : "border border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/20"
            }`}
          >
            <span className="hidden sm:inline">Daily Sprint Update</span>
            <span className="sm:hidden">Daily Sprint</span>
          </button>
          <button
            onClick={() => setMode("week-start")}
            className={`flex-1 py-2 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer text-center ${
              mode === "week-start"
                ? "bg-zinc-850 border border-emerald-500/30 text-emerald-400"
                : "border border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/20"
            }`}
          >
            <span className="hidden sm:inline">Weekly Focus (Plan)</span>
            <span className="sm:hidden">Weekly Plan</span>
          </button>
          <button
            onClick={() => setMode("week-summary")}
            className={`flex-1 py-2 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer text-center ${
              mode === "week-summary"
                ? "bg-zinc-850 border border-emerald-500/30 text-emerald-400"
                : "border border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/20"
            }`}
          >
            <span className="hidden sm:inline">Weekly Done (Summary)</span>
            <span className="sm:hidden">Weekly Done</span>
          </button>
        </div>

        {/* MOBILE SUB-TAB TOGGLE - ONLY VISIBLE ON MOBILE/TABLET */}
        <div className="lg:hidden bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-1 flex gap-1 items-center shadow-lg">
          <button
            onClick={() => setMobileSubTab("edit")}
            className={`flex-1 py-2 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer text-center ${
              mobileSubTab === "edit"
                ? "bg-zinc-850 border border-emerald-500/30 text-emerald-400"
                : "border border-transparent text-zinc-500 hover:text-zinc-350 hover:bg-zinc-800/20"
            }`}
          >
            1. Report Editor
          </button>
          <button
            onClick={() => setMobileSubTab("preview")}
            className={`flex-1 py-2 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer text-center relative ${
              mobileSubTab === "preview"
                ? "bg-zinc-850 border border-emerald-500/30 text-emerald-400"
                : "border border-transparent text-zinc-500 hover:text-zinc-350 hover:bg-zinc-800/20"
            }`}
          >
            <span>2. Preview & Checklist</span>
            {mode === "daily" && (hourAuditViolation || vagueTasksDetected || emptyTasksDetected || zeroHoursDetected) && (
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
            )}
          </button>
        </div>

        {/* BENTO BOX GRID LAYOUT - 12 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* LEFT AREA: INTERACTIVE CONTROLS (Col span 7) */}
          <div className={`lg:col-span-7 space-y-4 ${mobileSubTab === "edit" ? "block" : "hidden lg:block"}`}>
            
            {/* Bento Card A: User Context Profile Metadata */}
            <div className="bg-zinc-900/40 border border-zinc-900 rounded-xl p-5 space-y-4 shadow-md">
              <div className="flex items-center gap-2 border-b border-zinc-800/50 pb-3">
                <Layers className="h-4 w-4 text-emerald-500" />
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
                  REPORT PROFILE DETAILS
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 block">
                    Developer Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-600" />
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      value={employeeName}
                      onChange={(e) => setEmployeeName(e.target.value)}
                      className="w-full text-xs font-mono bg-zinc-950 border border-zinc-850 rounded-lg pl-9 pr-3 py-2.5 text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/10 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  {mode === "daily" ? (
                    <>
                      <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 block">
                        Update Report Date
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-600" />
                        <input
                          type="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className="w-full text-xs font-mono bg-zinc-950 border border-zinc-850 rounded-lg pl-9 pr-3 py-2.5 text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/10 transition-all [color-scheme:dark]"
                        />
                      </div>
                    </>
                  ) : mode === "week-start" ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 block">
                          Week Start Range
                        </label>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="relative">
                          <input
                            type="date"
                            value={weekStartRaw}
                            onChange={(e) => setWeekStartRaw(e.target.value)}
                            className="w-full text-xs font-mono bg-zinc-950 border border-zinc-850 rounded-lg px-2.5 py-2 text-zinc-100 focus:outline-none focus:border-emerald-500/40 transition-all [color-scheme:dark]"
                          />
                          <span className="absolute right-2.5 top-1.5 text-[8px] font-mono text-zinc-600 pointer-events-none uppercase">From</span>
                        </div>
                        <div className="relative">
                          <input
                            type="date"
                            value={weekEndRaw}
                            onChange={(e) => setWeekEndRaw(e.target.value)}
                            className="w-full text-xs font-mono bg-zinc-950 border border-zinc-850 rounded-lg px-2.5 py-2 text-zinc-100 focus:outline-none focus:border-emerald-500/40 transition-all [color-scheme:dark]"
                          />
                          <span className="absolute right-2.5 top-1.5 text-[8px] font-mono text-zinc-600 pointer-events-none uppercase">To</span>
                        </div>
                      </div>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-600" />
                        <input
                          type="text"
                          placeholder="e.g. 08-06-2026 to 12-06-2026"
                          value={weekRangeStart}
                          onChange={(e) => setWeekRangeStart(e.target.value)}
                          className="w-full text-xs font-mono bg-zinc-950 border border-zinc-850 rounded-lg pl-9 pr-3 py-2.5 text-zinc-100 focus:outline-none focus:border-emerald-500/40 transition-all"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 block">
                          Week Summary Range
                        </label>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="relative">
                          <input
                            type="date"
                            value={weekSummaryStartRaw}
                            onChange={(e) => setWeekSummaryStartRaw(e.target.value)}
                            className="w-full text-xs font-mono bg-zinc-950 border border-zinc-850 rounded-lg px-2.5 py-2 text-zinc-100 focus:outline-none focus:border-emerald-500/40 transition-all [color-scheme:dark]"
                          />
                          <span className="absolute right-2.5 top-1.5 text-[8px] font-mono text-zinc-600 pointer-events-none uppercase">From</span>
                        </div>
                        <div className="relative">
                          <input
                            type="date"
                            value={weekSummaryEndRaw}
                            onChange={(e) => setWeekSummaryEndRaw(e.target.value)}
                            className="w-full text-xs font-mono bg-zinc-950 border border-zinc-850 rounded-lg px-2.5 py-2 text-zinc-100 focus:outline-none focus:border-emerald-500/40 transition-all [color-scheme:dark]"
                          />
                          <span className="absolute right-2.5 top-1.5 text-[8px] font-mono text-zinc-600 pointer-events-none uppercase">To</span>
                        </div>
                      </div>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-600" />
                        <input
                          type="text"
                          placeholder="e.g. 01.06.2026 – 06.06.2026"
                          value={weekRangeSummary}
                          onChange={(e) => setWeekRangeSummary(e.target.value)}
                          className="w-full text-xs font-mono bg-zinc-950 border border-zinc-850 rounded-lg pl-9 pr-3 py-2.5 text-zinc-100 focus:outline-none focus:border-emerald-500/40 transition-all"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* AI Assistant Bento Card */}
            {mode === "daily" && (
              <div className="bg-zinc-900/40 border border-zinc-900 rounded-xl p-5 space-y-4 shadow-md">
                <div className="flex items-center gap-2 border-b border-zinc-800/50 pb-3">
                  <Sparkles className="h-4 w-4 text-emerald-400 animate-pulse" />
                  <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
                    GEMINI SPRINT ASSISTANT
                  </h2>
                </div>
                <div className="space-y-3">
                  <textarea
                    rows={3}
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder={`Paste raw daily bullets, Slack messages, or notes here...\ne.g. Finished the allocating sheet UI enhancements (#1138), took about 2 and a half hours.\nMigrated cost center integration and ran tests (2 hours)`}
                    className="w-full text-xs font-mono bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-zinc-200 placeholder-zinc-800 focus:outline-none focus:border-emerald-500/30 resize-none leading-relaxed"
                  />
                  <div className="flex flex-wrap items-center justify-between gap-2.5">
                    <div className="flex items-center gap-1 bg-zinc-950 p-1 border border-zinc-850 rounded-lg text-xs">
                      <button
                        type="button"
                        onClick={() => setAiMode("append")}
                        className={`px-2.5 py-1 rounded-md font-mono text-[10px] font-bold uppercase transition-all cursor-pointer ${
                          aiMode === "append"
                            ? "bg-zinc-850 border border-emerald-500/20 text-emerald-400"
                            : "text-zinc-500 hover:text-zinc-350"
                        }`}
                      >
                        Append
                      </button>
                      <button
                        type="button"
                        onClick={() => setAiMode("replace")}
                        className={`px-2.5 py-1 rounded-md font-mono text-[10px] font-bold uppercase transition-all cursor-pointer ${
                          aiMode === "replace"
                            ? "bg-zinc-850 border border-emerald-500/20 text-emerald-400"
                            : "text-zinc-500 hover:text-zinc-350"
                        }`}
                      >
                        Replace All
                      </button>
                    </div>
                    
                    <button
                      type="button"
                      onClick={handleGenerateTasksWithAI}
                      disabled={aiIsLoading || !aiPrompt.trim()}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-950 disabled:border-zinc-850 disabled:text-zinc-700 text-zinc-950 rounded-lg text-[11px] font-mono font-bold cursor-pointer transition-all shadow-md"
                    >
                      {aiIsLoading ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>AI IS STRUCTURING...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>STRUCTURE WITH GEMINI</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Bento Card B: Active Data List Editor */}
            <div className="bg-zinc-900/40 border border-zinc-900 rounded-xl p-4 sm:p-5 space-y-4 shadow-md">
              
              {/* Dynamic Sub-header based on mode */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800/50 pb-3 gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-400" />
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-200">
                    {mode === "daily" && `Daily Action Items (${tasks.length})`}
                    {mode === "week-start" && `Weekly Focus Breakdown (${weeklyFocusItems.length})`}
                    {mode === "week-summary" && `Accomplishment Bullet Points (${weeklyAccomplishments.length})`}
                  </h3>
                </div>

                {/* Add Row Button */}
                {mode === "daily" && (
                  <button
                    onClick={handleAddTask}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500 hover:text-zinc-950 text-emerald-400 rounded-lg text-[11px] font-mono font-bold cursor-pointer transition-all w-full sm:w-auto"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>ADD TASK ROW</span>
                  </button>
                )}
                {mode === "week-start" && (
                  <button
                    onClick={handleAddWeeklyFocus}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500 hover:text-zinc-950 text-emerald-400 rounded-lg text-[11px] font-mono font-bold cursor-pointer transition-all w-full sm:w-auto"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>ADD FOCUS AREA</span>
                  </button>
                )}
                {mode === "week-summary" && (
                  <button
                    onClick={handleAddAccomplishment}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500 hover:text-zinc-950 text-emerald-400 rounded-lg text-[11px] font-mono font-bold cursor-pointer transition-all w-full sm:w-auto"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>ADD BULLET</span>
                  </button>
                )}
              </div>

              {/* LIST ITEMS RENDER CONTAINER - scrollable internally */}
              <div className="max-h-[500px] overflow-y-auto pr-1 sm:pr-2 space-y-4 custom-scrollbar">
                
                {/* 1. Daily Tasks Editor List */}
                {mode === "daily" && (
                  <div className="space-y-3">
                    {tasks.map((t, index) => {
                      const isFocused = activeTaskIndex === index;
                      return (
                        <div 
                          key={t.id}
                          onClick={() => setActiveTaskIndex(index)}
                          className={`p-3.5 sm:p-4 rounded-xl border transition-all relative ${
                            isFocused 
                              ? "bg-zinc-900/90 border-emerald-500/30 shadow-lg" 
                              : "bg-zinc-950/40 border-zinc-900/80 hover:border-zinc-800"
                          }`}
                        >
                          {/* Row Header controls */}
                          <div className="flex items-center justify-between border-b border-zinc-900 pb-2 mb-3">
                            <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-2">
                              <span className={`w-1.5 h-1.5 rounded-full ${isFocused ? "bg-emerald-400" : "bg-zinc-700"}`} />
                              TASK ROW #{index + 1} {isFocused && <span className="text-[9px] text-emerald-500 font-bold uppercase"><span className="hidden sm:inline">(Active Input Target)</span><span className="sm:hidden">(Active)</span></span>}
                            </span>

                            <div className="flex items-center gap-1.5">
                              {/* Reordering */}
                              <button
                                disabled={index === 0}
                                onClick={(e) => { e.stopPropagation(); handleMoveTask(index, "up"); }}
                                className="p-1 text-zinc-500 hover:text-zinc-200 disabled:opacity-20 rounded cursor-pointer"
                                title="Move Row Up"
                              >
                                <ArrowUp className="h-3.5 w-3.5" />
                              </button>
                              <button
                                disabled={index === tasks.length - 1}
                                onClick={(e) => { e.stopPropagation(); handleMoveTask(index, "down"); }}
                                className="p-1 text-zinc-500 hover:text-zinc-200 disabled:opacity-20 rounded cursor-pointer"
                                title="Move Row Down"
                              >
                                <ArrowDown className="h-3.5 w-3.5" />
                              </button>

                              {/* Duplicate */}
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDuplicateTask(t); }}
                                className="p-1 text-zinc-500 hover:text-emerald-400 rounded cursor-pointer"
                                title="Duplicate Row"
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </button>

                              {/* Delete */}
                              <button
                                onClick={(e) => { e.stopPropagation(); handleRemoveTask(t.id); }}
                                className="p-1 text-zinc-500 hover:text-rose-500 rounded cursor-pointer"
                                title="Delete Row"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Dual columns: Project Selection & Estimated Time */}
                          <div className="grid grid-cols-2 md:grid-cols-12 gap-3 mb-3">
                            
                            {/* Project Name Selector Select Box */}
                            <div className="col-span-1 md:col-span-8 space-y-1">
                              <label className="block text-[9px] font-mono font-bold uppercase text-zinc-500">
                                Official Project Name
                              </label>
                              <SearchableProjectSelect
                                value={t.project}
                                onChange={(val) => handleUpdateTask(t.id, { project: val })}
                                projects={OFFICIAL_PROJECTS}
                                placeholder="Select Project..."
                              />
                            </div>

                            {/* Estimated Hours Input */}
                            <div className="col-span-1 md:col-span-4 space-y-1">
                              <label className="block text-[9px] font-mono font-bold uppercase text-zinc-500 flex justify-between">
                                <span>Time</span>
                                <span className="text-[8px] text-zinc-650 font-normal hidden sm:inline">Max: 4h</span>
                              </label>
                              <div className="relative">
                                <input
                                  type="number"
                                  step="0.5"
                                  min="0"
                                  placeholder="Hours"
                                  value={t.hours}
                                  onChange={(e) => handleUpdateTask(t.id, { hours: e.target.value })}
                                  className={`w-full text-xs font-mono bg-zinc-950 border rounded-lg px-2 py-2 text-zinc-200 focus:outline-none focus:border-emerald-500/30 pr-8 ${
                                    Number(t.hours) > 4 ? "border-amber-500/40" : "border-zinc-850"
                                  }`}
                                />
                                <span className="absolute right-2.5 top-2 text-[10px] font-mono text-zinc-650">hrs</span>
                              </div>
                            </div>

                          </div>

                          {/* Task Description */}
                          <div className="space-y-1">
                            <label className="block text-[9px] font-mono font-bold uppercase text-zinc-500 flex justify-between">
                              <span>Specific task details & action items</span>
                              {t.description.length > 0 && t.description.length < 15 && (
                                <span className="text-[8px] text-amber-400 font-bold">VAGUE UPDATE WARNING</span>
                              )}
                            </label>
                            <textarea
                              rows={2}
                              placeholder="Detail specifically what you are fixing, testing, or developing (No vague text!)..."
                              value={t.description}
                              onChange={(e) => handleUpdateTask(t.id, { description: e.target.value })}
                              className="w-full text-xs font-mono bg-zinc-950 border border-zinc-850 rounded-lg px-2.5 py-2 text-zinc-200 placeholder-zinc-800 focus:outline-none focus:border-emerald-500/30 resize-none leading-relaxed"
                            />
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 2. Weekly Focus Editor List */}
                {mode === "week-start" && (
                  <div className="space-y-3">
                    {weeklyFocusItems.map((item, index) => (
                      <div 
                        key={item.id}
                        className="p-4 rounded-xl border bg-zinc-950/40 border-zinc-900/80 hover:border-zinc-800 space-y-3 relative transition-all"
                      >
                        <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                          <span className="text-[10px] font-mono text-zinc-500">
                            FOCUS ITEM #{index + 1}
                          </span>

                          <div className="flex items-center gap-1.5">
                            <button
                              disabled={index === 0}
                              onClick={() => handleMoveWeeklyFocus(index, "up")}
                              className="p-1 text-zinc-500 hover:text-zinc-200 disabled:opacity-20 rounded cursor-pointer"
                            >
                              <ArrowUp className="h-3.5 w-3.5" />
                            </button>
                            <button
                              disabled={index === weeklyFocusItems.length - 1}
                              onClick={() => handleMoveWeeklyFocus(index, "down")}
                              className="p-1 text-zinc-500 hover:text-zinc-200 disabled:opacity-20 rounded cursor-pointer"
                            >
                              <ArrowDown className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleRemoveWeeklyFocus(item.id)}
                              className="p-1 text-zinc-500 hover:text-rose-500 rounded cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="block text-[9px] font-mono font-bold uppercase text-zinc-500">
                              Project Focus
                            </label>
                            <SearchableProjectSelect
                              value={item.project}
                              onChange={(val) => handleUpdateWeeklyFocus(item.id, { project: val })}
                              projects={OFFICIAL_PROJECTS}
                              placeholder="Select Project..."
                            />
                          </div>
                          
                          <div className="space-y-1">
                            <label className="block text-[9px] font-mono font-bold uppercase text-zinc-500">
                              Module Name
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Timesheet Management"
                              value={item.module}
                              onChange={(e) => handleUpdateWeeklyFocus(item.id, { module: e.target.value })}
                              className="w-full text-xs font-mono bg-zinc-950 border border-zinc-850 rounded-lg px-2.5 py-1.5 text-zinc-200 placeholder-zinc-800 focus:outline-none focus:border-emerald-500/30"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[9px] font-mono font-bold uppercase text-zinc-500">
                            Core technical Focus Checklist
                          </label>
                          <textarea
                            rows={2}
                            placeholder="e.g. Business logic, validation, testing, and bug fixing..."
                            value={item.focus}
                            onChange={(e) => handleUpdateWeeklyFocus(item.id, { focus: e.target.value })}
                            className="w-full text-xs font-mono bg-zinc-950 border border-zinc-850 rounded-lg px-2.5 py-2 text-zinc-200 placeholder-zinc-800 focus:outline-none focus:border-emerald-500/30 resize-none leading-relaxed"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 3. Weekly Accomplishments Bullet Editor List */}
                {mode === "week-summary" && (
                  <div className="space-y-2">
                    {weeklyAccomplishments.map((item, index) => (
                      <div 
                        key={item.id}
                        className="flex items-center gap-2.5 bg-zinc-950/40 p-2.5 rounded-lg border border-zinc-900 hover:border-zinc-800 transition-all"
                      >
                        <span className="text-[10px] font-mono text-zinc-600 select-none w-5 text-right">
                          #{index + 1}
                        </span>

                        <input
                          type="text"
                          placeholder="Developed Cost Centre UI following ERP guidelines..."
                          value={item.text}
                          onChange={(e) => handleUpdateAccomplishment(item.id, e.target.value)}
                          className="flex-1 text-xs font-mono bg-zinc-950 border border-zinc-850 rounded px-2.5 py-1.5 text-zinc-100 placeholder-zinc-800 focus:outline-none focus:border-emerald-500/30"
                        />

                        <div className="flex items-center gap-1">
                          <button
                            disabled={index === 0}
                            onClick={() => handleMoveAccomplishment(index, "up")}
                            className="p-1 text-zinc-600 hover:text-zinc-300 disabled:opacity-20 rounded cursor-pointer"
                          >
                            <ArrowUp className="h-3 w-3" />
                          </button>
                          <button
                            disabled={index === weeklyAccomplishments.length - 1}
                            onClick={() => handleMoveAccomplishment(index, "down")}
                            className="p-1 text-zinc-600 hover:text-zinc-300 disabled:opacity-20 rounded cursor-pointer"
                          >
                            <ArrowDown className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleRemoveAccomplishment(item.id)}
                            className="p-1 text-zinc-600 hover:text-rose-400 rounded cursor-pointer"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>

              {/* Reset Draft Form button */}
              <div className="pt-3 border-t border-zinc-900 flex justify-end items-center">
                <button
                  type="button"
                  onClick={handleClearForm}
                  className="px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500 hover:text-zinc-950 text-rose-500 text-xs font-mono font-bold rounded-lg cursor-pointer transition-all uppercase tracking-wider"
                >
                  Clear Active Form Draft
                </button>
              </div>

            </div>

            {/* Bento Card C: Optional Footer / General Note block (Appended at very bottom under total hours) */}
            {mode === "daily" && (
              <div className="bg-zinc-900/40 border border-zinc-900 rounded-xl p-5 space-y-3.5 shadow-md">
                <div className="space-y-1">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                    <BadgeInfo className="h-4 w-4 text-emerald-400" />
                    ADDITIONAL NOTES
                  </h4>
                  <p className="text-[10px] text-zinc-500">
                    Optional general blockers, milestone highlights, or custom statements to append under your daily hours.
                  </p>
                </div>

                <textarea
                  rows={2}
                  placeholder="e.g. Blockers escalated to Lead; or, completed pre-release testing routines."
                  value={weeklyFocusNote}
                  onChange={(e) => setWeeklyFocusNote(e.target.value)}
                  className="w-full text-xs font-mono bg-zinc-950 border border-zinc-850 rounded-lg px-3 py-2 text-zinc-200 placeholder-zinc-800 focus:outline-none focus:border-emerald-500/30 resize-none leading-relaxed"
                />
              </div>
            )}

          </div>

          {/* RIGHT AREA: PREVIEWS, DIRECTIVES & OFFICIAL LISTS (Col span 5) */}
          <div className={`lg:col-span-5 space-y-4 ${mobileSubTab === "preview" ? "block" : "hidden lg:block"}`}>
            
            {/* Bento Card D: COMPILATION TEMPLATE PREVIEW CONSOLE */}
            <div className="bg-zinc-900/40 border border-zinc-900 rounded-xl p-4 sm:p-5 flex flex-col space-y-4 shadow-md">
              <div className="flex items-center justify-between border-b border-zinc-800/50 pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
                    LIVE CONSOLE PREVIEW
                  </span>
                </div>
                
                <span className="text-[9px] font-mono bg-zinc-950 border border-zinc-850 px-2 py-0.5 rounded text-zinc-500">
                  {reportText.length} Chars | {reportText.split("\n").length} Lines
                </span>
              </div>

              {/* Text Area Output Block */}
              <div className="bg-zinc-950 border border-zinc-850/80 rounded-lg p-4 font-mono text-[11px] text-zinc-200 leading-relaxed overflow-y-auto max-h-[350px] whitespace-pre-wrap select-all shadow-inner scrollbar">
                {reportText}
              </div>

              {/* Calculation Stats Metrics Widget */}
              {mode === "daily" && (
                <div className="bg-zinc-950/80 border border-zinc-900 p-3.5 rounded-lg flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">
                      Compliance Status
                    </span>
                    {hourAuditViolation || vagueTasksDetected || emptyTasksDetected || zeroHoursDetected ? (
                      <span className="text-[9px] bg-rose-500/10 border border-rose-500/30 text-rose-400 px-2 py-0.5 rounded uppercase font-mono font-bold inline-block">
                        Attention Required
                      </span>
                    ) : tasks.length > 0 && tasks.some(t => t.description.trim()) ? (
                      <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded uppercase font-mono font-bold inline-block">
                        SOP COMPLIANT
                      </span>
                    ) : (
                      <span className="text-[9px] bg-zinc-800/40 border border-zinc-800 text-zinc-500 px-2 py-0.5 rounded uppercase font-mono font-bold inline-block">
                        Draft (No Tasks)
                      </span>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block">
                      Total Day Time Taken
                    </span>
                    <span className="text-sm font-mono font-bold text-zinc-100 flex items-center gap-1.5 justify-end">
                      <Clock className="h-4 w-4 text-emerald-400" />
                      {totalDailyHours} <span className="text-zinc-500 text-xs font-normal">hrs</span>
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons Stack */}
              <div className="space-y-2 pt-2">
                
                {/* Primary Button: WhatsApp API Link */}
                <button
                  type="button"
                  onClick={handleSendToWhatsApp}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-lg font-mono font-bold text-xs shadow-lg shadow-emerald-500/10 cursor-pointer transition-all"
                >
                  <Send className="h-4 w-4 stroke-[2.5]" />
                  <span>SEND TO WHATSAPP</span>
                </button>

                {/* Copy to Clipboard Trigger */}
                <button
                  type="button"
                  onClick={handleCopyToClipboard}
                  className={`w-full flex items-center justify-center gap-2 py-2 border font-mono font-bold text-xs rounded-lg transition-all cursor-pointer ${
                    copied
                      ? "bg-zinc-900 border-emerald-500/40 text-emerald-400"
                      : "bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-200"
                  }`}
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  <span>{copied ? "TEMPLATE COPIED!" : "COPY RAW CONTENT"}</span>
                </button>

                {/* Sub-downloads Grid */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadTXT}
                    className="flex items-center justify-center gap-1.5 py-2 bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 rounded-lg text-[10px] font-mono font-semibold transition-all cursor-pointer"
                  >
                    <FileText className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Download TXT</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleDownloadMD}
                    className="flex items-center justify-center gap-1.5 py-2 bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 rounded-lg text-[10px] font-mono font-semibold transition-all cursor-pointer"
                  >
                    <FileDown className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Download MD</span>
                  </button>
                </div>

              </div>
            </div>

            {/* Bento Card F: Compliance Warning Checklist & Audit Panel */}
            <div className="bg-zinc-900/40 border border-zinc-900 rounded-xl p-4 sm:p-5 space-y-5 shadow-md font-mono text-[10px] leading-relaxed">
              
              {/* Part 1: Interactive Created Tasks Checklist */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wide">
                      {mode === "daily" ? "DAILY TASKS CHECKLIST" : mode === "week-start" ? "WEEKLY FOCUS CHECKLIST" : "ACCOMPLISHMENTS CHECKLIST"}
                    </h4>
                  </div>
                  <span className="text-[9px] text-zinc-500 uppercase tracking-wider">
                    {mode === "daily" 
                      ? `${totalDailyHours} hrs total • ${tasks.filter(t => t.completed).length}/${tasks.length} Done` 
                      : mode === "week-start" 
                        ? `${weeklyFocusItems.filter(f => f.completed).length}/${weeklyFocusItems.length} Planned`
                        : `${weeklyAccomplishments.filter(a => a.completed).length}/${weeklyAccomplishments.length} Completed`
                    }
                  </span>
                </div>

                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                  {mode === "daily" && (
                    tasks.length === 0 || (tasks.length === 1 && !tasks[0].description) ? (
                      <div className="text-zinc-600 text-[9px] py-4 text-center italic">
                        No active tasks to display in checklist. Write some descriptions!
                      </div>
                    ) : (
                      tasks.map((t) => (
                        <div 
                          key={t.id}
                          onClick={() => handleToggleTaskComplete(t.id)}
                          className="flex items-start gap-2.5 p-2 bg-zinc-950/40 hover:bg-zinc-950/80 border border-zinc-850/50 hover:border-zinc-800 rounded-lg cursor-pointer select-none transition-all"
                        >
                          <div className={`mt-0.5 h-3.5 w-3.5 rounded border flex items-center justify-center shrink-0 transition-all ${
                            t.completed 
                              ? "bg-emerald-500 border-emerald-500 text-zinc-950" 
                              : "border-zinc-700 hover:border-zinc-500"
                          }`}>
                            {t.completed && <Check className="h-2.5 w-2.5 stroke-[3px]" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[9px] font-bold px-1 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded">
                                {t.project || "ACCOUNTS"}
                              </span>
                              {t.hours > 0 && (
                                <span className="text-[8px] text-zinc-500">
                                  ({t.hours} hrs)
                                </span>
                              )}
                            </div>
                            <p className={`text-[9.5px] mt-1 break-words leading-relaxed ${
                              t.completed ? "text-zinc-500 line-through decoration-zinc-700" : "text-zinc-300"
                            }`}>
                              {t.description || <span className="italic text-zinc-650">(No description written yet)</span>}
                            </p>
                          </div>
                        </div>
                      ))
                    )
                  )}

                  {mode === "week-start" && (
                    weeklyFocusItems.length === 0 || (weeklyFocusItems.length === 1 && !weeklyFocusItems[0].focus) ? (
                      <div className="text-zinc-600 text-[9px] py-4 text-center italic">
                        No focus items to display in checklist.
                      </div>
                    ) : (
                      weeklyFocusItems.map((item) => (
                        <div 
                          key={item.id}
                          onClick={() => handleToggleWeeklyFocusComplete(item.id)}
                          className="flex items-start gap-2.5 p-2 bg-zinc-950/40 hover:bg-zinc-950/80 border border-zinc-850/50 hover:border-zinc-800 rounded-lg cursor-pointer select-none transition-all"
                        >
                          <div className={`mt-0.5 h-3.5 w-3.5 rounded border flex items-center justify-center shrink-0 transition-all ${
                            item.completed 
                              ? "bg-emerald-500 border-emerald-500 text-zinc-950" 
                              : "border-zinc-700 hover:border-zinc-500"
                          }`}>
                            {item.completed && <Check className="h-2.5 w-2.5 stroke-[3px]" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[9px] font-bold px-1 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded">
                                {item.project || "ACCOUNTS"}
                              </span>
                              {item.module && (
                                <span className="text-[8.5px] text-emerald-400 font-semibold">
                                  {item.module}
                                </span>
                              )}
                            </div>
                            <p className={`text-[9.5px] mt-1 break-words leading-relaxed ${
                              item.completed ? "text-zinc-500 line-through decoration-zinc-700" : "text-zinc-300"
                            }`}>
                              {item.focus || <span className="italic text-zinc-650">(No focus details written yet)</span>}
                            </p>
                          </div>
                        </div>
                      ))
                    )
                  )}

                  {mode === "week-summary" && (
                    weeklyAccomplishments.length === 0 || (weeklyAccomplishments.length === 1 && !weeklyAccomplishments[0].text) ? (
                      <div className="text-zinc-600 text-[9px] py-4 text-center italic">
                        No accomplishment items to display in checklist.
                      </div>
                    ) : (
                      weeklyAccomplishments.map((item) => (
                        <div 
                          key={item.id}
                          onClick={() => handleToggleAccomplishmentComplete(item.id)}
                          className="flex items-start gap-2.5 p-2 bg-zinc-950/40 hover:bg-zinc-950/80 border border-zinc-850/50 hover:border-zinc-800 rounded-lg cursor-pointer select-none transition-all"
                        >
                          <div className={`mt-0.5 h-3.5 w-3.5 rounded border flex items-center justify-center shrink-0 transition-all ${
                            item.completed 
                              ? "bg-emerald-500 border-emerald-500 text-zinc-950" 
                              : "border-zinc-700 hover:border-zinc-500"
                          }`}>
                            {item.completed && <Check className="h-2.5 w-2.5 stroke-[3px]" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-[9.5px] break-words leading-relaxed ${
                              item.completed ? "text-zinc-500 line-through decoration-zinc-700" : "text-zinc-300"
                            }`}>
                              {item.text || <span className="italic text-zinc-650">(No accomplishments written yet)</span>}
                            </p>
                          </div>
                        </div>
                      ))
                    )
                  )}
                </div>
              </div>

              {/* Part 2: SOP Compliance Warnings and Audits */}
              <div className="space-y-3 pt-3 border-t border-zinc-900">
                <div className="flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4 text-emerald-400" />
                  <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wide">
                    SOP COMPLIANCE CHECKLIST
                  </h4>
                </div>

                {/* Status Indicator Board */}
                <div className="space-y-2.5 text-zinc-400">
                  <div className="flex items-start gap-2">
                    <span className={`select-none ${hourAuditViolation ? "text-rose-400 font-bold" : "text-emerald-500"}`}>
                      {hourAuditViolation ? "✗" : "✓"}
                    </span>
                    <div>
                      <strong className={hourAuditViolation ? "text-rose-400" : "text-zinc-350"}>The 4-Hour Rule:</strong> No single task estimate should exceed 4 hours.
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className={`select-none ${vagueTasksDetected ? "text-rose-400 font-bold" : "text-emerald-500"}`}>
                      {vagueTasksDetected ? "✗" : "✓"}
                    </span>
                    <div>
                      <strong className={vagueTasksDetected ? "text-rose-400" : "text-zinc-350"}>Specific Detail Only:</strong> Updates must name specific features/bugs (no vague texts).
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="text-emerald-500 select-none">✓</span>
                    <div>
                      <strong className="text-zinc-350">Total Time Tracking:</strong> Registered <span className="text-emerald-400 font-bold">{totalDailyHours} hrs</span> for today (dynamic task summation, no 8-hour limit).
                    </div>
                  </div>
                </div>

                {/* Live Alerts Box if any violation happens */}
                {(hourAuditViolation || vagueTasksDetected || emptyTasksDetected || zeroHoursDetected) ? (
                  <div className="mt-2 p-3 bg-rose-500/5 border border-rose-500/20 text-rose-400 rounded-lg space-y-1">
                    <div className="font-bold uppercase tracking-wider text-[9px] flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>Compliance warnings found:</span>
                    </div>
                    <ul className="list-disc list-inside text-[9px] space-y-0.5 text-zinc-400">
                      {hourAuditViolation && (
                        <li>A task exceeds the 4-Hour maximum rule. Please split it!</li>
                      )}
                      {emptyTasksDetected && (
                        <li>One or more tasks have empty descriptions!</li>
                      )}
                      {zeroHoursDetected && (
                        <li>One or more tasks have 0 hours allocated!</li>
                      )}
                      {vagueTasksDetected && (
                        <li>Vague description detected. Ensure details describe specifically what was worked on!</li>
                      )}
                    </ul>
                  </div>
                ) : (
                  <div className="mt-2 p-2.5 bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 rounded-lg flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                    <span className="font-bold uppercase tracking-wider text-[9px]">
                      SOP Verification: ALL AUDITS CLEAR
                    </span>
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>



      </div>

    </div>
  );
}
