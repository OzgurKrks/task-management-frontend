"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TaskStatus, TaskPriority, Task } from "@/types/task";
import { Project } from "@/types/project";
import { PlusIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { axiosPrivate } from "@/lib/axiosConfig";
import { clearAuthCookies } from "@/utils/authCookies";
import ProjectColumn from "@/components/ProjectColumn";

import Loading from "@/components/ui/Loading";
import NotificationIcon from "@/components/NotificationIcon";

import { showSuccessToast, showErrorToast, showInfoToast } from "@/utils/toast";

// Task form interfaces
interface TaskFormData {
  _id?: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status?: TaskStatus;
  assignedTo?: string;
}

// Project form interfaces
interface ProjectFormData {
  name: string;
  description: string;
}

interface DashboardClientProps {
  initialUser: any;
  initialProjects: Project[];
  initialProjectTasks: Record<string, Task[]>;
}

export default function DashboardClient({
  initialUser,
  initialProjects,
  initialProjectTasks,
}: DashboardClientProps) {
  // States for page data
  const [user] = useState<any>(initialUser);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [filteredProjects, setFilteredProjects] =
    useState<Project[]>(initialProjects);
  const [projectTasks, setProjectTasks] =
    useState<Record<string, Task[]>>(initialProjectTasks);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [projectMembers, setProjectMembers] = useState<any[]>([]);

  // State for modals
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [currentProject, setCurrentProject] = useState<string | null>(null);

  // Form states
  const [projectForm, setProjectForm] = useState<ProjectFormData>({
    name: "",
    description: "",
  });

  const [taskForm, setTaskForm] = useState<TaskFormData>({
    title: "",
    description: "",
    priority: TaskPriority.MEDIUM,
    status: TaskStatus.PENDING,
  });

  const router = useRouter();

  // Setup socket event handlers
  const handleSocketTaskCreated = (task: Task) => {
    const projectId =
      typeof task.project === "string" ? task.project : task.project._id;
    setProjectTasks((prev) => ({
      ...prev,
      [projectId]: [...(prev[projectId] || []), task],
    }));
  };

  const handleSocketTaskUpdated = (task: Task) => {
    const projectId =
      typeof task.project === "string" ? task.project : task.project._id;
    setProjectTasks((prev) => ({
      ...prev,
      [projectId]:
        prev[projectId]?.map((t: Task) => (t._id === task._id ? task : t)) ||
        [],
    }));
  };

  const handleSocketTaskDeleted = (data: {
    taskId: string;
    projectId: string;
  }) => {
    const { taskId, projectId } = data;
    setProjectTasks((prev) => ({
      ...prev,
      [projectId]: prev[projectId]?.filter((t: Task) => t._id !== taskId) || [],
    }));
  };

  const handleSocketProjectUpdated = (project: Project) => {
    setProjects((prev) =>
      prev.map((p) => (p._id === project._id ? project : p))
    );
  };

  // Load tasks for a specific project
  const fetchTasksForProject = async (projectId: string) => {
    try {
      const response = await axiosPrivate.get(`/projects/${projectId}/tasks`);
      return response.data;
    } catch (err) {
      console.error(`Failed to fetch tasks for project ${projectId}:`, err);
      return [];
    }
  };

  // Fetch all projects
  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const response = await axiosPrivate.get("/projects");
      setProjects(response.data);
      return response.data;
    } catch (err) {
      console.error("Failed to fetch projects:", err);
      setError("Failed to load projects");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuthCookies();
    router.push("/auth/login");
  };

  // Create a new project
  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (projectForm.name.trim() !== "") {
      setIsLoading(true);
      try {
        // Create the project
        const response = await axiosPrivate.post("/projects", projectForm);

        // Add project to state
        setProjects([...projects, response.data]);

        // Initialize empty tasks array for this project
        setProjectTasks((prev) => ({
          ...prev,
          [response.data._id]: [],
        }));

        // Only show success message after project is added
        showSuccessToast("Project created successfully!");

        // Close modal and reset form
        setShowProjectModal(false);
        setProjectForm({ name: "", description: "" });
      } catch (err) {
        console.error("Failed to create project:", err);
        setError("Failed to create project");
        showErrorToast("Failed to create project. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Create a new task
  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (taskForm.title.trim() !== "" && currentProject) {
      setIsLoading(true);
      try {
        // Create the task
        const response = await axiosPrivate.post(
          `/projects/${currentProject}/tasks`,
          taskForm
        );

        // Refresh the tasks for this project
        const updatedTasks = await fetchTasksForProject(currentProject);
        setProjectTasks((prev) => ({
          ...prev,
          [currentProject]: updatedTasks,
        }));

        // Only show success message after tasks are refreshed
        showSuccessToast("Task created successfully!");

        // Close modal and reset form
        setShowTaskModal(false);
        setTaskForm({
          title: "",
          description: "",
          priority: TaskPriority.MEDIUM,
          status: TaskStatus.PENDING,
          assignedTo: "",
        });
      } catch (err) {
        console.error("Failed to create task:", err);
        setError("Failed to create task");
        showErrorToast("Failed to create task. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Open task creation modal for a specific project
  const handleAddTask = async (projectId: string) => {
    setCurrentProject(projectId);

    // Reset task form
    setTaskForm({
      title: "",
      description: "",
      priority: TaskPriority.MEDIUM,
      status: TaskStatus.PENDING,
      assignedTo: "",
    });

    // Fetch project members
    try {
      const response = await axiosPrivate.get(`/projects/${projectId}/members`);
      setProjectMembers(response.data);
    } catch (err) {
      console.error("Failed to fetch project members:", err);
    }

    // Show task modal
    setShowTaskModal(true);
  };

  // Handle task update
  const handleTaskUpdated = async () => {
    // Show info toast
    showInfoToast("Task updated. Refreshing data...");

    // Refresh all projects tasks
    if (projects.length > 0) {
      setIsLoading(true);
      try {
        // Fetch tasks for each project again
        const tasksByProject: Record<string, Task[]> = { ...projectTasks };

        await Promise.all(
          projects.map(async (project: Project) => {
            const tasks = await fetchTasksForProject(project._id);
            tasksByProject[project._id] = tasks;
          })
        );

        setProjectTasks(tasksByProject);
      } catch (err) {
        console.error("Failed to refresh tasks:", err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handle task deletion
  const handleTaskDeleted = async (projectId: string) => {
    try {
      // Show info toast
      showInfoToast("Task deleted. Refreshing data...");

      // Refresh tasks for the specific project
      const tasks = await fetchTasksForProject(projectId);
      setProjectTasks((prev) => ({
        ...prev,
        [projectId]: tasks,
      }));
    } catch (err) {
      console.error(`Failed to refresh tasks for project ${projectId}:`, err);
      showErrorToast("Failed to refresh tasks. Please try again.");
    }
  };

  // Handle project update (like when members are added)
  const handleProjectUpdated = async () => {
    // Show info toast
    showInfoToast("Project updated. Refreshing data...");

    // Refresh the projects list
    await fetchProjects();
  };

  // Handle project deletion
  const handleProjectDeleted = async (projectId: string) => {
    // Update local state by removing the deleted project
    const updatedProjects = projects.filter((p) => p._id !== projectId);
    setProjects(updatedProjects);
    setFilteredProjects(filteredProjects.filter((p) => p._id !== projectId));

    // Remove the project tasks from the state
    const updatedProjectTasks = { ...projectTasks };
    delete updatedProjectTasks[projectId];
    setProjectTasks(updatedProjectTasks);
  };

  // Search projects
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim() === "") {
      setFilteredProjects(projects);
    } else {
      searchProjects(value);
    }
  };

  // Search projects via API
  const searchProjects = async (query: string) => {
    if (query.trim() === "") {
      setFilteredProjects(projects);
      return;
    }

    try {
      setIsSearching(true);
      const response = await axiosPrivate.get(
        `/projects/search?q=${encodeURIComponent(query)}`
      );
      setFilteredProjects(response.data);
    } catch (err) {
      console.error("Failed to search projects:", err);
      // If search fails, do client-side filtering as fallback
      const filtered = projects.filter(
        (project) =>
          project.name.toLowerCase().includes(query.toLowerCase()) ||
          project.description.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredProjects(filtered);
    } finally {
      setIsSearching(false);
    }
  };

  // Update filtered projects when projects change
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredProjects(projects);
    } else {
      searchProjects(searchTerm);
    }
  }, [projects]);

  // Header with user info and logout button
  const header = (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <h1 className="text-xl font-semibold text-gray-900">
            Task Management
          </h1>
          <div className="flex items-center space-x-4">
            <NotificationIcon />
            <div className="flex items-center">
              <span className="text-sm text-gray-700 mr-2">
                {user?.name} ({user?.role})
              </span>
              <button
                onClick={handleLogout}
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

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Projects header, search and create button */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2 className="text-xl font-semibold text-gray-800">Projects</h2>

          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Search box */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                </div>
              )}
            </div>

            {/* New project button */}
            <button
              onClick={() => setShowProjectModal(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center justify-center"
            >
              <PlusIcon className="h-5 w-5 mr-1" />
              New Project
            </button>
          </div>
        </div>

        {/* Error message if any */}
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

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-center my-8">
            <Loading />
          </div>
        )}

        {/* Project Boards */}
        {!isLoading && filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project: Project) => (
              <ProjectColumn
                key={project._id}
                project={project}
                tasks={projectTasks[project._id] || []}
                onAddTask={handleAddTask}
                onTaskUpdated={handleTaskUpdated}
                onTaskDeleted={() => handleTaskDeleted(project._id)}
                onProjectUpdated={handleProjectUpdated}
                onProjectDeleted={handleProjectDeleted}
                onViewLogs={() =>
                  router.push(`/dashboard/projects/${project._id}/logs`)
                }
              />
            ))}
          </div>
        ) : !isLoading && searchTerm.trim() !== "" ? (
          <div className="bg-white rounded-lg p-6 text-center">
            <p className="text-gray-600">
              No projects found matching "{searchTerm}".
            </p>
          </div>
        ) : !isLoading && projects.length === 0 ? (
          <div className="bg-white rounded-lg p-6 text-center">
            <p className="text-gray-600">
              You don't have any projects yet. Create one to get started!
            </p>
          </div>
        ) : null}
      </main>

      {/* Project Creation Modal */}
      {showProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium mb-4">Create New Project</h3>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-6">
                <Loading size="lg" />
                <p className="mt-4 text-gray-600">Creating project...</p>
              </div>
            ) : (
              <form onSubmit={handleProjectSubmit}>
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
                    value={projectForm.name}
                    onChange={(e) =>
                      setProjectForm({ ...projectForm, name: e.target.value })
                    }
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
                    value={projectForm.description}
                    onChange={(e) =>
                      setProjectForm({
                        ...projectForm,
                        description: e.target.value,
                      })
                    }
                    className="w-full border rounded-md px-3 py-2"
                    rows={3}
                    required
                  ></textarea>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowProjectModal(false)}
                    className="px-4 py-2 border rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Create Project
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Task Creation Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {taskForm._id ? "Update Task" : "Add New Task"}
            </h2>

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
                    {taskForm._id ? "Update" : "Add"} Task
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
