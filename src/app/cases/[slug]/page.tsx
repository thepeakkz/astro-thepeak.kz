import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { createCaseMetadata, createSeoMetadata, getCasePageJsonLd } from "@/lib/seo";
import { targetCases } from "@/data/target-cases";
import ManagedCasePage from "@/components/cms/ManagedCasePage";
import { getPublishedPageByPath } from "@/lib/cms/data";

type TargetCaseSlug = keyof typeof targetCases;

function isTargetCaseSlug(slug: string): slug is TargetCaseSlug {
    return slug in targetCases;
}

export function generateStaticParams() {
    return Object.keys(targetCases).map((slug) => ({ slug }));
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;

    if (isTargetCaseSlug(slug)) return createCaseMetadata(slug);

    const routePath = `/cases/${slug}`;
    const cmsPage = await getPublishedPageByPath(routePath);
    if (!cmsPage) return {};

    return createSeoMetadata({
        title: cmsPage.page.seo_title || `${cmsPage.page.title} — кейс ThePeak`,
        description: cmsPage.page.seo_description || `Кейс ThePeak: ${cmsPage.page.title}. Задача, решение и результаты проекта.`,
        path: routePath,
    });
}

export default async function TargetCasePage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    return (
        <>
            {isTargetCaseSlug(slug) ? <JsonLd data={getCasePageJsonLd(slug)} /> : null}
            <ManagedCasePage slug={slug} />
        </>
    );
}
