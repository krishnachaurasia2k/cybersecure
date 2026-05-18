import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Server, Database, Shield, Monitor, Globe, Activity, Cpu, Zap, Radio, Boxes, Layers } from 'lucide-react';
import { cn } from '../lib/utils';

const nodes = [
  { id: 'internet', label: 'External Network', icon: Globe, x: 10, y: 50, color: '#00f0ff' },
  { id: 'firewall', label: 'Firewall', icon: Shield, x: 30, y: 50, color: '#ff003c' },
  { id: 'server', label: 'Main Server', icon: Server, x: 50, y: 50, color: '#00f0ff' },
  { id: 'db1', label: 'Database A', icon: Database, x: 75, y: 30, color: '#b026ff' },
  { id: 'db2', label: 'Database B', icon: Database, x: 75, y: 70, color: '#b026ff' },
  { id: 'client1', label: 'Client 1', icon: Monitor, x: 50, y: 20, color: '#00ff66' },
  { id: 'client2', label: 'Client 2', icon: Monitor, x: 50, y: 80, color: '#00ff66' },
];

const connections = [
  { id: 'c1', from: 'internet', to: 'firewall' },
  { id: 'c2', from: 'firewall', to: 'server' },
  { id: 'c3', from: 'server', to: 'db1' },
  { id: 'c4', from: 'server', to: 'db2' },
  { id: 'c5', from: 'server', to: 'client1' },
  { id: 'c6', from: 'server', to: 'client2' },
];

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

const StreamParticle = ({ pathId, color, onComplete }) => (
  <motion.circle
    r="1.2"
    fill={color}
    initial={{ offsetDistance: "0%", opacity: 0 }}
    animate={{ offsetDistance: "100%", opacity: [0, 1, 1, 0] }}
    onAnimationComplete={onComplete}
    transition={{ duration: 1.2, ease: "easeInOut" }}
    style={{ offsetPath: `url(#${pathId})`, filter: `drop-shadow(0 0 4px ${color})` }}
  />
);

export default function NetworkTopologyMap() {
  const [activeStreams, setActiveStreams] = useState([]);
  const [pulsingNodes, setPulsingNodes] = useState({});
  const streamIdCounter = useRef(0);

  useEffect(() => {
    const handleNewPacket = (e) => {
      const p = e.detail;
      const srcNodeId = getNodeFromIP(p.srcIp);
      const dstNodeId = getNodeFromIP(p.destIp);
      const isSuspicious = p.risk === 'Suspicious';

      const paths = [];
      if (srcNodeId === 'internet') paths.push('c1', 'c2');
      if (dstNodeId === 'db1') paths.push('c3');
      if (dstNodeId === 'db2') paths.push('c4');
      if (dstNodeId === 'client1') paths.push('c5');
      if (dstNodeId === 'client2') paths.push('c6');

      setPulsingNodes(prev => ({ ...prev, [srcNodeId]: true, [dstNodeId]: true }));
      setTimeout(() => {
        setPulsingNodes(prev => {
          const next = { ...prev };
          delete next[srcNodeId];
          delete next[dstNodeId];
          return next;
        });
      }, 800);

      paths.forEach(connId => {
        const id = streamIdCounter.current++;
        const color = isSuspicious ? '#ff003c' : '#00f0ff';
        setActiveStreams(prev => [...prev.slice(-40), { id, connId, color }]);
      });
    };

    window.addEventListener('new-packet', handleNewPacket);
    return () => window.removeEventListener('new-packet', handleNewPacket);
  }, []);

  return (
    <div className="relative w-full h-[750px] bg-[#020205] perspective-[2000px] overflow-hidden rounded-[40px] border border-white/10 group">
      {/* 3D Tilted Container */}
      <div 
        className="absolute inset-0 transition-transform duration-1000 ease-out preserve-3d"
        style={{ transform: 'rotateX(20deg) rotateY(-5deg) translateY(50px)' }}
      >
        {/* Holographic Base Grid */}
        <div className="absolute inset-x-0 bottom-0 h-full bg-[linear-gradient(to_bottom,transparent_0%,rgba(0,240,255,0.05)_100%)] industrial-grid opacity-30" />
        
        {/* Dynamic Light Rays */}
        <div className="absolute inset-0 bg-gradient-radial from-primary/5 to-transparent blur-[120px] pointer-events-none" />

        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full p-20 overflow-visible">
          <defs>
            <linearGradient id="beam-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(0,240,255,0)" />
              <stop offset="50%" stopColor="rgba(0,240,255,0.1)" />
              <stop offset="100%" stopColor="rgba(0,240,255,0)" />
            </linearGradient>
            <filter id="hologram-glow">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Connection Beams */}
          {connections.map((conn) => {
            const from = nodes.find(n => n.id === conn.from);
            const to = nodes.find(n => n.id === conn.to);
            return (
              <g key={conn.id}>
                <path
                  id={`stream-${conn.id}`}
                  d={`M ${from.x} ${from.y} L ${to.x} ${to.y}`}
                  fill="none"
                  stroke="rgba(0,240,255,0.05)"
                  strokeWidth="0.8"
                />
                <motion.path
                  d={`M ${from.x} ${from.y} L ${to.x} ${to.y}`}
                  fill="none"
                  stroke="url(#beam-grad)"
                  strokeWidth="2"
                  animate={{ strokeDashoffset: [0, -20] }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  strokeDasharray="5 15"
                />
                {activeStreams.filter(s => s.connId === conn.id).map(s => (
                  <StreamParticle 
                    key={s.id} 
                    pathId={`stream-${conn.id}`} 
                    color={s.color} 
                    onComplete={() => setActiveStreams(prev => prev.filter(item => item.id !== s.id))} 
                  />
                ))}
              </g>
            );
          })}

          {/* Holographic Nodes */}
          {nodes.map((node) => {
            const Icon = node.icon;
            const isPulsing = pulsingNodes[node.id];
            return (
              <g key={node.id}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="6"
                  fill="rgba(0,240,255,0.02)"
                  filter="url(#hologram-glow)"
                />
                <path
                  d={`M ${node.x} ${node.y - 5} L ${node.x + 4.5} ${node.y - 2.5} L ${node.x + 4.5} ${node.y + 2.5} L ${node.x} ${node.y + 5} L ${node.x - 4.5} ${node.y + 2.5} L ${node.x - 4.5} ${node.y - 2.5} Z`}
                  fill="rgba(10,10,18,0.9)"
                  stroke={isPulsing ? node.color : "rgba(255,255,255,0.15)"}
                  strokeWidth="0.4"
                />
                <foreignObject x={node.x - 2.5} y={node.y - 2.5} width="5" height="5">
                  <div className="w-full h-full flex items-center justify-center">
                    <Icon className={cn("w-full h-full", isPulsing ? "scale-110 drop-shadow-[0_0_8px_currentColor]" : "opacity-40")} style={{ color: isPulsing ? node.color : 'white' }} />
                  </div>
                </foreignObject>
                <foreignObject x={node.x - 10} y={node.y + 7} width="20" height="10">
                  <div className="flex flex-col items-center">
                    <span className="text-[3px] font-black font-mono text-white/20 uppercase tracking-[0.3em] mb-0.5">
                      {node.id.toUpperCase()}
                    </span>
                    <span className={cn("text-[4px] font-black uppercase tracking-tighter", isPulsing ? "text-white" : "text-white/40")}>
                      {node.label}
                    </span>
                  </div>
                </foreignObject>
                {isPulsing && (
                  <motion.circle cx={node.x} cy={node.y} r="5" fill="none" stroke={node.color} strokeWidth="0.5" initial={{ scale: 1, opacity: 0.8 }} animate={{ scale: 3, opacity: 0 }} transition={{ duration: 0.8 }} />
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Static HUD Overlays */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="hud-corner top-10 left-10 border-t-2 border-l-2" />
        <div className="hud-corner top-10 right-10 border-t-2 border-r-2" />
        <div className="hud-corner bottom-10 left-10 border-b-2 border-l-2" />
        <div className="hud-corner bottom-10 right-10 border-b-2 border-r-2" />
        <div className="absolute top-16 left-16 space-y-2">
          <div className="flex items-center space-x-3 text-primary text-[10px] font-black uppercase tracking-[0.5em]">
            <Radio className="w-4 h-4" />
            <span>Spatial Topology Matrix</span>
          </div>
          <div className="h-1 w-48 bg-primary/20 rounded-full overflow-hidden">
            <motion.div className="h-full bg-primary" animate={{ x: ['-100%', '100%'] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} />
          </div>
        </div>
        <div className="absolute bottom-16 right-16 flex flex-col items-end space-y-4">
          <div className="glass-card p-6 bg-black/80 border-white/5 space-y-4 min-w-[200px]">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">Active Signals</span>
              <Boxes className="w-3 h-3 text-primary" />
            </div>
            <div className="space-y-3">
              {[
                { label: 'UPLINK_STABLE', value: '98.2%', color: 'text-success' },
                { label: 'THREAT_SCAN', value: 'ACTIVE', color: 'text-primary' },
                { label: 'LATENCY', value: '4ms', color: 'text-white' }
              ].map(item => (
                <div key={item.label} className="flex justify-between items-center text-[8px] font-mono">
                  <span className="text-white/20">{item.label}</span>
                  <span className={item.color}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="absolute inset-0 pointer-events-none holographic-noise opacity-[0.05]" />
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(0,240,255,0.03)_1px,transparent_1px)] bg-[size:100%_4px] opacity-20" />
    </div>
  );
}
