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
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const pathname = usePathname();

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
