import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import InfiniteGallery from "@/components/ui/3d-gallery-photography";
import NativePageGate from "@/components/cms/NativePageGate";
import { absoluteUrl, createSeoMetadata, getBreadcrumbJsonLd, pageSeo } from "@/lib/seo";

export const metadata: Metadata = createSeoMetadata(pageSeo.gallery);

export default function GalleryPage() {
  return (
    <NativePageGate routePath="/gallery">
      <GalleryContent />
    </NativePageGate>
  );
}

export function GalleryContent() {
  const sampleImages = [
    {
      src: "https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=1200",
      alt: "Mountain landscape",
    },
    {
      src: "https://images.pexels.com/photos/1287145/pexels-photo-1287145.jpeg?auto=compress&cs=tinysrgb&w=1200",
      alt: "Ocean waves",
    },
    {
      src: "https://images.pexels.com/photos/1323550/pexels-photo-1323550.jpeg?auto=compress&cs=tinysrgb&w=1200",
      alt: "Forest path",
    },
    {
      src: "https://images.pexels.com/photos/1591373/pexels-photo-1591373.jpeg?auto=compress&cs=tinysrgb&w=1200",
      alt: "Desert dunes",
    },
    {
      src: "https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=1200",
      alt: "City skyline",
    },
    {
      src: "https://images.pexels.com/photos/1761279/pexels-photo-1761279.jpeg?auto=compress&cs=tinysrgb&w=1200",
      alt: "Northern lights",
    },
    {
      src: "https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg?auto=compress&cs=tinysrgb&w=1200",
      alt: "Waterfall",
    },
    {
      src: "https://images.pexels.com/photos/1770809/pexels-photo-1770809.jpeg?auto=compress&cs=tinysrgb&w=1200",
      alt: "Sunset beach",
    },
  ]

  return (
    <div className="col-span-12 w-[calc(100%+2*var(--page-margin))] -ml-[var(--page-margin)] min-h-screen relative bg-black">
      <JsonLd
        data={[
          getBreadcrumbJsonLd([
            { name: "Главная", path: "/" },
            { name: "Галерея", path: "/gallery" },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "ImageGallery",
            "@id": absoluteUrl("/gallery#gallery"),
            name: "Галерея ThePeak",
            description: pageSeo.gallery.description,
            url: absoluteUrl("/gallery"),
            inLanguage: "ru-KZ",
            creator: {
              "@id": absoluteUrl("/#organization"),
            },
          },
        ]}
      />
      <InfiniteGallery
        images={sampleImages}
        speed={1.2}
        zSpacing={3}
        visibleCount={12}
        falloff={{ near: 0.8, far: 14 }}
        className="h-screen w-full rounded-lg overflow-hidden"
      />
      <div className="h-screen inset-0 pointer-events-none fixed flex items-center justify-center text-center px-3 mix-blend-exclusion text-white">
        <h1 className="font-serif text-3xl md:text-6xl tracking-tight">
          <span className="italic">I create;</span> therefore I am
        </h1>
      </div>

      <div className="text-center fixed bottom-10 left-0 right-0 font-mono uppercase text-[11px] font-semibold text-white pointer-events-none">
        <p>Use mouse wheel, arrow keys, or touch to navigate</p>
        <p className=" opacity-60">Auto-play resumes after 3 seconds of inactivity</p>
      </div>
    </div>
  )
}
