// eventx-backend/models/Event.js
import mongoose from "mongoose";

const seatSchema = new mongoose.Schema({
  seatNumber: { type: String, required: true },
  row: { type: String, required: true },
  section: { type: String, required: true },
  isBooked: { type: Boolean, default: false },
  isReserved: { type: Boolean, default: false },
  price: { type: Number, required: true },
  category: { type: String, enum: ["standard", "premium", "vip"], default: "standard" }
});

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  location: { type: String, required: true },
  venue: { type: String, required: true },
  price: { type: Number, required: true },
  capacity: { type: Number, required: true },
  bookedSeats: { type: Number, default: 0 },
  category: { type: String, required: true },
  image: { type: String, default: "" },
  status: { type: String, enum: ["draft", "upcoming", "active", "closed", "cancelled"], default: "draft" },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  tags: [String],
  
  // Seat allocation system
  seatingPlan: {
    hasSeatingPlan: { type: Boolean, default: false },
    sections: [{
      name: { type: String, required: true },
      rows: [{
        name: { type: String, required: true },
        seats: [seatSchema]
      }]
    }],
    generalAdmission: { type: Boolean, default: true }
  },
  
  // Pricing tiers
  pricingTiers: [{
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: String,
    availableSeats: { type: Number, required: true }
  }],
  
  // Event details
  eventType: { type: String, enum: ["concert", "conference", "workshop", "sports", "exhibition", "other"], default: "other" },
  duration: { type: Number, default: 120 }, // in minutes
  ageRestriction: { type: String, default: "all ages" },
  refundPolicy: { type: String, default: "No refunds" },
  
  // Social and marketing
  socialLinks: {
    website: String,
    facebook: String,
    twitter: String,
    instagram: String
  },
  
  // Analytics and tracking
  views: { type: Number, default: 0 },
  favorites: { type: Number, default: 0 },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field on save
eventSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for checking if event is sold out
eventSchema.virtual('isSoldOut').get(function() {
  return this.bookedSeats >= this.capacity;
});

// Virtual for checking if event is upcoming
eventSchema.virtual('isUpcoming').get(function() {
  return new Date(this.date) > new Date();
});

// Virtual for event status based on date and capacity
eventSchema.virtual('computedStatus').get(function() {
  const now = new Date();
  const eventDate = new Date(this.date);
  
  if (this.status === 'cancelled') return 'cancelled';
  if (this.isSoldOut) return 'sold-out';
  if (eventDate < now) return 'past';
  if (eventDate > now) return 'upcoming';
  return 'active';
});

export default mongoose.model("Event", eventSchema);
