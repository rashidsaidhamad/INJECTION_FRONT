import React, { useState, useEffect } from 'react';
import { 
  ShieldCheckIcon, 
  ExclamationTriangleIcon, 
  ChartBarIcon,
  ClockIcon,
  EyeIcon,
  DocumentMagnifyingGlassIcon,
  CpuChipIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  PlayIcon,
  BellIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const [currentQPM, setCurrentQPM] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [lastNotificationTime, setLastNotificationTime] = useState(null);

  // Simulate real-time query monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate random query rate (queries per minute)
      const newQPM = Math.floor(Math.random() * 150) + 50; // Random between 50-200
      setCurrentQPM(newQPM);

      // Check if threshold exceeded and enough time passed since last notification
      const now = new Date();
      const timeSinceLastNotification = lastNotificationTime 
        ? (now - lastNotificationTime) / 1000 / 60 // minutes
        : 10; // If no previous notification, allow immediate trigger

      if (newQPM >= 100 && timeSinceLastNotification >= 1) { // At least 1 minute between notifications
        const notification = {
          id: Date.now(),
          type: 'high-traffic',
          title: 'High Query Traffic Alert',
          message: `${newQPM} queries per minute detected - exceeding threshold of 100 QPM`,
          timestamp: now.toLocaleTimeString(),
          severity: newQPM >= 150 ? 'critical' : 'warning'
        };
        
        setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Keep last 5 notifications
        setLastNotificationTime(now);

        // Browser notification if permission granted
        if (Notification.permission === 'granted') {
          new Notification('SQL Security Alert', {
            body: notification.message,
            icon: '/favicon.ico'
          });
        }
      }
    }, 5000); // Check every 5 seconds for demo purposes

    return () => clearInterval(interval);
  }, [lastNotificationTime]);

  // Request notification permission on component mount
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };
  const stats = [
    {
      title: "Database Queries Monitored",
      value: "12,847",
      change: "+12%",
      trend: "up",
      icon: DocumentMagnifyingGlassIcon,
      color: "blue",
      description: "Total SQL queries processed today"
    },
    {
      title: "Current Query Rate",
      value: `${currentQPM}/min`,
      change: currentQPM >= 100 ? "ALERT" : "Normal",
      trend: currentQPM >= 100 ? "alert" : "up",
      icon: ClockIcon,
      color: currentQPM >= 100 ? "red" : "green",
      description: `Real-time queries per minute (Threshold: 100)`
    },
    {
      title: "Security Threats Blocked",
      value: "234",
      change: "-8%",
      trend: "down",
      icon: ExclamationTriangleIcon,
      color: "red",
      description: "Malicious injections prevented"
    },
    {
      title: "System Protection Rate",
      value: "98.7%",
      change: "+0.3%",
      trend: "up",
      icon: ShieldCheckIcon,
      color: "green",
      description: "ML model accuracy performance"
    }
  ];

  const recentThreats = [
    { 
      id: 1, 
      query: "SELECT * FROM users WHERE id = 1 OR 1=1--", 
      type: "Boolean-based SQLi", 
      severity: "High", 
      time: "2 min ago",
      source: "192.168.1.45",
      database: "user_auth_db"
    },
    { 
      id: 2, 
      query: "SELECT * FROM products UNION SELECT username,password FROM admin_users", 
      type: "Union-based SQLi", 
      severity: "Critical", 
      time: "15 min ago",
      source: "10.0.0.23",
      database: "ecommerce_db"
    },
    { 
      id: 3, 
      query: "SELECT * FROM orders WHERE date = '2023-01-01'; DROP TABLE users;--", 
      type: "Stacked Queries", 
      severity: "Critical", 
      time: "1 hour ago",
      source: "172.16.0.8",
      database: "orders_db"
    },
    { 
      id: 4, 
      query: "SELECT * FROM items WHERE name LIKE '%' + (SELECT TOP 1 password FROM admin) + '%'", 
      type: "Blind SQLi", 
      severity: "High", 
      time: "2 hours ago",
      source: "203.0.113.42",
      database: "inventory_db"
    }
  ];

  const quickActions = [
    { title: "Security Scan Console", icon: PlayIcon, action: "detection", color: "bg-blue-600 hover:bg-blue-700" },
    { title: "Generate Security Report", icon: ChartBarIcon, action: "analytics", color: "bg-green-600 hover:bg-green-700" },
    { title: "Audit Log Review", icon: ClockIcon, action: "history", color: "bg-purple-600 hover:bg-purple-700" },
    { title: "System Health Monitor", icon: EyeIcon, action: "monitor", color: "bg-orange-600 hover:bg-orange-700" }
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Real-time Notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg shadow-lg border-l-4 bg-white max-w-sm animate-pulse ${
                notification.severity === 'critical'
                  ? 'border-red-500'
                  : 'border-yellow-500'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  <BellIcon className={`h-5 w-5 mr-2 mt-0.5 ${
                    notification.severity === 'critical' ? 'text-red-600' : 'text-yellow-600'
                  }`} />
                  <div>
                    <h4 className={`font-semibold text-sm ${
                      notification.severity === 'critical' ? 'text-red-800' : 'text-yellow-800'
                    }`}>
                      {notification.title}
                    </h4>
                    <p className="text-xs text-gray-600 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {notification.timestamp}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => dismissNotification(notification.id)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">System Administrator Dashboard</h1>
        <p className="text-gray-600">SQL Injection Detection & Security Management Console</p>
        <div className="mt-4 flex items-center space-x-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Security Engine: Online</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Last Update: {new Date().toLocaleTimeString()}</span>
          </div>
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${currentQPM >= 100 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
            <span className={`text-sm font-medium ${currentQPM >= 100 ? 'text-red-600' : 'text-gray-600'}`}>
              Query Rate: {currentQPM}/min {currentQPM >= 100 && '⚠️ HIGH TRAFFIC'}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className={`text-2xl font-bold text-${stat.color}-600 mt-2`}>{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
              </div>
              <div className={`p-3 rounded-full bg-${stat.color}-100`}>
                <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {stat.trend === 'up' ? (
                <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
              ) : stat.trend === 'alert' ? (
                <BellIcon className="h-4 w-4 text-red-500 mr-1 animate-pulse" />
              ) : (
                <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${
                stat.trend === 'up' ? 'text-green-600' : 
                stat.trend === 'alert' ? 'text-red-600' : 
                'text-red-600'
              }`}>
                {stat.change}
              </span>
              {stat.trend !== 'alert' && (
                <span className="text-sm text-gray-500 ml-1">from last week</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions & Recent Threats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Administrative Actions */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Administrative Actions</h2>
          <div className="space-y-3">
            {quickActions.map((action, index) => (
              <button
                key={index}
                className={`w-full flex items-center p-3 ${action.color} text-white rounded-lg transition-colors`}
              >
                <action.icon className="h-5 w-5 mr-3" />
                {action.title}
              </button>
            ))}
          </div>
        </div>

        {/* Security Incident Log */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Security Incident Log</h2>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Export Log</button>
          </div>
          <div className="space-y-4">
            {recentThreats.map((threat) => (
              <div key={threat.id} className="border-l-4 border-red-500 pl-4 py-3 bg-red-50 rounded-r-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate max-w-md mb-2">
                      {threat.query}
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                      <div>
                        <span className="font-medium">Source IP:</span> {threat.source}
                      </div>
                      <div>
                        <span className="font-medium">Target DB:</span> {threat.database}
                      </div>
                    </div>
                    <div className="flex items-center mt-2 space-x-4">
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                        {threat.type}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        threat.severity === 'Critical' 
                          ? 'bg-red-200 text-red-900' 
                          : 'bg-orange-200 text-orange-900'
                      }`}>
                        {threat.severity} Risk
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-500">{threat.time}</span>
                    <div className="mt-1">
                      <button className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200">
                        Block IP
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Real-time Query Monitor */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
            <ClockIcon className="h-5 w-5 mr-2 text-blue-600" />
            Real-time Query Monitor
          </h3>
          <div className="space-y-4">
            <div className="text-center">
              <div className={`text-4xl font-bold mb-2 ${currentQPM >= 100 ? 'text-red-600' : 'text-green-600'}`}>
                {currentQPM}
              </div>
              <div className="text-sm text-gray-600">Queries per Minute</div>
              <div className={`mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                currentQPM >= 150 ? 'bg-red-100 text-red-800' :
                currentQPM >= 100 ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {currentQPM >= 150 ? 'CRITICAL LOAD' :
                 currentQPM >= 100 ? 'HIGH TRAFFIC' :
                 'NORMAL TRAFFIC'}
              </div>
            </div>
            
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Threshold Status:</span>
                <span className={`text-sm font-medium ${currentQPM >= 100 ? 'text-red-600' : 'text-green-600'}`}>
                  {currentQPM >= 100 ? 'EXCEEDED' : 'NORMAL'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    currentQPM >= 150 ? 'bg-red-600' :
                    currentQPM >= 100 ? 'bg-yellow-500' : 
                    'bg-green-600'
                  }`}
                  style={{width: `${Math.min((currentQPM / 200) * 100, 100)}%`}}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0</span>
                <span className="text-red-600 font-medium">100 (Threshold)</span>
                <span>200+</span>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Notifications:</h4>
              {notifications.length === 0 ? (
                <p className="text-xs text-gray-500">No recent alerts</p>
              ) : (
                <div className="space-y-1">
                  {notifications.slice(0, 3).map((notif) => (
                    <div key={notif.id} className="text-xs text-gray-600 border-l-2 border-gray-300 pl-2">
                      <span className="font-medium">{notif.timestamp}:</span> {notif.message.substring(0, 50)}...
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Security Engine Performance */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Security Engine Performance</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Detection Precision</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                  <div className="bg-green-600 h-2 rounded-full" style={{width: '96%'}}></div>
                </div>
                <span className="text-sm font-medium">96%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Threat Recall Rate</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                  <div className="bg-blue-600 h-2 rounded-full" style={{width: '94%'}}></div>
                </div>
                <span className="text-sm font-medium">94%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Overall F1-Score</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                  <div className="bg-purple-600 h-2 rounded-full" style={{width: '95%'}}></div>
                </div>
                <span className="text-sm font-medium">95%</span>
              </div>
            </div>
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <div className="text-sm text-green-800">
                <span className="font-medium">Engine Status:</span> Optimal Performance
              </div>
              <div className="text-xs text-green-600 mt-1">
                Last model update: 2 hours ago
              </div>
            </div>
          </div>
        </div>

        {/* Infrastructure Status */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Infrastructure Status</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Security API Gateway</span>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium">Online (230ms)</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Database Connections</span>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium">All Connected (8/8)</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">ML Security Engine</span>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium">Active & Learning</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">System Resource Usage</span>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium">CPU: 67% | RAM: 45%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Log Storage</span>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium">85% Available (2.4TB)</span>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-800">
                <span className="font-medium">Uptime:</span> 99.8% (30 days)
              </div>
              <div className="text-xs text-blue-600 mt-1">
                Next maintenance window: Sunday 2:00 AM
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;