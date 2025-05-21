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
import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { 
  HomeIcon, 
  ShieldCheckIcon, 
  DocumentChartBarIcon, 
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  UserCircleIcon,
   ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { ShieldAlert } from 'lucide-react'; // import a relevant icon
const DashboardLayout = () => {
    const navigate = useNavigate();

  const handleLogout = () => {
    // Add logout logic here
    navigate('/');
  };
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white">
        <div className="p-4">
             <ShieldAlert className="w-6 h-6 text-white" />
          <h2 className="text-xl font-bold leading-tight">SQL Injection Detection System</h2>
          <p className="text-sm text-gray-400 mt-1">ML-Powered Security</p>
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
              <p className="text-sm text-gray-400">admin@deepsite.com</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-4 w-full flex items-center justify-center px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
            Logout
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;