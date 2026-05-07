import { useState, useEffect } from 'react';
import { ShieldAlert, Trash2, ExternalLink, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

export default function ThreatAlerts() {
  const [alerts, setAlerts] = useState(() => {
    const saved = localStorage.getItem('persistent-threat-alerts');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const handleThreat = (e) => {
      const newAlert = {
        id: Date.now() + Math.random(),
        packet: e.detail,
        timestamp: new Date().toLocaleString(),
        status: 'Unresolved'
      };
      
      setAlerts(prev => {
        const updated = [newAlert, ...prev].slice(0, 100);
        localStorage.setItem('persistent-threat-alerts', JSON.stringify(updated));
        return updated;
      });
    };

    window.addEventListener('threat-alert', handleThreat);
    return () => window.removeEventListener('threat-alert', handleThreat);
  }, []);

  const clearAlerts = () => {
    setAlerts([]);
    localStorage.removeItem('persistent-threat-alerts');
  };

  const resolveAlert = (id) => {
    setAlerts(prev => {
      const updated = prev.map(a => a.id === id ? { ...a, status: 'Resolved' } : a);
      localStorage.setItem('persistent-threat-alerts', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center space-x-3">
            <ShieldAlert className="w-8 h-8 text-[#ff003c]" />
            <span>Threat Intelligence Center</span>
          </h1>
          <p className="text-gray-400">Detailed analysis and management of detected network threats.</p>
        </div>
        
        {alerts.length > 0 && (
          <button 
            onClick={clearAlerts}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-[#ff003c] transition-all border border-white/10"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {alerts.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-20 flex flex-col items-center justify-center text-center space-y-4"
        >
          <div className="p-6 bg-green-500/10 rounded-full border border-green-500/20">
            <ShieldCheck className="w-16 h-16 text-green-500" />
          </div>
          <h3 className="text-xl font-bold text-white">No Threats Detected</h3>
          <p className="text-gray-400 max-w-md">Your network is currently safe. Any suspicious activity detected by the AI will appear here for investigation.</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence>
            {alerts.map((alert) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                layout
                className={cn(
                  "glass-panel border-l-4 p-6 flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0 transition-all",
                  alert.status === 'Resolved' ? "border-l-green-500 opacity-60" : 
                  alert.packet?.risk === 'Blocked' ? "border-l-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.2)]" :
                  "border-l-[#ff003c] glow-box-danger-sm"
                )}
              >
                <div className="flex items-start space-x-4">
                  <div className={cn(
                    "p-3 rounded-xl",
                    alert.status === 'Resolved' ? "bg-green-500/10 text-green-500" : 
                    alert.packet?.risk === 'Blocked' ? "bg-orange-500/10 text-orange-500" :
                    "bg-[#ff003c]/10 text-[#ff003c]"
                  )}>
                    <ShieldAlert className={cn("w-6 h-6", alert.status !== 'Resolved' && "animate-pulse")} />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-mono text-gray-400">{alert.timestamp}</span>
                      <span className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider",
                        alert.status === 'Resolved' ? "bg-green-500/20 text-green-500" : 
                        alert.packet?.risk === 'Blocked' ? "bg-orange-500/20 text-orange-500" :
                        "bg-[#ff003c]/20 text-[#ff003c]"
                      )}>
                        {alert.packet?.risk === 'Blocked' ? "Blocked" : alert.status}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white mt-1">
                      Suspicious Activity from {alert.packet?.srcIp || 'Unknown IP'}
                    </h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-400">
                      <p>Protocol: <span className="text-white font-mono">{alert.packet?.protocol || 'N/A'}</span></p>
                      <p>Target Port: <span className="text-white font-mono">{alert.packet?.port || 'N/A'}</span></p>
                      <p>Threat Type: <span className="text-[#ff003c] font-semibold">{alert.packet?.threatType || 'Anomalous Traffic'}</span></p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {alert.status !== 'Resolved' && (
                    <button 
                      onClick={() => resolveAlert(alert.id)}
                      className="px-4 py-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/30 text-sm font-semibold transition-all"
                    >
                      Mark Resolved
                    </button>
                  )}
                  <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 transition-all border border-white/10">
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
