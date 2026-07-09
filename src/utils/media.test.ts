import { describe, expect, it } from "vitest";
import { optimizeCloudinaryVideoUrl } from "./media";

describe("optimizeCloudinaryVideoUrl", () => {
  it("rewrites standard Cloudinary upload URLs to use f_auto,q_auto", () => {
    const input = "https://res.cloudinary.com/dxvynbrut/video/upload/v1782373350/cases/ark/Video.mp4";
    const expected = "https://res.cloudinary.com/dxvynbrut/video/upload/f_auto,q_auto/v1782373350/cases/ark/Video.mp4";
    expect(optimizeCloudinaryVideoUrl(input)).toBe(expected);
  });

  it("rewrites Cloudinary upload URLs with q_auto:best to use f_auto,q_auto", () => {
    const input = "https://res.cloudinary.com/dxvynbrut/video/upload/q_auto:best/v1782373350/cases/ark/Video.mp4";
    const expected = "https://res.cloudinary.com/dxvynbrut/video/upload/f_auto,q_auto/v1782373350/cases/ark/Video.mp4";
    expect(optimizeCloudinaryVideoUrl(input)).toBe(expected);
  });

  it("rewrites Cloudinary upload URLs with simple q_auto to use f_auto,q_auto", () => {
    const input = "https://res.cloudinary.com/dxvynbrut/video/upload/q_auto/v1782373350/cases/ark/Video.mp4";
    const expected = "https://res.cloudinary.com/dxvynbrut/video/upload/f_auto,q_auto/v1782373350/cases/ark/Video.mp4";
    expect(optimizeCloudinaryVideoUrl(input)).toBe(expected);
  });

  it("handles empty or invalid inputs gracefully", () => {
    expect(optimizeCloudinaryVideoUrl("")).toBe("");
    expect(optimizeCloudinaryVideoUrl("/cases/local-video.mp4")).toBe("/cases/local-video.mp4");
  });
});
