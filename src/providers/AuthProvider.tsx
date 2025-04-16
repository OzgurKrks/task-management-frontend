"use client";

import { ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import { logout } from "@/redux/features/authSlice";
import socketService from "@/utils/socket";
import { getAuthToken } from "@/utils/authCookies";

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const { isAuthenticated, token, user } = useSelector(
    (state: RootState) => state.auth
  );
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const pathname = usePathname();

  // Initialize socket connection when authenticated
  useEffect(() => {
    const authToken = getAuthToken();

    // Only proceed if we have a token and are authenticated
    if (isAuthenticated && authToken) {
      // Check if there's already an active connection
      if (!socketService.isConnected()) {
        try {
          // Connect with socket
          socketService
            .connect()
            .then(() => {
              console.log("Socket connection established with token");
              // Debug connection after a short delay
              setTimeout(() => socketService.debug(), 1000);
            })
            .catch((error) => {
              console.error("Socket connection failed:", error);
            });
        } catch (error) {
          console.error("Socket connection setup failed:", error);
        }
      }
    } else {
      // Disconnect if not authenticated or no token
      socketService.disconnect();
    }

    return () => {
      // Only disconnect if component unmounts
      if (pathname !== "/dashboard") {
        socketService.disconnect();
      }
    };
  }, [isAuthenticated, pathname]);

  // Set up axios interceptors for authentication
  useEffect(() => {
    // Add axios request interceptor to include token
    const setAxiosDefaults = () => {
      const axios = require("axios");

      // Clear previous interceptors
      axios.interceptors.request.handlers = [];
      axios.interceptors.response.handlers = [];

      // Add request interceptor
      axios.interceptors.request.use(
        (config: any) => {
          const authToken = getAuthToken();
          if (authToken) {
            config.headers.Authorization = `Bearer ${authToken}`;
          }
          return config;
        },
        (error: any) => Promise.reject(error)
      );

      // Add response interceptor to handle 401 errors
      axios.interceptors.response.use(
        (response: any) => response,
        (error: any) => {
          if (error.response?.status === 401) {
            // Token expired or invalid, log out
            dispatch(logout());

            // Only redirect to login if not already on login page
            const isAuthPage = pathname.includes("/auth/");
            if (!isAuthPage) {
              router.push("/auth/login");
            }
          }

          return Promise.reject(error);
        }
      );
    };

    setAxiosDefaults();
  }, [dispatch, router, pathname]);

  return <>{children}</>;
}
