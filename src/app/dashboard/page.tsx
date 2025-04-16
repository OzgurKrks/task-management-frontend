import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";
import { createServerAxios } from "@/lib/axiosConfig";
import { getAuthCookie } from "@/utils/serverCookies";

// Basic type for project and task to help TypeScript
interface BasicProject {
  _id: string;
  [key: string]: any;
}

// Verify user token and get user data
async function verifyAuth(token: string) {
  try {
    const serverAxios = createServerAxios(token);
    const response = await serverAxios.get(`/auth/profile`);
    return { verified: true, user: response.data };
  } catch (error) {
    console.error("Auth verification failed:", error);
    return { verified: false, user: null };
  }
}

async function fetchProjects(token: string) {
  try {
    const serverAxios = createServerAxios(token);
    const response = await serverAxios.get(`/projects`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    return [];
  }
}

async function fetchProjectTasks(token: string, projectId: string) {
  try {
    const serverAxios = createServerAxios(token);
    const response = await serverAxios.get(`/projects/${projectId}/tasks`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch tasks for project ${projectId}:`, error);
    return [];
  }
}

export default async function DashboardPage() {
  try {
    // Get token from cookie
    const token = await getAuthCookie();

    console.log("[Dashboard Page] Auth token exists:", !!token);

    // If no token, redirect to login
    if (!token) {
      console.log("[Dashboard Page] No auth token found, redirecting to login");
      return redirect("/auth/login");
    }

    // Verify user authentication
    const { verified, user } = await verifyAuth(token);

    if (!verified || !user) {
      console.log(
        "[Dashboard Page] User verification failed, redirecting to login"
      );
      return redirect("/auth/login");
    }

    console.log("[Dashboard Page] User verified successfully:", user.name);

    // Fetch projects
    const projects = await fetchProjects(token);
    console.log(
      `[Dashboard Page] Fetched ${projects.length} projects for user`
    );

    // Fetch tasks for each project in parallel
    const projectTasks: Record<string, any[]> = {};
    if (projects && projects.length > 0) {
      const tasksPromises = projects.map(async (project: BasicProject) => {
        const tasks = await fetchProjectTasks(token, project._id);
        return { projectId: project._id, tasks };
      });

      const results = await Promise.all(tasksPromises);
      results.forEach(({ projectId, tasks }) => {
        projectTasks[projectId] = tasks;
      });
    }

    return (
      <DashboardClient
        initialUser={user}
        initialProjects={projects}
        initialProjectTasks={projectTasks}
      />
    );
  } catch (error) {
    console.error("[Dashboard Page] Error loading dashboard:", error);
    // In case of unexpected errors, redirect to login
    return redirect("/auth/login");
  }
}

// Force dynamic rendering to ensure we always check auth status
export const dynamic = "force-dynamic";
export const revalidate = 0;
