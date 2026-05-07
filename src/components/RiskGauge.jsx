import { useEffect, useState, useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function RiskGauge() {
  const [stats, setStats] = useState({
    totalPackets: 0,
    threatAlerts: 0
  });
  
  useEffect(() => {
    const handleStatsUpdate = (e) => {
      setStats(e.detail);
    };

    window.addEventListener('stats-update', handleStatsUpdate);
    return () => window.removeEventListener('stats-update', handleStatsUpdate);
  }, []);

  const riskScore = useMemo(() => {
    if (stats.totalPackets === 0) return 0;
    return Math.round((stats.threatAlerts / stats.totalPackets) * 100);
  }, [stats]);

  const data = {
    labels: ['Risk', 'Safe'],
    datasets: [
      {
        data: [riskScore, 100 - riskScore || 100],
        backgroundColor: [
          riskScore > 50 ? 'rgba(255, 0, 60, 0.8)' : 'rgba(0, 240, 255, 0.8)',
          'rgba(255, 255, 255, 0.05)',
        ],
        borderColor: [
          riskScore > 50 ? '#ff003c' : '#00f0ff',
          'rgba(255, 255, 255, 0.1)',
        ],
        borderWidth: 1,
        circumference: 180,
        rotation: 270,
        cutout: '80%',
      },
    ],
  };

  const options = {
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    maintainAspectRatio: false,
    responsive: true,
  };

  return (
    <div className="glass-panel p-6 flex flex-col items-center justify-center relative min-h-[280px] overflow-hidden group">
      <div className="absolute top-4 left-6">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Risk Score</h3>
      </div>
      
      <div className="w-48 h-24 mt-4 relative">
        <Doughnut data={data} options={options} />
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
          <motion.span 
            key={riskScore}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cn(
              "text-4xl font-bold tracking-tighter",
              riskScore > 50 ? "text-[#ff003c] glow-text-danger" : "text-[#00f0ff] glow-text-primary"
            )}
          >
            {riskScore}%
          </motion.span>
          <span className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">Threat Level</span>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-8 w-full border-t border-white/5 pt-4">
        <div className="text-center">
          <p className="text-[10px] text-gray-500 uppercase">Total Packets</p>
          <p className="text-lg font-bold text-white">{stats.totalPackets}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-gray-500 uppercase">Total Alerts</p>
          <p className="text-lg font-bold text-[#ff003c]">
            {stats.threatAlerts}
          </p>
        </div>
      </div>

      {/* Subtle background glow */}
      <div className={cn(
        "absolute -bottom-10 -right-10 w-32 h-32 blur-3xl opacity-20 transition-colors duration-500",
        riskScore > 50 ? "bg-[#ff003c]" : "bg-[#00f0ff]"
      )} />
    </div>
  );
}
