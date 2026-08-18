const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:5000";

/**
 * Normalizes and builds the full URL for media/images from the backend.
 * Handles:
 * - Direct HTTP/HTTPS URLs (returns as-is)
 * - Blob/data URLs (returns as-is)
 * - Object with path or url property
 * - Relative paths (replaces backslashes, prefixes with BASE_URL)
 * - Empty / undefined paths
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return "";

  if (typeof imagePath === "object" && imagePath !== null) {
    if (imagePath.path) return getImageUrl(imagePath.path);
    if (imagePath.url) return getImageUrl(imagePath.url);
    return "";
  }

  if (typeof imagePath !== "string") return "";

  const trimmed = imagePath.trim();
  if (!trimmed) return "";

  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("blob:") ||
    trimmed.startsWith("data:")
  ) {
    return trimmed;
  }

  const cleanPath = trimmed.replace(/\\/g, "/").replace(/^\/+/, "");
  const cleanBase = BASE_URL.replace(/\/+$/, "");

  return `${cleanBase}/${cleanPath}`;
};

export default getImageUrl;
