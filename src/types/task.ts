export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  project: {
    _id: string;
    name: string;
  };
  assignedTo: {
    _id: string;
    name: string;
    email: string;
  };
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface TaskLog {
  _id: string;
  task: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  previousStatus?: TaskStatus;
  newStatus?: TaskStatus;
  previousPriority?: TaskPriority;
  newPriority?: TaskPriority;
  previousAssignee?: {
    _id: string;
    name: string;
    email: string;
  };
  newAssignee?: {
    _id: string;
    name: string;
    email: string;
  };
  message: string;
  createdAt: string;
} 