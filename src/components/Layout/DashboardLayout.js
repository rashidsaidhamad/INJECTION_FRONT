// import React from 'react';
// import { Link, Outlet } from 'react-router-dom';
// import { HomeIcon, ClockIcon, ChartBarIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

// const DashboardLayout = () => {
//   return (
//     <div className="flex h-screen">
//       {/* Sidebar */}
//       <div className="w-64 bg-gray-800 text-white">
//         <div className="p-4">
//           <h2 className="text-2xl font-bold">SQL injection detection system using Machine learning</h2>
//         </div>
//         <nav className="mt-6">
//           <Link to="/dashboard" className="flex items-center px-6 py-3 hover:bg-gray-700">
//             <HomeIcon className="h-5 w-5 mr-3" />
//             Dashboard
//           </Link>
//           <Link to="/dashboard/history" className="flex items-center px-6 py-3 hover:bg-gray-700">
//             <ClockIcon className="h-5 w-5 mr-3" />
//             History
//           </Link>
//           <Link to="/dashboard/analytics" className="flex items-center px-6 py-3 hover:bg-gray-700">
//             <ChartBarIcon className="h-5 w-5 mr-3" />
//             Analytics
//           </Link>
//           <Link to="/dashboard/settings" className="flex items-center px-6 py-3 hover:bg-gray-700">
//             <Cog6ToothIcon className="h-5 w-5 mr-3" />
//             Settings
//           </Link>
//         </nav>
//       </div>
      
//       {/* Main Content */}
//       <div className="flex-1 overflow-auto">
//         <Outlet />
//       </div>
//     </div>
//   );
// };

// export default DashboardLayout;
import React, { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { 
  HomeIcon, 
  ShieldCheckIcon, 
  DocumentChartBarIcon, 
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ShieldExclamationIcon
} from '@heroicons/react/24/outline';
const DashboardLayout = () => {
    const navigate = useNavigate();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    // Clear all authentication data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.clear(); // Clear any other stored data
    
    // Close the confirmation modal
    setShowLogoutConfirm(false);
    
    // Redirect to login page with replace to prevent back navigation
    navigate('/login', { replace: true });
    
    // Force page reload to ensure clean state
    window.location.href = '/login';
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(true);
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white">
        <div className="p-4">
          <div className="flex items-center mb-2">
            <ShieldExclamationIcon className="w-6 h-6 text-blue-400 mr-2" />
            <h2 className="text-xl font-bold leading-tight">SQL Injection Detection</h2>
          </div>
          <p className="text-sm text-gray-400">ML-Powered Security System</p>
        </div>
        <nav className="mt-6">
          <Link to="/dashboard" className="flex items-center px-6 py-3 hover:bg-gray-700">
            <HomeIcon className="h-5 w-5 mr-3" />
            Overview
          </Link>
          <Link to="/dashboard/detection" className="flex items-center px-6 py-3 hover:bg-gray-700">
            <ShieldCheckIcon className="h-5 w-5 mr-3" />
            Detection Console
          </Link>
          <Link to="/dashboard/history" className="flex items-center px-6 py-3 hover:bg-gray-700">
            <ClipboardDocumentListIcon className="h-5 w-5 mr-3" />
            Threat History
          </Link>
          <Link to="/dashboard/analytics" className="flex items-center px-6 py-3 hover:bg-gray-700">
            <DocumentChartBarIcon className="h-5 w-5 mr-3" />
            ML Analytics
          </Link>
          <Link to="/dashboard/settings" className="flex items-center px-6 py-3 hover:bg-gray-700">
            <Cog6ToothIcon className="h-5 w-5 mr-3" />
            System Config
          </Link>
        </nav>
        {/* New User Profile Section */}
        <div className="border-t border-gray-700 p-4 mt-auto">
          <div className="flex items-center space-x-3">
            <UserCircleIcon className="h-10 w-10 text-gray-400" />
            <div className="flex-1">
              <h3 className="font-medium text-white">Admin User</h3>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <button
              onClick={confirmLogout}
              className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md mx-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Confirm Logout</h3>
              <p className="text-sm text-gray-600 mt-2">
                Are you sure you want to logout from the system?
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={cancelLogout}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;