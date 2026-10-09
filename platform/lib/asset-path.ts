const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Prefix a public asset with the optional deployment base path. */
export function assetPath(path: string): string {
  return `${basePath}${path}`;
}
