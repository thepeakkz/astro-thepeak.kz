"use client";

import ReactDOM from "react-dom";

export default function HeroVideoPreload() {
  ReactDOM.preload("/hero-mobile-poster-v2.webp", {
    as: "image",
    media: "(max-width: 767px)",
    fetchPriority: "high",
  });

  ReactDOM.preload("/hero-desktop-poster-v2.webp", {
    as: "image",
    media: "(min-width: 768px)",
    fetchPriority: "high",
  });

  return null;
}
