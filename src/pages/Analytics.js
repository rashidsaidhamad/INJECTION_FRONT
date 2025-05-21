import React from 'react';
import { 
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ChartBarIcon 
} from '@heroicons/react/24/outline';

const Analytics = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>

      {/* Statistics Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6"> Statistics</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Total Scans */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-800 text-sm font-medium">Total Scans</p>
                <h3 className="text-2xl font-bold text-blue-900">1,248</h3>
              </div>
              <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                <MagnifyingGlassIcon className="h-6 w-6" />
              </div>
            </div>
            <p className="mt-2 text-blue-700 text-xs">+12.5% from last week</p>
          </div>
          
          {/* SQL Injections */}
          <div className="bg-red-50 p-4 rounded-lg border border-red-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-800 text-sm font-medium">SQL Injections</p>
                <h3 className="text-2xl font-bold text-red-900">328</h3>
              </div>
              <div className="p-2 rounded-full bg-red-100 text-red-600">
                <ExclamationTriangleIcon className="h-6 w-6" />
              </div>
            </div>
            <p className="mt-2 text-red-700 text-xs">+5.3% from last week</p>
          </div>
          
          {/* Safe Queries */}
          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-800 text-sm font-medium">Safe Queries</p>
                <h3 className="text-2xl font-bold text-green-900">920</h3>
              </div>
              <div className="p-2 rounded-full bg-green-100 text-green-600">
                <CheckCircleIcon className="h-6 w-6" />
              </div>
            </div>
            <p className="mt-2 text-green-700 text-xs">+8.7% from last week</p>
          </div>
          
          {/* Accuracy */}
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-800 text-sm font-medium">Accuracy</p>
                <h3 className="text-2xl font-bold text-purple-900">98.7%</h3>
              </div>
              <div className="p-2 rounded-full bg-purple-100 text-purple-600">
                <ChartBarIcon className="h-6 w-6" />
              </div>
            </div>
            <p className="mt-2 text-purple-700 text-xs">+0.8% from last week</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;