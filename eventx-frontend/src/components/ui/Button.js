export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) {
  const base = "inline-flex items-center justify-center font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-3 text-base"
  };
  const variants = {
    primary: "text-white bg-blue-600 hover:bg-blue-700",
    secondary: "text-[var(--text-900)] bg-[var(--bg-0)] hover:bg-[var(--bg-100)] border border-[var(--bg-100)]",
    danger: "text-white bg-red-600 hover:bg-red-700",
    ghost: "text-[var(--text-700)] hover:bg-[var(--bg-100)]"
  };
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}



