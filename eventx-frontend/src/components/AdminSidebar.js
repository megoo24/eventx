import { Link, useLocation } from "react-router-dom";

export default function AdminSidebar() {
  const location = useLocation();
  const isActive = (path) => location.pathname.startsWith(path);

  const NavItem = ({ to, label }) => (
    <Link
      to={to}
      className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        isActive(to)
          ? "bg-[var(--brand-50)] text-[var(--brand-700)]"
          : "text-[var(--text-700)] hover:text-[var(--brand-700)]"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <aside className="hidden md:flex md:flex-col md:w-64 p-4">
      <div className="card p-4">
        <h2 className="font-semibold text-lg mb-4" style={{ color: "var(--text-900)" }}>
          Admin Navigation
        </h2>
        <nav className="flex flex-col space-y-1">
          <NavItem to="/admin/dashboard" label="Dashboard" />
          <NavItem to="/admin/events" label="Events List" />
          <NavItem to="/admin/events/new" label="Add Event" />
          <NavItem to="/admin/tickets" label="Ticket Management" />
          <NavItem to="/admin/analytics" label="Analytics" />
        </nav>
      </div>
    </aside>
  );
}
