"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

export default function HomePage() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  useEffect(() => {
    // Redirect based on authentication status
    if (isAuthenticated) {
      router.push("/dashboard");
    } else {
      router.push("/auth/login");
    }
  }, [isAuthenticated, router]);

  // Show loading while redirecting
  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Task Management App</h2>
        <p className="text-gray-600 mb-4">Redirecting...</p>
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  );
}
