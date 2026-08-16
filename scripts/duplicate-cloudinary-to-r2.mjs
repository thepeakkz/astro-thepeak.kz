import { HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const IMMUTABLE_MEDIA_CACHE_CONTROL = "public, max-age=31536000, immutable";

const projectRoot = process.cwd();
const execute = process.argv.includes("--execute");
const sourceRoots = [path.join(projectRoot, "src")];
const mediaUrlPattern = /https:\/\/res\.cloudinary\.com\/[A-Za-z0-9_-]+\/(?:image|video|raw)\/upload\/[A-Za-z0-9%_.,:+/@~-]+/g;
const mappingFilePath = path.join(projectRoot, "src", "data", "cloudinary-r2-mapping.json");

async function loadLocalEnv() {
  try {
    const contents = await readFile(path.join(projectRoot, ".env.local"), "utf8");
    for (const line of contents.split(/\r?\n/)) {
      const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
      if (!match || process.env[match[1]] !== undefined) continue;
      const value = match[2].trim().replace(/^(["'])(.*)\1$/, "$2");
      process.env[match[1]] = value;
    }
  } catch {
    // Environment variables may already be supplied by the environment.
  }
}

async function walk(directory) {
  try {
    const entries = await readdir(directory, { withFileTypes: true });
    const files = await Promise.all(entries.map(async (entry) => {
      const absolutePath = path.join(directory, entry.name);
      if (entry.isDirectory()) return walk(absolutePath);
      return /\.(?:ts|tsx|js|jsx|json|md)$/.test(entry.name) ? [absolutePath] : [];
    }));
    return files.flat();
  } catch {
    return [];
  }
}

function getConfig() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET_NAME;
  const publicUrl = process.env.R2_PUBLIC_URL?.replace(/\/$/, "");
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicUrl) {
    throw new Error("Заполните переменные CLOUDFLARE_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME и R2_PUBLIC_URL в .env.local.");
  }
  return { accountId, accessKeyId, secretAccessKey, bucket, publicUrl };
}

function objectKeyForCloudinary(sourceUrl) {
  const url = new URL(sourceUrl);
  const segments = url.pathname.split("/").filter(Boolean);
  const cloudName = segments.shift();
  const resourceType = segments.shift();
  if (segments.shift() !== "upload") throw new Error(`Неожиданный URL Cloudinary: ${sourceUrl}`);

  const versionIndex = segments.findIndex((segment) => /^v\d+$/.test(segment));
  const assetPath = (versionIndex >= 0 ? segments.slice(versionIndex + 1) : segments).join("/");
  const decodedPath = decodeURIComponent(assetPath);
  const casesIndex = decodedPath.toLowerCase().indexOf("cases/");
  if (casesIndex >= 0) return decodedPath.slice(casesIndex);
  return `legacy/${cloudName}/${resourceType}/${decodedPath}`;
}

function publicUrlFor(publicUrl, key) {
  return `${publicUrl}/${key.split("/").map(encodeURIComponent).join("/")}`;
}

async function objectExists(client, bucket, key) {
  try {
    await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return true;
  } catch {
    return false;
  }
}

function getContentType(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  const types = {
    ".webp": "image/webp",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
  };
  return types[ext] || "application/octet-stream";
}

async function getLocalAssetsToUpload() {
  const localAssets = [];

  // 1. Client logos from public/logo/
  const logoDir = path.join(projectRoot, "public", "logo");
  try {
    const entries = await readdir(logoDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isFile() && !entry.name.startsWith(".")) {
        localAssets.push({
          localPath: path.join(logoDir, entry.name),
          key: `logos/${entry.name}`,
          label: `Логотип ${entry.name}`,
        });
      }
    }
  } catch {}

  // 2. Hero background videos and posters from public/
  const publicDir = path.join(projectRoot, "public");
  try {
    const entries = await readdir(publicDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isFile() && (entry.name.startsWith("bg") || entry.name.endsWith(".mp4") || entry.name.endsWith(".webm"))) {
        localAssets.push({
          localPath: path.join(publicDir, entry.name),
          key: `hero/${entry.name}`,
          label: `Главное видео/обложка ${entry.name}`,
        });
      }
    }
  } catch {}

  return localAssets;
}

async function main() {
  await loadLocalEnv();
  const files = (await Promise.all(sourceRoots.map(walk))).flat();
  const sourceUrls = new Set();

  for (const file of files) {
    const contents = await readFile(file, "utf8");
    for (const match of contents.matchAll(mediaUrlPattern)) {
      sourceUrls.add(match[0]);
    }
  }

  const sortedUrls = [...sourceUrls].sort();
  const localAssets = await getLocalAssetsToUpload();

  console.log(`Найдено ${sortedUrls.length} Cloudinary медиафайлов и ${localAssets.length} локальных файлов (логотипы + обложка).`);
  const totalFiles = sortedUrls.length + localAssets.length;

  let existingMapping = {};
  try {
    existingMapping = JSON.parse(await readFile(mappingFilePath, "utf8"));
  } catch {
    existingMapping = {};
  }

  if (!execute) {
    console.log("\nРежим проверки (dry run). Запустите с флагом -- --execute для выгрузки файлов в R2.\n");
    console.log(`Будет загружено всего файлов: ${totalFiles}`);
    console.log(`- Из Cloudinary: ${sortedUrls.length}`);
    console.log(`- Из локальных ресурсов (public/logo, public/bg*): ${localAssets.length}`);
    return;
  }

  const config = getConfig();
  const client = new S3Client({
    region: "auto",
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey },
  });

  const updatedMapping = { ...existingMapping };
  let uploadedCount = 0;
  let skippedCount = 0;
  let currentIndex = 0;

  // Upload Cloudinary assets
  for (let index = 0; index < sortedUrls.length; index += 1) {
    currentIndex += 1;
    const sourceUrl = sortedUrls[index];
    const key = objectKeyForCloudinary(sourceUrl);
    const targetPublicUrl = publicUrlFor(config.publicUrl, key);

    const exists = await objectExists(client, config.bucket, key);
    if (exists) {
      skippedCount += 1;
      updatedMapping[sourceUrl] = targetPublicUrl;
      console.log(`[${currentIndex}/${totalFiles}] Уже есть в R2: ${key}`);
      continue;
    }

    console.log(`[${currentIndex}/${totalFiles}] Скачиваем с Cloudinary и загружаем в R2: ${key}`);
    const response = await fetch(sourceUrl);
    if (!response.ok || !response.body) {
      console.warn(`Не удалось скачать ${sourceUrl}: HTTP ${response.status}`);
      continue;
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    await client.send(new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: buffer,
      ContentLength: buffer.length,
      ContentType: response.headers.get("content-type") || undefined,
      CacheControl: IMMUTABLE_MEDIA_CACHE_CONTROL,
    }));

    updatedMapping[sourceUrl] = targetPublicUrl;
    uploadedCount += 1;
  }

  // Upload local assets (logos + hero assets)
  for (let index = 0; index < localAssets.length; index += 1) {
    currentIndex += 1;
    const item = localAssets[index];
    const targetPublicUrl = publicUrlFor(config.publicUrl, item.key);

    const exists = await objectExists(client, config.bucket, item.key);
    if (exists) {
      skippedCount += 1;
      updatedMapping[item.localPath] = targetPublicUrl;
      console.log(`[${currentIndex}/${totalFiles}] Уже есть в R2: ${item.key}`);
      continue;
    }

    console.log(`[${currentIndex}/${totalFiles}] Загружаем локальный файл в R2: ${item.key}`);
    try {
      const buffer = await readFile(item.localPath);
      await client.send(new PutObjectCommand({
        Bucket: config.bucket,
        Key: item.key,
        Body: buffer,
        ContentLength: buffer.length,
        ContentType: getContentType(item.localPath),
        CacheControl: IMMUTABLE_MEDIA_CACHE_CONTROL,
      }));

      updatedMapping[item.localPath] = targetPublicUrl;
      uploadedCount += 1;
    } catch (err) {
      console.warn(`Не удалось загрузить локальный файл ${item.localPath}:`, err);
    }
  }

  await writeFile(mappingFilePath, JSON.stringify(updatedMapping, null, 2), "utf8");
  console.log(`\nУспешно! Загружено новых: ${uploadedCount}, пропущено (уже в R2): ${skippedCount}.`);
  console.log(`Маппинг сохранён в ${mappingFilePath}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
