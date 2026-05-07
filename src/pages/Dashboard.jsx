import { useState, useEffect } from 'react';
import { Activity, ShieldAlert, Wifi, ArrowDownUp, Shield, Zap, CheckCircle2 } from 'lucide-react';
import StatCard from '../components/StatCard';
import NetworkTopologyMap from '../components/NetworkTopologyMap';
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
      const res = await fetch('http://127.0.0.1:5001/api/incidents');
      const data = await res.json();
      setAuditLogs(data);
      setShowAuditLogs(true);
    } catch (err) {
      console.error("Failed to fetch audit logs", err);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  return (
    <div className="space-y-12 pb-20 relative">
      {/* Audit Logs Modal */}
      <AnimatePresence>
        {showAuditLogs && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#050508]/90 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-4xl h-[70vh] bg-[#0a0a0f] border border-white/10 rounded-[40px] overflow-hidden flex flex-col shadow-[0_0_100px_rgba(0,0,0,1)]"
            >
              <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white">Security Audit Vault</h2>
                  <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em] mt-1">Classified Incident Records</p>
                </div>
                <button 
                  onClick={() => setShowAuditLogs(false)}
                  className="p-3 hover:bg-white/5 rounded-2xl transition-colors text-white/40 hover:text-white"
                >
                  <Activity className="w-6 h-6 rotate-45" />
                </button>
              </div>
              <div className="flex-grow overflow-y-auto p-8 space-y-4 custom-scrollbar">
                {auditLogs.length > 0 ? auditLogs.map((log, i) => (
                  <div key={i} className="group p-6 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-[#00f0ff]/30 transition-all">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${log.action?.includes('Blocked') ? 'bg-red-500' : 'bg-[#00f0ff]'}`} />
                        <span className="text-white font-bold text-sm tracking-tight">{log.threat_type || 'System Event'}</span>
                      </div>
                      <span className="text-[10px] text-white/20 font-mono">{log.timestamp}</span>
                    </div>
                    <p className="text-xs text-white/60 mb-4 leading-relaxed">
                      Detected potential {log.threat_type} from source <span className="text-white font-mono">{log.source_ip}</span>.
                      The system response was: <span className="text-[#00f0ff] font-bold">{log.action || 'Logged'}</span>.
                    </p>
                    <div className="flex items-center space-x-4">
                      <div className="px-2 py-1 bg-white/5 rounded-md text-[9px] text-white/40 font-mono uppercase tracking-widest">Target: {log.destination_ip}</div>
                      <div className="px-2 py-1 bg-white/5 rounded-md text-[9px] text-white/40 font-mono uppercase tracking-widest">Protocol: {log.protocol || 'TCP'}</div>
                    </div>
                  </div>
                )) : (
                  <div className="h-full flex flex-col items-center justify-center opacity-20">
                    <Shield className="w-16 h-16 mb-4" />
                    <span className="text-sm font-black uppercase tracking-widest">No Incident Records Found</span>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[40px] p-8 md:p-12 border border-white/5 bg-gradient-to-br from-[rgba(20,20,30,0.8)] to-transparent">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
          <motion.div 
            animate={{ 
              rotate: 360,
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-full h-full border-[1px] border-dashed border-[#00f0ff] rounded-full"
          />
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#00ff66]/10 border border-[#00ff66]/20 text-[#00ff66] text-[10px] font-bold uppercase tracking-widest mb-6">
              <Zap className="w-3 h-3 animate-pulse" />
              <span>System Live</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
              Autonomous <br />
              <span className="text-[#00f0ff] glow-text-primary">Cyber Defense</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-lg mb-8 leading-relaxed">
              Real-time AI monitoring active. Neural defense kernel initialized and protecting all network nodes.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="px-8 py-3 rounded-xl bg-[#00ff66]/10 border border-[#00ff66]/30 text-[#00ff66] font-bold flex items-center space-x-2 shadow-[0_0_15px_rgba(0,255,102,0.1)]">
                <CheckCircle2 className="w-4 h-4" />
                <span>Neural Engine Online</span>
              </div>
              <button 
                onClick={fetchAuditLogs}
                className="px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all hover:scale-105 active:scale-95"
              >
                Audit Logs
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="flex justify-center"
          >
            <div className="relative w-64 h-64 md:w-80 md:h-80">
              <div className="absolute inset-0 blur-3xl rounded-full animate-pulse bg-[#00ff66]/10" />
              <motion.div 
                animate={{ rotateY: [0, 360] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="w-full h-full relative z-10 flex items-center justify-center"
              >
                <Shield className="w-40 h-40 md:w-56 md:h-56 text-[#00ff66] drop-shadow-[0_0_30px_rgba(0,255,102,0.5)]" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Data Section */}
      <div className="opacity-100">
        {/* Stats Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <StatCard 
            title="Total Packets" 
            value={stats.totalPackets.value} 
            previousValue={stats.totalPackets.prev}
            icon={Activity} 
            color="primary"
          />
          <StatCard 
            title="TCP Traffic" 
            value={stats.tcpTraffic.value} 
            previousValue={stats.tcpTraffic.prev}
            icon={ArrowDownUp} 
            color="purple"
          />
          <StatCard 
            title="UDP Traffic" 
            value={stats.udpTraffic.value} 
            previousValue={stats.udpTraffic.prev}
            icon={Wifi} 
            color="success"
          />
          <StatCard 
            title="Threat Alerts" 
            value={stats.threatAlerts.value} 
            previousValue={stats.threatAlerts.prev}
            icon={ShieldAlert} 
            color="danger"
          />
        </motion.div>

        {/* Network Topology Map Section */}
        <motion.section 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="space-y-6 mt-12"
        >
          <div className="flex items-center justify-between px-2">
            <div>
              <h2 className="text-3xl font-black text-white">Live Topology</h2>
              <p className="text-gray-500 text-sm font-bold uppercase tracking-widest mt-1">Real-time Node Distribution</p>
            </div>
          </div>
          
          <div className="glass-panel p-2 min-h-[600px] relative">
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] to-transparent pointer-events-none z-10 h-20 top-auto" />
            <NetworkTopologyMap />
          </div>
        </motion.section>
      </div>
    </div>
  );
}
