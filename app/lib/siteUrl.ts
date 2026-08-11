const fallbackSiteUrl = "https://ark-and-text.example";

export function resolveSiteUrl(rawSiteUrl: string | undefined): URL {
  const candidate = rawSiteUrl?.trim();
  if (!candidate) return new URL(fallbackSiteUrl);

  try {
    const url = new URL(candidate);
    const isHttpOrigin = url.protocol === "https:" || url.protocol === "http:";
    const hasCredentials = url.username !== "" || url.password !== "";

    return isHttpOrigin && !hasCredentials ? url : new URL(fallbackSiteUrl);
  } catch {
    return new URL(fallbackSiteUrl);
  }
}
