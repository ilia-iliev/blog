export function altFromFilename(src: string) {
  const name = src.split("/").pop() ?? "";
  return name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim();
}
