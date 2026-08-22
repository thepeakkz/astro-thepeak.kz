import Navigation from "@/components/Navigation";
import CmsBlockRenderer from "@/components/cms/CmsBlockRenderer";
import type { CmsEditorBlock } from "@/types/cms";

export default function CmsPageIsland({ blocks }: { blocks: CmsEditorBlock[] }) {
  return (
    <>
      <Navigation />
      <CmsBlockRenderer blocks={blocks} />
    </>
  );
}
