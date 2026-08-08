import cloudinaryMappingData from "@/data/cloudinary-r2-mapping.json";

const mapping = cloudinaryMappingData as Record<string, string>;

// Build reverse mapping: R2 URL -> Cloudinary URL
const reverseMapping: Record<string, string> = {};
for (const [cloudinaryUrl, r2Url] of Object.entries(mapping)) {
  if (cloudinaryUrl && r2Url) {
    reverseMapping[r2Url] = cloudinaryUrl;
  }
}

export type MediaUrlPair = {
  primarySrc: string;
  fallbackSrc?: string;
};

/**
 * Returns primary R2 URL and fallback Cloudinary URL if available.
 */
export function getMediaUrlPair(url: string): MediaUrlPair {
  if (!url) return { primarySrc: "" };

  // If input is Cloudinary URL, map to R2 as primary, Cloudinary as fallback
  if (mapping[url]) {
    return {
      primarySrc: mapping[url],
      fallbackSrc: url,
    };
  }

  // If input is R2 URL, check if we have a reverse mapped Cloudinary fallback
  if (reverseMapping[url]) {
    return {
      primarySrc: url,
      fallbackSrc: reverseMapping[url],
    };
  }

  // If url is already an R2 URL or external URL without explicit fallback
  return { primarySrc: url };
}

/**
 * Looks up fallback Cloudinary URL for a given R2 URL or Cloudinary URL.
 */
export function getFallbackMediaUrl(url: string): string | undefined {
  if (!url) return undefined;
  if (reverseMapping[url]) return reverseMapping[url];
  if (url.includes("res.cloudinary.com")) return url;
  return undefined;
}
