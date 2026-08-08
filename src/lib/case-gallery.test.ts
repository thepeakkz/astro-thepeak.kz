import { describe, expect, it } from "vitest";
import { parseCaseGallery, serializeCaseGallery } from "./case-gallery";

describe("case gallery content", () => {
  it("distinguishes an automatic gallery from an explicitly empty gallery", () => {
    expect(parseCaseGallery("")).toBeUndefined();
    expect(parseCaseGallery("[]")).toEqual([]);
  });

  it("keeps safe media and removes duplicate or unsafe URLs", () => {
    expect(parseCaseGallery(JSON.stringify([
      { src: "https://media.example/one.mp4", type: "video", name: "One" },
      { src: "https://media.example/one.mp4", type: "video" },
      { src: "javascript:alert(1)", type: "image" },
      { src: "/cases/demo/two.webp", type: "image", width: 1080, height: 1350 },
    ]))).toEqual([
      { src: "https://media.example/one.mp4", type: "video", name: "One" },
      { src: "/cases/demo/two.webp", type: "image", width: 1080, height: 1350 },
    ]);
  });

  it("serializes gallery order", () => {
    const value = serializeCaseGallery([
      { src: "/second.webp", type: "image" },
      { src: "/first.mp4", type: "video" },
    ]);
    expect(parseCaseGallery(value)?.map((item) => item.src)).toEqual(["/second.webp", "/first.mp4"]);
  });
});
