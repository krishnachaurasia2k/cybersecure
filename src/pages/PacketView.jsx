import PacketTable from '../components/PacketTable';
import TerminalLog from '../components/TerminalLog';

export default function PacketView() {
  return (
    <div className="space-y-12 pb-20">
      {/* Hyper-Tech Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pt-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-3 text-primary text-[10px] font-black uppercase tracking-[0.5em]">
             <div className="w-5 h-5 rounded-full border border-primary/40 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_#00f0ff]" />
             </div>
             <span>Telemetry Stream Omega</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-black text-white tracking-tighter uppercase drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
            Live Packet <span className="text-primary">Analyzer</span>
          </h1>
          <p className="text-gray-500 text-lg md:text-xl font-light max-w-2xl leading-relaxed">
            Deep packet inspection across all active neural nodes. Monitoring ingress/egress signals with real-time heuristic analysis.
          </p>
        </div>
        
        <div className="flex items-center space-x-8 bg-white/5 border border-white/10 px-10 py-6 rounded-3xl backdrop-blur-2xl">
          <div className="flex flex-col items-end">
            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Stream Status</span>
            <span className="text-sm font-black text-success glow-text-primary uppercase tracking-tighter">Verified</span>
          </div>
          <div className="w-[1px] h-12 bg-white/10" />
          <div className="flex flex-col items-end">
            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Total Signals</span>
            <span className="text-xl font-black text-white tracking-tighter">1,244,102</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-10">
        <div className="xl:col-span-3">
          <PacketTable />
        </div>
        <div className="xl:col-span-1">
          <TerminalLog />
        </div>
      </div>
    </div>
  );
}
