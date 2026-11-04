import type { NextConfig } from "next";

/**
 * STATIC_EXPORT=1 produces a fully static build (used for the GitHub Pages
 * preview); BASE_PATH mounts it under a sub-path. Netlify/production builds
 * leave both unset and use the default Next.js output.
 */
const isStaticExport = process.env.STATIC_EXPORT === "1";
const basePath = process.env.BASE_PATH || "";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(isStaticExport ? { output: "export" as const, basePath, trailingSlash: true } : {}),
  images: {
    formats: ["image/avif", "image/webp"],
    unoptimized: isStaticExport,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
