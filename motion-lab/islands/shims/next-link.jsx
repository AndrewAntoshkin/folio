export default function Link({ href, children, className, onClick, ...rest }) {
  return (
    <a
      href={href || "#"}
      className={className}
      onClick={(event) => {
        event.preventDefault();
        onClick?.(event);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
