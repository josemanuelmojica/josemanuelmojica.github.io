import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";

// Static export served by an assets-only Cloudflare Worker (see wrangler.jsonc).
const projectRoot = fileURLToPath(new URL(".", import.meta.url));

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  turbopack: { root: projectRoot },
};

export default nextConfig;
