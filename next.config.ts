import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // node:sqlite adalah modul bawaan Node.js, jangan di-bundle oleh Turbopack/webpack.
  serverExternalPackages: ["node:sqlite"],
  typedRoutes: false,
};

export default nextConfig;
