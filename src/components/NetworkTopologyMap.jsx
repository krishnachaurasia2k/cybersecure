import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Server, Database, Shield, Monitor, Globe } from 'lucide-react';
import { cn } from '../lib/utils';

const nodes = [
  { id: 'internet', type: 'globe', label: 'External Network', icon: Globe, color: 'text-gray-400', glow: 'glow-box-primary', x: 10, y: 50 },
  { id: 'firewall', type: 'shield', label: 'Firewall', icon: Shield, color: 'text-[#ff003c]', glow: 'glow-box-danger', x: 30, y: 50 },
  { id: 'server', type: 'server', label: 'Main Server', icon: Server, color: 'text-[#00f0ff]', glow: 'glow-box-primary', x: 50, y: 50 },
  { id: 'db1', type: 'database', label: 'Database A', icon: Database, color: 'text-[#b026ff]', glow: 'glow-box-purple', x: 75, y: 30 },
  { id: 'db2', type: 'database', label: 'Database B', icon: Database, color: 'text-[#b026ff]', glow: 'glow-box-purple', x: 75, y: 70 },
  { id: 'client1', type: 'monitor', label: 'Client 1', icon: Monitor, color: 'text-[#00ff66]', glow: 'glow-box-success', x: 50, y: 20 },
  { id: 'client2', type: 'monitor', label: 'Client 2', icon: Monitor, color: 'text-[#00ff66]', glow: 'glow-box-success', x: 50, y: 80 },
];

const connections = [
  { id: 'c1', from: 'internet', to: 'firewall' },
  { id: 'c2', from: 'firewall', to: 'server' },
  { id: 'c3', from: 'server', to: 'db1' },
  { id: 'c4', from: 'server', to: 'db2' },
  { id: 'c5', from: 'server', to: 'client1' },
  { id: 'c6', from: 'server', to: 'client2' },
];

// Helper to determine node from IP
const getNodeFromIP = (ip) => {
  if (!ip) return 'internet';
  if (ip === '127.0.0.1' || ip.startsWith('192.168.1.10')) return 'server';
  if (ip.startsWith('192.168.1.5')) return 'db1';
  if (ip.startsWith('192.168.1.6')) return 'db2';
  if (ip.startsWith('192.168.')) {
    const lastOctet = parseInt(ip.split('.').pop());
    return lastOctet % 2 === 0 ? 'client1' : 'client2';
  }
  return 'internet';
};

const PacketDot = ({ pathId, duration, color, onComplete }) => (
  <motion.circle
    r="3"
    fill={color}
    className="drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]"
    initial={{ offsetDistance: "0%" }}
    animate={{ offsetDistance: "100%" }}
    onAnimationComplete={onComplete}
    transition={{
      duration: duration,
      ease: "linear"
    }}
    style={{ offsetPath: `url(#${pathId})` }}
  />
);

export default function NetworkTopologyMap() {
  const [activePackets, setActivePackets] = useState([]);
  const [pulsingPaths, setPulsingPaths] = useState({});
  const packetIdCounter = useRef(0);

  useEffect(() => {
    const handleNewPacket = (e) => {
      const p = e.detail;
      const srcNodeId = getNodeFromIP(p.srcIp);
      const dstNodeId = getNodeFromIP(p.destIp);
      const isSuspicious = p.risk === 'Suspicious';

      // Find relevant connection paths to pulse
      const pathsToPulse = [];
      
      // Basic logic: if external to server, pulse internet -> firewall -> server
      if (srcNodeId === 'internet' && (dstNodeId === 'server' || dstNodeId.startsWith('client'))) {
        pathsToPulse.push('c1', 'c2');
        if (dstNodeId === 'client1') pathsToPulse.push('c5');
        if (dstNodeId === 'client2') pathsToPulse.push('c6');
      } else if (srcNodeId === 'server') {
        if (dstNodeId === 'db1') pathsToPulse.push('c3');
        if (dstNodeId === 'db2') pathsToPulse.push('c4');
        if (dstNodeId === 'client1') pathsToPulse.push('c5');
        if (dstNodeId === 'client2') pathsToPulse.push('c6');
      }

      // Add packets to animation
      pathsToPulse.forEach(connId => {
        const id = packetIdCounter.current++;
        const color = isSuspicious ? '#ff003c' : (srcNodeId === 'internet' ? '#00f0ff' : '#b026ff');
        
        setActivePackets(prev => [...prev, { id, connId, color }]);
        
        // Pulse the path
        setPulsingPaths(prev => ({ ...prev, [connId]: true }));
        setTimeout(() => {
          setPulsingPaths(prev => {
            const newState = { ...prev };
            delete newState[connId];
            return newState;
          });
        }, 1000);
      });
    };

    window.addEventListener('new-packet', handleNewPacket);
    return () => window.removeEventListener('new-packet', handleNewPacket);
  }, []);

  const removePacket = (id) => {
    setActivePackets(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="relative w-full h-[550px] glass-panel border border-white/10 rounded-xl overflow-hidden bg-[rgba(10,10,15,0.7)] shadow-2xl">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wNSkiLz48L3N2Zz4=')] opacity-50 pointer-events-none" />

      {/* SVG Connections & Packets */}
      <svg 
        viewBox="0 0 100 100" 
        preserveAspectRatio="none" 
        className="absolute inset-0 w-full h-full pointer-events-none"
      >
        <defs>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(0,240,255,0.2)" />
            <stop offset="50%" stopColor="rgba(0,240,255,0.6)" />
            <stop offset="100%" stopColor="rgba(176,38,255,0.2)" />
          </linearGradient>
          <filter id="glow-line" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {connections.map((conn) => {
          const fromNode = nodes.find(n => n.id === conn.from);
          const toNode = nodes.find(n => n.id === conn.to);
          const pathId = `path-${conn.id}`;
          const isPulsing = pulsingPaths[conn.id];
          
          return (
            <g key={conn.id}>
              <path
                id={pathId}
                d={`M ${fromNode.x} ${fromNode.y} L ${toNode.x} ${toNode.y}`}
                fill="none"
              />
              <motion.path
                d={`M ${fromNode.x} ${fromNode.y} L ${toNode.x} ${toNode.y}`}
                stroke={isPulsing ? "#00f0ff" : "url(#lineGrad)"}
                strokeWidth={isPulsing ? "1.2" : "0.6"}
                strokeOpacity={isPulsing ? 1 : 0.4}
                fill="none"
                animate={{ 
                  strokeOpacity: isPulsing ? [0.5, 1, 0.5] : 0.4,
                  strokeWidth: isPulsing ? [0.6, 1.2, 0.6] : 0.6
                }}
                transition={{ duration: 1, repeat: isPulsing ? Infinity : 0 }}
                filter="url(#glow-line)"
              />
              {/* Dynamic Packets */}
              {activePackets.filter(p => p.connId === conn.id).map(p => (
                <PacketDot 
                  key={p.id} 
                  pathId={pathId} 
                  duration={1.5} 
                  color={p.color} 
                  onComplete={() => removePacket(p.id)} 
                />
              ))}
            </g>
          );
        })}
      </svg>

      {/* Nodes */}
      {nodes.map((node) => {
        const Icon = node.icon;
        const isNodeActive = activePackets.some(p => {
          const conn = connections.find(c => c.id === p.connId);
          return conn.from === node.id || conn.to === node.id;
        });

        return (
          <motion.div
            key={node.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center"
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 100 }}
          >
            <motion.div 
              animate={{ 
                scale: isNodeActive ? [1, 1.1, 1] : 1,
                boxShadow: isNodeActive ? "0 0 30px rgba(0,240,255,0.4)" : "none"
              }}
              className={cn(
                "p-4 rounded-2xl bg-[rgba(15,15,25,0.9)] border border-white/10 backdrop-blur-xl relative z-10 transition-all duration-300",
                node.glow,
                isNodeActive && "border-[#00f0ff]/50"
              )}
            >
              <Icon className={cn("w-8 h-8", node.color)} />
              
              {isNodeActive && (
                <motion.div
                  className="absolute inset-0 rounded-2xl border border-[#00f0ff]/50"
                  initial={{ opacity: 0, scale: 1 }}
                  animate={{ opacity: [0, 1, 0], scale: [1, 1.5] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </motion.div>
            <div className="mt-3 px-3 py-1 rounded-full bg-black/40 border border-white/5 backdrop-blur-md">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">{node.label}</span>
            </div>
          </motion.div>
        );
      })}

      {/* Legend */}
      <div className="absolute bottom-4 right-4 flex flex-col space-y-2 bg-black/40 p-3 rounded-lg border border-white/5 backdrop-blur-md">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-[#00f0ff]" />
          <span className="text-[10px] text-gray-400">Normal Ingress</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-[#b026ff]" />
          <span className="text-[10px] text-gray-400">Internal Traffic</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-[#ff003c] animate-pulse" />
          <span className="text-[10px] text-[#ff003c]">Threat Detected</span>
        </div>
      </div>
    </div>
  );
}
