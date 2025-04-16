import { redirect } from "next/navigation";
import { getAuthCookie } from "@/utils/serverCookies";
import { Suspense } from "react";
import Loading from "@/components/ui/Loading";
import TaskDetailClient from "./TaskDetailClient";
import { createServerAxios } from "@/lib/axiosConfig";

// Mark this route as dynamic to prevent static generation errors with cookies
export const dynamic = "force-dynamic";

// Auth check function
const checkAuth = async () => {
  const token = await getAuthCookie();
  if (!token) {
    redirect("/auth/login");
  }
  return token;
};

// Get task details function
const getTaskDetails = async (taskId: string, token: string) => {
  try {
    // Create a server-side Axios instance with the auth token
    const serverAxios = createServerAxios(token);
    const response = await serverAxios.get(`/tasks/${taskId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to get task details:", error);
    throw new Error("Failed to get task details");
  }
};

// Get task logs function
const getRecentTaskLogs = async (taskId: string, token: string) => {
  try {
    // Create a server-side Axios instance with the auth token
    const serverAxios = createServerAxios(token);
    const response = await serverAxios.get(`/tasks/${taskId}/logs`, {
      params: {
        limit: 5, // Only get the 5 most recent logs
      },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to get task logs:", error);
    return []; // Return empty array instead of throwing error
  }
};

export default async function TaskDetailPage(props: {
  params: Promise<{ taskId: string }>;
}) {
  // Next.js 15 expects params to be a Promise
  const params = await props.params;
  const { taskId } = params;

  // Check auth and get token
  const token = await checkAuth();

  try {
    // Fetch task details and recent logs
    const [taskDetails, recentLogs] = await Promise.all([
      getTaskDetails(taskId, token),
      getRecentTaskLogs(taskId, token),
    ]);

    // Pass data to client component
    return (
      <Suspense
        fallback={
          <div className="flex justify-center items-center h-screen">
            <Loading size="lg" />
          </div>
        }
      >
        <TaskDetailClient taskDetails={taskDetails} recentLogs={recentLogs} />
      </Suspense>
    );
  } catch (error) {
    // Handle errors
    console.error("Error fetching task data:", error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Error Loading Task
          </h1>
          <p className="text-gray-700 mb-4">
            Failed to load task details. Please try again later.
          </p>
          <a
            href="/dashboard"
            className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }
}
