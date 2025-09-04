import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../api.js";
import EventCard from "../../components/EventCard.js";

export default function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priceFilter, setPriceFilter] = useState("");

  useEffect(() => {
    fetchEvents();
  }, [searchTerm, categoryFilter, statusFilter, priceFilter]);



  const fetchEvents = async () => {
  try {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchTerm) params.append("search", searchTerm);
    if (categoryFilter) params.append("category", categoryFilter);
    if (statusFilter) params.append("status", statusFilter);
    if (priceFilter) params.append("maxPrice", priceFilter);

    const response = await api.get("/events", { params });
    setEvents(response.data.events || []); // ✅ هنا التعديل
  } catch (error) {
    console.error("Error fetching events:", error);
    setEvents([]); // لو حصل error خليه Array فاضي عشان ميكراشش
  } finally {
    setLoading(false);
  }
};


  const categories = ["Technology", "Music", "Sports", "Business", "Education", "Entertainment", "Art", "Food", "Health", "Science"];
  const statuses = ["upcoming", "active", "closed"];
  const priceRanges = [
    { label: "Any Price", value: "" },
    { label: "Free", value: "0" },
    { label: "Under $25", value: "25" },
    { label: "Under $50", value: "50" },
    { label: "Under $100", value: "100" },
    { label: "$100+", value: "100+" }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-50)" }}>
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="brand-gradient h-40 w-full opacity-90" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 pb-6">
          <div className="card p-6">
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl font-semibold mb-2" style={{ color: "var(--text-900)" }}>
                Discover Amazing Events
              </h1>
              <p className="text-base sm:text-lg" style={{ color: "var(--text-700)" }}>
                Find and book tickets for the best events in your area
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="card p-4">
            <div className="flex flex-wrap justify-center gap-4">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Status</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>

              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {priceRanges.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        {events.length === 0 ? (
          <div className="card p-8 text-center">
            <h3 className="text-lg font-medium mb-2" style={{ color: "var(--text-900)" }}>No events found</h3>
            <p style={{ color: "var(--text-700)" }}>Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
