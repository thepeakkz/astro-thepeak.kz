export type CaseGalleryItem = {
  fallbackPosterSrc?: string;
  fallbackSrc?: string;
  height?: number;
  name?: string;
  posterSrc?: string;
  src: string;
  type: "image" | "video";
  width?: number;
};

const MAX_GALLERY_ITEMS = 100;

function safeUrl(value: unknown) {
  if (typeof value !== "string") return "";
  return value.startsWith("/") || value.startsWith("https://") ? value : "";
}

function positiveNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : undefined;
}

function normalizeItem(value: unknown): CaseGalleryItem | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const item = value as Record<string, unknown>;
  const src = safeUrl(item.src);
  if (!src) return null;

  const type = item.type === "video" || /\.(?:m4v|mov|mp4|webm)(?:\?|$)/i.test(src)
    ? "video"
    : "image";
  const posterSrc = safeUrl(item.posterSrc);
  const fallbackSrc = safeUrl(item.fallbackSrc);
  const fallbackPosterSrc = safeUrl(item.fallbackPosterSrc);
  const name = typeof item.name === "string" ? item.name.trim().slice(0, 240) : "";
  const width = positiveNumber(item.width);
  const height = positiveNumber(item.height);

  return {
    src,
    type,
    ...(name ? { name } : {}),
    ...(posterSrc ? { posterSrc } : {}),
    ...(fallbackSrc ? { fallbackSrc } : {}),
    ...(fallbackPosterSrc ? { fallbackPosterSrc } : {}),
    ...(width ? { width } : {}),
    ...(height ? { height } : {}),
  };
}

export function parseCaseGallery(value: unknown): CaseGalleryItem[] | undefined {
  if (value === undefined || value === null || value === "") return undefined;

  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    if (!Array.isArray(parsed)) return undefined;

    const seen = new Set<string>();
    return parsed.slice(0, MAX_GALLERY_ITEMS).flatMap((candidate) => {
      const item = normalizeItem(candidate);
      if (!item || seen.has(item.src)) return [];
      seen.add(item.src);
      return [item];
    });
  } catch {
    return undefined;
  }
}

export function serializeCaseGallery(items: readonly CaseGalleryItem[]) {
  return JSON.stringify(items.slice(0, MAX_GALLERY_ITEMS));
}
