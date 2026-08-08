import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navigation from "@/components/Navigation";
import CmsBlockRenderer from "@/components/cms/CmsBlockRenderer";
import { getPublishedPageBySlug } from "@/lib/cms/data";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPublishedPageBySlug(slug);
  if (!data) return {};

  return {
    title: data.page.seo_title || data.page.title,
    description: data.page.seo_description || undefined,
    alternates: { canonical: `/${data.page.slug}` },
    openGraph: {
      title: data.page.seo_title || data.page.title,
      description: data.page.seo_description || undefined,
      url: `/${data.page.slug}`,
      type: "website",
    },
  };
}

export default async function CmsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getPublishedPageBySlug(slug);
  if (!data) notFound();

  return (
    <>
      <Navigation />
      <main>
        <CmsBlockRenderer blocks={data.blocks} />
      </main>
    </>
  );
}

