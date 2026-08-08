export type CmsPageStatus = "draft" | "published";

export type CmsPage = {
  id: string;
  slug: string;
  route_path: string;
  title: string;
  seo_title: string;
  seo_description: string;
  status: CmsPageStatus;
  page_kind: string;
  is_system: boolean;
  created_at: string;
  updated_at: string;
  published_at: string | null;
};

export type CmsFieldOption = {
  label: string;
  value: string;
};

export type CmsField = {
  name: string;
  label: string;
  type: "text" | "textarea" | "url" | "select" | "media";
  required?: boolean;
  accept?: string;
  mediaTypeField?: string;
  options?: CmsFieldOption[];
};

export type CmsBlockTemplate = {
  id: string;
  type: string;
  name: string;
  description: string;
  fields: CmsField[];
  default_content: Record<string, unknown>;
  is_active: boolean;
  page_kinds: string[];
};

export type CmsPageBlock = {
  id: string;
  page_id: string;
  block_id: string;
  sort_order: number;
  content: Record<string, unknown>;
  is_visible: boolean;
};

export type CmsEditorBlock = CmsPageBlock & {
  template: CmsBlockTemplate;
};

export type CmsPageRevision = {
  id: string;
  page_id: string;
  title: string;
  slug: string;
  status: CmsPageStatus;
  seo_title: string;
  seo_description: string;
  blocks: Array<{
    id: string;
    blockId: string;
    content: Record<string, unknown>;
    isVisible: boolean;
  }>;
  created_at: string;
};

export type CmsTrashPage = CmsPage & {
  deleted_at: string;
};

