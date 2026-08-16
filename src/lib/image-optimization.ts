import sharp from "sharp";

export const IMMUTABLE_MEDIA_CACHE_CONTROL = "public, max-age=31536000, immutable";

export type OptimizedImage = {
  buffer: Buffer;
  contentType: string;
  extension: string;
  optimizedBy: "tinify" | "sharp" | "original";
};

const TINIFY_SUPPORTED_TYPES = new Set([
  "image/avif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function requestBody(buffer: Buffer) {
  return Uint8Array.from(buffer).buffer;
}

async function convertLocallyToWebp(buffer: Buffer): Promise<OptimizedImage> {
  const output = await sharp(buffer, { animated: true })
    .rotate()
    .webp({ effort: 4, quality: 82 })
    .toBuffer();

  return {
    buffer: output,
    contentType: "image/webp",
    extension: "webp",
    optimizedBy: "sharp",
  };
}

export async function optimizeImageBuffer(
  buffer: Buffer,
  contentType: string,
): Promise<OptimizedImage> {
  const apiKey = process.env.TINIFY_API_KEY;

  if (apiKey && TINIFY_SUPPORTED_TYPES.has(contentType)) {
    try {
      const authorization = `Basic ${Buffer.from(`api:${apiKey}`).toString("base64")}`;
      const shrinkResponse = await fetch("https://api.tinify.com/shrink", {
        method: "POST",
        headers: {
          Authorization: authorization,
          "Content-Type": contentType,
        },
        body: requestBody(buffer),
      });
      const outputUrl = shrinkResponse.headers.get("location");

      if (!shrinkResponse.ok || !outputUrl) {
        throw new Error(`Tinify shrink failed with status ${shrinkResponse.status}`);
      }

      const outputResponse = contentType === "image/webp"
        ? await fetch(outputUrl, { headers: { Authorization: authorization } })
        : await fetch(outputUrl, {
            method: "POST",
            headers: {
              Authorization: authorization,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ convert: { type: "image/webp" } }),
          });

      if (!outputResponse.ok) {
        throw new Error(`Tinify output failed with status ${outputResponse.status}`);
      }

      return {
        buffer: Buffer.from(await outputResponse.arrayBuffer()),
        contentType: "image/webp",
        extension: "webp",
        optimizedBy: "tinify",
      };
    } catch (error) {
      console.warn("Tinify optimization failed; using the local WebP fallback.", error);
    }
  }

  try {
    return await convertLocallyToWebp(buffer);
  } catch (error) {
    console.warn("Local WebP conversion failed; preserving the original upload.", error);
    return {
      buffer,
      contentType,
      extension: contentType.split("/")[1] || "bin",
      optimizedBy: "original",
    };
  }
}
