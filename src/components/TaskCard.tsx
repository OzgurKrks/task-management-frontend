"use client";

import React from "react";
import { Task, TaskStatus, TaskPriority } from "@/types/task";
import {
  PencilIcon,
  TrashIcon,
  UserIcon,
  CalendarIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

interface TaskCardProps {
  task: Task;
  index: number;
  onEdit: (taskId: string) => void;
  onDelete: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  index,
  onEdit,
  onDelete,
}) => {
  // Get priority color
  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.HIGH:
        return "border-red-500";
      case TaskPriority.MEDIUM:
        return "border-yellow-500";
      case TaskPriority.LOW:
        return "border-green-500";
      default:
        return "border-gray-500";
    }
  };

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(date);
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm mb-3 p-3 border-l-4 ${getPriorityColor(
        task.priority
      )}`}
    >
      <div className="flex justify-between items-start mb-2">
        <Link
          href={`/dashboard/tasks/${task._id}`}
          className="text-base font-medium text-gray-800 hover:text-blue-600"
        >
          {task.title}
        </Link>
        <div className="flex space-x-1">
          <button
            onClick={() => onEdit(task._id)}
            className="text-gray-500 hover:text-blue-500 p-1"
            title="Edit task"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(task._id)}
            className="text-gray-500 hover:text-red-500 p-1"
            title="Delete task"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {task.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex flex-wrap text-xs text-gray-500 mt-2 gap-2">
        {task.assignedTo && (
          <div className="flex items-center" title="Assigned to">
            <UserIcon className="h-3 w-3 mr-1" />
            <span>{task.assignedTo.name}</span>
          </div>
        )}

        {task.createdBy && (
          <div className="flex items-center" title="Created by">
            <UsersIcon className="h-3 w-3 mr-1" />
            <span>{task.createdBy.name}</span>
          </div>
        )}

        <div className="flex items-center ml-auto" title="Created on">
          <CalendarIcon className="h-3 w-3 mr-1" />
          <span>{formatDate(task.createdAt)}</span>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
