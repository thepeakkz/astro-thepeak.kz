/**
 * Optimizes a Cloudinary video URL by applying f_auto (format optimization)
 * and q_auto (quality compression) instead of q_auto:best or uncompressed delivery.
 *
 * Example:
 * Input:  https://res.cloudinary.com/dxvynbrut/video/upload/q_auto:best/v1782373350/cases/ark/Video_by_ark_detailing_alm_DVtneESjPJc_byrbrb.mp4
 * Output: https://res.cloudinary.com/dxvynbrut/video/upload/f_auto,q_auto/v1782373350/cases/ark/Video_by_ark_detailing_alm_DVtneESjPJc_byrbrb.mp4
 */
export function optimizeCloudinaryVideoUrl(url: string): string {
  if (!url || typeof url !== "string") {
    return url;
  }

  if (!url.includes("res.cloudinary.com") || !url.includes("/video/upload/")) {
    return url;
  }

  const parts = url.split("/video/upload/");
  if (parts.length !== 2) {
    return url;
  }

  const prefix = parts[0];
  const rest = parts[1];

  // Find the version tag (e.g., v1782373350/) which marks the start of the public ID path
  const versionMatch = rest.match(/v\d+\//);
  if (versionMatch) {
    const versionIndex = rest.indexOf(versionMatch[0]);
    const pathAndVersion = rest.slice(versionIndex);
    return `${prefix}/video/upload/f_auto,q_auto/${pathAndVersion}`;
  }

  // Fallback: If no version tag is found, strip known transformation segments
  let cleanRest = rest;
  const knownTransformations = ["q_auto:best/", "q_auto/"];
  for (const trans of knownTransformations) {
    if (cleanRest.startsWith(trans)) {
      cleanRest = cleanRest.slice(trans.length);
      break;
    }
  }

  return `${prefix}/video/upload/f_auto,q_auto/${cleanRest}`;
}
