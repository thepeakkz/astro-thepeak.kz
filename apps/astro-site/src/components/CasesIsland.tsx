import CasesClient from "@/app/cases/cases-client";
import type { CaseItem } from "@/data/cases";
import type { CmsEditorBlock } from "@/types/cms";

export default function CasesIsland({ blocks, cases }: { blocks?: CmsEditorBlock[]; cases: CaseItem[] }) {
  return <CasesClient blocks={blocks} cases={cases} />;
}
