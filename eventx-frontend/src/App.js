import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.js";

// Admin Pages
import AdminDashboard from "./pages/Admin/AdminDashboard";
import EventList from "./pages/Admin/EventList";
import EventForm from "./pages/Admin/EventForm";
import TicketManagement from "./pages/Admin/TicketManagement";
import Analytics from "./pages/Admin/Analytics";

// User Pages
import Home from "./pages/User/Home";
import EventDetails from "./pages/User/EventDetails";
import BookTicket from "./pages/User/BookTicket";
import MyTickets from "./pages/User/MyTickets";

// Auth Pages
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";

// Shared Components
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/events"
            element={
              <ProtectedRoute role="admin">
                <EventList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/events/new"
            element={
              <ProtectedRoute role="admin">
                <EventForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tickets"
            element={
              <ProtectedRoute role="admin">
                <TicketManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute role="admin">
                <Analytics />
              </ProtectedRoute>
            }
          />

          {/* User */}
          <Route path="/" element={<Home />} />
          <Route path="/event/:id" element={<EventDetails />} />
          <Route
            path="/book/:id"
            element={
              <ProtectedRoute role="user">
                <BookTicket />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-tickets"
            element={
              <ProtectedRoute role="user">
                <MyTickets />
              </ProtectedRoute>
            }
          />

          {/* Fallback for unknown routes */}
          <Route path="*" element={<h2>404 - Page Not Found</h2>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
