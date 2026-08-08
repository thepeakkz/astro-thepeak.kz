import { getPublishedPageByPath } from "@/lib/cms/data";

export default async function NativePageGate({
  routePath,
  children,
}: {
  routePath: string;
  children: React.ReactNode;
}) {
  const cmsPage = await getPublishedPageByPath(routePath);
  if (!cmsPage) return children;

  const visible = cmsPage.blocks.some((block) => block.template.type === "native_page");
  return visible ? children : null;
}
