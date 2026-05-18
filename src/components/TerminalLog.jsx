import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Cpu, Activity, Zap } from 'lucide-react';
import { cn } from '../lib/utils';

export default function TerminalLog() {
  const [logs, setLogs] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleNewPacket = (e) => {
      setLogs(prev => [e.detail, ...prev].slice(0, 50));
    };
    window.addEventListener('new-packet', handleNewPacket);
    return () => window.removeEventListener('new-packet', handleNewPacket);
  }, []);

  return (
    <div className="glass-card flex flex-col h-full border-white/5 relative group min-h-[400px]">
      {/* HUD Headers */}
      <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
            <Cpu className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white tracking-widest uppercase">Signal Ingress</h3>
            <p className="text-[8px] text-primary font-black uppercase tracking-[0.4em] opacity-40">Matrix Stream Active</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Port 8080</span>
        </div>
      </div>

      <div
        ref={containerRef}
        className="flex-grow overflow-y-auto p-6 space-y-2 custom-scrollbar font-mono relative bg-black/20"
      >
        <AnimatePresence initial={false}>
          {logs.map((log, i) => (
            <motion.div
              key={log.id || i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center space-x-4 p-4 rounded-xl hover:bg-white/[0.03] transition-colors border border-transparent hover:border-white/5 group/row"
            >
              <div className={cn(
                "w-1 h-10 rounded-full shrink-0",
                log.risk === 'High' ? 'bg-danger shadow-[0_0_10px_#ff003c]' :
                  log.risk === 'Medium' ? 'bg-warning shadow-[0_0_10px_#ffb800]' :
                    'bg-success shadow-[0_0_10px_#00ff66]'
              )} />

              <div className="flex-grow grid grid-cols-12 gap-6 items-center">
                <span className="col-span-2 text-[10px] text-white/20 font-bold">{log.time || log.timestamp}</span>
                <span className="col-span-3 text-sm text-white font-black tracking-tighter truncate uppercase">{log.srcIp}</span>
                <div className="col-span-1 flex justify-center">
                  <Zap className="w-3 h-3 text-white/10 group-hover/row:text-primary transition-colors animate-pulse" />
                </div>
                <span className="col-span-3 text-sm text-white/40 font-medium truncate uppercase tracking-tight">{log.destIp}</span>
                <div className="col-span-3 flex justify-end">
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border",
                    log.risk === 'High' ? 'bg-danger/10 text-danger border-danger/20' :
                      log.risk === 'Medium' ? 'bg-warning/10 text-warning border-warning/20' :
                        'bg-success/10 text-success border-success/20'
                  )}>
                    {log.threatType || 'Neutral'}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Footer Meta */}
      <div className="px-8 py-4 border-t border-white/5 bg-black/40 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <span className="text-[8px] text-white/20 uppercase tracking-[0.3em]">Protocol: AES-256</span>
          <span className="text-[8px] text-white/20 uppercase tracking-[0.3em]">Status: Verified</span>
        </div>
        <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            animate={{ width: ['0%', '100%', '0%'] }}
            transition={{ duration: 5, repeat: Infinity }}
          />
        </div>
      </div>

      {/* Matrix Overlay on Terminal */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] holographic-noise" />
    </div>
  );
}
