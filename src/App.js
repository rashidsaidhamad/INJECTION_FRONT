import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import DashboardLayout from './components/Layout/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Detection from './pages/Detection';  
import History from './pages/History';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="detection" element={<Detection />} />
          <Route path="history" element={<History />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;