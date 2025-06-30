import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ShieldExclamationIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [analytics, setAnalytics] = useState(null);
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const days = timeRange === 'day' ? 1 : timeRange === 'week' ? 7 : 30;
      
      // Fetch analytics data from multiple endpoints
      const [statsResponse, trendsResponse, historyResponse] = await Promise.all([
        api.get(`/detection/statistics?days=${days}`),
        api.get(`/analytics/trends?days=${days}`),
        api.get(`/analytics/history?days=${days}&per_page=50`)
      ]);

      const stats = statsResponse.data;
      const trendsData = trendsResponse.data;
      const history = historyResponse.data;

      // Process attack types for better display
      const attackTypes = Object.entries(stats.attack_types || {}).map(([type, count]) => ({
        type: formatAttackType(type),
        count,
        percentage: stats.malicious_detections > 0 ? ((count / stats.malicious_detections) * 100).toFixed(1) : 0
      })).sort((a, b) => b.count - a.count);

      // Process threat levels
      const threatLevels = Object.entries(stats.threat_levels || {}).map(([level, count]) => ({
        level,
        count,
        percentage: stats.total_detections > 0 ? ((count / stats.total_detections) * 100).toFixed(1) : 0,
        color: getThreatLevelColor(level)
      }));

      setAnalytics({
        totalDetections: stats.total_detections,
        maliciousDetections: stats.malicious_detections,
        safeQueries: stats.safe_queries,
        averageConfidence: stats.average_confidence,
        attackTypes,
        threatLevels,
        detectionRate: stats.total_detections > 0 ? ((stats.malicious_detections / stats.total_detections) * 100).toFixed(1) : 0
      });

      setTrends(trendsData);

    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      setError('Failed to load analytics data. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatAttackType = (type) => {
    if (!type) return 'Unknown';
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getThreatLevelColor = (level) => {
    const colors = {
      'Low': 'bg-green-500',
      'Medium': 'bg-yellow-500', 
      'High': 'bg-orange-500',
      'Critical': 'bg-red-500'
    };
    return colors[level] || 'bg-gray-500';
  };
      console.error('Failed to fetch analytics:', error);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const processHistoryForDaily = (historyData) => {
    const dailyMap = {};
    
    historyData.forEach(item => {
      const date = new Date(item.timestamp).toISOString().split('T')[0];
      if (!dailyMap[date]) {
        dailyMap[date] = { date, scans: 0, malicious: 0, safe: 0 };
      }
      dailyMap[date].scans++;
      if (item.status === 'malicious') {
        dailyMap[date].malicious++;
      } else {
        dailyMap[date].safe++;
      }
    });

    return Object.values(dailyMap).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  const { attackTypes, dailyStats } = analytics || { attackTypes: [], dailyStats: [] };

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

      {/* Summary Statistics */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MagnifyingGlassIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Scans</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalDetections}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Threats Detected</p>
                <p className="text-2xl font-bold text-red-600">{analytics.maliciousDetections}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Safe Queries</p>
                <p className="text-2xl font-bold text-green-600">{analytics.safeQueries}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Avg. Confidence</p>
                <p className="text-2xl font-bold text-purple-600">{analytics.averageConfidence}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

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