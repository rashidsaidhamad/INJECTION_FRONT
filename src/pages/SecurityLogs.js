import React, { useState, useEffect } from 'react';
import api from '../services/api';

const SecurityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    severity: '',
    event_type: '',
    limit: 50,
    offset: 0
  });

  useEffect(() => {
    fetchSecurityData();
  }, [filters]);

  const fetchSecurityData = async () => {
    try {
      setLoading(true);
      
      // First check if user is authenticated
      const userData = localStorage.getItem('user');
      if (!userData) {
        setError('Please login as admin first.');
        setLoading(false);
        return;
      }
      
      const user = JSON.parse(userData);
      if (user.role !== 'admin') {
        setError('Admin privileges required to view security logs.');
        setLoading(false);
        return;
      }
      
      console.log('User authenticated:', user);
      console.log('Making API calls to security endpoints...');
      
      // Fetch security logs
      const logsParams = new URLSearchParams();
      if (filters.severity) logsParams.append('severity', filters.severity);
      if (filters.event_type) logsParams.append('event_type', filters.event_type);
      logsParams.append('limit', filters.limit);
      logsParams.append('offset', filters.offset);
      
      console.log('Fetching logs with params:', logsParams.toString());
      console.log('API base URL:', api.defaults.baseURL);
      
      const [logsResponse, statsResponse] = await Promise.all([
        api.get(`/admin/security/logs?${logsParams}`),
        api.get('/admin/security/stats')
      ]);
      
      console.log('Logs response:', logsResponse);
      console.log('Stats response:', statsResponse);
      
      setLogs(logsResponse.data.logs);
      setStats(statsResponse.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching security data:', err);
      console.error('Error response:', err.response);
      console.error('Error status:', err.response?.status);
      console.error('Error data:', err.response?.data);
      
      let errorMessage = 'Failed to load security logs. Please check your permissions.';
      if (err.response?.status === 401) {
        errorMessage = 'Authentication required. Please login as admin first.';
      } else if (err.response?.status === 403) {
        errorMessage = 'Access forbidden. Admin privileges required.';
      } else if (err.response?.status === 404) {
        errorMessage = 'Security logs endpoint not found.';
      } else if (err.response?.data?.error) {
        errorMessage = `Error: ${err.response.data.error}`;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      offset: 0 // Reset pagination when filtering
    }));
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEventTypeIcon = (eventType) => {
    switch (eventType) {
      case 'sql_injection_attempt': return '🚨';
      case 'login': return '🔐';
      case 'logout': return '🚪';
      case 'registration': return '📝';
      case 'course_enrollment': return '📚';
      case 'assignment_submission': return '📤';
      case 'profile_update': return '👤';
      default: return '📋';
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading security logs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Security Logs</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchSecurityData}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🔒 Security Logs</h1>
          <p className="text-gray-600">Monitor all security events and SQL injection detection across the system</p>
        </div>

        {/* Security Statistics Dashboard */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            
            {/* Severity Stats */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🚨 Threat Levels</h3>
              <div className="space-y-2">
                {Object.entries(stats.severity_stats).map(([severity, count]) => (
                  <div key={severity} className="flex justify-between items-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(severity)}`}>
                      {severity.toUpperCase()}
                    </span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Time-based Stats */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Activity Timeline</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Today</span>
                  <span className="font-semibold">{stats.time_stats.today}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">This Week</span>
                  <span className="font-semibold">{stats.time_stats.this_week}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">This Month</span>
                  <span className="font-semibold">{stats.time_stats.this_month}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total</span>
                  <span className="font-semibold">{stats.time_stats.total}</span>
                </div>
              </div>
            </div>

            {/* Event Type Stats */}
            <div className="bg-white rounded-lg shadow-sm border p-6 md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Event Types</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(stats.event_type_stats).map(([eventType, count]) => (
                  <div key={eventType} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">
                      {getEventTypeIcon(eventType)} {eventType.replace('_', ' ')}
                    </span>
                    <span className="font-semibold text-blue-600">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🔍 Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Severity Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Severity Level</label>
              <select
                value={filters.severity}
                onChange={(e) => handleFilterChange('severity', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* Event Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
              <select
                value={filters.event_type}
                onChange={(e) => handleFilterChange('event_type', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Events</option>
                <option value="sql_injection_attempt">SQL Injection Attempts</option>
                <option value="login">Login Events</option>
                <option value="logout">Logout Events</option>
                <option value="registration">Registration Events</option>
                <option value="course_enrollment">Course Enrollments</option>
                <option value="assignment_submission">Assignment Submissions</option>
                <option value="profile_update">Profile Updates</option>
              </select>
            </div>

            {/* Limit Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Results per Page</label>
              <select
                value={filters.limit}
                onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security Logs Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h3 className="text-lg font-semibold text-gray-900">📜 Security Event Log</h3>
            <p className="text-sm text-gray-600 mt-1">
              Showing {logs.length} events • Real-time monitoring of all user input fields
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{getEventTypeIcon(log.event_type)}</span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {log.event_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {log.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTimestamp(log.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(log.severity)}`}>
                        {log.severity.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      User ID: {log.user_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.ip_address}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs">
                        <div className="truncate" title={log.message}>
                          {log.message}
                        </div>
                        {log.detection_details && log.detection_details !== log.message && (
                          <div className="text-xs text-gray-500 mt-1 truncate" title={log.detection_details}>
                            {log.detection_details}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {logs.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Security Events Found</h3>
              <p className="text-gray-500">
                {filters.severity || filters.event_type ? 
                  'Try adjusting your filters to see more events.' : 
                  'No security events have been logged yet.'
                }
              </p>
            </div>
          )}
        </div>

        {/* SQL Injection Alerts */}
        {stats && stats.event_type_stats.sql_injection_attempt > 0 && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="text-red-600 text-2xl mr-3">🚨</div>
              <div>
                <h3 className="text-lg font-semibold text-red-900">SQL Injection Attempts Detected</h3>
                <p className="text-red-700 mt-1">
                  {stats.event_type_stats.sql_injection_attempt} SQL injection attempts have been detected and blocked by the ML models.
                  All malicious queries were prevented from executing. Review the logs above for details.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>🛡️ Protected by ML-powered SQL injection detection system</p>
          <p>Last updated: {stats ? formatTimestamp(stats.generated_at) : 'Loading...'}</p>
        </div>
      </div>
    </div>
  );
};

export default SecurityLogs;