import React, { useState } from 'react';
import { 
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ChartBarIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('week');

  // Mock data for attack types
  const attackTypes = [
    { type: 'Union-Based', count: 156, percentage: 47.6 },
    { type: 'Error-Based', count: 89, percentage: 27.1 },
    { type: 'Boolean-Based', count: 45, percentage: 13.7 },
    { type: 'Time-Based', count: 38, percentage: 11.6 }
  ];

  // Mock data for daily statistics
  const dailyStats = [
    { date: '2025-05-15', scans: 180, malicious: 45, safe: 135 },
    { date: '2025-05-16', scans: 195, malicious: 52, safe: 143 },
    { date: '2025-05-17', scans: 168, malicious: 38, safe: 130 },
    { date: '2025-05-18', scans: 202, malicious: 58, safe: 144 },
    { date: '2025-05-19', scans: 187, malicious: 49, safe: 138 },
    { date: '2025-05-20', scans: 210, malicious: 55, safe: 155 },
    { date: '2025-05-21', scans: 225, malicious: 31, safe: 194 }
  ];

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        
        {/* Time Range Selector */}
        <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg shadow-sm">
          <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border-0 text-sm focus:ring-0"
          >
            <option value="day">Last 24 Hours</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Statistics Cards - Your existing code here */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
        {/* ... existing statistics cards ... */}
      </div>

      {/* Historical Trend Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Detection Trends</h2>
          <div className="h-64 bg-gray-50 rounded-lg p-4">
            {/* Add your preferred charting library here */}
            <p className="text-gray-500 text-center">Chart showing daily detection trends</p>
          </div>
        </div>

        {/* Attack Types Breakdown */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Attack Types</h2>
          <div className="space-y-4">
            {attackTypes.map((attack) => (
              <div key={attack.type}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{attack.type}</span>
                  <span className="text-gray-500">{attack.count} attacks</span>
                </div>
                <div className="relative h-2 bg-gray-100 rounded">
                  <div 
                    className="absolute top-0 left-0 h-full bg-red-500 rounded"
                    style={{ width: `${attack.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Statistics Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Daily Statistics</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Scans</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Malicious</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Safe</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Detection Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {dailyStats.map((day) => (
                <tr key={day.date}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{day.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{day.scans}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">{day.malicious}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">{day.safe}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {((day.malicious / day.scans) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;