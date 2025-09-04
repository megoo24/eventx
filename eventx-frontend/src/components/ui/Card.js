export function Card({ children, className = "" }) {
  return <div className={`card ${className}`}>{children}</div>;
}

export function CardHeader({ title, subtitle }) {
  return (
    <div className="px-6 py-4 border-b" style={{ borderColor: "var(--bg-100)" }}>
      {title && <h3 className="text-lg font-medium" style={{ color: "var(--text-900)" }}>{title}</h3>}
      {subtitle && <p className="text-sm mt-1" style={{ color: "var(--text-700)" }}>{subtitle}</p>}
    </div>
  );
}

export function CardContent({ children, className = "p-6" }) {
  return <div className={className}>{children}</div>;
}



