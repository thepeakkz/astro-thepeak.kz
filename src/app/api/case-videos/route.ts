import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { NextRequest } from "next/server";
import { caseMediaManifest } from "@/data/case-media-manifest";
import { createR2Client, getR2Config, getR2PublicUrl } from "@/lib/r2";
import { getMediaUrlPair } from "@/lib/media-fallback";

const IMAGE_EXTENSIONS = new Set([".avif", ".gif", ".jpeg", ".jpg", ".png", ".webp"]);
const VIDEO_EXTENSIONS = new Set([".m4v", ".mov", ".mp4", ".webm"]);

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface CaseMediaItem {
  height?: number;
  src: string;
  name: string;
  posterSrc?: string;
  type: "image" | "video";
  width?: number;
}

function isSafeSlug(slug: string) {
  return /^[a-z0-9-]+$/i.test(slug);
}

function getMediaType(fileName: string): CaseMediaItem["type"] | null {
  const extension = path.extname(fileName).toLowerCase();
  if (IMAGE_EXTENSIONS.has(extension)) return "image";
  if (VIDEO_EXTENSIONS.has(extension)) return "video";
  return null;
}

function isCover(fileName: string) {
  const baseName = path.parse(fileName).name.toLowerCase();
  return baseName === "cover" || baseName === "cover-poster" || baseName.startsWith("cover");
}

function getWebpDimensions(buffer: Buffer) {
  if (buffer.toString("ascii", 0, 4) !== "RIFF" || buffer.toString("ascii", 8, 12) !== "WEBP") return {};
  const chunkType = buffer.toString("ascii", 12, 16);
  if (chunkType === "VP8 " && buffer.length >= 30) {
    return { width: buffer.readUInt16LE(26) & 0x3fff, height: buffer.readUInt16LE(28) & 0x3fff };
  }
  if (chunkType === "VP8X" && buffer.length >= 30) {
    return { width: 1 + buffer.readUIntLE(24, 3), height: 1 + buffer.readUIntLE(27, 3) };
  }
  if (chunkType === "VP8L" && buffer.length >= 25) {
    const bits = buffer.readUInt32LE(21);
    return { width: 1 + (bits & 0x3fff), height: 1 + ((bits >> 14) & 0x3fff) };
  }
  return {};
}

async function getLocalImageDimensions(filePath: string) {
  try {
    return path.extname(filePath).toLowerCase() === ".webp" ? getWebpDimensions(await readFile(filePath)) : {};
  } catch {
    return {};
  }
}

function normalizeMediaKey(value: string) {
  return value
    .normalize("NFC")
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/%[0-9a-f]{2}/gi, " ")
    .replace(/[^a-zа-яё0-9]+/giu, " ")
    .trim();
}

function getAssetName(value: string) {
  const withoutQuery = value.split("?")[0].replace(/\.[a-z0-9]+$/i, "");
  try {
    return path.basename(decodeURIComponent(withoutQuery));
  } catch {
    return path.basename(withoutQuery);
  }
}

function isSameAsset(a: CaseMediaItem, b: CaseMediaItem) {
  const aKeys = [a.name, getAssetName(a.src)].map(normalizeMediaKey).filter(Boolean);
  const bKeys = [b.name, getAssetName(b.src)].map(normalizeMediaKey).filter(Boolean);
  return aKeys.some((aKey) => bKeys.some((bKey) => aKey === bKey || aKey.startsWith(`${bKey} `) || bKey.startsWith(`${aKey} `)));
}

function attachPosters(items: CaseMediaItem[]) {
  const images = items.filter((item) => item.type === "image");
  const videos = items.filter((item) => item.type === "video").map((video) => {
    if (video.posterSrc) return video;
    const poster = images.find((image) => isSameAsset(video, image));
    return { ...video, posterSrc: poster?.src, width: video.width || 1080, height: video.height || 1920 };
  });
  const posterUrls = new Set(videos.map((video) => video.posterSrc).filter(Boolean));
  return [...videos, ...images.filter((image) => !posterUrls.has(image.src))];
}

async function getR2Media(slug: string): Promise<CaseMediaItem[]> {
  if (
    !process.env.CLOUDFLARE_ACCOUNT_ID ||
    !process.env.R2_ACCESS_KEY_ID ||
    !process.env.R2_SECRET_ACCESS_KEY ||
    !process.env.R2_BUCKET_NAME ||
    !process.env.R2_PUBLIC_URL
  ) return [];

  try {
    const prefix = `cases/${slug}/`;
    const { bucket } = getR2Config();
    const response = await createR2Client().send(new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix, MaxKeys: 1000 }));
    return (response.Contents || []).flatMap((object) => {
      if (!object.Key) return [];
      const relativeName = object.Key.slice(prefix.length);
      if (!relativeName || relativeName.includes("/") || isCover(relativeName)) return [];
      const type = getMediaType(relativeName);
      return type ? [{ src: getR2PublicUrl(object.Key), name: path.parse(relativeName).name, type }] : [];
    });
  } catch (error) {
    console.warn(`R2 case media request failed for "${slug}".`, error);
    return [];
  }
}

async function getLocalMedia(slug: string): Promise<CaseMediaItem[]> {
  const mediaDir = path.join(process.cwd(), "public", "cases", slug);
  try {
    const entries = await readdir(mediaDir, { withFileTypes: true });
    return Promise.all(entries.flatMap((entry) => {
      if (!entry.isFile() || isCover(entry.name)) return [];
      const type = getMediaType(entry.name);
      if (!type) return [];
      return [(async () => ({
        src: `/cases/${slug}/${encodeURIComponent(entry.name)}`,
        name: path.parse(entry.name).name,
        type,
        ...(type === "image" ? await getLocalImageDimensions(path.join(mediaDir, entry.name)) : {}),
      }))()];
    }));
  } catch {
    return [];
  }
}

function getManifestMedia(slug: string): CaseMediaItem[] {
  return (caseMediaManifest[slug] || []).map((item) => ({ ...item }));
}

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug")?.trim();
  if (!slug || !isSafeSlug(slug)) return Response.json({ media: [], videos: [] }, { status: 400 });

  const [r2Media, localMedia] = await Promise.all([
    process.env.PLAYWRIGHT_TEST === "1" ? Promise.resolve([]) : getR2Media(slug),
    getLocalMedia(slug),
  ]);
  const manifestMedia = getManifestMedia(slug);
  const candidates = r2Media.length > 0
    ? [...r2Media, ...manifestMedia.filter((item) => !r2Media.some((known) => isSameAsset(item, known))), ...localMedia]
    : manifestMedia.length > 0
      ? [...manifestMedia, ...localMedia]
      : localMedia;

  const seen = new Set<string>();
  const media = attachPosters(candidates)
    .filter((item) => {
      if (seen.has(item.src)) return false;
      seen.add(item.src);
      return true;
    })
    .map((item) => {
      const srcPair = getMediaUrlPair(item.src);
      const posterPair = item.posterSrc ? getMediaUrlPair(item.posterSrc) : undefined;
      return {
        ...item,
        src: srcPair.primarySrc,
        ...(srcPair.fallbackSrc ? { fallbackSrc: srcPair.fallbackSrc } : {}),
        ...(posterPair ? { posterSrc: posterPair.primarySrc } : {}),
        ...(posterPair?.fallbackSrc ? { fallbackPosterSrc: posterPair.fallbackSrc } : {}),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name, "ru"));

  return Response.json({ media, videos: media.filter((item) => item.type === "video") });
}

