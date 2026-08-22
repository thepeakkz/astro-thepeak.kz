import { type ComponentType, useEffect, useState } from "react";

type LoadedComponent<Props> = ComponentType<Props> | { default: ComponentType<Props> };
type Loader<Props> = () => Promise<LoadedComponent<Props>>;

export default function dynamic<Props extends object>(
  loader: Loader<Props>,
  options: { loading?: ComponentType; ssr?: boolean } = {},
) {
  return function DynamicComponent(props: Props) {
    const [Component, setComponent] = useState<ComponentType<Props> | null>(null);

    useEffect(() => {
      let mounted = true;
      void loader().then((loaded) => {
        if (!mounted) return;
        setComponent(() => "default" in loaded ? loaded.default : loaded);
      });
      return () => { mounted = false; };
    }, []);

    if (!Component) {
      const Loading = options.loading;
      return Loading ? <Loading /> : null;
    }
    return <Component {...props} />;
  } as ComponentType<Props> & { preload?: () => Promise<LoadedComponent<Props>> };
}
