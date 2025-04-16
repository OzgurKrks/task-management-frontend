"use client";

import React, { useState, useEffect } from "react";
import { Task, TaskStatus, TaskPriority, TaskLog } from "@/types/task";
import { axiosPrivate } from "@/lib/axiosConfig";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  ClockIcon,
  PencilIcon,
  TrashIcon,
  UserMinusIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { formatDate } from "@/utils/formatDate";
import { showSuccessToast, showErrorToast } from "@/utils/toast";

interface User {
  _id: string;
  name: string;
  email: string;
}

interface TaskDetailClientProps {
  taskDetails: Task;
  recentLogs: TaskLog[];
}

export default function TaskDetailClient({
  taskDetails,
  recentLogs,
}: TaskDetailClientProps) {
  const [task, setTask] = useState<Task>(taskDetails);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeletingInProgress, setIsDeletingInProgress] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description,
    priority: task.priority,
    status: task.status,
    assignedTo: task.assignedTo?._id || "",
  });

  // Fetch users when edit mode is activated
  useEffect(() => {
    if (isEditing) {
      fetchUsers();
    }
  }, [isEditing]);

  // Fetch users from the API
  const fetchUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const response = await axiosPrivate.get("/users");
      setUsers(response.data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError("Could not load users. Please try again.");
      showErrorToast("Failed to load users. Please try again.");
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUpdating(true);
      setError(null);

      const response = await axiosPrivate.put(`/tasks/${task._id}`, formData);

      // Only show success toast once the response is received
      showSuccessToast("Task updated successfully");

      setTask(response.data);
      setIsEditing(false);

      // Refresh the router to update any cached data
      router.refresh();
    } catch (err) {
      console.error("Failed to update task:", err);
      setError("Could not update task. Please try again.");
      showErrorToast("Failed to update task. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteTask = async () => {
    try {
      setIsDeletingInProgress(true);
      setError(null);

      await axiosPrivate.delete(`/tasks/${task._id}`);

      // Only show success toast once the task is deleted
      showSuccessToast("Task deleted successfully");

      // Navigate back to the project page
      router.push(`/dashboard`);
    } catch (err) {
      console.error("Failed to delete task:", err);
      setError("Could not delete task. Please try again.");
      showErrorToast("Failed to delete task. Please try again.");
      setIsDeletingInProgress(false);
    }
  };

  // Get the status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case TaskStatus.PENDING:
        return "bg-yellow-100 text-yellow-800";
      case TaskStatus.IN_PROGRESS:
        return "bg-blue-100 text-blue-800";
      case TaskStatus.COMPLETED:
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get the priority badge color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case TaskPriority.LOW:
        return "bg-green-100 text-green-800";
      case TaskPriority.MEDIUM:
        return "bg-yellow-100 text-yellow-800";
      case TaskPriority.HIGH:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Back button */}
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main task details */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            {isEditing ? (
              /* Edit Form */
              <div>
                <h1 className="text-2xl font-bold mb-6">Edit Task</h1>

                {isUpdating ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                    <p className="mt-4 text-gray-600">Updating task...</p>
                  </div>
                ) : (
                  <form onSubmit={handleUpdateTask}>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className="w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={6}
                        required
                      ></textarea>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Priority
                        </label>
                        <select
                          name="priority"
                          value={formData.priority}
                          onChange={handleInputChange}
                          className="w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value={TaskPriority.LOW}>Low</option>
                          <option value={TaskPriority.MEDIUM}>Medium</option>
                          <option value={TaskPriority.HIGH}>High</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Status
                        </label>
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                          className="w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value={TaskStatus.PENDING}>Pending</option>
                          <option value={TaskStatus.IN_PROGRESS}>
                            In Progress
                          </option>
                          <option value={TaskStatus.COMPLETED}>
                            Completed
                          </option>
                        </select>
                      </div>
                    </div>

                    {/* Assigned user dropdown */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Assigned To
                      </label>
                      <div className="flex">
                        <select
                          name="assignedTo"
                          value={formData.assignedTo}
                          onChange={handleInputChange}
                          className="w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                          disabled={isLoadingUsers}
                        >
                          <option value="">Unassigned</option>
                          {users.map((user) => (
                            <option key={user._id} value={user._id}>
                              {user.name} ({user.email})
                            </option>
                          ))}
                        </select>
                        {formData.assignedTo && (
                          <button
                            type="button"
                            className="ml-2 p-2 text-red-600 hover:bg-red-50 rounded-md flex items-center"
                            title="Remove assigned user"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                assignedTo: "",
                              }))
                            }
                          >
                            <UserMinusIcon className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                      {isLoadingUsers && (
                        <p className="text-sm text-gray-500 mt-1">
                          Loading users...
                        </p>
                      )}
                    </div>

                    <div className="flex justify-end space-x-3 mt-6">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ) : (
              /* View Mode */
              <>
                <div className="flex justify-between items-start mb-6">
                  <h1 className="text-2xl font-bold text-gray-800">
                    {task.title}
                  </h1>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                      title="Edit task"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setIsDeleting(true)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                      title="Delete task"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      task.status
                    )}`}
                  >
                    {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                      task.priority
                    )}`}
                  >
                    {task.priority.charAt(0).toUpperCase() +
                      task.priority.slice(1)}{" "}
                    Priority
                  </span>
                </div>

                <div className="prose max-w-none mb-8">
                  <p className="text-gray-600 whitespace-pre-line">
                    {task.description}
                  </p>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium mb-4">Task Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">
                        Project
                      </h4>
                      <p className="mt-1">
                        {task.project?.name || "Unknown Project"}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">
                        Created At
                      </h4>
                      <p className="mt-1">{formatDate(task.createdAt)}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">
                        Created By
                      </h4>
                      <p className="mt-1">
                        {task.createdBy?.name || "Unknown"}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">
                        Last Updated
                      </h4>
                      <p className="mt-1">{formatDate(task.updatedAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Delete Confirmation */}
                {isDeleting && (
                  <div className="mt-8 bg-red-50 p-4 rounded-md">
                    <h3 className="text-lg font-medium text-red-800 mb-2">
                      Confirm Deletion
                    </h3>

                    {isDeletingInProgress ? (
                      <div className="flex flex-col items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                        <p className="mt-3 text-red-700">Deleting task...</p>
                      </div>
                    ) : (
                      <>
                        <p className="text-red-700 mb-4">
                          Are you sure you want to delete this task? This action
                          cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                          <button
                            onClick={() => setIsDeleting(false)}
                            className="px-4 py-2 border rounded-md"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleDeleteTask}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div>
          {/* Assigned to card */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-medium mb-4">Assigned To</h3>
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 overflow-hidden">
                {task.assignedTo?.name
                  ? task.assignedTo.name.charAt(0).toUpperCase()
                  : "U"}
              </div>
              <div className="ml-3">
                <p className="font-medium">
                  {task.assignedTo?.name || "Unassigned"}
                </p>
                <p className="text-sm text-gray-500">
                  {task.assignedTo?.email || ""}
                </p>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="ml-auto p-1 text-blue-600 hover:bg-blue-50 rounded-md"
                title="Change assigned user"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Recent activity card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Recent Activity</h3>
            </div>

            {recentLogs && recentLogs.length > 0 ? (
              <div className="space-y-4">
                {recentLogs.map((log) => (
                  <div key={log._id} className="flex">
                    <div className="mr-3 flex-shrink-0">
                      <ClockIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm">{log.message}</p>
                      <div className="flex items-center mt-1">
                        <span className="text-xs text-gray-500">
                          {log.user?.name || "Unknown"} •{" "}
                          {formatDate(log.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
