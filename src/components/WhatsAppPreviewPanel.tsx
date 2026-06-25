import React from "react";
import { Copy, FileDown, Printer, Share2, Sparkles, Send, FileText } from "lucide-react";
import { Task } from "../types";
import { formatWhatsAppReport, formatMarkdownReport, downloadFile } from "../utils/helpers";

interface WhatsAppPreviewPanelProps {
  date: string;
  employeeName: string;
  tasks: Task[];
  totalHours: number;
  addToast: (text: string, type: "success" | "error" | "info") => void;
  onClearForm: () => void;
}

export const WhatsAppPreviewPanel: React.FC<WhatsAppPreviewPanelProps> = ({
  date,
  employeeName,
  tasks,
  totalHours,
  addToast,
  onClearForm,
}) => {
  const reportText = formatWhatsAppReport(date, employeeName, tasks, totalHours);
  const characterCount = reportText.length;

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(reportText);
      addToast("Formatted report copied for WhatsApp!", "success");
    } catch (err) {
      addToast("Failed to copy report. Please copy manually.", "error");
    }
  };

  const handleDownloadTXT = () => {
    const filename = `work_report_${date || "today"}.txt`;
    downloadFile(reportText, filename, "text/plain");
    addToast("Downloaded TXT report!", "success");
  };

  const handleDownloadMarkdown = () => {
    const mdContent = formatMarkdownReport(date, employeeName, tasks, totalHours);
    const filename = `work_report_${date || "today"}.md`;
    downloadFile(mdContent, filename, "text/markdown");
    addToast("Downloaded Markdown report!", "success");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Daily Work Report - ${employeeName}`,
          text: reportText,
        });
        addToast("Report shared successfully!", "success");
      } catch (err: any) {
        if (err.name !== "AbortError") {
          addToast("Failed to share report", "error");
        }
      }
    } else {
      addToast("Web Share API not supported on this browser. Copied instead!", "info");
      handleCopyToClipboard();
    }
  };

  const isShareSupported = typeof navigator !== "undefined" && !!navigator.share;

  return (
    <div className="bg-white dark:bg-gray-800 border border-[#e2e8f0] dark:border-gray-700 rounded-lg p-5 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between border-b border-[#e2e8f0] dark:border-gray-700 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            WhatsApp Format
          </span>
        </div>
        <span className="text-[10px] bg-slate-100 dark:bg-gray-900 border border-[#e2e8f0] dark:border-gray-700 px-2 py-0.5 rounded text-slate-600 dark:text-slate-400">
          {characterCount} Chars
        </span>
      </div>

      {/* WhatsApp Chat Bubble Replica */}
      <div className="flex-grow bg-slate-50 dark:bg-gray-950/40 border border-[#e2e8f0] dark:border-gray-700 rounded p-4 font-mono text-[11px] text-slate-800 dark:text-slate-300 select-all overflow-y-auto max-h-[350px] whitespace-pre-wrap leading-relaxed shadow-sm">
        {tasks.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-12">
            <Send className="h-8 w-8 mb-2 stroke-[1.5] text-slate-300" />
            <p className="font-sans text-xs">Fill out employee name and add some tasks to preview the WhatsApp report format live.</p>
          </div>
        ) : (
          reportText
        )}
      </div>

      {/* Quick Action Controls */}
      <div className="grid grid-cols-2 gap-2 mt-4">
        <button
          type="button"
          onClick={handleCopyToClipboard}
          disabled={tasks.length === 0}
          className="col-span-2 flex items-center justify-center space-x-2 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 disabled:bg-slate-200 dark:disabled:bg-gray-800 disabled:text-slate-400 rounded-lg text-xs font-bold hover:bg-black dark:hover:bg-slate-100 transition-all cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.634 1.437h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          <span>Copy for WhatsApp</span>
        </button>

        <button
          type="button"
          onClick={handleDownloadTXT}
          disabled={tasks.length === 0}
          className="flex items-center justify-center space-x-2 py-2 bg-white dark:bg-gray-800 border border-[#e2e8f0] dark:border-gray-700 rounded-lg text-xs font-bold hover:bg-slate-50 dark:hover:bg-gray-750 text-slate-700 dark:text-slate-300 disabled:text-slate-400 transition-all cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5 text-blue-600" />
          <span>TXT File</span>
        </button>

        <button
          type="button"
          onClick={handleDownloadMarkdown}
          disabled={tasks.length === 0}
          className="flex items-center justify-center space-x-2 py-2 bg-white dark:bg-gray-800 border border-[#e2e8f0] dark:border-gray-700 rounded-lg text-xs font-bold hover:bg-slate-50 dark:hover:bg-gray-750 text-slate-700 dark:text-slate-300 disabled:text-slate-400 transition-all cursor-pointer"
        >
          <FileDown className="w-3.5 h-3.5 text-blue-600" />
          <span>MD File</span>
        </button>
      </div>

      <div className="flex items-center justify-between border-t border-[#e2e8f0] dark:border-gray-700 pt-3 mt-4 gap-4">
        <button
          type="button"
          onClick={handlePrint}
          disabled={tasks.length === 0}
          className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
        >
          <Printer className="h-3.5 w-3.5" />
          <span>Print Report</span>
        </button>
        <button
          type="button"
          onClick={onClearForm}
          className="text-[11px] font-semibold text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
        >
          Clear Draft
        </button>
      </div>
    </div>
  );
};
