import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { z } from "zod";
import { requireAdmin } from "@/lib/supabase/auth";
import { createR2Client, getR2Config, getR2PublicUrl } from "@/lib/r2";

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

const inputSchema = z.object({
  fileName: z.string().min(1).max(240),
  contentType: z.string().min(1).max(100),
  size: z.number().int().positive().max(MAX_FILE_SIZE),
  folder: z.enum(["pages", "cases"]).default("pages"),
  caseSlug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(120).optional(),
});

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
    const parsed = inputSchema.safeParse(await request.json());

    if (!parsed.success || !ALLOWED_TYPES.has(parsed.data?.contentType ?? "")) {
      return Response.json(
        { error: "Разрешены изображения и видео размером до 500 МБ." },
        { status: 400 },
      );
    }

    const { caseSlug, contentType, fileName, folder } = parsed.data;
    const now = new Date();
    const uniqueName = `${crypto.randomUUID()}-${safeBaseName(fileName)}.${extensionFor(contentType)}`;
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
      ContentType: contentType,
    });
    const uploadUrl = await getSignedUrl(createR2Client(), command, { expiresIn: 300 });

    return Response.json({
      contentType,
      key,
      publicUrl: getR2PublicUrl(key),
      uploadUrl,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Не удалось подготовить загрузку.";
    const status = message === "UNAUTHORIZED" ? 401 : 500;
    return Response.json({ error: status === 401 ? "Требуется вход администратора." : message }, { status });
  }
}
