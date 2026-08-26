import { type ComponentType, useEffect, useRef, useState } from "react";

type LoadedComponent<Props> = ComponentType<Props> | { default: ComponentType<Props> };
type Loader<Props> = () => Promise<LoadedComponent<Props>>;

export default function dynamic<Props extends object>(
  loader: Loader<Props>,
  options: { loading?: ComponentType; ssr?: boolean } = {},
) {
  return function DynamicComponent(props: Props) {
    const [Component, setComponent] = useState<ComponentType<Props> | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      let mounted = true;
      const load = () => {
        void loader().then((loaded) => {
          if (!mounted) return;
          setComponent(() => ("default" in loaded ? loaded.default : loaded));
        });
      };

      if (typeof IntersectionObserver === "undefined" || !containerRef.current) {
        if (typeof requestIdleCallback !== "undefined") {
          const id = requestIdleCallback(load, { timeout: 2500 });
          return () => {
            mounted = false;
            cancelIdleCallback(id);
          };
        }
        const timer = setTimeout(load, 100);
        return () => {
          mounted = false;
          clearTimeout(timer);
        };
      }

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            observer.disconnect();
            load();
          }
        },
        { rootMargin: "600px" },
      );

      observer.observe(containerRef.current);

      return () => {
        mounted = false;
        observer.disconnect();
      };
    }, []);

    if (!Component) {
      const Loading = options.loading;
      return (
        <div ref={containerRef} style={{ minHeight: "1px", display: "contents" }}>
          {Loading ? <Loading /> : null}
        </div>
      );
    }
    return <Component {...props} />;
  } as ComponentType<Props> & { preload?: () => Promise<LoadedComponent<Props>> };
}
