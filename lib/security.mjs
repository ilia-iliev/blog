export function isSlug(value) {
  return /^[a-zA-Z0-9_-]+$/.test(value);
}

export function isSafeContentUrl(value) {
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  try {
    return ["http:", "https:", "mailto:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}
