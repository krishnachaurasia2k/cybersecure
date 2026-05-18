import { useState, useEffect } from 'react';
import { Target, Terminal, Fingerprint, Ghost, Database, ShieldAlert, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

export default function HoneypotLab() {
   const [events, setEvents] = useState([]);
   const [loading, setLoading] = useState(true);

   const fetchHoneypotEvents = async () => {
      try {
         const response = await fetch('/api/honeypot/events');
         if (response.ok) {
            const data = await response.json();
            setEvents(data);
         }
      } catch (err) {
         console.error("Failed to fetch honeypot events:", err);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchHoneypotEvents();
      const interval = setInterval(fetchHoneypotEvents, 3000);
      return () => clearInterval(interval);
   }, []);

   return (
      <div className="space-y-8 max-w-6xl mx-auto">
         {/* Glitchy Header */}
         <div className="relative p-8 overflow-hidden rounded-2xl bg-gradient-to-r from-[#ff003c]/10 to-[#00f0ff]/10 border border-white/10">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
               <div className="flex items-center space-x-4">
                  <div className="p-4 bg-black/40 rounded-xl border border-[#ff003c]/50 glow-box-danger-sm">
                     <Ghost className="w-10 h-10 text-[#ff003c] animate-pulse" />
                  </div>
                  <div>
                     <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
                        Honeypot <span className="text-[#ff003c]">Lab</span>
                     </h1>
                     <p className="text-gray-400 font-mono text-sm tracking-widest uppercase">
                        Active Deception & Intrusion Recording
                     </p>
                  </div>
               </div>

               <div className="flex gap-4">
                  <div className="px-4 py-2 bg-black/40 border border-[#00f0ff]/30 rounded-lg text-center min-w-[120px]">
                     <span className="block text-[10px] text-gray-500 font-mono uppercase">Fake SSH</span>
                     <span className="text-[#00f0ff] font-bold font-mono">Port 2222</span>
                  </div>
                  <div className="px-4 py-2 bg-black/40 border border-[#00f0ff]/30 rounded-lg text-center min-w-[120px]">
                     <span className="block text-[10px] text-gray-500 font-mono uppercase">Fake Web</span>
                     <span className="text-[#00f0ff] font-bold font-mono">Port 8080</span>
                  </div>
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

            {/* Left Stats Column */}
            <div className="lg:col-span-1 space-y-6">
               <div className="glass-panel p-6 border-l-4 border-l-[#00f0ff]">
                  <div className="flex items-center justify-between mb-4">
                     <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Captured Intel</h3>
                     <Database className="w-4 h-4 text-[#00f0ff]" />
                  </div>
                  <div className="space-y-4">
                     <div>
                        <span className="text-3xl font-black text-white font-mono">{events.length}</span>
                        <span className="text-xs text-gray-500 ml-2">Total Hits</span>
                     </div>
                     <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>Unique IPs</span>
                        <span className="text-white font-mono">{new Set(events.map(e => e.ip)).size}</span>
                     </div>
                  </div>
               </div>

               <div className="glass-panel p-6 border-l-4 border-l-[#ff003c]">
                  <div className="flex items-center justify-between mb-4">
                     <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Threat</h3>
                     <Target className="w-4 h-4 text-[#ff003c]" />
                  </div>
                  {events.length > 0 ? (
                     <div className="space-y-2">
                        <p className="text-lg font-mono font-bold text-white truncate">{events[0].ip}</p>
                        <p className="text-[10px] text-[#ff003c] font-bold uppercase">{events[0].type}</p>
                     </div>
                  ) : (
                     <p className="text-gray-500 text-sm">Waiting for connection...</p>
                  )}
               </div>
            </div>

            {/* Middle Activity Column */}
            <div className="lg:col-span-3 space-y-6">
               <div className="flex items-center justify-between px-2">
                  <h2 className="text-xl font-bold text-white flex items-center space-x-2 italic">
                     <Terminal className="w-5 h-5 text-[#00f0ff]" />
                     <span>Intrusion Stream</span>
                  </h2>
                  <div className="flex items-center space-x-2">
                     <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                     <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Live Monitoring</span>
                  </div>
               </div>

               <div className="space-y-4">
                  <AnimatePresence mode='popLayout'>
                     {events.length === 0 ? (
                        <motion.div
                           initial={{ opacity: 0 }}
                           animate={{ opacity: 1 }}
                           className="glass-panel p-20 flex flex-col items-center justify-center text-center space-y-6 border-dashed border-2 border-white/5"
                        >
                           <div className="relative">
                              <Fingerprint className="w-16 h-16 text-gray-700" />
                              <motion.div
                                 animate={{ top: [0, 64, 0] }}
                                 transition={{ duration: 4, repeat: Infinity }}
                                 className="absolute top-0 left-0 w-full h-1 bg-[#00f0ff]/50 shadow-[0_0_15px_#00f0ff]"
                              ></motion.div>
                           </div>
                           <p className="text-gray-500 font-mono text-sm">Honeypot is active. Scanning for unauthorized entry...</p>
                        </motion.div>
                     ) : (
                        events.map((event, idx) => (
                           <motion.div
                              key={`${event.ip}-${idx}`}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="glass-panel p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-2 border-l-white/10 hover:border-l-[#00f0ff] transition-all bg-black/20"
                           >
                              <div className="flex items-center space-x-4">
                                 <div className={cn(
                                    "p-2 rounded-lg",
                                    event.type.includes("SSH") ? "bg-purple-500/10 text-purple-400" : "bg-orange-500/10 text-orange-400"
                                 )}>
                                    {event.type.includes("SSH") ? <Cpu className="w-5 h-5" /> : <Ghost className="w-5 h-5" />}
                                 </div>
                                 <div>
                                    <div className="flex items-center space-x-3">
                                       <span className="text-xs font-mono text-gray-500">{event.timestamp}</span>
                                       <span className="text-sm font-bold text-white font-mono">{event.ip}</span>
                                    </div>
                                    <p className="text-sm text-[#00f0ff] font-bold mt-1 uppercase tracking-tight">{event.type}</p>
                                 </div>
                              </div>

                              <div className="flex-grow max-w-md mx-4 px-4 py-2 bg-black/40 rounded border border-white/5 font-mono text-xs text-gray-400 italic truncate">
                                 {event.details}
                              </div>

                              <div className="text-right">
                                 <span className="text-[10px] px-2 py-1 rounded bg-white/5 border border-white/10 text-gray-400 uppercase font-bold">
                                    Logged
                                 </span>
                              </div>
                           </motion.div>
                        ))
                     )}
                  </AnimatePresence>
               </div>
            </div>

         </div>
      </div>
   );
}
