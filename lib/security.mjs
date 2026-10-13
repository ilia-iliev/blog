export function isSlug(value) {
  return /^[a-zA-Z0-9_-][a-zA-Z0-9._-]*$/.test(value);
}

export function isSafeContentUrl(value) {
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  try {
    return ["http:", "https:", "mailto:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

export function assertSlug(slug, source) {
  if (!isSlug(slug)) {
    throw new Error(`content/${source} can't be served: use only letters, digits, "_", "-" and "." in the name`);
  }
  return slug;
}
