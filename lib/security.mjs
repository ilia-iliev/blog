const imageExtensions = new Set(["jpg", "jpeg", "png", "gif", "webp", "svg"]);

export function isSlug(value) {
  return /^[a-zA-Z0-9_-]+$/.test(value);
}

export function isImageFilename(value) {
  const match = /^[a-zA-Z0-9_-][a-zA-Z0-9_.-]*\.([a-zA-Z]+)$/.exec(value);
  return match !== null && imageExtensions.has(match[1].toLowerCase());
}

export function isSafeContentUrl(value) {
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  try {
    return ["http:", "https:", "mailto:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}
