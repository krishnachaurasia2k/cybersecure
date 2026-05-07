import PacketTable from '../components/PacketTable';
import TerminalLog from '../components/TerminalLog';

export default function PacketView() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Real-Time Packet Stream</h1>
          <p className="text-gray-400">Live monitoring of network ingress and egress traffic.</p>
        </div>
        
        <div className="flex items-center space-x-3 bg-[rgba(20,20,30,0.7)] border border-white/10 px-4 py-2 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#00f0ff] animate-pulse glow-box-primary" />
            <span className="text-sm font-medium text-gray-300">Live Feed Active</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
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
