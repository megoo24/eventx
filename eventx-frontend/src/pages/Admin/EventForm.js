import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api.js";
import SeatPicker from "../../components/SeatPicker.js";

export default function EventForm() {
  const navigate = useNavigate();
  const { id } = useParams(); // For editing existing events
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSeatPicker, setShowSeatPicker] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    venue: "",
    price: "",
    capacity: "",
    category: "",
    tags: "",
    image: "",
    seatAllocation: "automatic", // automatic, manual, or none
    seatMap: [], // For manual seat allocation
    qrCodeEnabled: true,
    ticketTemplate: "standard" // standard, premium, custom
  });

  const [seatMap, setSeatMap] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);

  const categories = [
    "Technology", "Music", "Sports", "Business", "Education", 
    "Entertainment", "Art", "Food", "Health", "Other"
  ];

  const ticketTemplates = [
    { value: "standard", label: "Standard Ticket", description: "Basic ticket with QR code" },
    { value: "premium", label: "Premium Ticket", description: "Enhanced ticket with branding" },
    { value: "custom", label: "Custom Template", description: "Custom designed ticket" }
  ];

  useEffect(() => {
    if (id) {
      fetchEvent();
    }
  }, [id]);

  const fetchEvent = async () => {
    try {
      const response = await api.get(`/events/${id}`);
      const event = response.data;
      
      // Split date and time for the form
      const eventDate = new Date(event.date);
      const dateStr = eventDate.toISOString().split('T')[0];
      const timeStr = eventDate.toTimeString().slice(0, 5);
      
      setFormData({
        title: event.title || "",
        description: event.description || "",
        date: dateStr,
        time: timeStr,
        location: event.location || "",
        venue: event.venue || "",
        price: event.price || "",
        capacity: event.capacity || "",
        category: event.category || "",
        tags: event.tags ? event.tags.join(", ") : "",
        image: event.image || "",
        seatAllocation: event.seatAllocation || "automatic",
        seatMap: event.seatMap || [],
        qrCodeEnabled: event.qrCodeEnabled !== false,
        ticketTemplate: event.ticketTemplate || "standard"
      });

      if (event.seatMap && event.seatMap.length > 0) {
        setSeatMap(event.seatMap);
        setShowSeatPicker(true);
      }
    } catch (error) {
      console.error("Error fetching event:", error);
      setError("Failed to load event data");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSeatSelect = (seatId) => {
    setSelectedSeats(prev => [...prev, seatId]);
  };

  const handleSeatDeselect = (seatId) => {
    setSelectedSeats(prev => prev.filter(id => id !== seatId));
  };

  const generateSeatMap = () => {
    const capacity = parseInt(formData.capacity) || 0;
    if (capacity > 0) {
      setSeatMap(Array.from({ length: capacity }, (_, i) => ({
        seatNumber: i + 1,
        isReserved: false,
        isBooked: false,
        price: parseFloat(formData.price) || 0
      })));
      setShowSeatPicker(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Combine date and time
      const dateTime = new Date(`${formData.date}T${formData.time}`);
      
      const eventData = {
        ...formData,
        date: dateTime,
        tags: formData.tags.split(",").map(tag => tag.trim()).filter(tag => tag),
        seatMap: showSeatPicker ? seatMap : [],
        price: parseFloat(formData.price),
        capacity: parseInt(formData.capacity)
      };

      if (id) {
        // Update existing event
        await api.put(`/events/${id}`, eventData);
        navigate("/admin/events");
      } else {
        // Create new event
        await api.post("/events", eventData);
        navigate("/admin/events");
      }
    } catch (error) {
      console.error("Error saving event:", error);
      setError(error.response?.data?.error || "Failed to save event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {id ? "Edit Event" : "Create New Event"}
          </h1>
          <p className="text-gray-600">
            {id ? "Update your event details" : "Set up a new event with all the necessary information"}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow p-6">
          {error && (
            <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Event Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter event title"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe your event..."
              />
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  required
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                  Time *
                </label>
                <input
                  type="time"
                  id="time"
                  name="time"
                  required
                  value={formData.time}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  City/Location *
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., New York, NY"
                />
              </div>

              <div>
                <label htmlFor="venue" className="block text-sm font-medium text-gray-700 mb-2">
                  Venue *
                </label>
                <input
                  type="text"
                  id="venue"
                  name="venue"
                  required
                  value={formData.venue}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Convention Center"
                />
              </div>
            </div>

            {/* Pricing and Capacity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  Ticket Price ($) *
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-2">
                  Capacity *
                </label>
                <input
                  type="number"
                  id="capacity"
                  name="capacity"
                  required
                  min="1"
                  value={formData.capacity}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="100"
                />
              </div>
            </div>

            {/* Seat Allocation */}
            <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Seat Allocation & Management</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <label htmlFor="seatAllocation" className="block text-sm font-medium text-gray-700 mb-2">
                    Seat Allocation Type
                  </label>
                  <select
                    id="seatAllocation"
                    name="seatAllocation"
                    value={formData.seatAllocation}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="automatic">Automatic (First come, first served)</option>
                    <option value="manual">Manual (Admin assigns seats)</option>
                    <option value="none">No assigned seating</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={generateSeatMap}
                    disabled={!formData.capacity || formData.seatAllocation === "none"}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Generate Seat Map
                  </button>
                </div>
              </div>

              {showSeatPicker && formData.seatAllocation === "manual" && (
                <div className="mt-4">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Seat Map Preview</h4>
                  <SeatPicker
                    totalSeats={parseInt(formData.capacity) || 0}
                    bookedSeats={[]}
                    onSeatSelect={handleSeatSelect}
                    onSeatDeselect={handleSeatDeselect}
                    selectedSeats={selectedSeats}
                    isEditable={true}
                    seatPrice={parseFloat(formData.price) || 0}
                    showPricing={true}
                  />
                </div>
              )}
            </div>

            {/* Ticket Configuration */}
            <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Ticket Configuration</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="ticketTemplate" className="block text-sm font-medium text-gray-700 mb-2">
                    Ticket Template
                  </label>
                  <select
                    id="ticketTemplate"
                    name="ticketTemplate"
                    value={formData.ticketTemplate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {ticketTemplates.map(template => (
                      <option key={template.value} value={template.value}>
                        {template.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-gray-500 mt-1">
                    {ticketTemplates.find(t => t.value === formData.ticketTemplate)?.description}
                  </p>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="qrCodeEnabled"
                    name="qrCodeEnabled"
                    checked={formData.qrCodeEnabled}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="qrCodeEnabled" className="ml-2 block text-sm text-gray-900">
                    Enable QR Code Generation
                  </label>
                </div>
              </div>

              {formData.qrCodeEnabled && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-blue-800">
                      QR codes will be automatically generated for each ticket, enabling easy check-in and verification.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., tech, startup, networking"
                />
                <p className="text-sm text-gray-500 mt-1">Separate tags with commas</p>
              </div>

              <div>
                <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                />
                <p className="text-sm text-gray-500 mt-1">Optional image for the event</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate("/admin/events")}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Saving..." : (id ? "Update Event" : "Create Event")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
