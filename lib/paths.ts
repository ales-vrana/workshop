/** Musí sedět s `basePath` v next.config.mjs. */
export const BASE_PATH = "/workshop";

export function apiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${BASE_PATH}${p}`;
}

export const CLARITY_PROJECT_ID = "ykej9fbehc";
export const CLARITY_URL = `https://clarity.microsoft.com/projects/view/${CLARITY_PROJECT_ID}`;
