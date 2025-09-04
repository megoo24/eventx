// eventx-backend/models/Ticket.js
import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ticketNumber: { type: String, required: true, unique: true },
  
  // Ticket details
  ticketType: { type: String, enum: ["standard", "premium", "vip"], default: "standard" },
  price: { type: Number, required: true },
  
  // Seat allocation
  seatInfo: {
    section: String,
    row: String,
    seatNumber: String,
    isAssigned: { type: Boolean, default: false }
  },
  
  // QR Code
  qrCode: { type: String, required: true, unique: true },
  qrCodeData: { type: String, required: true }, // Encoded data for QR code
  
  // Status and validation
  status: { type: String, enum: ["active", "used", "cancelled", "refunded"], default: "active" },
  isValid: { type: Boolean, default: true },
  
  // Purchase details
  purchaseDate: { type: Date, default: Date.now },
  purchaseMethod: { type: String, default: "online" },
  
  // Usage tracking
  usedAt: Date,
  usedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  
  // Additional info
  notes: String,
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Generate unique ticket number
ticketSchema.pre('save', async function(next) {
  if (this.isNew) {
    // Generate ticket number: EVT-YYYYMMDD-XXXXX
    const date = new Date();
    const dateStr = date.getFullYear().toString() + 
                   (date.getMonth() + 1).toString().padStart(2, '0') + 
                   date.getDate().toString().padStart(2, '0');
    
    // Generate random 5-digit number
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    this.ticketNumber = `EVT-${dateStr}-${randomNum}`;
    
    // Generate QR code data
    this.qrCodeData = JSON.stringify({
      ticketId: this._id,
      eventId: this.event,
      ticketNumber: this.ticketNumber,
      userId: this.user
    });
    
    // Generate QR code (will be generated on the frontend)
    this.qrCode = `ticket_${this._id}_${Date.now()}`;
  }
  
  this.updatedAt = Date.now();
  next();
});

// Virtual for checking if ticket is expired
ticketSchema.virtual('isExpired').get(function() {
  // Ticket expires 24 hours after event
  const event = this.populated('event');
  if (!event) return false;
  
  const eventDate = new Date(event.date);
  const expiryDate = new Date(eventDate.getTime() + (24 * 60 * 60 * 1000));
  return new Date() > expiryDate;
});

// Virtual for ticket display name
ticketSchema.virtual('displayName').get(function() {
  return `${this.ticketType.charAt(0).toUpperCase() + this.ticketType.slice(1)} Ticket`;
});

// Index for better query performance
ticketSchema.index({ event: 1, user: 1 });
ticketSchema.index({ ticketNumber: 1 });
ticketSchema.index({ qrCode: 1 });
ticketSchema.index({ status: 1 });

export default mongoose.model("Ticket", ticketSchema);
