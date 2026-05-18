import { useState, useEffect } from 'react';
import { ShieldAlert, Trash2, ExternalLink, ShieldCheck, Zap, AlertCircle, Search } from 'lucide-react';
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  return (
    <div className="space-y-12 max-w-7xl mx-auto pb-20">
      {/* Header section with background glow */}
      <div className="relative p-10 rounded-[40px] border border-white/5 bg-white/[0.01] overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full cyber-grid opacity-5 pointer-events-none" />
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#ff003c]/10 blur-[100px] rounded-full" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-[#ff003c] text-[10px] font-black uppercase tracking-[0.4em]">
              <AlertCircle className="w-4 h-4" />
              <span>High Priority Signal Monitoring</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none">
              Threat <span className="text-[#ff003c] drop-shadow-[0_0_20px_rgba(255,0,60,0.3)]">Intelligence</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl font-light">
              Aggregated cryptographic analysis of anomalous network packets and potential infiltration vectors.
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="glass-panel px-6 py-3 border-white/10 flex flex-col items-center">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Signals</span>
              <span className="text-2xl font-black text-white font-mono">{alerts.length}</span>
            </div>
            {alerts.length > 0 && (
              <button
                onClick={clearAlerts}
                className="flex items-center space-x-2 px-6 py-4 rounded-2xl bg-[#ff003c]/10 hover:bg-[#ff003c]/20 text-[#ff003c] transition-all border border-[#ff003c]/30 text-xs font-black uppercase tracking-widest active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
                <span>Purge Data</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {alerts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-32 flex flex-col items-center justify-center text-center space-y-8 border-dashed border-2 border-white/5"
        >
          <div className="relative">
            <div className="p-10 bg-[#00ff66]/10 rounded-full border border-[#00ff66]/20">
              <ShieldCheck className="w-20 h-20 text-[#00ff66] drop-shadow-[0_0_20px_rgba(0,255,102,0.4)]" />
            </div>
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0, 0.3, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute inset-0 border-4 border-[#00ff66] rounded-full"
            />
          </div>
          <div className="space-y-3">
            <h3 className="text-3xl font-black text-white tracking-tight uppercase">Signals Clear</h3>
            <p className="text-gray-500 max-w-md mx-auto font-medium">Neural engine reporting 0% threat probability across all monitored endpoints.</p>
          </div>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {alerts.map((alert, idx) => (
              <motion.div
                key={alert.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 50 }}
                className={cn(
                  "glass-panel group overflow-hidden border-l-0 p-0 transition-all duration-500",
                  alert.status === 'Resolved' ? "opacity-40 grayscale" : "hover:border-[#ff003c]/40 hover:shadow-[0_0_40px_rgba(255,0,60,0.1)]"
                )}
              >
                <div className="flex flex-col md:flex-row md:items-stretch">
                  {/* Side Indicator */}
                  <div className={cn(
                    "w-full md:w-2 min-h-[4px] md:min-h-full transition-colors duration-500",
                    alert.status === 'Resolved' ? "bg-green-500" :
                      alert.packet?.risk === 'Blocked' ? "bg-orange-500" : "bg-[#ff003c] shadow-[0_0_15px_#ff003c]"
                  )} />

                  <div className="flex-grow p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 relative">
                    {/* Background ID text */}
                    <div className="absolute right-10 bottom-0 text-white/[0.02] text-7xl font-black pointer-events-none select-none italic tracking-tighter">
                      SIGNAL_{idx + 100}
                    </div>

                    <div className="flex items-start space-x-6 relative z-10">
                      <div className={cn(
                        "p-5 rounded-2xl transition-all duration-500",
                        alert.status === 'Resolved' ? "bg-green-500/10 text-green-500" :
                          alert.packet?.risk === 'Blocked' ? "bg-orange-500/10 text-orange-500" :
                            "bg-[#ff003c]/10 text-[#ff003c] group-hover:bg-[#ff003c]/20"
                      )}>
                        <ShieldAlert className={cn("w-8 h-8", alert.status !== 'Resolved' && "animate-pulse")} />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <span className="text-[10px] font-mono font-bold text-gray-500 bg-white/5 px-2 py-1 rounded">{alert.timestamp}</span>
                          <div className={cn(
                            "text-[8px] px-3 py-1 rounded-full font-black uppercase tracking-[0.2em] border",
                            alert.status === 'Resolved' ? "bg-green-500/10 text-green-500 border-green-500/20" :
                              alert.packet?.risk === 'Blocked' ? "bg-orange-500/10 text-orange-500 border-orange-500/20" :
                                "bg-[#ff003c]/10 text-[#ff003c] border-[#ff003c]/20"
                          )}>
                            {alert.packet?.risk === 'Blocked' ? "Containment Active" : alert.status}
                          </div>
                        </div>

                        <h3 className="text-2xl font-black text-white tracking-tight group-hover:text-[#ff003c] transition-colors">
                          {alert.packet?.srcIp || 'Anonymous Node'}
                        </h3>

                        <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2">
                          <div className="flex items-center space-x-2">
                            <Zap className="w-3 h-3 text-[#ff003c]" />
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Type:</span>
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">{alert.packet?.threatType || 'Anomaly'}</span>
                          </div>
                          <div className="flex items-center space-x-2 border-l border-white/10 pl-6">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Proto:</span>
                            <span className="text-[10px] font-mono font-bold text-[#00f0ff]">{alert.packet?.protocol || 'N/A'}</span>
                          </div>
                          <div className="flex items-center space-x-2 border-l border-white/10 pl-6">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Port:</span>
                            <span className="text-[10px] font-mono font-bold text-white">{alert.packet?.port || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 relative z-10 shrink-0">
                      {alert.status !== 'Resolved' && (
                        <button
                          onClick={() => resolveAlert(alert.id)}
                          className="px-8 py-3 rounded-2xl bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/30 text-xs font-black uppercase tracking-widest transition-all active:scale-95"
                        >
                          De-escalate
                        </button>
                      )}
                      <button className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all border border-white/10 active:scale-95">
                        <Search className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
                {/* Scanline Effect on individual cards */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
