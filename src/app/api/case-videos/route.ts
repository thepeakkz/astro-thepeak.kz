import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { NextRequest } from "next/server";
import { caseMediaManifest } from "@/data/case-media-manifest";
import { optimizeCloudinaryVideoUrl } from "@/utils/media";

const IMAGE_EXTENSIONS = new Set([".avif", ".gif", ".jpeg", ".jpg", ".png", ".webp"]);
const VIDEO_EXTENSIONS = new Set([".m4v", ".mov", ".mp4", ".webm"]);
const CLOUDINARY_CASES_FOLDER = "cases";
const CLOUDINARY_VIDEO_TRANSFORMATION = "f_auto,q_auto";

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

interface CloudinaryResource {
    public_id: string;
    secure_url: string;
    display_name?: string;
    height?: number;
    original_filename?: string;
    format?: string;
    width?: number;
}

interface CloudinaryResourcesResponse {
    resources?: CloudinaryResource[];
}

interface CloudinaryErrorResponse {
    error?: {
        message?: string;
    };
}

function isSafeSlug(slug: string) {
    return /^[a-z0-9-]+$/i.test(slug);
}

function getMediaType(fileName: string): CaseMediaItem["type"] | null {
    const extension = path.extname(fileName).toLowerCase();

    if (IMAGE_EXTENSIONS.has(extension)) {
        return "image";
    }

    if (VIDEO_EXTENSIONS.has(extension)) {
        return "video";
    }

    return null;
}

function getWebpDimensions(buffer: Buffer) {
    if (buffer.toString("ascii", 0, 4) !== "RIFF" || buffer.toString("ascii", 8, 12) !== "WEBP") {
        return {};
    }

    const chunkType = buffer.toString("ascii", 12, 16);

    if (chunkType === "VP8 " && buffer.length >= 30) {
        return {
            width: buffer.readUInt16LE(26) & 0x3fff,
            height: buffer.readUInt16LE(28) & 0x3fff,
        };
    }

    if (chunkType === "VP8X" && buffer.length >= 30) {
        return {
            width: 1 + buffer.readUIntLE(24, 3),
            height: 1 + buffer.readUIntLE(27, 3),
        };
    }

    if (chunkType === "VP8L" && buffer.length >= 25) {
        const bits = buffer.readUInt32LE(21);

        return {
            width: 1 + (bits & 0x3fff),
            height: 1 + ((bits >> 14) & 0x3fff),
        };
    }

    return {};
}

async function getLocalImageDimensions(filePath: string) {
    try {
        const extension = path.extname(filePath).toLowerCase();

        if (extension === ".webp") {
            return getWebpDimensions(await readFile(filePath));
        }
    } catch {
        return {};
    }

    return {};
}

function getCloudinaryConfig() {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
        return null;
    }

    return { cloudName, apiKey, apiSecret };
}

function getCloudinaryVideoName(resource: CloudinaryResource, folderPrefix: string) {
    const publicName = resource.public_id.slice(folderPrefix.length);
    return resource.display_name || resource.original_filename || path.parse(publicName).name;
}

function getHighQualityCloudinaryVideoSrc(src: string) {
    return src.replace("/video/upload/", `/video/upload/${CLOUDINARY_VIDEO_TRANSFORMATION}/`);
}

function getPublicMediaSrc(slug: string, fileName: string) {
    return `/cases/${slug}/${encodeURIComponent(fileName)}`;
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

function getBracketToken(value: string) {
    return value.match(/\[([^\]]+)\]/)?.[1]?.toLowerCase();
}

function getCloudinaryPublicName(value: string) {
    const withoutQuery = value.split("?")[0];
    const withoutExtension = withoutQuery.replace(/\.[a-z0-9]+$/i, "");
    const decoded = decodeURIComponent(withoutExtension);

    return path.basename(decoded);
}

function findPosterForVideoName(videoName: string, posterItems: CaseMediaItem[]) {
    const exactKey = normalizeMediaKey(videoName);
    const token = getBracketToken(videoName);

    return posterItems.find((poster) => {
        const posterKey = normalizeMediaKey(poster.name);
        const posterToken = getBracketToken(poster.name);

        if (posterKey === exactKey) {
            return true;
        }

        if (token && posterKey.includes(token)) {
            return true;
        }

        if (posterToken && exactKey.includes(posterToken)) {
            return true;
        }

        return posterKey.length > 0 && exactKey.startsWith(`${posterKey} `);
    });
}

async function getCloudinaryVideos(slug: string, localPosters: CaseMediaItem[]): Promise<CaseMediaItem[] | null> {
    const config = getCloudinaryConfig();

    if (!config) {
        return null;
    }

    const folderPrefix = `${CLOUDINARY_CASES_FOLDER}/${slug}/`;
    const params = new URLSearchParams({
        prefix: folderPrefix,
        max_results: "100",
    });
    const url = `https://api.cloudinary.com/v1_1/${config.cloudName}/resources/video/upload?${params.toString()}`;
    const credentials = Buffer.from(`${config.apiKey}:${config.apiSecret}`).toString("base64");

    try {
        const response = await fetch(url, {
            headers: {
                Authorization: `Basic ${credentials}`,
            },
            cache: "no-store",
        });

        if (!response.ok) {
            const error = (await response.json().catch(() => null)) as CloudinaryErrorResponse | null;
            console.warn(
                `Cloudinary case videos request failed for "${slug}": ${response.status}${
                    error?.error?.message ? ` ${error.error.message}` : ""
                }`,
            );

            return null;
        }

        const data = (await response.json()) as CloudinaryResourcesResponse;

        return (data.resources || [])
            .filter((resource) => {
                if (!resource.secure_url || !resource.public_id.startsWith(folderPrefix)) {
                    return false;
                }

                const nestedPath = resource.public_id.slice(folderPrefix.length);
                const assetName = path.parse(nestedPath).name.toLowerCase();
                if (assetName === "cover" || assetName === "cover-poster" || assetName.startsWith("cover")) {
                    return false;
                }
                return nestedPath.length > 0 && !nestedPath.includes("/");
            })
            .map((resource) => {
                const src = getHighQualityCloudinaryVideoSrc(resource.secure_url);
                const name = getCloudinaryVideoName(resource, folderPrefix);
                const poster = findPosterForVideoName(name, localPosters) || findPosterForVideoName(src, localPosters);

                return {
                    height: 1920,
                    src,
                    name,
                    posterSrc: poster?.src,
                    type: "video" as const,
                    width: 1080,
                };
            })
            .sort((a, b) => a.name.localeCompare(b.name, "ru"));
    } catch {
        return null;
    }
}

async function getLocalMedia(slug: string, allowedTypes: Set<CaseMediaItem["type"]>): Promise<CaseMediaItem[]> {
    const videoDir = path.join(process.cwd(), "public", "cases", slug);

    try {
        const entries = await readdir(videoDir, { withFileTypes: true });

        const media = await Promise.all(
            entries.flatMap((entry) => {
                if (!entry.isFile()) {
                    return [];
                }

                const baseName = path.parse(entry.name).name.toLowerCase();
                if (baseName === "cover" || baseName === "cover-poster" || baseName.startsWith("cover")) {
                    return [];
                }

                const type = getMediaType(entry.name);

                if (!type || !allowedTypes.has(type)) {
                    return [];
                }

                return [
                    (async () => ({
                        src: getPublicMediaSrc(slug, entry.name),
                        name: path.parse(entry.name).name,
                        type,
                        ...(type === "image" ? await getLocalImageDimensions(path.join(videoDir, entry.name)) : {}),
                    }))(),
                ];
            }),
        );

        return media.sort((a, b) => a.name.localeCompare(b.name, "ru"));
    } catch {
        return [];
    }
}

async function getLocalPosters(slug: string): Promise<CaseMediaItem[]> {
    const mediaDir = path.join(process.cwd(), "public", "cases", slug);

    try {
        const entries = await readdir(mediaDir, { withFileTypes: true });
        const videoNames = new Set(
            entries
                .filter((entry) => entry.isFile() && VIDEO_EXTENSIONS.has(path.extname(entry.name).toLowerCase()))
                .map((entry) => path.parse(entry.name).name),
        );
        const manifestVideos = (caseMediaManifest[slug] || []).filter((item) => item.type === "video");
        const posterCandidates = await Promise.all(
            entries
                .filter((entry) => entry.isFile() && path.extname(entry.name).toLowerCase() === ".webp")
                .map(async (entry) => ({
                    src: getPublicMediaSrc(slug, entry.name),
                    name: path.parse(entry.name).name,
                    type: "image" as const,
                    ...(await getLocalImageDimensions(path.join(mediaDir, entry.name))),
                })),
        );

        return posterCandidates
            .filter((poster) => {
                if (videoNames.has(poster.name)) {
                    return true;
                }

                return manifestVideos.some(
                    (video) =>
                        findPosterForVideoName(video.name, [poster]) ||
                        findPosterForVideoName(getCloudinaryPublicName(video.src), [poster]),
                );
            })
            .sort((a, b) => a.name.localeCompare(b.name, "ru"));
    } catch {
        return [];
    }
}

function getManifestMedia(
    slug: string,
    allowedTypes: Set<CaseMediaItem["type"]>,
    localPosters: CaseMediaItem[] = [],
): CaseMediaItem[] {
    return (caseMediaManifest[slug] || [])
        .filter((item) => allowedTypes.has(item.type))
        .map((item) => {
            const src = item.type === "video" ? optimizeCloudinaryVideoUrl(item.src) : item.src;
            if (item.type !== "video" || item.posterSrc) {
                return { ...item, src };
            }

            const poster =
                findPosterForVideoName(item.name, localPosters) ||
                findPosterForVideoName(getCloudinaryPublicName(item.src), localPosters);

            return {
                ...item,
                src,
                height: item.type === "video" ? (item.height || 1920) : (poster?.height ?? item.height),
                posterSrc: poster?.src,
                width: item.type === "video" ? (item.width || 1080) : (poster?.width ?? item.width),
            };
        })
        .sort((a, b) => a.name.localeCompare(b.name, "ru"));
}

function excludeVideoPostersFromImages(images: CaseMediaItem[], videos: CaseMediaItem[]) {
    const posterSrcs = new Set(videos.map((video) => video.posterSrc).filter(Boolean));

    return images.filter((image) => !posterSrcs.has(image.src));
}

function isSameVideoAsset(a: CaseMediaItem, b: CaseMediaItem) {
    return Boolean(
        findPosterForVideoName(a.name, [b]) ||
            findPosterForVideoName(b.name, [a]) ||
            findPosterForVideoName(getCloudinaryPublicName(a.src), [b]) ||
            findPosterForVideoName(getCloudinaryPublicName(b.src), [a]),
    );
}

function excludeDuplicateLocalVideos(localVideos: CaseMediaItem[], knownVideos: CaseMediaItem[]) {
    return localVideos.filter((localVideo) => !knownVideos.some((knownVideo) => isSameVideoAsset(localVideo, knownVideo)));
}

function attachLocalPostersToVideos(videos: CaseMediaItem[], localPosters: CaseMediaItem[]) {
    return videos.map((video) => {
        const poster = findPosterForVideoName(video.name, localPosters) || findPosterForVideoName(video.src, localPosters);

        return {
            ...video,
            height: video.height || 1920,
            posterSrc: video.posterSrc || poster?.src,
            width: video.width || 1080,
        };
    });
}

export async function GET(request: NextRequest) {
    const slug = request.nextUrl.searchParams.get("slug")?.trim();

    if (!slug || !isSafeSlug(slug)) {
        return Response.json({ videos: [] }, { status: 400 });
    }

    const localPosters = await getLocalPosters(slug);
    const cloudinaryVideos = process.env.PLAYWRIGHT_TEST === "1"
        ? null
        : await getCloudinaryVideos(slug, localPosters);

    const manifestMedia = getManifestMedia(slug, new Set(["video", "image"]), localPosters);
    const localImages = await getLocalMedia(slug, new Set(["image"]));
    const localVideos = attachLocalPostersToVideos(
        await getLocalMedia(slug, new Set(["video"])),
        localPosters,
    );

    let media: CaseMediaItem[] = [];

    if (cloudinaryVideos && cloudinaryVideos.length > 0) {
        const manifestVideoItems = (caseMediaManifest[slug] || []).filter((item) => item.type === "video");
        const filteredCloudinaryVideos = manifestVideoItems.length > 0
            ? cloudinaryVideos.filter((cVid) =>
                manifestVideoItems.some((mVid) => isSameVideoAsset(cVid, mVid))
            )
            : cloudinaryVideos;

        const manifestVideoObjects = manifestMedia.filter((item) => item.type === "video");
        const extraManifestVideos = excludeDuplicateLocalVideos(manifestVideoObjects, filteredCloudinaryVideos);

        const localOnlyVideos = excludeDuplicateLocalVideos(localVideos, [...filteredCloudinaryVideos, ...extraManifestVideos]);
        const images = excludeVideoPostersFromImages(
            [...manifestMedia.filter((item) => item.type === "image"), ...localImages],
            [...filteredCloudinaryVideos, ...extraManifestVideos, ...localOnlyVideos],
        );
        media = [...filteredCloudinaryVideos, ...extraManifestVideos, ...localOnlyVideos, ...images];
    } else if (manifestMedia.length > 0) {
        const localOnlyVideos = excludeDuplicateLocalVideos(
            localVideos,
            manifestMedia.filter((item) => item.type === "video"),
        );
        const images = excludeVideoPostersFromImages(localImages, [...manifestMedia, ...localOnlyVideos]);
        media = [...manifestMedia, ...localOnlyVideos, ...images];
    } else {
        const images = excludeVideoPostersFromImages(localImages, localVideos);
        media = [...localVideos, ...images];
    }

    // De-duplicate media items by src to prevent repeating elements
    const seen = new Set<string>();
    media = media.filter((item) => {
        if (seen.has(item.src)) return false;
        seen.add(item.src);
        return true;
    });

    media.sort((a, b) => a.name.localeCompare(b.name, "ru"));

    return Response.json({ media, videos: media.filter((item) => item.type === "video") });
}
