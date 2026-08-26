import { S3Client, ListObjectsV2Command, HeadObjectCommand } from "@aws-sdk/client-s3";
import { readFile, writeFile } from "node:fs/promises";
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

async function main() {
  await loadLocalEnv();

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET_NAME;
  const publicUrl = process.env.R2_PUBLIC_URL?.replace(/\/$/, "");

  console.log("Checking R2 configuration:");
  console.log(`Bucket: ${bucket}`);
  console.log(`Public URL: ${publicUrl}`);

  const s3 = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });

  // 1. List all objects in bucket
  console.log("\nFetching all objects currently in R2 bucket...");
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

  console.log(`Total objects in R2 bucket: ${bucketObjects.size}`);

  // 2. Read cloudinary-r2-mapping.json
  const mappingPath = path.join(projectRoot, "src", "data", "cloudinary-r2-mapping.json");
  const mappingRaw = await readFile(mappingPath, "utf8");
  const mapping = JSON.parse(mappingRaw);

  let updatedMappingCount = 0;
  const newMapping = {};

  const missingInBucket = [];
  const foundInBucket = [];

  for (const [key, value] of Object.entries(mapping)) {
    let newUrl = value;
    if (value.includes("media.thepeak.kz")) {
      newUrl = value.replace("https://media.thepeak.kz", publicUrl);
      updatedMappingCount++;
    }
    newMapping[key] = newUrl;

    // Determine the R2 object key
    try {
      const urlObj = new URL(newUrl);
      const objKey = decodeURIComponent(urlObj.pathname.replace(/^\//, ""));
      if (bucketObjects.has(objKey)) {
        foundInBucket.push(objKey);
      } else {
        missingInBucket.push({ key, newUrl, objKey });
      }
    } catch (err) {
      console.error(`Invalid URL: ${newUrl}`, err);
    }
  }

  console.log(`\nMapping check:`);
  console.log(`- Total mapped entries: ${Object.keys(mapping).length}`);
  console.log(`- Updated media.thepeak.kz -> ${publicUrl}: ${updatedMappingCount}`);
  console.log(`- Objects confirmed in R2: ${foundInBucket.length}`);
  console.log(`- Objects missing in R2: ${missingInBucket.length}`);

  if (missingInBucket.length > 0) {
    console.log("\nMissing objects sample (first 10):", missingInBucket.slice(0, 10));
  }

  // Also check if public URL works via fetch
  console.log("\nTesting HTTP access via R2 public URL...");
  const sampleKey = foundInBucket[0];
  if (sampleKey) {
    const testUrl = `${publicUrl}/${encodeURI(sampleKey)}`;
    try {
      const resp = await fetch(testUrl, { method: "HEAD" });
      console.log(`HEAD ${testUrl} -> Status: ${resp.status} ${resp.statusText}`);
      console.log(`Content-Type: ${resp.headers.get("content-type")}`);
      console.log(`Content-Length: ${resp.headers.get("content-length")}`);
    } catch (e) {
      console.error(`Failed to fetch test URL ${testUrl}:`, e);
    }
  }
}

main().catch(console.error);
