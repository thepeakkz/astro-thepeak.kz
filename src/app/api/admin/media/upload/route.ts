import { PutObjectCommand } from "@aws-sdk/client-s3";
import { requireAdmin } from "@/lib/supabase/auth";
import { createR2Client, getR2Config, getR2PublicUrl } from "@/lib/r2";
import { IMMUTABLE_MEDIA_CACHE_CONTROL, optimizeImageBuffer } from "@/lib/image-optimization";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_FILE_SIZE = 500 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "image/avif",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/quicktime",
  "video/webm",
]);

function safeBaseName(fileName: string) {
  const withoutExtension = fileName.replace(/\.[^.]+$/, "");
  const normalized = withoutExtension
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);

  return normalized || "media";
}

function extensionFor(contentType: string) {
  const fallback: Record<string, string> = {
    "application/pdf": "pdf",
    "image/avif": "avif",
    "image/gif": "gif",
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "video/mp4": "mp4",
    "video/quicktime": "mov",
    "video/webm": "webm",
  };
  return fallback[contentType] || "bin";
}

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return Response.json({ error: "Файл не передан." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE || !ALLOWED_TYPES.has(file.type)) {
      return Response.json(
        { error: "Разрешены изображения и видео размером до 500 МБ." },
        { status: 400 },
      );
    }

    const folder = (formData.get("folder") as string) || "pages";
    const caseSlug = (formData.get("caseSlug") as string) || undefined;

    const sourceBuffer = Buffer.from(await file.arrayBuffer());
    const optimized = file.type.startsWith("image/")
      ? await optimizeImageBuffer(sourceBuffer, file.type)
      : {
          buffer: sourceBuffer,
          contentType: file.type,
          extension: extensionFor(file.type),
          optimizedBy: "original" as const,
        };
    const now = new Date();
    const uniqueName = `${crypto.randomUUID()}-${safeBaseName(file.name)}.${optimized.extension}`;
    const key = folder === "cases" && caseSlug
      ? `cases/${caseSlug}/${uniqueName}`
      : [
          "cms",
          folder,
          String(now.getUTCFullYear()),
          String(now.getUTCMonth() + 1).padStart(2, "0"),
          uniqueName,
        ].join("/");

    const { bucket } = getR2Config();

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: optimized.buffer,
      ContentType: optimized.contentType,
      CacheControl: IMMUTABLE_MEDIA_CACHE_CONTROL,
    });

    await createR2Client().send(command);

    const publicUrl = getR2PublicUrl(key);

    return Response.json({
      contentType: optimized.contentType,
      key,
      optimizedBy: optimized.optimizedBy,
      publicUrl,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Не удалось загрузить файл.";
    const status = message === "UNAUTHORIZED" ? 401 : 500;
    return Response.json(
      { error: status === 401 ? "Требуется вход администратора." : message },
      { status },
    );
  }
}
