"use client";

import { useState, useEffect } from "react";
import { BellIcon } from "@heroicons/react/24/outline";
import { axiosPrivate } from "@/lib/axiosConfig";
import Link from "next/link";

interface Notification {
  _id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
  relatedProject?: string | { _id: string };
  relatedTask?: string | { _id: string };
}

interface NotificationSummary {
  notifications: Notification[];
  unreadCount: number;
}

export default function NotificationIcon() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axiosPrivate.get<NotificationSummary>(
        "/notifications"
      );
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      await axiosPrivate.put(`/notifications/${notificationId}/read`);
      // Update local state
      setNotifications(
        notifications.map((notification) =>
          notification._id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
      setUnreadCount((prev) => prev - 1);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await axiosPrivate.put("/notifications/read-all");
      // Update local state
      setNotifications(
        notifications.map((notification) => ({
          ...notification,
          read: true,
        }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
    // If opening dropdown, fetch latest notifications
    if (!showDropdown) {
      fetchNotifications();
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchNotifications();

    // Set up interval to check for new notifications
    const interval = setInterval(() => {
      fetchNotifications();
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="relative p-2 text-gray-700 hover:text-blue-600 focus:outline-none"
        title="Notifications"
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-50">
          <div className="p-3 border-b flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-700">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-3 border-b hover:bg-gray-50 ${
                    !notification.read ? "bg-blue-50" : ""
                  }`}
                  onClick={() =>
                    !notification.read && markAsRead(notification._id)
                  }
                >
                  <div className="flex items-start">
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <span className="h-2 w-2 bg-blue-600 rounded-full mt-1"></span>
                    )}
                  </div>

                  {notification.relatedTask && (
                    <Link
                      href={`/dashboard/tasks/${
                        typeof notification.relatedTask === "object"
                          ? (notification.relatedTask as any)._id
                          : notification.relatedTask
                      }`}
                      className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                    >
                      View task
                    </Link>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
