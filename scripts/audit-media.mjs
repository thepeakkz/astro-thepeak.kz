import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const projectRoot = process.cwd();

async function loadLocalEnv() {
  try {
    const contents = await readFile(path.join(projectRoot, ".env.local"), "utf8");
    for (const line of contents.split(/\r?\n/)) {
      const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
      if (!match || process.env[match[1]] !== undefined) continue;
      const value = match[2].trim().replace(/^(["'])(.*)\1$/, "$2");
      process.env[match[1]] = value;
    }
  } catch {}
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const res = path.resolve(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "node_modules" || entry.name === ".next" || entry.name === ".git" || entry.name === ".astro") return [];
        return walk(res);
      }
      return res;
    })
  );
  return files.flat();
}

async function main() {
  await loadLocalEnv();

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET_NAME;
  const publicUrl = process.env.R2_PUBLIC_URL?.replace(/\/$/, "");

  const s3 = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });

  console.log("=== Comprehensive Media & R2 Audit ===");

  // 1. Fetch all objects in R2
  const bucketObjects = new Set();
  let continuationToken = undefined;

  do {
    const res = await s3.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        ContinuationToken: continuationToken,
      })
    );
    for (const item of res.Contents || []) {
      if (item.Key) bucketObjects.add(item.Key);
    }
    continuationToken = res.NextContinuationToken;
  } while (continuationToken);

  console.log(`\n1. R2 Bucket Object Count: ${bucketObjects.size} files`);

  // 2. Scan all codebase files in src/ and apps/astro-site/src/
  const srcFiles = await walk(path.join(projectRoot, "src"));
  let astroSrcFiles = [];
  try {
    astroSrcFiles = await walk(path.join(projectRoot, "apps", "astro-site", "src"));
  } catch {}

  const allFiles = [...srcFiles, ...astroSrcFiles].filter(f => /\.(ts|tsx|astro|json|md)$/.test(f));
  console.log(`2. Scanned code files: ${allFiles.length} files`);

  const mediaReferences = new Set();
  const mediaThePeakReferences = [];

  for (const filePath of allFiles) {
    const content = await readFile(filePath, "utf8");
    if (content.includes("media.thepeak.kz")) {
      mediaThePeakReferences.push(filePath);
    }

    // Extract URLs
    const urls = content.match(/https?:\/\/[^\s"'\`\)\]]+/g) || [];
    for (const url of urls) {
      if (
        url.includes("r2.dev") ||
        url.includes("res.cloudinary.com") ||
        url.includes("media.thepeak.kz") ||
        url.endsWith(".webp") ||
        url.endsWith(".png") ||
        url.endsWith(".jpg") ||
        url.endsWith(".jpeg") ||
        url.endsWith(".mp4") ||
        url.endsWith(".webm")
      ) {
        mediaReferences.add({ url, file: path.relative(projectRoot, filePath) });
      }
    }
  }

  console.log(`\n3. Found ${mediaThePeakReferences.length} files referencing media.thepeak.kz:`);
  for (const f of mediaThePeakReferences) {
    console.log(`   - ${path.relative(projectRoot, f)}`);
  }

  console.log(`\n4. Sample of R2 objects in bucket:`);
  let count = 0;
  for (const key of bucketObjects) {
    if (count++ < 10) console.log(`   - ${key}`);
  }
}

main().catch(console.error);
