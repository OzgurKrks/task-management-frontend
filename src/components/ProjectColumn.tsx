import { useState } from "react";
import {
  PlusIcon,
  UserGroupIcon,
  TrashIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { Project } from "@/types/project";
import { Task } from "@/types/task";
import TaskCard from "./TaskCard";
import ProjectMembersModal from "./ProjectMembersModal";
import { useRouter } from "next/navigation";
import { axiosPrivate } from "@/lib/axiosConfig";
import { showSuccessToast, showErrorToast } from "@/utils/toast";

interface ProjectColumnProps {
  project: Project;
  tasks: Task[];
  onAddTask: (projectId: string) => void;
  onTaskUpdated?: () => void;
  onTaskDeleted?: () => void;
  onProjectUpdated?: () => void;
  onProjectDeleted?: (projectId: string) => void;
  onViewLogs?: () => void;
}

export default function ProjectColumn({
  project,
  tasks,
  onAddTask,
  onTaskDeleted,
  onProjectUpdated,
  onProjectDeleted,
}: ProjectColumnProps) {
  // State for project members modal
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleAddTask = () => {
    onAddTask(project._id);
  };

  const handleViewMembers = () => {
    setIsMembersModalOpen(true);
  };

  const handleViewDetails = () => {
    router.push(`/dashboard/projects/${project._id}`);
  };

  const handleEditTask = (taskId: string) => {
    router.push(`/dashboard/tasks/${taskId}`);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await axiosPrivate.delete(`/tasks/${taskId}`);
        if (onTaskDeleted) {
          onTaskDeleted();
        }
      } catch (error) {
        console.error("Failed to delete task:", error);
        alert("Failed to delete task. Please try again.");
      }
    }
  };

  const handleDeleteProject = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this project? All associated tasks will also be deleted."
      )
    ) {
      try {
        setIsDeleting(true);
        await axiosPrivate.delete(`/projects/${project._id}`);
        showSuccessToast("Project deleted successfully");
        if (onProjectDeleted) {
          onProjectDeleted(project._id);
        }
      } catch (error) {
        console.error("Failed to delete project:", error);
        showErrorToast("Failed to delete project. Please try again.");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-800">{project.name}</h3>
        <div className="flex space-x-1">
          <button
            onClick={handleDeleteProject}
            className="p-1 text-gray-500 hover:text-red-500"
            title="Delete project"
            disabled={isDeleting}
          >
            <TrashIcon className="h-5 w-5" />
          </button>

          <button
            onClick={handleViewMembers}
            className="p-1 text-gray-500 hover:text-blue-500"
            title="View project members"
          >
            <UserGroupIcon className="h-5 w-5" />
          </button>

          <button
            onClick={handleAddTask}
            className="p-1 text-gray-500 hover:text-blue-500"
            title="Add a new task"
          >
            <PlusIcon className="h-5 w-5" />
          </button>

          <button
            onClick={handleViewDetails}
            className="p-1 text-gray-500 hover:text-green-500"
            title="View project details"
          >
            <EyeIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="text-xs text-gray-500 mb-2 flex justify-between">
        <span>{tasks.length} tasks</span>
        <span>Created: {new Date(project.createdAt).toLocaleDateString()}</span>
      </div>

      {isDeleting && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}

      <div className="flex-grow bg-gray-50 rounded p-3 overflow-y-auto h-[450px]">
        {tasks.length > 0 ? (
          tasks.map((task, index) => (
            <TaskCard
              key={task._id}
              task={task}
              index={index}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
            />
          ))
        ) : (
          <div className="flex justify-center items-center h-full text-gray-400 text-sm">
            No tasks yet
          </div>
        )}
      </div>

      {/* View details link at the bottom */}
      <div className="mt-3 text-center">
        <button
          onClick={handleViewDetails}
          className="text-blue-500 hover:text-blue-700 text-sm font-medium"
        >
          View Details
        </button>
      </div>

      {/* Project Members Modal */}
      <ProjectMembersModal
        isOpen={isMembersModalOpen}
        onClose={() => setIsMembersModalOpen(false)}
        projectId={project._id}
        onProjectUpdated={onProjectUpdated}
      />
    </div>
  );
}
