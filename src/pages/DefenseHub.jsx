import { useState, useEffect } from 'react';
import { Shield, ShieldAlert, ShieldCheck, Unlock, FileText, Activity, AlertTriangle, Cpu, Zap, Database, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

export default function DefenseHub() {
   const [blockedIps, setBlockedIps] = useState([]);
   const [incidents, setIncidents] = useState([]);
   const [loading, setLoading] = useState(true);
   const [autoDefense, setAutoDefense] = useState(true);

   const fetchDefenseData = async () => {
      try {
         const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001';
         const [resBlocked, resIncidents, resStatus] = await Promise.all([
            fetch(`${API_BASE}/api/responses`),
            fetch(`${API_BASE}/api/incidents`),
            fetch(`${API_BASE}/api/defense/status`)
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
         const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001';
         const response = await fetch(`${API_BASE}/api/responses/unblock`, {
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
      <div className="space-y-16 max-w-7xl mx-auto relative pb-32">
         {/* HUD Header */}
         <div className="relative p-12 glass-card border-white/5 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full cyber-grid-dark opacity-5 pointer-events-none" />
            <div className="hud-corner top-0 left-0 border-t-2 border-l-2" />
            <div className="hud-corner bottom-0 right-0 border-b-2 border-r-2" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
               <div className="space-y-6">
                  <div className="flex items-center space-x-3 text-primary text-[10px] font-black uppercase tracking-[0.4em]">
                     <Cpu className="w-4 h-4 animate-spin-slow" />
                     <span>Neural Security Logic</span>
                  </div>
                  <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-[0.85] uppercase">
                     Defense <span className="text-gradient-cyan">Protocols</span>
                  </h1>
                  <p className="text-gray-400 text-xl font-light max-w-2xl leading-relaxed">
                     Real-time neural monitoring with automated threat interception and cryptographic containment systems.
                  </p>
               </div>

               <div className="flex flex-col items-center gap-6">
                  <div className={cn(
                     "relative px-10 py-6 rounded-3xl border transition-all duration-700 flex flex-col items-center",
                     autoDefense
                        ? "bg-primary/5 border-primary/20 text-primary shadow-[0_0_50px_rgba(0,240,255,0.1)]"
                        : "bg-white/5 border-white/10 text-white/20"
                  )}>
                     <span className="text-[10px] font-black uppercase tracking-[0.3em] mb-2 opacity-60">Neural Engine</span>
                     <span className="text-3xl font-black uppercase tracking-tighter">{autoDefense ? "Operational" : "Standby"}</span>
                     {autoDefense && <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity }} className="mt-4 w-2 h-2 rounded-full bg-primary" />}
                  </div>

                  <button
                     onClick={async () => {
                        const newState = !autoDefense;
                        try {
                           const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001';
                           const res = await fetch(`${API_BASE}/api/defense/toggle`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ enabled: newState })
                           });
                           if (res.ok) setAutoDefense(newState);
                        } catch (err) {
                           console.error("Failed to toggle auto-defense:", err);
                        }
                     }}
                     className="btn-secondary w-full group flex items-center justify-center space-x-3"
                  >
                     <Lock className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                     <span>{autoDefense ? "Initialize Halt" : "Engage Logic"}</span>
                  </button>
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

            {/* Left Column: Active Blocks */}
            <div className="lg:col-span-8 space-y-10">
               <div className="flex items-center justify-between px-4">
                  <div className="flex items-center space-x-4">
                     <div className="w-12 h-12 bg-danger/10 rounded-2xl flex items-center justify-center border border-danger/20">
                        <ShieldAlert className="w-6 h-6 text-danger" />
                     </div>
                     <div>
                        <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Neutralized</h2>
                        <p className="text-[10px] text-danger font-black uppercase tracking-[0.3em] opacity-60">High Priority Containment</p>
                     </div>
                  </div>
                  <div className="px-6 py-2 rounded-full bg-danger/10 border border-danger/20 text-xs font-black text-danger font-mono">
                     {blockedIps.length} Active
                  </div>
               </div>

               <div className="space-y-6">
                  <AnimatePresence mode='popLayout'>
                     {blockedIps.length === 0 ? (
                        <motion.div
                           initial={{ opacity: 0, scale: 0.98 }}
                           animate={{ opacity: 1, scale: 1 }}
                           className="glass-card p-32 flex flex-col items-center justify-center text-center space-y-8 border-dashed border-2 border-white/5"
                        >
                           <ShieldCheck className="w-24 h-24 text-success/20 animate-pulse" />
                           <div className="space-y-3">
                              <h3 className="text-2xl font-black text-white tracking-tight uppercase">Perimeter Clear</h3>
                              <p className="text-gray-500 max-w-xs mx-auto font-medium">Neural engine reporting 0% threat probability across all monitored endpoints.</p>
                           </div>
                        </motion.div>
                     ) : (
                        blockedIps.map((block, idx) => (
                           <motion.div
                              key={block.ip}
                              layout
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              transition={{ delay: idx * 0.05 }}
                              className="glass-card group overflow-hidden relative border-white/5 hover:border-danger/40"
                           >
                              <div className="hud-corner top-0 left-0 border-t-2 border-l-2 border-danger/30" />
                              <div className="p-10 flex items-center justify-between relative z-10">
                                 <div className="flex items-center space-x-8">
                                    <div className="p-5 bg-danger/10 rounded-3xl text-danger group-hover:bg-danger/20 transition-all">
                                       <AlertTriangle className="w-8 h-8" />
                                    </div>

                                    <div className="space-y-2">
                                       <h4 className="text-3xl font-black text-white tracking-tighter font-mono group-hover:text-danger transition-colors">
                                          {block.ip}
                                       </h4>
                                       <div className="flex items-center space-x-4">
                                          <span className="px-4 py-1 rounded-full bg-danger/10 text-danger text-[10px] font-black uppercase tracking-widest border border-danger/20">
                                             {block.reason}
                                          </span>
                                          <span className="text-[10px] text-white/30 font-mono uppercase tracking-widest">
                                             Intercepted: {block.timestamp}
                                          </span>
                                       </div>
                                    </div>
                                 </div>

                                 <button
                                    onClick={() => handleUnblock(block.ip)}
                                    className="btn-secondary group flex items-center space-x-3 border-white/5 hover:border-primary/40 hover:text-primary"
                                 >
                                    <Unlock className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                                    <span>Release Node</span>
                                 </button>
                              </div>
                           </motion.div>
                        ))
                     )}
                  </AnimatePresence>
               </div>
            </div>

            {/* Right Column: Incident Reports */}
            <div className="lg:col-span-4 space-y-10">
               <div className="space-y-8">
                  <div className="flex items-center space-x-4 px-4">
                     <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                        <FileText className="w-5 h-5 text-primary" />
                     </div>
                     <h2 className="text-2xl font-black text-white tracking-tighter uppercase">Incident Matrix</h2>
                  </div>

                  <div className="glass-card overflow-hidden border-white/5">
                     <div className="px-6 py-5 bg-white/[0.02] border-b border-white/5 flex justify-between items-center">
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Signal Logs</span>
                        <div className="flex space-x-1.5">
                           {[...Array(3)].map((_, i) => (
                              <div key={i} className="w-1 h-1 rounded-full bg-primary animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                           ))}
                        </div>
                     </div>
                     <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto custom-scrollbar">
                        {incidents.length === 0 ? (
                           <div className="p-20 text-center text-white/10 text-xs font-black uppercase tracking-widest italic">
                              Waiting for data...
                           </div>
                        ) : (
                           incidents.map((report) => (
                              <motion.div
                                 key={report.id}
                                 initial={{ opacity: 0 }}
                                 animate={{ opacity: 1 }}
                                 className="p-6 hover:bg-white/[0.02] transition-all cursor-pointer group relative"
                              >
                                 <div className="flex items-start justify-between relative z-10">
                                    <div className="space-y-3">
                                       <p className="text-base font-black text-white group-hover:text-primary transition-colors truncate max-w-[200px] uppercase tracking-tighter">
                                          {report.name}
                                       </p>
                                       <div className="flex items-center space-x-3">
                                          <Database className="w-3 h-3 text-white/10" />
                                          <p className="text-[10px] text-white/20 font-mono font-bold tracking-widest">
                                             {new Date(report.timestamp * 1000).toLocaleTimeString()}
                                          </p>
                                       </div>
                                    </div>
                                    <div className="p-3 rounded-2xl bg-white/5 group-hover:bg-primary/20 transition-all border border-white/5 group-hover:border-primary/20">
                                       <Activity className="w-4 h-4 text-white/20 group-hover:text-primary" />
                                    </div>
                                 </div>
                                 <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-0 group-hover:h-1/2 bg-primary transition-all duration-500" />
                              </motion.div>
                           ))
                        )}
                     </div>
                     <div className="p-6 bg-white/[0.02] border-t border-white/5">
                        <button className="w-full py-4 text-[10px] font-black text-primary hover:text-white bg-primary/10 hover:bg-primary/20 rounded-2xl transition-all uppercase tracking-[0.4em] border border-primary/10">
                           Analyze Signal Archive
                        </button>
                     </div>
                  </div>
               </div>

               {/* Quick Stats Overlay */}
               <div className="glass-card p-10 relative overflow-hidden group">
                  <div className="hud-corner top-0 left-0 border-t-2 border-l-2" />
                  <div className="relative z-10 space-y-8">
                     <div className="flex items-center justify-between">
                        <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Neural Accuracy</h3>
                        <Activity className="w-4 h-4 text-primary animate-pulse" />
                     </div>

                     <div className="space-y-6">
                        <div className="flex justify-between items-end">
                           <div className="flex flex-col">
                              <span className="text-5xl font-black text-white tracking-tighter">99.8%</span>
                              <span className="text-[10px] text-primary font-black uppercase tracking-[0.2em] mt-1">Matrix Confirmed</span>
                           </div>
                        </div>

                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden relative">
                           <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: '99.8%' }}
                              transition={{ duration: 2, ease: "easeOut" }}
                              className="h-full bg-primary relative"
                           >
                              <div className="absolute inset-0 bg-white/20 animate-scan-fast opacity-30" />
                           </motion.div>
                        </div>

                        <p className="text-[10px] text-white/30 font-medium leading-relaxed italic uppercase tracking-widest">
                           Neural engine optimizing containment for zero-day vectors.
                        </p>
                     </div>
                  </div>
               </div>
            </div>

         </div>
      </div>
   );
}
