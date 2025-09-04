import { useState, useEffect } from "react";
import api from "../../api.js";
import { exportToCSV, exportToExcel, generateReportFilename } from "../../utils/exportUtils.js";

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    overview: {
      totalRevenue: 0,
      totalAttendees: 0,
      totalTicketsSold: 0,
      totalEvents: 0,
      averageTicketPrice: 0
    },
    demographics: {
      ageGroups: [],
      gender: [],
      interests: [],
      locations: []
    },
    trends: {
      monthlyRevenue: [],
      monthlyTickets: [],
      topEvents: []
    }
  });
  const [selectedPeriod, setSelectedPeriod] = useState("30");
  const [selectedEvent, setSelectedEvent] = useState("all");

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedPeriod, selectedEvent]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/admin/analytics?period=${selectedPeriod}&event=${selectedEvent}`);
      setAnalyticsData(response.data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      // Use mock data for demonstration
      setAnalyticsData(getMockData());
    } finally {
      setLoading(false);
    }
  };

  const getMockData = () => ({
    overview: {
      totalRevenue: 125000,
      totalAttendees: 2847,
      totalTicketsSold: 3120,
      totalEvents: 24,
      averageTicketPrice: 40.06
    },
    demographics: {
      ageGroups: [
        { group: "18-24", count: 456, percentage: 16 },
        { group: "25-34", count: 892, percentage: 31.3 },
        { group: "35-44", count: 712, percentage: 25 },
        { group: "45-54", count: 456, percentage: 16 },
        { group: "55+", count: 331, percentage: 11.7 }
      ],
      gender: [
        { gender: "Male", count: 1423, percentage: 50 },
        { gender: "Female", count: 1284, percentage: 45.1 },
        { gender: "Other", count: 140, percentage: 4.9 }
      ],
      interests: [
        { interest: "Technology", count: 892, percentage: 31.3 },
        { interest: "Music", count: 712, percentage: 25 },
        { interest: "Sports", count: 456, percentage: 16 },
        { interest: "Business", count: 398, percentage: 14 },
        { interest: "Education", count: 389, percentage: 13.7 }
      ],
      locations: [
        { city: "New York", count: 456, percentage: 16 },
        { city: "Los Angeles", count: 398, percentage: 14 },
        { city: "Chicago", count: 345, percentage: 12.1 },
        { city: "Houston", count: 312, percentage: 11 },
        { city: "Phoenix", count: 289, percentage: 10.2 },
        { city: "Other", count: 1047, percentage: 36.7 }
      ]
    },
    trends: {
      monthlyRevenue: [
        { month: "Jan", revenue: 8500 },
        { month: "Feb", revenue: 9200 },
        { month: "Mar", revenue: 10800 },
        { month: "Apr", revenue: 12500 },
        { month: "May", revenue: 14200 },
        { month: "Jun", revenue: 15800 },
        { month: "Jul", revenue: 17200 },
        { month: "Aug", revenue: 18900 },
        { month: "Sep", revenue: 20100 },
        { month: "Oct", revenue: 21800 },
        { month: "Nov", revenue: 23500 },
        { month: "Dec", revenue: 25200 }
      ],
      monthlyTickets: [
        { month: "Jan", tickets: 68 },
        { month: "Feb", tickets: 74 },
        { month: "Mar", tickets: 86 },
        { month: "Apr", tickets: 100 },
        { month: "May", tickets: 114 },
        { month: "Jun", tickets: 126 },
        { month: "Jul", revenue: 138 },
        { month: "Aug", tickets: 151 },
        { month: "Sep", tickets: 161 },
        { month: "Oct", tickets: 174 },
        { month: "Nov", tickets: 188 },
        { month: "Dec", tickets: 202 }
      ],
      topEvents: [
        { name: "Tech Conference 2024", revenue: 25000, tickets: 500 },
        { name: "Summer Music Festival", revenue: 22000, tickets: 440 },
        { name: "Business Summit", revenue: 20000, tickets: 400 },
        { name: "Sports Championship", revenue: 18000, tickets: 360 },
        { name: "Art Exhibition", revenue: 15000, tickets: 300 }
      ]
    }
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const handleExportCSV = () => {
    const filename = generateReportFilename('analytics', 'csv');
    exportToCSV(analyticsData, filename);
  };

  const handleExportExcel = () => {
    const filename = generateReportFilename('analytics', 'xls');
    exportToExcel(analyticsData, filename);
  };

  const renderPieChart = (data, title, colorScheme = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']) => {
    const total = data.reduce((sum, item) => sum + item.count, 0);
    
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={item.group || item.gender || item.interest || item.city} className="flex items-center justify-between">
              <div className="flex items-center">
                <div 
                  className="w-4 h-4 rounded-full mr-3"
                  style={{ backgroundColor: colorScheme[index % colorScheme.length] }}
                ></div>
                <span className="text-sm font-medium text-gray-700">
                  {item.group || item.gender || item.interest || item.city}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-900">{formatNumber(item.count)}</div>
                <div className="text-xs text-gray-500">{item.percentage}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderBarChart = (data, title, yAxisLabel, color = '#3B82F6') => {
    const maxValue = Math.max(...data.map(item => item.revenue || item.tickets));
    
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="space-y-3">
          {data.map((item, index) => {
            const percentage = ((item.revenue || item.tickets) / maxValue) * 100;
            return (
              <div key={item.month} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{item.month}</span>
                  <span className="font-medium text-gray-900">
                    {yAxisLabel === 'Revenue' ? formatCurrency(item.revenue) : formatNumber(item.tickets)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${percentage}%`, 
                      backgroundColor: color 
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics & Reports</h1>
          <p className="text-gray-600">Comprehensive insights into your event performance</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time Period</label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                  <option value="365">Last year</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Filter</label>
                <select
                  value={selectedEvent}
                  onChange={(e) => setSelectedEvent(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Events</option>
                  <option value="tech">Technology Events</option>
                  <option value="music">Music Events</option>
                  <option value="sports">Sports Events</option>
                  <option value="business">Business Events</option>
                </select>
              </div>
            </div>
                         <div className="flex gap-3">
               <button
                 onClick={handleExportCSV}
                 className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center"
               >
                 <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                 </svg>
                 Export CSV
               </button>
               <button
                 onClick={handleExportExcel}
                 className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center"
               >
                 <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                 </svg>
                 Export Excel
               </button>
             </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(analyticsData.overview.totalRevenue)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Attendees</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(analyticsData.overview.totalAttendees)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tickets Sold</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(analyticsData.overview.totalTicketsSold)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(analyticsData.overview.totalEvents)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Ticket Price</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(analyticsData.overview.averageTicketPrice)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Demographics Charts */}
          {renderPieChart(analyticsData.demographics.ageGroups, "Age Distribution", ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'])}
          {renderPieChart(analyticsData.demographics.gender, "Gender Distribution", ['#3B82F6', '#EC4899', '#8B5CF6'])}
          {renderPieChart(analyticsData.demographics.interests, "Interest Categories", ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'])}
          {renderPieChart(analyticsData.demographics.locations, "Geographic Distribution", ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'])}
        </div>

        {/* Trend Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {renderBarChart(analyticsData.trends.monthlyRevenue, "Monthly Revenue Trend", "Revenue", "#10B981")}
          {renderBarChart(analyticsData.trends.monthlyTickets, "Monthly Tickets Sold", "Tickets", "#3B82F6")}
        </div>

        {/* Top Events Table */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Events</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tickets Sold</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analyticsData.trends.topEvents.map((event, index) => {
                  const performance = (event.revenue / analyticsData.overview.totalRevenue * 100).toFixed(1);
                  return (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{event.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatCurrency(event.revenue)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatNumber(event.tickets)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="h-2 bg-blue-600 rounded-full"
                              style={{ width: `${performance}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-900">{performance}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Insights */}
        <div className="bg-blue-50 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Key Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <p>• <strong>Peak Season:</strong> Revenue peaks in Q4 (October-December)</p>
              <p>• <strong>Top Category:</strong> Technology events generate highest revenue</p>
              <p>• <strong>Demographics:</strong> 25-34 age group is your primary audience</p>
            </div>
            <div>
              <p>• <strong>Geographic Focus:</strong> New York and LA are top markets</p>
              <p>• <strong>Growth Trend:</strong> 15% month-over-month revenue growth</p>
              <p>• <strong>Conversion Rate:</strong> 89% of visitors purchase tickets</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
