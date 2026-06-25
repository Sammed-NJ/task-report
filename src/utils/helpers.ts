import { Task } from "../types";

/**
 * Formats a Date string from YYYY-MM-DD to DD-MM-YYYY
 */
export const formatDateToDDMMYYYY = (dateStr: string): string => {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateStr;
};

/**
 * Formats the report content exactly into the WhatsApp-friendly format requested.
 */
export const formatWhatsAppReport = (
  date: string,
  employeeName: string,
  tasks: Task[],
  totalHours: number
): string => {
  const formattedDate = formatDateToDDMMYYYY(date);
  
  let reportText = `*Date:* \`${formattedDate}\`\n`;
  reportText += `*Employee Name:* \`${employeeName}\`\n\n`;
  reportText += `### *Tasks for Today*\n\n`;

  tasks.forEach((task, index) => {
    reportText += `${index + 1}. *Project:* \`${task.project}\` | *Module:* \`${task.module}\`\n`;
    reportText += `   *Task ID:* \`${task.taskId || "N/A"}\`\n`;
    reportText += `   *Task:* \`${task.description}\`\n`;
    reportText += `   *Est:* \`${task.estimatedHours} hrs\`\n\n`;
  });

  reportText += `*Total Estimated Hours:* \`${totalHours} hrs\``;
  return reportText;
};

/**
 * Formats the report as Markdown
 */
export const formatMarkdownReport = (
  date: string,
  employeeName: string,
  tasks: Task[],
  totalHours: number
): string => {
  const formattedDate = formatDateToDDMMYYYY(date);
  
  let md = `# Daily Work Report\n\n`;
  md += `**Date:** ${formattedDate}  \n`;
  md += `**Employee Name:** ${employeeName}  \n`;
  md += `**Total Hours:** ${totalHours} hrs  \n\n`;
  md += `## Tasks for Today\n\n`;

  tasks.forEach((task, index) => {
    md += `### ${index + 1}. ${task.project} - ${task.module}\n`;
    if (task.taskId) md += `- **Task ID:** ${task.taskId}\n`;
    md += `- **Description:** ${task.description}\n`;
    md += `- **Estimated Hours:** ${task.estimatedHours} hrs\n\n`;
  });

  return md;
};

/**
 * Downloads a text file in the browser
 */
export const downloadFile = (content: string, filename: string, contentType: string) => {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
