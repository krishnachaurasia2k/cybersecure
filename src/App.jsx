import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import PacketView from './pages/PacketView';
import ThreatCharts from './pages/ThreatCharts';
import ThreatAlerts from './pages/ThreatAlerts';
import DefenseHub from './pages/DefenseHub';
import HoneypotLab from './pages/HoneypotLab';
import Login from './pages/Login';
import AlertNotification from './components/AlertNotification';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Absolute protection: If not authenticated, the dashboard routes don't even exist.
  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <>
      <AlertNotification />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="packets" element={<PacketView />} />
          <Route path="charts" element={<ThreatCharts />} />
          <Route path="alerts" element={<ThreatAlerts />} />
          <Route path="defense" element={<DefenseHub />} />
          <Route path="honeypot" element={<HoneypotLab />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
