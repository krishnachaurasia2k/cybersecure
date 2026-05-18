import { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Shield, Activity, Globe, Server, Database, Monitor, Zap, Radio, Target } from 'lucide-react';
import { cn } from '../lib/utils';

const nodes = [
  { id: 'internet', label: 'EXT_SIGNAL', icon: Globe, x: 15, y: 50, color: '#00f0ff' },
  { id: 'firewall', label: 'SEC_WALL', icon: Shield, x: 32, y: 50, color: '#ff003c' },
  { id: 'server', label: 'NEURAL_CORE', icon: Server, x: 50, y: 50, color: '#00f0ff' },
  { id: 'db1', label: 'ALPHA_STORAGE', icon: Database, x: 70, y: 32, color: '#7000ff' },
  { id: 'db2', label: 'BETA_STORAGE', icon: Database, x: 70, y: 68, color: '#7000ff' },
  { id: 'client1', label: 'NODE_ALPHA', icon: Monitor, x: 50, y: 22, color: '#00ff66' },
  { id: 'client2', label: 'NODE_BETA', icon: Monitor, x: 50, y: 78, color: '#00ff66' },
];

const connections = [
  { id: 'c1', from: 'internet', to: 'firewall' },
  { id: 'c2', from: 'firewall', to: 'server' },
  { id: 'c3', from: 'server', to: 'db1' },
  { id: 'c4', from: 'server', to: 'db2' },
  { id: 'c5', from: 'server', to: 'client1' },
  { id: 'c6', from: 'server', to: 'client2' },
];

export default function JarvisHUD() {
  const [pulsingNodes, setPulsingNodes] = useState({});
  const [isThreat, setIsThreat] = useState(false);
  const [lastPacket, setLastPacket] = useState(null);

  const containerRef = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-400, 400], [20, -20]), { stiffness: 50, damping: 25 });
  const rotateY = useSpring(useTransform(mouseX, [-400, 400], [-25, 25]), { stiffness: 50, damping: 25 });
  const translateZ = useSpring(useTransform(mouseY, [-400, 400], [50, -50]), { stiffness: 50, damping: 25 });

  useEffect(() => {
    const handleNewPacket = (e) => {
      const p = e.detail;
      const isSuspicious = p.risk === 'Suspicious' || p.risk === 'Blocked';
      setLastPacket(p);

      if (isSuspicious) {
        setIsThreat(true);
        setTimeout(() => setIsThreat(false), 3000);
      }

      // Map packet to nodes (simplified for brevity)
      const srcNode = nodes[Math.floor(Math.random() * nodes.length)].id;
      setPulsingNodes(prev => ({ ...prev, [srcNode]: true }));
      setTimeout(() => setPulsingNodes(prev => ({ ...prev, [srcNode]: false })), 800);
    };

    window.addEventListener('new-packet', handleNewPacket);
    return () => window.removeEventListener('new-packet', handleNewPacket);
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseMove={(e) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        mouseX.set(e.clientX - rect.left - rect.width / 2);
        mouseY.set(e.clientY - rect.top - rect.height / 2);
      }}
      className="relative w-full h-[850px] flex items-center justify-center overflow-hidden bg-[#020205]/40 rounded-[40px] border border-white/5 cursor-none"
    >
      {/* Interactive 3D HUD Stage */}
      <motion.div
        style={{ rotateX, rotateY, translateZ, perspective: 1200 }}
        className="relative w-full h-full flex items-center justify-center preserve-3d"
      >
        {/* Dynamic Glowing Rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="absolute w-[750px] h-[750px] border border-primary/20 rounded-full flex items-center justify-center"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-black border border-primary/40 rounded-full text-[10px] font-black text-primary uppercase tracking-[0.5em] backdrop-blur-md">
              Spatial_Sync_Active
            </div>
          </motion.div>

          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className="absolute w-[650px] h-[650px] border border-dashed border-white/5 rounded-full"
          />

          {/* Radar Sweep Beam */}
          <div className="absolute w-[600px] h-[600px] rounded-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-conic from-primary/10 via-transparent to-transparent animate-spin-slow" style={{ animationDuration: '4s' }} />
          </div>
        </div>

        {/* Main Network Topology (SVG) */}
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full p-24 overflow-visible z-10">
          <defs>
            <filter id="hyper-glow">
              <feGaussianBlur stdDeviation="1" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <radialGradient id="node-gradient">
              <stop offset="0%" stopColor="rgba(255,255,255,0.2)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>

          {/* High-Tech Connections */}
          {connections.map((conn) => {
            const from = nodes.find(n => n.id === conn.from);
            const to = nodes.find(n => n.id === conn.to);
            return (
              <g key={conn.id}>
                <path d={`M ${from.x} ${from.y} L ${to.x} ${to.y}`} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.8" />
                <path
                  d={`M ${from.x} ${from.y} L ${to.x} ${to.y}`}
                  fill="none"
                  stroke={isThreat ? "#ff003c" : "#00f0ff"}
                  strokeWidth="0.4"
                  strokeDasharray="2 6"
                  className="animate-dash"
                  style={{ opacity: 0.3 }}
                />
              </g>
            );
          })}

          {/* Holographic Nodes */}
          {nodes.map((node) => {
            const Icon = node.icon;
            const isPulsing = pulsingNodes[node.id];
            return (
              <g key={node.id} className="group/node">
                <circle cx={node.x} cy={node.y} r="6" fill="url(#node-gradient)" className="animate-pulse" style={{ animationDuration: '3s' }} />
                <rect
                  x={node.x - 4} y={node.y - 4} width="8" height="8" rx="2"
                  fill="rgba(10,10,18,0.9)"
                  stroke={isPulsing ? node.color : "rgba(255,255,255,0.1)"}
                  strokeWidth="0.4"
                  className="transition-all duration-500 shadow-2xl"
                  filter="url(#hyper-glow)"
                />
                <foreignObject x={node.x - 2.5} y={node.y - 2.5} width="5" height="5">
                  <div className="w-full h-full flex items-center justify-center pointer-events-none">
                    <Icon className={cn("w-full h-full transition-all duration-500", isPulsing ? "text-white scale-125" : "text-white/30")} style={{ color: isPulsing ? node.color : undefined }} />
                  </div>
                </foreignObject>
                <text x={node.x} y={node.y + 8} textAnchor="middle" className="text-[2px] font-black uppercase tracking-[0.4em] fill-white/20 select-none">{node.label}</text>
              </g>
            );
          })}
        </svg>

        {/* Floating Side Info Panels */}
        <div className="absolute inset-0 p-16 flex flex-col justify-between pointer-events-none">
          <div className="flex justify-between items-start">
            <motion.div
              animate={isThreat ? { x: [0, -5, 5, 0], borderColor: ['#ff003c', 'rgba(255,255,255,0.1)'] } : {}}
              className="glass-card p-6 border-white/10 w-72 backdrop-blur-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-[2px] bg-primary/40 animate-scan-horizontal" />
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Radio className={cn("w-4 h-4", isThreat ? "text-danger" : "text-primary")} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">Neural Feed</span>
                </div>
                <div className="text-[8px] font-mono text-white/30">00:24:99</div>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="text-[8px] text-white/20 uppercase font-black">Active Signature</div>
                  <div className="text-[11px] font-mono text-primary truncate">{lastPacket?.srcIp || "WAITING_FOR_SIGNAL..."}</div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-primary/40 w-1/2 animate-pulse" />
                  </div>
                  <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-secondary/40 w-3/4 animate-pulse" />
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="text-right space-y-4">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Command Core</span>
                <h2 className="text-6xl font-black text-white tracking-tighter uppercase leading-tight">MATRIX<br /><span className="opacity-30">OMEGA</span></h2>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-end">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center relative group">
                <div className="absolute inset-0 bg-primary/5 blur-xl animate-pulse" />
                <Target className="w-10 h-10 text-primary opacity-60" />
                <div className="absolute -bottom-2 -right-2 bg-primary text-black px-2 py-0.5 rounded text-[8px] font-black">LIVE</div>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] font-black text-white/20 uppercase tracking-widest">Topology Security</div>
                <div className="text-2xl font-black text-white">ALPHA CLEARANCE</div>
              </div>
            </div>

            <div className="glass-card p-6 border-white/10 w-72 backdrop-blur-2xl flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Core Latency</span>
                <div className="text-2xl font-black text-primary">0.004ms</div>
              </div>
              <Zap className="w-8 h-8 text-secondary" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Decorative Overlays */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="hud-corner top-10 left-10 border-t-2 border-l-2 w-20 h-20 border-primary/20" />
        <div className="hud-corner bottom-10 right-10 border-b-2 border-r-2 w-20 h-20 border-primary/20" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.02)_1px,transparent_1px)] bg-[size:100%_4px] opacity-20" />
      </div>

      {/* Custom Crosshair Cursor */}
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 pointer-events-none z-[100] border border-primary/40 rounded-full flex items-center justify-center"
        style={{ x: mouseX, y: mouseY, marginLeft: '-16px', marginTop: '-16px' }}
      >
        <div className="w-1 h-1 bg-primary rounded-full shadow-[0_0_10px_#00f0ff]" />
      </motion.div>
    </div>
  );
}
