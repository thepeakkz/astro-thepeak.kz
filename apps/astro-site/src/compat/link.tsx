import { forwardRef, type AnchorHTMLAttributes, type ReactNode } from "react";

type UrlLike = string | { hash?: string; pathname?: string; query?: Record<string, string | number | boolean> };

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  children?: ReactNode;
  href: UrlLike;
  prefetch?: boolean | null;
  replace?: boolean;
  scroll?: boolean;
};

function toHref(value: UrlLike) {
  if (typeof value === "string") return value;
  const pathname = value.pathname || "";
  const query = value.query ? `?${new URLSearchParams(Object.entries(value.query).map(([key, item]) => [key, String(item)])).toString()}` : "";
  return `${pathname}${query}${value.hash || ""}` || "/";
}

const AppLink = forwardRef<HTMLAnchorElement, LinkProps>(function AppLink(
  { href, prefetch: _prefetch, replace, scroll: _scroll, onClick, ...props },
  ref,
) {
  return (
    <a
      {...props}
      ref={ref}
      href={toHref(href)}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented && replace && typeof window !== "undefined") {
          event.preventDefault();
          window.location.replace(event.currentTarget.href);
        }
      }}
    />
  );
});

export default AppLink;
