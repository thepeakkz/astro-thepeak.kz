import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";

const projectRoot = process.cwd();
const execute = process.argv.includes("--execute");
const sourceRoots = [path.join(projectRoot, "src")];
const mediaUrlPattern = /https:\/\/res\.cloudinary\.com\/[A-Za-z0-9_-]+\/(?:image|video|raw)\/upload\/[A-Za-z0-9%_.,:+/@~-]+/g;

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
    // Environment variables may already be supplied by the deployment shell.
  }
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) return walk(absolutePath);
    return /\.(?:ts|tsx|js|jsx|json|md)$/.test(entry.name) ? [absolutePath] : [];
  }));
  return files.flat();
}

function getConfig() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET_NAME;
  const publicUrl = process.env.R2_PUBLIC_URL?.replace(/\/$/, "");
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicUrl) {
    throw new Error("Заполните переменные CLOUDFLARE_ACCOUNT_ID и R2_* перед миграцией.");
  }
  return { accountId, accessKeyId, secretAccessKey, bucket, publicUrl };
}

function objectKeyFor(sourceUrl) {
  const url = new URL(sourceUrl);
  const segments = url.pathname.split("/").filter(Boolean);
  const cloudName = segments.shift();
  const resourceType = segments.shift();
  if (segments.shift() !== "upload") throw new Error(`Неожиданный URL: ${sourceUrl}`);

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

async function main() {
  await loadLocalEnv();
  const files = (await Promise.all(sourceRoots.map(walk))).flat();
  const fileContents = new Map();
  const sourceUrls = new Set();

  for (const file of files) {
    const contents = await readFile(file, "utf8");
    fileContents.set(file, contents);
    for (const match of contents.matchAll(mediaUrlPattern)) sourceUrls.add(match[0]);
  }

  const mappings = [...sourceUrls].map((sourceUrl) => ({ sourceUrl, key: objectKeyFor(sourceUrl) }));
  console.log(`Найдено ${mappings.length} уникальных legacy-медиафайлов.`);
  if (!execute) {
    console.log("Dry run завершён. Для загрузки и замены URL добавьте флаг -- --execute.");
    return;
  }

  const config = getConfig();
  const client = new S3Client({
    region: "auto",
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey },
  });

  for (let index = 0; index < mappings.length; index += 1) {
    const item = mappings[index];
    const response = await fetch(item.sourceUrl);
    if (!response.ok || !response.body) throw new Error(`Не удалось скачать ${item.sourceUrl}: ${response.status}`);
    const buffer = Buffer.from(await response.arrayBuffer());
    await client.send(new PutObjectCommand({
      Bucket: config.bucket,
      Key: item.key,
      Body: buffer,
      ContentLength: buffer.length,
      ContentType: response.headers.get("content-type") || undefined,
    }));
    console.log(`[${index + 1}/${mappings.length}] ${item.key}`);
  }

  for (const [file, originalContents] of fileContents) {
    let nextContents = originalContents;
    for (const item of mappings) {
      nextContents = nextContents.split(item.sourceUrl).join(publicUrlFor(config.publicUrl, item.key));
    }
    if (nextContents !== originalContents) await writeFile(file, nextContents, "utf8");
  }

  console.log("Миграция завершена: объекты загружены в R2, URL в src обновлены.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

