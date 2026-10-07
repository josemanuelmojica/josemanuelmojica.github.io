import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";

// Static export: every route is prerendered to ./out and served from
// Cloudflare's edge as plain assets. No Node or Workers runtime is required,
// so nothing here depends on a Next-on-Cloudflare adapter.
const projectRoot = fileURLToPath(new URL(".", import.meta.url));
// Optional sub-path hosting (leave empty for a Pages project at the domain root).
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  assetPrefix: basePath || undefined,
  images: { unoptimized: true },
  turbopack: { root: projectRoot },
};

export default nextConfig;
