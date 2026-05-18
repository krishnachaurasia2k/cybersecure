import { useState, useEffect } from 'react';
import { Activity, ShieldAlert, Wifi, ArrowDownUp, Shield, Zap, CheckCircle2, Globe, Lock, Cpu, Database, Network } from 'lucide-react';
import StatCard from '../components/StatCard';
import JarvisHUD from '../components/JarvisHUD';
import CyberCore from '../components/CyberCore';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [stats, setStats] = useState({
    totalPackets: { value: 0, prev: 0 },
    tcpTraffic: { value: 0, prev: 0 },
    udpTraffic: { value: 0, prev: 0 },
    threatAlerts: { value: 0, prev: 0 }
  });

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    const handleStatsUpdate = (e) => {
      const data = e.detail;
      setStats(prev => ({
        totalPackets: { value: data.totalPackets, prev: prev.totalPackets.value },
        tcpTraffic: { value: data.tcpTraffic, prev: prev.tcpTraffic.value },
        udpTraffic: { value: data.udpTraffic, prev: prev.udpTraffic.value },
        threatAlerts: { value: data.threatAlerts, prev: prev.threatAlerts.value }
      }));
    };
    window.addEventListener('stats-update', handleStatsUpdate);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('stats-update', handleStatsUpdate);
    };
  }, []);

  const fetchAuditLogs = async () => {
    try {
      // Use responses endpoint which has the actual forensic data
      const res = await fetch('http://127.0.0.1:5001/api/responses');
      const data = await res.json();
      setAuditLogs(data);
      setShowAuditLogs(true);
    } catch (err) {
      console.error("Failed to fetch security vault logs", err);
    }
  };

  return (
    <div className="space-y-20 pb-32 relative">
      {/* Audit Logs Modal (Improved) */}
      <AnimatePresence>
        {showAuditLogs && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-3xl flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              className="w-full max-w-5xl h-[80vh] glass-card border-white/10 flex flex-col shadow-[0_0_100px_rgba(0,0,0,1)]"
            >
              <div className="hud-corner top-0 left-0 border-t-2 border-l-2" />
              <div className="hud-corner top-0 right-0 border-t-2 border-r-2" />
              
              <div className="px-10 py-10 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                    <Lock className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-4xl font-black text-white tracking-tighter uppercase">Security Vault</h2>
                    <p className="text-[10px] text-primary font-black uppercase tracking-[0.4em] mt-1 opacity-60">Level Alpha Clearance Required</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAuditLogs(false)}
                  className="w-16 h-16 hover:bg-white/5 rounded-2xl transition-all text-white/20 hover:text-white flex items-center justify-center border border-white/5"
                >
                  <Activity className="w-8 h-8 rotate-45" />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-10 space-y-6 custom-scrollbar">
                {auditLogs.length > 0 ? auditLogs.map((log, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group p-8 glass-card border-white/5 hover:border-primary/40 transition-all bg-white/[0.02]"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <div className="px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-danger/20 text-danger border border-danger/30">
                          {log.status || 'BLOCKED'}
                        </div>
                        <span className="text-white font-black text-xl tracking-tighter uppercase">{log.reason || 'SENSITIVE_SIGNAL'}</span>
                      </div>
                      <span className="text-[10px] text-white/30 font-mono bg-white/5 px-3 py-1 rounded-full border border-white/5">{log.timestamp}</span>
                    </div>
                    <p className="text-gray-400 text-lg font-light leading-relaxed mb-8">
                      Hostile entity at <span className="text-white font-mono font-bold">{log.ip}</span> was successfully neutralized and blacklisted from core infrastructure. 
                    </p>
                    <div className="flex gap-6">
                      <div className="flex items-center space-x-2 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                        <Shield className="w-4 h-4 text-primary" />
                        <span className="text-[10px] text-white/40 font-mono uppercase">Node: NEURAL_CORE_ALPHA</span>
                      </div>
                      <div className="flex items-center space-x-2 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                        <Activity className="w-4 h-4 text-purple" />
                        <span className="text-[10px] text-white/40 font-mono uppercase">Protocol: AUTOMATED_CONTAINMENT</span>
                      </div>
                    </div>
                  </motion.div>
                )) : (
                  <div className="h-full flex flex-col items-center justify-center opacity-10">
                    <Shield className="w-32 h-32 mb-8 animate-pulse" />
                    <span className="text-xl font-black uppercase tracking-[1em]">Vault Empty</span>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section (Vastly Improved) */}
      <section className="relative min-h-[600px] flex items-center justify-center px-6">
        <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
          
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:col-span-7 space-y-10"
          >
            <div className="space-y-4">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center space-x-3 px-4 py-2 rounded-full bg-success/10 border border-success/20 text-success text-[10px] font-black uppercase tracking-[0.4em]"
              >
                <div className="w-2 h-2 rounded-full bg-success animate-pulse shadow-[0_0_10px_#00ff66]" />
                <span>Neural Core v4.0 Online</span>
              </motion.div>
              
              <h1 className="text-7xl md:text-[10rem] font-black text-white leading-[0.8] tracking-tighter drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                AUTONOMOUS<br />
                <span className="text-gradient-cyan glow-text-primary">CYBER</span> <span className="text-gradient-purple">DEFENSE</span>
              </h1>
            </div>

            <p className="text-gray-400 text-xl md:text-2xl font-light leading-relaxed max-w-2xl">
              Next-generation neural architecture monitoring ingress signals with zero-latency containment protocols.
            </p>

            <div className="flex flex-wrap gap-6 pt-4">
              <button className="btn-primary flex items-center space-x-3 group">
                <Globe className="w-4 h-4 animate-spin-slow" />
                <span>Initialize Global Matrix</span>
              </button>
              
              <button 
                onClick={fetchAuditLogs}
                className="btn-secondary group flex items-center space-x-3"
              >
                <Cpu className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                <span>Analyze Signal Vault</span>
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, type: "spring" }}
            className="lg:col-span-5 flex justify-center relative"
          >
            <CyberCore />
          </motion.div>
        </div>
      </section>

      {/* Stats Grid Section */}
      <div className="container mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10"
        >
          <StatCard 
            title="Ingress Traffic" 
            value={stats.totalPackets.value} 
            previousValue={stats.totalPackets.prev}
            icon={Activity} 
            color="primary"
          />
          <StatCard 
            title="Encrypted Flow" 
            value={stats.tcpTraffic.value} 
            previousValue={stats.tcpTraffic.prev}
            icon={ArrowDownUp} 
            color="purple"
          />
          <StatCard 
            title="Network Nodes" 
            value={stats.udpTraffic.value} 
            previousValue={stats.udpTraffic.prev}
            icon={Wifi} 
            color="success"
          />
          <StatCard 
            title="Hostile Signals" 
            value={stats.threatAlerts.value} 
            previousValue={stats.threatAlerts.prev}
            icon={ShieldAlert} 
            color="danger"
          />
        </motion.div>
      </div>

      {/* Topology Section (Improved) */}
      <div className="container mx-auto px-6 mt-32">
        <div className="space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-secondary text-[10px] font-black uppercase tracking-[0.4em]">
                <Activity className="w-4 h-4" />
                <span>Topology Matrix Alpha</span>
              </div>
              <h2 className="text-6xl font-black text-white tracking-tighter uppercase">Live Network</h2>
            </div>
            <div className="flex items-center space-x-6 text-[10px] font-black font-mono text-white/30 uppercase tracking-[0.2em] bg-white/5 px-6 py-3 rounded-full border border-white/5">
              <span className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span>Active Node</span>
              </span>
              <span className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-danger" />
                <span>Threat Origin</span>
              </span>
            </div>
          </div>
          
          <div className="glass-card min-h-[800px] border-white/5 group relative overflow-hidden">
            <JarvisHUD />
          </div>
        </div>
      </div>
    </div>
  );
}
