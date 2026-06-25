import React, { useRef } from "react";
import { GripVertical, Copy, Trash2, PlusCircle, Clock, Hash, Tag, FileText } from "lucide-react";
import { Task } from "../types";

interface TaskItemProps {
  task: Task;
  index: number;
  onUpdate: (id: string, updatedFields: Partial<Task>) => void;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
  projectDatalistId: string;
  moduleDatalistId: string;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  index,
  onUpdate,
  onRemove,
  onDuplicate,
  onDragStart,
  onDragOver,
  onDragEnd,
  projectDatalistId,
  moduleDatalistId,
}) => {
  const itemRef = useRef<HTMLDivElement>(null);

  const handleHourChange = (value: string) => {
    const parsed = parseFloat(value);
    onUpdate(task.id, { estimatedHours: isNaN(parsed) ? 0 : parsed });
  };

  return (
    <div
      ref={itemRef}
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDragEnd={onDragEnd}
      className="flex gap-3 p-4 bg-white dark:bg-gray-800 border border-[#e2e8f0] dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-900 rounded-lg shadow-sm transition-all duration-200 relative group"
    >
      {/* Drag & Drop Handle */}
      <div 
        className="flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-grab active:cursor-grabbing p-1 rounded-md hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors"
        title="Drag to reorder"
      >
        <GripVertical className="h-4.5 w-4.5" />
      </div>

      {/* Inputs Grid */}
      <div className="flex-grow grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Project Name */}
        <div className="md:col-span-3">
          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Tag className="h-3 w-3 text-slate-400" /> Project
          </label>
          <input
            type="text"
            required
            list={projectDatalistId}
            placeholder="e.g. Olivia Projects"
            value={task.project}
            onChange={(e) => onUpdate(task.id, { project: e.target.value })}
            className="w-full text-xs font-medium px-3 py-2 bg-slate-50 dark:bg-gray-900 border border-[#e2e8f0] dark:border-gray-700 rounded text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* Module Name */}
        <div className="md:col-span-3">
          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Tag className="h-3 w-3 text-slate-400" /> Module
          </label>
          <input
            type="text"
            required
            list={moduleDatalistId}
            placeholder="e.g. Allocation Sheet"
            value={task.module}
            onChange={(e) => onUpdate(task.id, { module: e.target.value })}
            className="w-full text-xs font-medium px-3 py-2 bg-slate-50 dark:bg-gray-900 border border-[#e2e8f0] dark:border-gray-700 rounded text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* Task ID */}
        <div className="md:col-span-2">
          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Hash className="h-3 w-3 text-slate-400" /> Task ID
          </label>
          <input
            type="text"
            placeholder="#1138"
            value={task.taskId}
            onChange={(e) => onUpdate(task.id, { taskId: e.target.value })}
            className="w-full text-xs font-mono px-3 py-2 bg-slate-50 dark:bg-gray-900 border border-[#e2e8f0] dark:border-gray-700 rounded text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* Estimated Hours */}
        <div className="md:col-span-2">
          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Clock className="h-3 w-3 text-slate-400" /> Est Hours
          </label>
          <input
            type="number"
            step="0.5"
            min="0"
            max="24"
            required
            placeholder="e.g. 2.5"
            value={task.estimatedHours || ""}
            onChange={(e) => handleHourChange(e.target.value)}
            className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 dark:bg-gray-900 border border-[#e2e8f0] dark:border-gray-700 rounded text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* Task Description */}
        <div className="md:col-span-12">
          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
            <FileText className="h-3 w-3 text-slate-400" /> Task Description
          </label>
          <textarea
            required
            rows={2}
            placeholder="Implement UI enhancements and workflow improvements in..."
            value={task.description}
            onChange={(e) => onUpdate(task.id, { description: e.target.value })}
            className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-gray-900 border border-[#e2e8f0] dark:border-gray-700 rounded text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
          />
        </div>
      </div>

      {/* Row Action Buttons (Duplicate, Delete) */}
      <div className="flex flex-col gap-1 justify-center border-l border-gray-100 dark:border-gray-700 pl-3">
        <button
          type="button"
          onClick={() => onDuplicate(task.id)}
          title="Duplicate Task"
          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 rounded transition-all"
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onRemove(task.id)}
          title="Delete Task"
          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-gray-700 rounded transition-all"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
