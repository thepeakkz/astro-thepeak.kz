import { forwardRef, type ImgHTMLAttributes } from "react";

type StaticImageLike = { height?: number; src: string; width?: number };
type ImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  fill?: boolean;
  priority?: boolean;
  quality?: number;
  src: string | StaticImageLike;
};

const AppImage = forwardRef<HTMLImageElement, ImageProps>(function AppImage(
  { fill, height, priority, quality: _quality, src, style, width, ...props },
  ref,
) {
  const source = typeof src === "string" ? src : src.src;
  const intrinsicHeight = height ?? (typeof src === "string" ? undefined : src.height);
  const intrinsicWidth = width ?? (typeof src === "string" ? undefined : src.width);

  return (
    <img
      {...props}
      ref={ref}
      src={source}
      width={fill ? undefined : intrinsicWidth}
      height={fill ? undefined : intrinsicHeight}
      loading={priority ? "eager" : props.loading || "lazy"}
      fetchPriority={priority ? "high" : props.fetchPriority}
      style={fill ? { ...style, height: "100%", inset: 0, position: "absolute", width: "100%" } : style}
    />
  );
});

export default AppImage;
