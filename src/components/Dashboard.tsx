import React, { useState, useRef } from "react";
import { Search, Calendar, User, Clock, Eye, Trash2, Copy, Edit3, Download, Upload, FileJson, AlertCircle } from "lucide-react";
import { Report } from "../types";
import { formatDateToDDMMYYYY } from "../utils/helpers";

interface DashboardProps {
  reports: Report[];
  onLoadReport: (report: Report) => void;
  onDuplicateReport: (report: Report) => void;
  onDeleteReport: (id: string) => void;
  onImportBackup: (data: { reports: Report[]; templates: any[]; profiles: any[] }) => void;
  addToast: (text: string, type: "success" | "error" | "info") => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  reports,
  onLoadReport,
  onDuplicateReport,
  onDeleteReport,
  onImportBackup,
  addToast,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Search filter logic
  const filteredReports = reports.filter((report) => {
    const term = searchTerm.toLowerCase();
    const dateMatch = formatDateToDDMMYYYY(report.date).toLowerCase().includes(term);
    const employeeMatch = report.employeeName.toLowerCase().includes(term);
    
    const tasksMatch = report.tasks.some(
      (task) =>
        task.project.toLowerCase().includes(term) ||
        task.module.toLowerCase().includes(term) ||
        task.taskId.toLowerCase().includes(term) ||
        task.description.toLowerCase().includes(term)
    );

    return dateMatch || employeeMatch || tasksMatch;
  });

  const handleExportBackup = () => {
    const backupData = {
      reports: JSON.parse(localStorage.getItem("task_reporter_reports") || "[]"),
      templates: JSON.parse(localStorage.getItem("task_reporter_templates") || "[]"),
      profiles: JSON.parse(localStorage.getItem("task_reporter_profiles") || "[]"),
      exportDate: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `task_reporter_backup_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addToast("JSON backup exported successfully!", "success");
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && (Array.isArray(parsed.reports) || Array.isArray(parsed.templates) || Array.isArray(parsed.profiles))) {
          onImportBackup({
            reports: parsed.reports || [],
            templates: parsed.templates || [],
            profiles: parsed.profiles || [],
          });
          addToast("JSON backup imported successfully!", "success");
        } else {
          addToast("Invalid JSON backup structure. Must contain reports or templates.", "error");
        }
      } catch (err) {
        addToast("Failed to parse JSON backup file.", "error");
      }
    };
    reader.readAsText(file);
    // Reset file input value
    if (e.target) e.target.value = "";
  };

  return (
    <div className="space-y-4">
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search reports by employee, project, module, task..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2 bg-white dark:bg-gray-800 border border-[#e2e8f0] dark:border-gray-700 rounded text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleExportBackup}
            title="Export JSON Backup"
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-800 border border-[#e2e8f0] dark:border-gray-700 hover:border-blue-300 dark:hover:border-gray-600 rounded text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-blue-600" />
            <span>Export Backup</span>
          </button>

          <button
            type="button"
            onClick={handleImportClick}
            title="Import JSON Backup"
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-800 border border-[#e2e8f0] dark:border-gray-700 hover:border-blue-300 dark:hover:border-gray-600 rounded text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
          >
            <Upload className="h-3.5 w-3.5 text-blue-600" />
            <span>Import Backup</span>
          </button>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportFileChange}
            accept=".json"
            className="hidden"
          />
        </div>
      </div>

      {/* Reports Grid */}
      {filteredReports.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 border border-[#e2e8f0] dark:border-gray-700 rounded-lg p-8 text-center text-slate-400 dark:text-slate-500 shadow-sm">
          <Calendar className="h-10 w-10 mx-auto mb-2 opacity-45 text-slate-400" />
          <h4 className="text-sm font-bold mb-1 text-slate-700 dark:text-slate-300">No reports found</h4>
          <p className="text-xs">
            {searchTerm ? "No reports match your current filter criteria." : "Create and save your first work report using the form above."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className="bg-white dark:bg-gray-800 border border-[#e2e8f0] dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-900 rounded-lg p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Card Header */}
                <div className="flex items-start justify-between border-b border-[#e2e8f0] dark:border-gray-700 pb-2.5 mb-3">
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-tight bg-blue-50 dark:bg-blue-950/40 text-blue-750 dark:text-blue-300 px-2 py-0.5 rounded">
                      <Calendar className="h-3 w-3" />
                      {formatDateToDDMMYYYY(report.date)}
                    </span>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 truncate">
                      <User className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                      {report.employeeName}
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold bg-slate-50 dark:bg-gray-900 border border-[#e2e8f0] dark:border-gray-700 px-2 py-1 rounded text-slate-600 dark:text-slate-400 flex items-center gap-1 flex-shrink-0">
                    <Clock className="h-3 w-3 text-slate-400" />
                    {report.totalHours} hrs
                  </span>
                </div>

                {/* Tasks Mini-List Preview */}
                <div className="space-y-1.5 mb-4 max-h-[140px] overflow-y-auto pr-1">
                  {report.tasks.map((task, idx) => (
                    <div key={task.id || idx} className="text-xs border-l-2 border-blue-500/50 dark:border-blue-900 pl-2 py-0.5">
                      <p className="font-bold text-slate-700 dark:text-slate-300 truncate">
                        {task.project} <span className="font-normal text-slate-450 dark:text-slate-500">({task.module})</span>
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate line-clamp-1 mt-0.5">
                        {task.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between border-t border-[#e2e8f0] dark:border-gray-700 pt-3 mt-auto">
                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono font-medium">
                  Saved {new Date(report.createdAt).toLocaleDateString()}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onLoadReport(report)}
                    title="Edit/Load Report"
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 rounded transition-all"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDuplicateReport(report)}
                    title="Duplicate into Form"
                    className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-gray-700 rounded transition-all"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteReport(report.id)}
                    title="Delete History"
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-gray-700 rounded transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
