import React from "react";

type LoadingSize = "sm" | "md" | "lg";

interface LoadingProps {
  size?: LoadingSize;
  color?: string;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

export default function Loading({
  size = "md",
  color = "border-blue-500",
}: LoadingProps) {
  const sizeClass = sizeClasses[size];

  return (
    <div
      className={`${sizeClass} animate-spin rounded-full border-2 border-gray-200 ${color} border-t-transparent`}
    ></div>
  );
}
