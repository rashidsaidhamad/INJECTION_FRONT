import React, { useState, useEffect } from 'react';
import { CogIcon, ShieldCheckIcon, BellIcon, UserIcon, CheckIcon, ClockIcon, ServerIcon } from '@heroicons/react/24/outline';
import api from '../services/api';

const Settings = () => {
  const [settings, setSettings] = useState({
    notifications: true,
    autoScan: false,
    confidenceThreshold: 80,
    emailAlerts: true,
    logRetention: 30,
    maxQueryLength: 10000,
    blockSuspiciousIPs: true,
    enableRealTimeMonitoring: true
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  const [serverTime, setServerTime] = useState('');
  const [serverTimeFormatted, setServerTimeFormatted] = useState('');
  const [clientTime, setClientTime] = useState('');
  const [timeDifference, setTimeDifference] = useState(0);
  const [systemInfo, setSystemInfo] = useState({
    backend_version: '',
    database: '',
    models: [],
    uptime: '',
    last_restart: ''
  });

  // Load settings from backend
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        // Fetch settings from the backend
        const response = await api.get('/settings');
        const backendSettings = response.data;
        
        // Update settings state
        setSettings({
          notifications: backendSettings.notifications || true,
          autoScan: backendSettings.autoScan || false,
          confidenceThreshold: backendSettings.confidenceThreshold || 80,
          emailAlerts: backendSettings.emailAlerts || true,
          logRetention: backendSettings.logRetention || 30,
          maxQueryLength: backendSettings.maxQueryLength || 10000,
          blockSuspiciousIPs: backendSettings.blockSuspiciousIPs || true,
          enableRealTimeMonitoring: backendSettings.enableRealTimeMonitoring || true
        });
        
        // Set server time
        if (backendSettings.server_time) {
          const serverTimeObj = new Date(backendSettings.server_time);
          setServerTime(backendSettings.server_time);
          setServerTimeFormatted(serverTimeObj.toLocaleString());
          
          // Calculate time difference between client and server
          const clientTimeObj = new Date();
          setClientTime(clientTimeObj.toLocaleString());
          setTimeDifference(Math.abs(clientTimeObj - serverTimeObj) / 1000); // Difference in seconds
        }
        
        // Set system info
        if (backendSettings.system_info) {
          setSystemInfo(backendSettings.system_info);
        }
        
        console.log('Settings loaded from backend');
      } catch (error) {
        console.error('Failed to load settings:', error);
        setError('Failed to load settings. Using default values.');
        
        // Set client time as fallback
        const clientTimeObj = new Date();
        setClientTime(clientTimeObj.toLocaleString());
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
    
    // Update client time every second
    const timer = setInterval(() => {
      setClientTime(new Date().toLocaleString());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSaved(false);
    
    try {
      // Save settings to backend
      const response = await api.put('/settings', settings);
      
      // Update server time from response
      if (response.data.settings && response.data.settings.server_time) {
        const serverTimeObj = new Date(response.data.settings.server_time);
        setServerTime(response.data.settings.server_time);
        setServerTimeFormatted(serverTimeObj.toLocaleString());
        
        // Recalculate time difference
        const clientTimeObj = new Date();
        setTimeDifference(Math.abs(clientTimeObj - serverTimeObj) / 1000);
      }
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setError('Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <CogIcon className="h-8 w-8 mr-2 text-blue-600" />
          Settings
        </h1>
        <p className="text-gray-600">Configure your SQL injection detection preferences</p>
      </div>

      <div className="space-y-6">
        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}
        
        {saved && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckIcon className="h-5 w-5 text-green-600 mr-2" />
              <p className="text-green-600">Settings saved successfully!</p>
            </div>
          </div>
        )}

        {/* Detection Settings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <ShieldCheckIcon className="h-6 w-6 mr-2 text-blue-600" />
            Detection Settings
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Auto-scan on paste</label>
                <p className="text-sm text-gray-500">Automatically analyze queries when pasted</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoScan}
                  onChange={(e) => updateSetting('autoScan', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confidence Threshold ({settings.confidenceThreshold}%)
              </label>
              <input
                type="range"
                min="50"
                max="99"
                value={settings.confidenceThreshold}
                onChange={(e) => updateSetting('confidenceThreshold', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>50% (Low)</span>
                <span>75% (Medium)</span>
                <span>99% (High)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <BellIcon className="h-6 w-6 mr-2 text-blue-600" />
            Notifications
          </h2>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Email notifications</label>
              <p className="text-sm text-gray-500">Receive alerts for high-risk detections</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={(e) => updateSetting('notifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {/* Additional Detection Settings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <ShieldCheckIcon className="h-6 w-6 mr-2 text-blue-600" />
            Advanced Detection
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Query Length
              </label>
              <input
                type="number"
                min="1000"
                max="50000"
                value={settings.maxQueryLength}
                onChange={(e) => updateSetting('maxQueryLength', parseInt(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">Maximum characters allowed in a single query</p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Block Suspicious IPs</label>
                <p className="text-sm text-gray-500">Automatically block IPs with repeated malicious attempts</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.blockSuspiciousIPs}
                  onChange={(e) => updateSetting('blockSuspiciousIPs', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Real-time Monitoring</label>
                <p className="text-sm text-gray-500">Enable continuous threat monitoring dashboard</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enableRealTimeMonitoring}
                  onChange={(e) => updateSetting('enableRealTimeMonitoring', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <UserIcon className="h-6 w-6 mr-2 text-blue-600" />
            Data Management
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Log Retention Period ({settings.logRetention} days)
              </label>
              <input
                type="range"
                min="7"
                max="365"
                value={settings.logRetention}
                onChange={(e) => updateSetting('logRetention', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>7 days</span>
                <span>90 days</span>
                <span>365 days</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">How long to keep detection logs and analysis data</p>
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <UserIcon className="h-6 w-6 mr-2 text-blue-600" />
            Account
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="your.email@example.com"
                defaultValue="admin@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your organization"
                defaultValue="Security Team"
              />
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <ServerIcon className="h-6 w-6 mr-2 text-blue-600" />
            System Information
          </h2>
          
          <div className="space-y-4">
            {/* Server Time */}
            <div className="border-b pb-4">
              <h3 className="text-md font-medium mb-3 flex items-center">
                <ClockIcon className="h-5 w-5 mr-2 text-gray-600" />
                Time Synchronization
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Server Time (UTC):</p>
                  <p className="text-sm text-gray-600">{serverTimeFormatted || 'Unavailable'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Client Time (Local):</p>
                  <p className="text-sm text-gray-600">{clientTime}</p>
                </div>
              </div>
              
              {timeDifference > 60 && (
                <div className="mt-2 bg-yellow-50 p-2 rounded text-sm text-yellow-800">
                  <p className="font-medium">Time Difference Warning</p>
                  <p>Server and client times differ by approximately {Math.round(timeDifference / 60)} minutes.</p>
                </div>
              )}
            </div>
            
            {/* System Details */}
            <div>
              <h3 className="text-md font-medium mb-3">System Details</h3>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Backend Version:</span>
                  <span className="text-sm font-medium">{systemInfo.backend_version || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Database Type:</span>
                  <span className="text-sm font-medium">{systemInfo.database || 'SQLite'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Active Models:</span>
                  <span className="text-sm font-medium">{systemInfo.models ? systemInfo.models.join(', ') : 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">System Uptime:</span>
                  <span className="text-sm font-medium">{systemInfo.uptime || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Last Restart:</span>
                  <span className="text-sm font-medium">
                    {systemInfo.last_restart ? new Date(systemInfo.last_restart).toLocaleString() : 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center disabled:bg-gray-400"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <CogIcon className="h-5 w-5 mr-2" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
