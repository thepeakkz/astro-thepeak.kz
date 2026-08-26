import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { readFile } from "node:fs/promises";
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

  const s3 = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });

  const bucketObjects = [];
  let continuationToken = undefined;

  do {
    const res = await s3.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        ContinuationToken: continuationToken,
      })
    );
    for (const item of res.Contents || []) {
      if (item.Key) bucketObjects.push(item.Key);
    }
    continuationToken = res.NextContinuationToken;
  } while (continuationToken);

  console.log(`Total R2 objects: ${bucketObjects.length}`);
  
  const prefixes = {};
  for (const key of bucketObjects) {
    const prefix = key.split("/")[0];
    prefixes[prefix] = (prefixes[prefix] || 0) + 1;
  }
  console.log("Bucket objects by folder/prefix:", prefixes);

  // Check logos:
  const logos = bucketObjects.filter(k => k.startsWith("logos/"));
  console.log(`Logos count: ${logos.length} (e.g. ${logos.slice(0, 5).join(", ")})`);

  // Check hero:
  const hero = bucketObjects.filter(k => k.startsWith("hero/"));
  console.log(`Hero count: ${hero.length} (e.g. ${hero.slice(0, 5).join(", ")})`);

  // Check cases:
  const cases = bucketObjects.filter(k => k.startsWith("cases/"));
  console.log(`Cases count: ${cases.length} (e.g. ${cases.slice(0, 5).join(", ")})`);
}

main().catch(console.error);
