/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["https://task-management-backend-ts41.onrender.com"],
  },
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL ||
      "https://task-management-backend-ts41.onrender.com/api",
  },
};

module.exports = nextConfig;
