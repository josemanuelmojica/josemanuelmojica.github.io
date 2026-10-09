import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://mojicagarcia.com/", priority: 1 },
    { url: "https://mojicagarcia.com/resume/", priority: 0.8 },
  ];
}
