import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://mojicagarcia.com/", priority: 1 },
    { url: "https://mojicagarcia.com/work/knowledge-linter/", priority: 0.9 },
    { url: "https://mojicagarcia.com/work/privacy-gate/", priority: 0.9 },
    { url: "https://mojicagarcia.com/work/import-preflight/", priority: 0.9 },
    { url: "https://mojicagarcia.com/resume/", priority: 0.8 },
  ];
}
