import React, { useState, useEffect } from 'react';
import { 
  CalendarDaysIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

const History = () => {
  const [timeframe, setTimeframe] = useState('day');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  
  const itemsPerPage = 10;

  useEffect(() => {
    fetchHistoryData();
  }, [timeframe, currentPage, statusFilter]);

  const fetchHistoryData = async () => {
    setIsLoading(true);
    try {
      const response = await mockFetchData();
      setHistoryData(response);
      setError(null);
    } catch (err) {
      setError('Failed to load history data');
    } finally {
      setIsLoading(false);
    }
  };

  const mockFetchData = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 1,
            query: "SELECT * FROM users WHERE id = '1' OR '1'='1'",
            timestamp: "2025-05-21 10:30:00",
            status: "malicious",
            confidence: 98.5,
            type: "Union-based injection"
          },
          {
            id: 2,
            query: "SELECT username FROM accounts WHERE user_id = 123",
            timestamp: "2025-05-21 09:15:00",
            status: "safe",
            confidence: 99.1
          }
        ]);
      }, 1000);
    });
  };

  const filteredData = historyData
    .filter(item => 
      item.query.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (statusFilter === 'all' || item.status === statusFilter)
    );

  const pageCount = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const exportToCSV = () => {
    const headers = ['Timestamp', 'Query', 'Status', 'Confidence', 'Type'];
    const csvData = filteredData.map(item => 
      [item.timestamp, item.query, item.status, item.confidence, item.type || ''].join(',')
    );
    
    const csv = [headers.join(','), ...csvData].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sql-injection-history-${timeframe}-${new Date().toISOString()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Detection History</h1>
        
        <div className="flex space-x-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {['day', 'week', 'month'].map((period) => (
              <button
                key={period}
                onClick={() => setTimeframe(period)}
                className={`px-4 py-2 rounded-md transition ${
                  timeframe === period ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>

          <button
            onClick={exportToCSV}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
            Export
          </button>
        </div>
      </div>

      <div className="mb-6 flex space-x-4">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search queries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="safe">Safe</option>
          <option value="malicious">Malicious</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)} History
          </h2>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : (
          <>
            <div className="divide-y divide-gray-200">
              {paginatedData.map((item) => (
                <div key={item.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {item.status === 'malicious' ? (
                        <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
                      ) : (
                        <CheckCircleIcon className="h-6 w-6 text-green-500" />
                      )}
                      <div>
                        <h3 className={`font-medium ${
                          item.status === 'malicious' ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {item.status === 'malicious' ? 'Malicious Query' : 'Safe Query'}
                        </h3>
                        <p className="text-sm text-gray-500">Confidence: {item.confidence}%</p>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      {item.timestamp}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 font-mono text-sm">
                    {item.query}
                  </div>

                  {item.type && (
                    <div className="mt-2 flex items-center">
                      <span className="text-xs font-medium px-2 py-1 bg-red-100 text-red-700 rounded">
                        {item.type}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(pageCount, p + 1))}
                  disabled={currentPage === pageCount}
                  className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default History;