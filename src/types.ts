export interface Task {
  id: string;
  project: string;
  module: string;
  taskId: string;
  description: string;
  estimatedHours: number;
  notes?: string;
  status?: string;
}

export interface Report {
  id: string;
  date: string; // YYYY-MM-DD
  employeeName: string;
  totalHours: number;
  tasks: Task[];
  createdAt: string; // ISO string
}

export interface Template {
  id: string;
  name: string;
  description: string;
  tasks: Omit<Task, "id">[]; // Templates store the raw task structure
}

export interface EmployeeProfile {
  id: string;
  name: string;
  isDefault: boolean;
}
