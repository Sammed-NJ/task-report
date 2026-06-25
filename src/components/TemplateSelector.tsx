import React, { useState } from "react";
import { FolderHeart, Plus, Save, Trash2, FolderOpen, X, Info } from "lucide-react";
import { Template, Task } from "../types";

interface TemplateSelectorProps {
  templates: Template[];
  currentTasks: Task[];
  onLoadTemplate: (template: Template) => void;
  onSaveTemplate: (name: string, description: string) => void;
  onDeleteTemplate: (id: string) => void;
  addToast: (text: string, type: "success" | "error" | "info") => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  templates,
  currentTasks,
  onLoadTemplate,
  onSaveTemplate,
  onDeleteTemplate,
  addToast,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateDesc, setTemplateDesc] = useState("");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateName.trim()) return;

    if (currentTasks.length === 0) {
      addToast("Cannot save an empty task list as a template", "error");
      return;
    }

    onSaveTemplate(templateName.trim(), templateDesc.trim());
    setTemplateName("");
    setTemplateDesc("");
    setIsSaving(false);
    addToast("Template saved successfully!", "success");
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-gray-800 hover:bg-slate-100 dark:hover:bg-gray-700 text-slate-700 dark:text-slate-200 border border-[#e2e8f0] dark:border-gray-700 rounded text-xs font-semibold transition-all cursor-pointer"
      >
        <FolderHeart className="h-3.5 w-3.5 text-blue-600" />
        <span>Templates ({templates.length})</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-[#e2e8f0] dark:border-gray-700 rounded-lg shadow-xl z-50 p-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#e2e8f0] dark:border-gray-700 pb-2 mb-3">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 uppercase tracking-wider">
                <FolderOpen className="h-4 w-4 text-blue-600" />
                Templates Manager
              </h3>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsSaving(false);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {isSaving ? (
              <form onSubmit={handleSave} className="space-y-3 animate-fade-in">
                <h4 className="text-xs font-bold text-slate-600 dark:text-slate-350">
                  Save Current Tasks as Template
                </h4>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Weekly Report, UI testing"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-gray-900 border border-[#e2e8f0] dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    placeholder="Brief description (optional)..."
                    value={templateDesc}
                    onChange={(e) => setTemplateDesc(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-gray-900 border border-[#e2e8f0] dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div className="flex gap-2 pt-1.5">
                  <button
                    type="button"
                    onClick={() => setIsSaving(false)}
                    className="flex-1 py-1.5 border border-[#e2e8f0] dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-750 rounded text-xs font-semibold text-slate-600 dark:text-slate-300 transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold transition-all shadow-sm"
                  >
                    Save Template
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {templates.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 dark:text-slate-500">
                      <FolderHeart className="h-8 w-8 mx-auto mb-1.5 opacity-40 text-slate-400" />
                      <p className="text-xs font-medium">No templates saved yet.</p>
                    </div>
                  ) : (
                    templates.map((tmpl) => (
                      <div
                        key={tmpl.id}
                        className="group flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-gray-700/45 rounded border border-transparent hover:border-[#e2e8f0] dark:hover:border-gray-700/50 transition-all"
                      >
                        <div className="flex-grow mr-2 overflow-hidden">
                          <button
                            type="button"
                            onClick={() => {
                              onLoadTemplate(tmpl);
                              setIsOpen(false);
                            }}
                            className="text-left w-full"
                          >
                            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                              {tmpl.name}
                            </h4>
                            {tmpl.description && (
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                {tmpl.description}
                              </p>
                            )}
                            <p className="text-[9px] text-blue-600/80 dark:text-blue-400/80 font-mono font-bold mt-0.5">
                              {tmpl.tasks.length} {tmpl.tasks.length === 1 ? "task" : "tasks"}
                            </p>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            onDeleteTemplate(tmpl.id);
                            addToast(`Deleted template "${tmpl.name}"`, "info");
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                          title="Delete Template"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="border-t border-[#e2e8f0] dark:border-gray-700 pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (currentTasks.length === 0) {
                        addToast("Create at least one task first, then save as template", "error");
                        return;
                      }
                      setIsSaving(true);
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-[#e2e8f0] dark:border-gray-700 hover:border-blue-300 dark:hover:border-gray-600 hover:bg-blue-50/25 dark:hover:bg-gray-800/40 rounded text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>Save Current as Template</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
