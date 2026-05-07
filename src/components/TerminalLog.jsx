import { useEffect, useState, useRef } from 'react';
import { Terminal } from 'lucide-react';
import { cn } from '../lib/utils';

export default function TerminalLog() {
  const [logs, setLogs] = useState([
    { id: 'init', text: '[SYSTEM] Initializing secure socket connection...', type: 'system' },
    { id: 'init2', text: '[SYSTEM] Connection established. Listening on port 8080.', type: 'system' }
  ]);
  const endRef = useRef(null);

  useEffect(() => {
    const handleNewPacket = (e) => {
      const p = e.detail;
      const isSuspicious = p.risk === 'Suspicious';
      
      const logText = `[${p.time}] INGRESS: ${p.srcIp} -> ${p.destIp} [${p.protocol}] PORT:${p.port}`;
      
      setLogs(prev => [...prev.slice(-49), { 
        id: p.id, 
        text: logText, 
        type: isSuspicious ? 'alert' : 'normal' 
      }]);
    };

    window.addEventListener('new-packet', handleNewPacket);
    return () => window.removeEventListener('new-packet', handleNewPacket);
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="glass-panel border border-white/10 rounded-xl overflow-hidden flex flex-col h-[400px]">
      <div className="bg-[#111116] border-b border-white/10 p-3 flex items-center space-x-2">
        <Terminal className="w-4 h-4 text-gray-400" />
        <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">Raw Packet Stream</span>
      </div>
      
      <div className="flex-grow p-4 overflow-y-auto bg-[#05050a] font-mono text-xs md:text-sm">
        {logs.map(log => (
          <div 
            key={log.id} 
            className={cn(
              "mb-1",
              log.type === 'system' && "text-[#00f0ff]",
              log.type === 'normal' && "text-gray-300",
              log.type === 'alert' && "text-[#ff003c] font-bold"
            )}
          >
            <span className="opacity-50 mr-2">{'>'}</span>
            {log.text}
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
}
