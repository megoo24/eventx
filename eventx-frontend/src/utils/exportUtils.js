// Export utilities for analytics data

export const exportToCSV = (data, filename) => {
  const csvContent = generateCSV(data);
  downloadFile(csvContent, filename, 'text/csv');
};

export const exportToExcel = (data, filename) => {
  // For Excel export, we'll create a CSV with .xls extension
  // In a real implementation, you might want to use a library like xlsx
  const csvContent = generateCSV(data);
  downloadFile(csvContent, filename.replace('.csv', '.xls'), 'application/vnd.ms-excel');
};

const downloadFile = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const generateCSV = (data) => {
  let csv = '';
  
  if (data.overview) {
    csv += 'OVERVIEW METRICS\n';
    csv += 'Metric,Value\n';
    csv += `Total Revenue,${data.overview.totalRevenue}\n`;
    csv += `Total Attendees,${data.overview.totalAttendees}\n`;
    csv += `Total Tickets Sold,${data.overview.totalTicketsSold}\n`;
    csv += `Total Events,${data.overview.totalEvents}\n`;
    csv += `Average Ticket Price,${data.overview.averageTicketPrice}\n\n`;
  }
  
  if (data.demographics) {
    if (data.demographics.ageGroups && data.demographics.ageGroups.length > 0) {
      csv += 'AGE GROUP DISTRIBUTION\n';
      csv += 'Age Group,Count,Percentage\n';
      data.demographics.ageGroups.forEach(group => {
        csv += `${group.group},${group.count},${group.percentage}%\n`;
      });
      csv += '\n';
    }
    
    if (data.demographics.gender && data.demographics.gender.length > 0) {
      csv += 'GENDER DISTRIBUTION\n';
      csv += 'Gender,Count,Percentage\n';
      data.demographics.gender.forEach(g => {
        csv += `${g.gender},${g.count},${g.percentage}%\n`;
      });
      csv += '\n';
    }
    
    if (data.demographics.interests && data.demographics.interests.length > 0) {
      csv += 'INTEREST CATEGORIES\n';
      csv += 'Interest,Count,Percentage\n';
      data.demographics.interests.forEach(interest => {
        csv += `${interest.interest},${interest.count},${interest.percentage}%\n`;
      });
      csv += '\n';
    }
    
    if (data.demographics.locations && data.demographics.locations.length > 0) {
      csv += 'GEOGRAPHIC DISTRIBUTION\n';
      csv += 'City,Count,Percentage\n';
      data.demographics.locations.forEach(location => {
        csv += `${location.city},${location.count},${location.percentage}%\n`;
      });
      csv += '\n';
    }
  }
  
  if (data.trends) {
    if (data.trends.monthlyRevenue && data.trends.monthlyRevenue.length > 0) {
      csv += 'MONTHLY REVENUE TREND\n';
      csv += 'Month,Revenue\n';
      data.trends.monthlyRevenue.forEach(item => {
        csv += `${item.month},${item.revenue}\n`;
      });
      csv += '\n';
    }
    
    if (data.trends.monthlyTickets && data.trends.monthlyTickets.length > 0) {
      csv += 'MONTHLY TICKETS SOLD\n';
      csv += 'Month,Tickets\n';
      data.trends.monthlyTickets.forEach(item => {
        csv += `${item.month},${item.tickets}\n`;
      });
      csv += '\n';
    }
    
    if (data.trends.topEvents && data.trends.topEvents.length > 0) {
      csv += 'TOP PERFORMING EVENTS\n';
      csv += 'Event Name,Revenue,Tickets Sold\n';
      data.trends.topEvents.forEach(event => {
        csv += `${event.name},${event.revenue},${event.tickets}\n`;
      });
      csv += '\n';
    }
  }
  
  return csv;
};

export const generateReportFilename = (type = 'analytics', format = 'csv') => {
  const date = new Date().toISOString().split('T')[0];
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  return `${type}_report_${timestamp}.${format}`;
};

export const exportEventReport = (events) => {
  let csv = 'EVENT REPORT\n';
  csv += 'Event Name,Date,Venue,Category,Status,Tickets Sold,Revenue,Capacity\n';
  
  events.forEach(event => {
    csv += `${event.title},${event.date},${event.venue},${event.category},${event.status},${event.bookedSeats || 0},${event.ticketPrice * (event.bookedSeats || 0)},${event.totalSeats}\n`;
  });
  
  const filename = generateReportFilename('events', 'csv');
  downloadFile(csv, filename, 'text/csv');
};

export const exportTicketReport = (tickets) => {
  let csv = 'TICKET REPORT\n';
  csv += 'Ticket ID,Event Name,Seat Number,Attendee Name,Email,Phone,Booking Date,Status\n';
  
  tickets.forEach(ticket => {
    csv += `${ticket.id},${ticket.event.title},${ticket.seats.join(', ')},${ticket.userDetails.firstName} ${ticket.userDetails.lastName},${ticket.userDetails.email},${ticket.userDetails.phone},${ticket.createdAt},${ticket.status}\n`;
  });
  
  const filename = generateReportFilename('tickets', 'csv');
  downloadFile(csv, filename, 'text/csv');
};
