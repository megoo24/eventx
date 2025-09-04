// eventx-backend/controllers/analyticsController.js
import Event from "../models/Event.js";
import Ticket from "../models/Ticket.js";
import User from "../models/User.js";

export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get total events for this organizer
    const totalEvents = await Event.countDocuments({ organizer: userId });
    
    // Get total tickets sold
    const totalTickets = await Ticket.countDocuments({
      event: { $in: await Event.find({ organizer: userId }).distinct('_id') }
    });

    // Get total revenue
    const tickets = await Ticket.find({
      event: { $in: await Event.find({ organizer: userId }).distinct('_id') }
    }).populate('event', 'price');

    const totalRevenue = tickets.reduce((sum, ticket) => sum + ticket.event.price, 0);

    // Get upcoming events
    const upcomingEvents = await Event.countDocuments({
      organizer: userId,
      date: { $gt: new Date() }
    });

    // Get recent events (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentEvents = await Event.countDocuments({
      organizer: userId,
      createdAt: { $gte: thirtyDaysAgo }
    });

    res.json({
      totalEvents,
      totalTickets,
      totalRevenue,
      upcomingEvents,
      recentEvents
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({ error: "Server error getting dashboard stats" });
  }
};

export const getEventAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const { eventId } = req.params;

    // Check if user is organizer
    const event = await Event.findById(eventId);
    if (!event || event.organizer.toString() !== userId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    // Get ticket statistics
    const tickets = await Ticket.find({ event: eventId });
    const totalTickets = tickets.length;
    const usedTickets = tickets.filter(t => t.status === 'used').length;
    const activeTickets = tickets.filter(t => t.status === 'active').length;
    const cancelledTickets = tickets.filter(t => t.status === 'cancelled').length;

    // Get revenue
    const revenue = tickets.reduce((sum, ticket) => sum + ticket.price, 0);

    // Get booking trends (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentBookings = await Ticket.countDocuments({
      event: eventId,
      bookedAt: { $gte: sevenDaysAgo }
    });

    res.json({
      event: {
        title: event.title,
        capacity: event.capacity,
        bookedSeats: event.bookedSeats
      },
      tickets: {
        total: totalTickets,
        used: usedTickets,
        active: activeTickets,
        cancelled: cancelledTickets
      },
      revenue,
      recentBookings
    });
  } catch (error) {
    console.error("Get event analytics error:", error);
    res.status(500).json({ error: "Server error getting event analytics" });
  }
};

export const getTopEvents = async (req, res) => {
  try {
    const userId = req.user.id;

    const events = await Event.find({ organizer: userId });
    const eventIds = events.map(event => event._id);

    const eventStats = await Ticket.aggregate([
      { $match: { event: { $in: eventIds } } },
      { $group: {
        _id: "$event",
        totalTickets: { $sum: 1 },
        revenue: { $sum: "$price" }
      }},
      { $sort: { totalTickets: -1 } },
      { $limit: 5 }
    ]);

    const topEvents = await Promise.all(
      eventStats.map(async (stat) => {
        const event = await Event.findById(stat._id);
        return {
          title: event.title,
          totalTickets: stat.totalTickets,
          revenue: stat.revenue
        };
      })
    );

    res.json(topEvents);
  } catch (error) {
    console.error("Get top events error:", error);
    res.status(500).json({ error: "Server error getting top events" });
  }
};

export const getMonthlyStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { year, month } = req.query;

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const events = await Event.find({ organizer: userId });
    const eventIds = events.map(event => event._id);

    const monthlyStats = await Ticket.aggregate([
      { $match: { 
        event: { $in: eventIds },
        bookedAt: { $gte: startDate, $lte: endDate }
      }},
      { $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$bookedAt" } },
        tickets: { $sum: 1 },
        revenue: { $sum: "$price" }
      }},
      { $sort: { _id: 1 } }
    ]);

    res.json(monthlyStats);
  } catch (error) {
    console.error("Get monthly stats error:", error);
    res.status(500).json({ error: "Server error getting monthly stats" });
  }
};
