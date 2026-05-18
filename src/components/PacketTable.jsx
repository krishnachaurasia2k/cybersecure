import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Search, ArrowUpDown, Filter, Activity } from 'lucide-react';
import { cn } from '../lib/utils';

export default function PacketTable() {
  const [packets, setPackets] = useState([]);

  // Filters & Sorting State
  const [searchIp, setSearchIp] = useState('');
  const [searchDevice, setSearchDevice] = useState('');
  const [filterProtocol, setFilterProtocol] = useState('All');
  const [filterRisk, setFilterRisk] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'time', direction: 'desc' });

  // Listen for global packet events dispatched by Layout.jsx
  useEffect(() => {
    const handleNewPacket = (e) => {
      const p = e.detail;
      if (!p) return;
      setPackets(prev => {
        // Check for duplicates
        if (prev.some(existing => existing && String(existing.id) === String(p.id))) {
          return prev;
        }
        // Prepend and keep max 100
        return [p, ...prev].slice(0, 100);
      });
    };

    window.addEventListener('new-packet', handleNewPacket);
    return () => window.removeEventListener('new-packet', handleNewPacket);
  }, []);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Filter and Sort Data with Null Safety
  const processedPackets = useMemo(() => {
    let filtered = packets.filter(packet => {
      if (!packet) return false;

      const src = (packet.srcIp || packet.source_ip || '').toLowerCase();
      const dst = (packet.destIp || packet.destination_ip || '').toLowerCase();
      const matchesIp = src.includes(searchIp.toLowerCase()) || dst.includes(searchIp.toLowerCase());

      const deviceStr = String(packet.deviceInfo || 'Unknown').toLowerCase();
      const matchesDevice = searchDevice === '' || deviceStr.includes(searchDevice.toLowerCase());

      let matchesProtocol = filterProtocol === 'All';
      if (!matchesProtocol) {
        const proto = (packet.protocol || '').toString();
        if (filterProtocol === 'Web') {
          matchesProtocol = proto.includes('Web') || proto.includes('HTTPS');
        } else if (filterProtocol === 'Video') {
          matchesProtocol = proto.includes('QUIC') || proto.includes('Video');
        } else if (filterProtocol === 'Remote') {
          matchesProtocol = proto.includes('SSH') || proto.includes('RDP');
        } else {
          matchesProtocol = proto.includes(filterProtocol);
        }
      }

      const matchesRisk = filterRisk === 'All' || packet.risk === filterRisk;
      return matchesIp && matchesDevice && matchesProtocol && matchesRisk;
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (!a || !b) return 0;
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [packets, searchIp, searchDevice, filterProtocol, filterRisk, sortConfig]);

  const SortableHeader = ({ label, sortKey }) => (
    <th
      className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-white/5 transition-colors group"
      onClick={() => handleSort(sortKey)}
    >
      <div className="flex items-center space-x-1">
        <span>{label}</span>
        <ArrowUpDown className={cn(
          "w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity",
          sortConfig.key === sortKey ? "opacity-100 text-[#00f0ff]" : ""
        )} />
      </div>
    </th>
  );

  return (
    <div className="w-full glass-panel flex flex-col h-[75vh] relative overflow-hidden">

      {/* Control Bar */}
      <div className="p-4 border-b border-white/10 flex flex-col xl:flex-row gap-4 items-center justify-between bg-black/20">
        <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search IP or Host..."
              value={searchIp}
              onChange={(e) => setSearchIp(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#00f0ff] transition-all"
            />
          </div>

          <div className="relative w-full md:w-32">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
            <input
              type="text"
              placeholder="Device..."
              value={searchDevice}
              onChange={(e) => setSearchDevice(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#00f0ff] transition-all"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center space-x-2">
            <select
              value={filterProtocol}
              onChange={(e) => setFilterProtocol(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00f0ff]"
            >
              <option value="All">All Traffic</option>
              <option value="Web">Web (HTTPS/HTTP)</option>
              <option value="Video">Video (QUIC/YT)</option>
              <option value="Remote">Remote (SSH/RDP)</option>
              <option value="DNS">DNS Queries</option>
              <option value="TCP">TCP Raw</option>
              <option value="UDP">UDP Raw</option>
            </select>
          </div>

          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00f0ff]"
          >
            <option value="All">All Risks</option>
            <option value="Normal">Normal</option>
            <option value="Suspicious">Suspicious</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto flex-grow relative custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-20 bg-[rgba(15,15,20,0.95)] backdrop-blur-xl border-b border-white/10 shadow-lg">
            <tr>
              <SortableHeader label="Time" sortKey="time" />
              <SortableHeader label="Source IP" sortKey="srcIp" />
              <SortableHeader label="Destination IP" sortKey="destIp" />
              <SortableHeader label="Protocol" sortKey="protocol" />
              <SortableHeader label="Device Info" sortKey="deviceInfo" />
              <SortableHeader label="Risk" sortKey="risk" />
            </tr>
          </thead>

          <tbody className="divide-y divide-white/5">
            <AnimatePresence initial={false}>
              {processedPackets.map((packet, idx) => {
                if (!packet) return null;
                const isSuspicious = packet.risk === 'Suspicious';

                return (
                  <motion.tr
                    key={packet.id || idx}
                    layout
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, transition: { duration: 0.2 } }}
                    transition={{ duration: 0.4 }}
                    className={cn(
                      "group hover:bg-white/5 transition-colors relative",
                      isSuspicious && "bg-[rgba(255,0,60,0.05)] border-l-2 border-l-[#ff003c]"
                    )}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-mono">
                      {packet.time}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200 font-mono">
                      {packet.srcIp || packet.source_ip}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200 font-mono">
                      {packet.destIp || packet.destination_ip}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-white/10 rounded-md text-gray-300">
                        {packet.protocol}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-mono">
                      {packet.deviceInfo || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isSuspicious ? (
                        <div className="flex items-center space-x-2 text-[#ff003c] glow-text-danger bg-[#ff003c]/10 px-3 py-1 rounded-full w-fit">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="text-xs font-bold tracking-wider">SUSPICIOUS</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 text-[#00ff66] bg-[#00ff66]/10 px-3 py-1 rounded-full w-fit">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="text-xs font-medium tracking-wider">NORMAL</span>
                        </div>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
            {processedPackets.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center py-20 text-gray-500">
                  <div className="flex flex-col items-center">
                    <Activity className="w-8 h-8 mb-4 opacity-20 animate-pulse" />
                    <span className="text-sm font-black uppercase tracking-[0.2em]">Waiting for live telemetry...</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
