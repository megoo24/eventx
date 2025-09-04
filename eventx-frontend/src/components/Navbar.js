import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.js";
import LoadingSpinner from "./LoadingSpinner.js";

export default function Navbar() {
  const { user, logout, loading, isInitialized } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const Brand = () => (
    <Link to="/" className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-md brand-gradient" />
      <span className="text-xl sm:text-2xl font-bold" style={{ color: "var(--brand-700)" }}>
        EventX Studio
      </span>
    </Link>
  );

  const GuestActions = () => (
    <div className="flex items-center space-x-2">
      <Link to="/login" className="nav-link">Sign In</Link>
      <Link to="/register" className="btn-primary">Sign Up</Link>
    </div>
  );

  const AdminLinks = () => (
    <div className="hidden md:flex items-center space-x-1">
      <Link to="/admin/dashboard" className="nav-link">Dashboard</Link>
      <Link to="/admin/events" className="nav-link">My Events</Link>
      <Link to="/admin/events/new" className="nav-link">Create Event</Link>
      <Link to="/admin/analytics" className="nav-link">Analytics</Link>
    </div>
  );

  const UserLinks = () => (
    <div className="hidden md:flex items-center space-x-1">
      <Link to="/" className="nav-link">Events</Link>
      <Link to="/my-tickets" className="nav-link">My Tickets</Link>
    </div>
  );

  // Loading/initializing state
  if (!isInitialized) {
    return (
      <header>
        <div className="brand-gradient h-1 w-full" />
        <nav className="bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Brand />
              </div>
              <div className="flex items-center">
                <LoadingSpinner size="sm" text="" />
              </div>
            </div>
          </div>
        </nav>
      </header>
    );
  }

  return (
    <header>
      <div className="brand-gradient h-1 w-full" />
      <nav className="bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Brand />
            </div>

            <div className="flex items-center space-x-3">
              {user ? (
                <>
                  {user.role === "admin" ? <AdminLinks /> : <UserLinks />}

                  <div className="hidden sm:block">
                    <span className="text-sm font-medium" style={{ color: "var(--text-700)" }}>
                      Welcome, {user.name}
                    </span>
                  </div>

                  <button
                    onClick={handleLogout}
                    disabled={loading}
                    className="btn-primary"
                  >
                    {loading ? "Logging out..." : "Logout"}
                  </button>
                </>
              ) : (
                <GuestActions />
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
