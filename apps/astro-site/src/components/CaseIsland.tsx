import CaseClient, { type CaseData } from "@/app/cases/[slug]/CaseClient";

export default function CaseIsland({ data, slug }: { data: CaseData; slug: string }) {
  return <CaseClient data={data} slug={slug} />;
}
