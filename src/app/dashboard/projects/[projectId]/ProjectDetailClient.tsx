"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Project } from "@/types/project";
import { Task, TaskStatus, TaskPriority } from "@/types/task";
import { axiosPrivate } from "@/lib/axiosConfig";
import { showSuccessToast, showErrorToast } from "@/utils/toast";
import Loading from "@/components/ui/Loading";
import NotificationIcon from "@/components/NotificationIcon";
import {
  PencilIcon,
  ArrowLeftIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import ProjectMembersModal from "@/components/ProjectMembersModal";
import TaskCard from "@/components/TaskCard";

// Task form interface
interface TaskFormData {
  _id?: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status?: TaskStatus;
  assignedTo?: string;
}

interface ProjectDetailClientProps {
  initialUser: any;
  initialProject: Project;
  initialTasks: Task[];
}

export default function ProjectDetailClient({
  initialUser,
  initialProject,
  initialTasks,
}: ProjectDetailClientProps) {
  const router = useRouter();

  // State variables
  const [user] = useState<any>(initialUser);
  const [project, setProject] = useState<Project>(initialProject);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [projectMembers, setProjectMembers] = useState<any[]>([]);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: project.name,
    description: project.description,
  });

  // Task form state
  const [taskForm, setTaskForm] = useState<TaskFormData>({
    title: "",
    description: "",
    priority: TaskPriority.MEDIUM,
    status: TaskStatus.PENDING,
  });

  // Fetch project members when component mounts
  useEffect(() => {
    fetchProjectMembers();
  }, []);

  // Fetch project members
  const fetchProjectMembers = async () => {
    try {
      console.log("Fetching members for project:", project._id);
      const response = await axiosPrivate.get(
        `/projects/${project._id}/members`
      );
      setProjectMembers(response.data);
    } catch (err) {
      console.error("Failed to fetch project members:", err);
    }
  };

  // Handle form changes
  const handleEditFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Save project changes
  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axiosPrivate.put(
        `/projects/${project._id}`,
        editForm
      );
      setProject(response.data);
      setIsEditMode(false);
      showSuccessToast("Project updated successfully");
    } catch (err: any) {
      console.error("Failed to update project:", err);
      showErrorToast(err.response?.data?.message || "Failed to update project");
      setError(err.response?.data?.message || "Failed to update project");
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    setEditForm({
      name: project.name,
      description: project.description,
    });
    setIsEditMode(false);
  };

  // Add a new task
  const handleAddTask = () => {
    setTaskForm({
      title: "",
      description: "",
      priority: TaskPriority.MEDIUM,
      status: TaskStatus.PENDING,
    });
    setShowTaskModal(true);
  };

  // Submit task form
  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (taskForm.title.trim() !== "") {
      setIsLoading(true);
      try {
        // Create the task
        const response = await axiosPrivate.post(
          `/projects/${project._id}/tasks`,
          taskForm
        );

        // Refresh tasks
        const updatedTasksResponse = await axiosPrivate.get(
          `/projects/${project._id}/tasks`
        );
        setTasks(updatedTasksResponse.data);

        showSuccessToast("Task created successfully!");
        setShowTaskModal(false);
      } catch (err: any) {
        console.error("Failed to create task:", err);
        showErrorToast(err.response?.data?.message || "Failed to create task");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handle task edit
  const handleEditTask = (taskId: string) => {
    router.push(`/dashboard/tasks/${taskId}`);
  };

  // Handle task deletion
  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await axiosPrivate.delete(`/tasks/${taskId}`);
        // Refresh tasks after deletion
        const updatedTasksResponse = await axiosPrivate.get(
          `/projects/${project._id}/tasks`
        );
        setTasks(updatedTasksResponse.data);
        showSuccessToast("Task deleted successfully");
      } catch (error) {
        console.error("Failed to delete task:", error);
        showErrorToast("Failed to delete task");
      }
    }
  };

  // Handle project updated event (e.g. after members change)
  const handleProjectUpdated = async () => {
    try {
      const response = await axiosPrivate.get(`/projects/${project._id}`);
      setProject(response.data);
    } catch (err) {
      console.error("Failed to refresh project:", err);
    }
  };

  // Go back to dashboard
  const handleBackToDashboard = () => {
    router.push("/dashboard");
  };

  // Header component
  const header = (
    <header className="bg-white shadow-sm mb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <button
              onClick={handleBackToDashboard}
              className="mr-4 p-2 rounded-full hover:bg-gray-100"
              title="Back to Dashboard"
            >
              <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">
              Project Details
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <NotificationIcon />
            <div className="flex items-center">
              <span className="text-sm text-gray-700 mr-2">
                {user?.name} ({user?.role})
              </span>
              <button
                onClick={() => {
                  // Handle logout
                  router.push("/auth/login");
                }}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {header}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Project details section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            {isEditMode ? (
              <h2 className="text-2xl font-bold text-gray-800">Edit Project</h2>
            ) : (
              <h2 className="text-2xl font-bold text-gray-800">
                {project.name}
              </h2>
            )}

            <div className="flex space-x-2">
              <button
                onClick={() => setShowMembersModal(true)}
                className="p-2 rounded-md hover:bg-gray-100"
                title="Manage Members"
              >
                <UserGroupIcon className="h-5 w-5 text-blue-500" />
              </button>

              {!isEditMode && (
                <button
                  onClick={() => setIsEditMode(true)}
                  className="p-2 rounded-md hover:bg-gray-100"
                  title="Edit Project"
                >
                  <PencilIcon className="h-5 w-5 text-blue-500" />
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
              {error}
              <button
                className="absolute top-0 bottom-0 right-0 px-4"
                onClick={() => setError(null)}
              >
                &times;
              </button>
            </div>
          )}

          {isLoading && (
            <div className="flex justify-center my-4">
              <Loading />
            </div>
          )}

          {isEditMode ? (
            // Edit form
            <form onSubmit={handleSaveChanges}>
              <div className="mb-4">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Project Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditFormChange}
                  className="w-full border rounded-md px-3 py-2"
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={editForm.description}
                  onChange={handleEditFormChange}
                  className="w-full border rounded-md px-3 py-2"
                  rows={4}
                  required
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 border rounded-md hover:bg-gray-50"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  disabled={isLoading}
                >
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            // View mode
            <div>
              <div className="mb-6">
                <h3 className="text-gray-500 text-sm font-medium mb-1">
                  Description
                </h3>
                <p className="text-gray-800">{project.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-gray-500 text-sm font-medium mb-1">
                    Owner
                  </h3>
                  <p className="text-gray-800">
                    {project.owner.name} ({project.owner.email})
                  </p>
                </div>

                <div>
                  <h3 className="text-gray-500 text-sm font-medium mb-1">
                    Created
                  </h3>
                  <p className="text-gray-800">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Project members section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Project Members
            </h3>
            <button
              onClick={() => setShowMembersModal(true)}
              className="text-blue-500 hover:text-blue-700 text-sm font-medium"
            >
              Manage Members
            </button>
          </div>

          {project.members && project.members.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {project.members.map((member: any) => (
                <div key={member._id} className="p-3 border rounded-md">
                  <p className="font-medium">{member.name}</p>
                  <p className="text-sm text-gray-500">{member.email}</p>
                  {member._id === project.owner._id && (
                    <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                      Owner
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No members in this project.</p>
          )}
        </div>

        {/* Tasks section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Tasks</h3>
            <button
              onClick={handleAddTask}
              className="px-4 py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600"
            >
              Add Task
            </button>
          </div>

          {tasks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tasks.map((task, index) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  index={index}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No tasks in this project yet.
            </p>
          )}
        </div>
      </main>

      {/* Project Members Modal */}
      <ProjectMembersModal
        isOpen={showMembersModal}
        onClose={() => setShowMembersModal(false)}
        projectId={project._id}
        onProjectUpdated={handleProjectUpdated}
      />

      {/* Task Creation Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Task</h2>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-6">
                <Loading size="lg" />
                <p className="mt-4 text-gray-600">Creating task...</p>
              </div>
            ) : (
              <form onSubmit={handleTaskSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={taskForm.title}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, title: e.target.value })
                    }
                    className="border rounded w-full py-2 px-3"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={taskForm.description}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, description: e.target.value })
                    }
                    className="border rounded w-full py-2 px-3"
                    rows={3}
                  ></textarea>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">
                    Priority
                  </label>
                  <select
                    name="priority"
                    value={taskForm.priority}
                    onChange={(e) =>
                      setTaskForm({
                        ...taskForm,
                        priority: e.target.value as TaskPriority,
                      })
                    }
                    className="border rounded w-full py-2 px-3"
                  >
                    <option value={TaskPriority.LOW}>Low</option>
                    <option value={TaskPriority.MEDIUM}>Medium</option>
                    <option value={TaskPriority.HIGH}>High</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={taskForm.status}
                    onChange={(e) =>
                      setTaskForm({
                        ...taskForm,
                        status: e.target.value as TaskStatus,
                      })
                    }
                    className="border rounded w-full py-2 px-3"
                  >
                    <option value={TaskStatus.PENDING}>Pending</option>
                    <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
                    <option value={TaskStatus.COMPLETED}>Completed</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">
                    Assign To
                  </label>
                  <select
                    name="assignedTo"
                    value={taskForm.assignedTo}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, assignedTo: e.target.value })
                    }
                    className="border rounded w-full py-2 px-3"
                  >
                    <option value="">Unassigned</option>
                    {projectMembers.map((member) => (
                      <option key={member._id} value={member._id}>
                        {member.name || member.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowTaskModal(false)}
                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Add Task
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
