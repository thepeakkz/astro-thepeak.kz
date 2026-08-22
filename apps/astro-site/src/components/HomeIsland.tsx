import HomeClient from "@/app/home-client";
import Navigation from "@/components/Navigation";
import CmsBlockRenderer from "@/components/cms/CmsBlockRenderer";
import type { CaseItem } from "@/data/cases";
import type { CmsEditorBlock } from "@/types/cms";

interface Props {
  allCases: CaseItem[];
  blocks?: CmsEditorBlock[];
}

export default function HomeIsland({ allCases, blocks }: Props) {
  if (!blocks) return <HomeClient />;
  return (
    <>
      <Navigation />
      <CmsBlockRenderer blocks={blocks} caseItems={allCases} />
    </>
  );
}
