export default function Image({
  src,
  alt = "",
  fill,
  width,
  height,
  className,
  style,
  sizes,
  priority,
  quality,
  placeholder,
  blurDataURL,
  ...rest
}) {
  const resolved = typeof src === "string" ? src : src?.src || "";
  const filled = fill
    ? {
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        ...style,
      }
    : style;
  return (
    <img
      src={resolved}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      className={className}
      style={filled}
      {...rest}
    />
  );
}
