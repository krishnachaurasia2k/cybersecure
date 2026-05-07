import { useState, useEffect } from 'react';
import { Shield, ShieldAlert, ShieldCheck, Unlock, FileText, Activity, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

export default function DefenseHub() {
  const [blockedIps, setBlockedIps] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoDefense, setAutoDefense] = useState(true);

  const fetchDefenseData = async () => {
    try {
      const [resBlocked, resIncidents, resStatus] = await Promise.all([
        fetch('/api/responses'),
        fetch('/api/incidents'),
        fetch('/api/defense/status')
      ]);
      
      if (resBlocked.ok) setBlockedIps(await resBlocked.json());
      if (resIncidents.ok) setIncidents(await resIncidents.json());
      if (resStatus.ok) {
        const status = await resStatus.json();
        setAutoDefense(status.enabled);
      }
    } catch (err) {
      console.error("Failed to fetch defense data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDefenseData();
    const interval = setInterval(fetchDefenseData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleUnblock = async (ip) => {
    try {
      const response = await fetch('/api/responses/unblock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip })
      });
      if (response.ok) {
        fetchDefenseData();
      }
    } catch (err) {
      console.error("Failed to unblock IP:", err);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center space-x-3">
            <Shield className="w-8 h-8 text-[#00f0ff] glow-text-primary" />
            <span>Automated Defense Hub</span>
          </h1>
          <p className="text-gray-400">Manage real-time automated responses and incident reports.</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className={cn(
            "flex items-center space-x-2 px-4 py-2 rounded-full border transition-all duration-500",
            autoDefense 
              ? "bg-[#00f0ff]/10 border-[#00f0ff]/30 text-[#00f0ff] glow-box-primary" 
              : "bg-gray-500/10 border-white/10 text-gray-400"
          )}>
            <Activity className={cn("w-4 h-4", autoDefense && "animate-pulse")} />
            <span className="text-sm font-bold uppercase tracking-wider">
              {autoDefense ? "System Active" : "System Paused"}
            </span>
          </div>
          <button 
            onClick={async () => {
              const newState = !autoDefense;
              try {
                const res = await fetch('/api/defense/toggle', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ enabled: newState })
                });
                if (res.ok) {
                  setAutoDefense(newState);
                }
              } catch (err) {
                console.error("Failed to toggle auto-defense:", err);
              }
            }}
            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-semibold transition-all"
          >
            {autoDefense ? "Pause Auto-Defense" : "Resume Auto-Defense"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Blocked IPs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-[#ff003c]" />
              <span>Active Network Blocks</span>
            </h2>
            <span className="text-xs font-mono text-gray-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded">
              {blockedIps.length} Targets
            </span>
          </div>

          <div className="space-y-4">
            <AnimatePresence mode='popLayout'>
              {blockedIps.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass-panel p-12 flex flex-col items-center justify-center text-center space-y-4 border-dashed border-2"
                >
                  <ShieldCheck className="w-12 h-12 text-green-500/50" />
                  <p className="text-gray-500">No active blocks. Network status clear.</p>
                </motion.div>
              ) : (
                blockedIps.map((block) => (
                  <motion.div
                    key={block.ip}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="glass-panel p-5 flex items-center justify-between group hover:border-[#ff003c]/30 transition-all border-l-4 border-l-[#ff003c]"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-[#ff003c]/10 rounded-lg text-[#ff003c]">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-lg font-mono font-bold text-white">{block.ip}</h4>
                        <div className="flex items-center space-x-3 text-xs text-gray-500 mt-1">
                          <span className="text-[#ff003c] font-semibold">{block.reason}</span>
                          <span>•</span>
                          <span>Blocked at {block.timestamp}</span>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleUnblock(block.ip)}
                      className="flex items-center space-x-2 px-3 py-1.5 rounded-md bg-white/5 hover:bg-[#00f0ff]/20 text-gray-400 hover:text-[#00f0ff] border border-white/10 hover:border-[#00f0ff]/30 transition-all text-sm group-hover:opacity-100 opacity-0 md:opacity-100"
                    >
                      <Unlock className="w-4 h-4" />
                      <span>Unblock</span>
                    </button>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Column: Incident Reports */}
        <div className="space-y-6">
          <div className="flex items-center px-2">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <FileText className="w-5 h-5 text-[#00f0ff]" />
              <span>Incident Logs</span>
            </h2>
          </div>

          <div className="glass-panel overflow-hidden">
            <div className="p-4 bg-white/5 border-b border-white/10">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Recent Reports</span>
            </div>
            <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto">
              {incidents.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-sm italic">
                  No incident reports generated yet.
                </div>
              ) : (
                incidents.map((report) => (
                  <div key={report.id} className="p-4 hover:bg-white/5 transition-colors cursor-pointer group">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-white group-hover:text-[#00f0ff] transition-colors truncate max-w-[180px]">
                          {report.name}
                        </p>
                        <p className="text-[10px] text-gray-500 font-mono">
                          {new Date(report.timestamp * 1000).toLocaleString()}
                        </p>
                      </div>
                      <FileText className="w-4 h-4 text-gray-600 group-hover:text-[#00f0ff]" />
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-4 bg-white/5 border-t border-white/10 text-center">
              <button className="text-xs font-bold text-[#00f0ff] hover:underline uppercase tracking-tighter">
                View All Reports
              </button>
            </div>
          </div>

          {/* Quick Stats Overlay */}
          <div className="glass-panel p-6 bg-gradient-to-br from-[#00f0ff]/5 to-transparent border-[#00f0ff]/10">
            <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-widest">Auto-Response Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-xs text-gray-400">Total Interceptions</span>
                <span className="text-2xl font-bold text-white font-mono">{incidents.length}</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-[#00f0ff] w-2/3 glow-box-primary"></div>
              </div>
              <p className="text-[10px] text-gray-500 italic">
                System is currently operating with 99.8% accuracy in threat classification.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
