// eventx-backend/controllers/ticketController.js
import Ticket from "../models/Ticket.js";
import Event from "../models/Event.js";
import QRCode from "qrcode";

export const bookTicket = async (req, res) => {
  try {
    const { eventId, seatNumber } = req.body;
    const userId = req.user.id;

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Check if seat is available
    const existingTicket = await Ticket.findOne({
      event: eventId,
      seatNumber,
      status: "active"
    });

    if (existingTicket) {
      return res.status(400).json({ error: "Seat already booked" });
    }

    // Check if event has capacity
    if (event.bookedSeats >= event.capacity) {
      return res.status(400).json({ error: "Event is full" });
    }

    // Generate QR code
    const qrData = JSON.stringify({
      eventId,
      userId,
      seatNumber,
      timestamp: Date.now()
    });

    const qrCode = await QRCode.toDataURL(qrData);

    // Create ticket
    const ticket = new Ticket({
      event: eventId,
      user: userId,
      seatNumber,
      price: event.price,
      qrCode
    });

    await ticket.save();

    // Update event booked seats
    await Event.findByIdAndUpdate(eventId, {
      $inc: { bookedSeats: 1 }
    });

    res.status(201).json({
      message: "Ticket booked successfully",
      ticket: {
        id: ticket._id,
        seatNumber: ticket.seatNumber,
        price: ticket.price,
        qrCode: ticket.qrCode,
        event: {
          title: event.title,
          date: event.date,
          venue: event.venue
        }
      }
    });
  } catch (error) {
    console.error("Book ticket error:", error);
    res.status(500).json({ error: "Server error booking ticket" });
  }
};

export const getUserTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ user: req.user.id })
      .populate("event", "title date venue location")
      .sort({ bookedAt: -1 });

    res.json(tickets);
  } catch (error) {
    console.error("Get user tickets error:", error);
    res.status(500).json({ error: "Server error getting tickets" });
  }
};

export const getEventTickets = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    // Check if user is admin or event organizer
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    if (event.organizer.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized" });
    }

    const tickets = await Ticket.find({ event: eventId })
      .populate("user", "name email")
      .sort({ bookedAt: -1 });

    res.json(tickets);
  } catch (error) {
    console.error("Get event tickets error:", error);
    res.status(500).json({ error: "Server error getting event tickets" });
  }
};

export const validateTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    
    const ticket = await Ticket.findById(ticketId)
      .populate("event", "title date venue")
      .populate("user", "name email");

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    if (ticket.status === "used") {
      return res.status(400).json({ error: "Ticket already used" });
    }

    if (ticket.status === "cancelled") {
      return res.status(400).json({ error: "Ticket is cancelled" });
    }

    // Mark ticket as used
    ticket.status = "used";
    ticket.usedAt = new Date();
    await ticket.save();

    res.json({
      message: "Ticket validated successfully",
      ticket: {
        id: ticket._id,
        seatNumber: ticket.seatNumber,
        user: ticket.user.name,
        event: ticket.event.title,
        venue: ticket.event.venue,
        date: ticket.event.date
      }
    });
  } catch (error) {
    console.error("Validate ticket error:", error);
    res.status(500).json({ error: "Server error validating ticket" });
  }
};

export const cancelTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const userId = req.user.id;

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    if (ticket.user.toString() !== userId) {
      return res.status(403).json({ error: "Not authorized to cancel this ticket" });
    }

    if (ticket.status !== "active") {
      return res.status(400).json({ error: "Ticket cannot be cancelled" });
    }

    ticket.status = "cancelled";
    await ticket.save();

    // Update event booked seats
    await Event.findByIdAndUpdate(ticket.event, {
      $inc: { bookedSeats: -1 }
    });

    res.json({ message: "Ticket cancelled successfully" });
  } catch (error) {
    console.error("Cancel ticket error:", error);
    res.status(500).json({ error: "Server error cancelling ticket" });
  }
};
