


export enum NotificationType {
  TASK_CREATED = 'task_created',
  TASK_UPDATED = 'task_updated',
  TASK_DELETED = 'task_deleted',
  TASK_ASSIGNED = 'task_assigned',
  PROJECT_CREATED = 'project_created',
  PROJECT_UPDATED = 'project_updated',
  PROJECT_MEMBER_ADDED = 'project_member_added',
  PROJECT_MEMBER_REMOVED = 'project_member_removed'
}

export interface Notification {
  _id: string;
  type: NotificationType;
  message: string;
  project?: {
    _id: string;
    name: string;
  };
  task?: {
    _id: string;
    title: string;
  };
  user: {
    _id: string;
    name: string;
  };
  recipient: string;
  read: boolean;
  createdAt: string;
}

export interface NotificationSummary {
  totalCount: number;
  unreadCount: number;
  recentNotifications: Notification[];
} 