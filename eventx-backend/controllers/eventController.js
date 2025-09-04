// eventx-backend/controllers/eventController.js
import Event from "../models/Event.js";
import Ticket from "../models/Ticket.js";

export const createEvent = async (req, res) => {
  try {
    const { 
      title, description, date, time, location, venue, price, capacity, 
      category, tags, image, eventType, duration, ageRestriction, 
      refundPolicy, socialLinks, pricingTiers, seatingPlan 
    } = req.body;
    
    // Validate required fields
    if (!title || !description || !date || !location || !venue || !price || !capacity || !category) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate date is in the future
    const eventDate = new Date(date);
    if (eventDate <= new Date()) {
      return res.status(400).json({ error: "Event date must be in the future" });
    }

    // Create pricing tiers if not provided
    let finalPricingTiers = pricingTiers;
    if (!pricingTiers || pricingTiers.length === 0) {
      finalPricingTiers = [{
        name: "General Admission",
        price: price,
        description: "Standard ticket",
        availableSeats: capacity
      }];
    }

    const event = new Event({
      title,
      description,
      date: eventDate,
      time: time || "19:00",
      location,
      venue,
      price,
      capacity,
      category,
      tags: tags || [],
      organizer: req.user.id,
      eventType: eventType || "other",
      duration: duration || 120,
      ageRestriction: ageRestriction || "all ages",
      refundPolicy: refundPolicy || "No refunds",
      socialLinks: socialLinks || {},
      pricingTiers: finalPricingTiers,
      seatingPlan: seatingPlan || { hasSeatingPlan: false, generalAdmission: true }
    });

    await event.save();
    
    res.status(201).json({ 
      message: "Event created successfully", 
      event: {
        ...event.toObject(),
        id: event._id
      }
    });
  } catch (error) {
    console.error("Create event error:", error);
    res.status(500).json({ error: "Server error creating event" });
  }
};

export const getAllEvents = async (req, res) => {
  try {
    const { status, category, search, eventType, page = 1, limit = 10 } = req.query;
    let query = {};

    if (status) query.status = status;
    if (category) query.category = category;
    if (eventType) query.eventType = eventType;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { venue: { $regex: search, $options: "i" } }
      ];
    }

    const skip = (page - 1) * limit;
    
    const events = await Event.find(query)
      .populate("organizer", "name")
      .sort({ date: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Event.countDocuments(query);

    res.json({
      events,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalEvents: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error("Get events error:", error);
    res.status(500).json({ error: "Server error getting events" });
  }
};

export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("organizer", "name email");

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Increment view count
    event.views += 1;
    await event.save();

    res.json(event);
  } catch (error) {
    console.error("Get event error:", error);
    res.status(500).json({ error: "Server error getting event" });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    if (event.organizer.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized to update this event" });
    }

    // Check if event has tickets sold
    const ticketsSold = await Ticket.countDocuments({ event: req.params.id, status: "active" });
    if (ticketsSold > 0) {
      // Don't allow major changes if tickets are sold
      const { capacity, date, venue, location } = req.body;
      if (capacity && capacity < ticketsSold) {
        return res.status(400).json({ error: `Cannot reduce capacity below ${ticketsSold} (tickets already sold)` });
      }
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    res.json({ message: "Event updated successfully", event: updatedEvent });
  } catch (error) {
    console.error("Update event error:", error);
    res.status(500).json({ error: "Server error updating event" });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    if (event.organizer.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized to delete this event" });
    }

    // Check if event has tickets sold
    const ticketsSold = await Ticket.countDocuments({ event: req.params.id, status: "active" });
    if (ticketsSold > 0) {
      return res.status(400).json({ 
        error: `Cannot delete event with ${ticketsSold} active tickets. Please cancel tickets first.` 
      });
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Delete event error:", error);
    res.status(500).json({ error: "Server error deleting event" });
  }
};

export const getAdminEvents = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    let query = { organizer: req.user.id };

    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    const skip = (page - 1) * limit;
    
    const events = await Event.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Event.countDocuments(query);

    // Get ticket counts for each event
    const eventsWithStats = await Promise.all(
      events.map(async (event) => {
        const ticketStats = await Ticket.aggregate([
          { $match: { event: event._id } },
          {
            $group: {
              _id: null,
              totalTickets: { $sum: 1 },
              activeTickets: { $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] } },
              usedTickets: { $sum: { $cond: [{ $eq: ["$status", "used"] }, 1, 0] } },
              totalRevenue: { $sum: "$price" }
            }
          }
        ]);

        return {
          ...event.toObject(),
          ticketStats: ticketStats[0] || {
            totalTickets: 0,
            activeTickets: 0,
            usedTickets: 0,
            totalRevenue: 0
          }
        };
      })
    );

    res.json({
      events: eventsWithStats,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalEvents: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error("Get admin events error:", error);
    res.status(500).json({ error: "Server error getting admin events" });
  }
};

export const updateEventStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    if (event.organizer.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized to update this event" });
    }

    // Validate status transition
    const validTransitions = {
      draft: ["upcoming", "cancelled"],
      upcoming: ["active", "cancelled"],
      active: ["closed", "cancelled"],
      closed: ["cancelled"],
      cancelled: []
    };

    if (!validTransitions[event.status].includes(status)) {
      return res.status(400).json({ 
        error: `Cannot transition from ${event.status} to ${status}` 
      });
    }

    event.status = status;
    await event.save();

    res.json({ message: "Event status updated successfully", event });
  } catch (error) {
    console.error("Update event status error:", error);
    res.status(500).json({ error: "Server error updating event status" });
  }
};

export const getEventSeatingPlan = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    if (!event.seatingPlan.hasSeatingPlan) {
      return res.status(400).json({ error: "This event does not have a seating plan" });
    }

    // Get booked seats
    const bookedSeats = await Ticket.find({ 
      event: req.params.id, 
      status: "active",
      "seatInfo.isAssigned": true 
    }).select("seatInfo");

    res.json({
      seatingPlan: event.seatingPlan,
      bookedSeats: bookedSeats.map(ticket => ticket.seatInfo)
    });
  } catch (error) {
    console.error("Get seating plan error:", error);
    res.status(500).json({ error: "Server error getting seating plan" });
  }
};
