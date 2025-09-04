import { Link } from "react-router-dom";

export default function AuthLayout({ title, subtitle, children, accent = "blue" }) {
  const accentClasses = accent === "green" ? {
    ring: "focus:ring-green-500",
    bg: "bg-green-600 hover:bg-green-700",
    text: "text-green-600",
    dot: "bg-green-600"
  } : {
    ring: "focus:ring-blue-500",
    bg: "bg-blue-600 hover:bg-blue-700",
    text: "text-blue-600",
    dot: "bg-blue-600"
  };

  return (
    <div className="min-h-screen flex">      
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 brand-gradient opacity-90" />
        <div className="absolute inset-0" style={{ background: "radial-gradient(1200px 600px at -100px -100px, rgba(255,255,255,0.2), rgba(255,255,255,0))" }} />
        <div className="relative z-10 w-full p-12 flex flex-col justify-between text-white">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/20" />
              <h1 className="text-2xl font-bold">EventX Studio</h1>
            </div>
            <p className="mt-6 text-white/90 max-w-md">
              Manage events, tickets, and analytics with a modern, elegant interface.
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className={`w-2 h-2 rounded-full ${accentClasses.dot}`} />
              <span className="text-white/90">Secure authentication</span>
            </div>
            <div className="flex items-center gap-3">
              <span className={`w-2 h-2 rounded-full ${accentClasses.dot}`} />
              <span className="text-white/90">Fast onboarding</span>
            </div>
            <div className="flex items-center gap-3">
              <span className={`w-2 h-2 rounded-full ${accentClasses.dot}`} />
              <span className="text-white/90">Admin and user roles</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="card p-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold" style={{ color: "var(--text-900)" }}>{title}</h2>
              {subtitle && (
                <p className="mt-2 text-sm" style={{ color: "var(--text-700)" }}>{subtitle}</p>
              )}
            </div>
            <div className="mt-6">
              {children}
            </div>
          </div>
          <div className="mt-6 text-center text-sm" style={{ color: "var(--text-700)" }}>
            <Link to="/" className="hover:underline">Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}


