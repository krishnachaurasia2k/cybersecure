import { useState, useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Pie, Bar } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';
import RiskGauge from '../components/RiskGauge';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Global Chart Defaults for Dark Theme
ChartJS.defaults.color = '#9ca3af';
ChartJS.defaults.font.family = "'Inter', system-ui, sans-serif";
ChartJS.defaults.plugins.legend.labels.usePointStyle = true;
ChartJS.defaults.scale.grid.color = 'rgba(255, 255, 255, 0.05)';
ChartJS.defaults.scale.grid.borderColor = 'rgba(255, 255, 255, 0.1)';

export default function ThreatCharts() {
  // State for charts
  const [timeLabels, setTimeLabels] = useState(Array(20).fill(''));
  const [packetData, setPacketData] = useState(Array(20).fill(0));
  
  const [protocolStats, setProtocolStats] = useState([50, 50]); // TCP, UDP
  const [riskStats, setRiskStats] = useState([100, 0]); // Normal, Suspicious

  // Counter for packets in current interval
  const packetCountRef = useRef(0);

  useEffect(() => {
    // 1. Listen for global stats updates
    const handleStatsUpdate = (e) => {
      const data = e.detail;
      const total = data.tcpTraffic + data.udpTraffic || 1;
      setProtocolStats([
        (data.tcpTraffic / total) * 100,
        (data.udpTraffic / total) * 100
      ]);

      const totalRisk = data.totalPackets || 1;
      const normalCount = data.totalPackets - data.threatAlerts;
      setRiskStats([
        (normalCount / totalRisk) * 100,
        (data.threatAlerts / totalRisk) * 100
      ]);
    };

    // 2. Listen for new packets to count throughput
    const handleNewPacket = () => {
      packetCountRef.current += 1;
    };

    window.addEventListener('stats-update', handleStatsUpdate);
    window.addEventListener('new-packet', handleNewPacket);

    // 3. Update the Line Chart every 2 seconds
    const interval = setInterval(() => {
      const now = new Date().toLocaleTimeString([], { hour12: false, second: '2-digit', minute: '2-digit' });
      
      const currentThroughput = packetCountRef.current;
      packetCountRef.current = 0; // Reset for next interval

      setTimeLabels(prev => [...prev.slice(1), now]);
      setPacketData(prev => [...prev.slice(1), currentThroughput]);
    }, 2000);

    return () => {
      window.removeEventListener('stats-update', handleStatsUpdate);
      window.removeEventListener('new-packet', handleNewPacket);
      clearInterval(interval);
    };
  }, []);

  const lineChartData = {
    labels: timeLabels,
    datasets: [
      {
        label: 'Packets / 2s',
        data: packetData,
        borderColor: '#00f0ff',
        backgroundColor: 'rgba(0, 240, 255, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#00f0ff',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#00f0ff',
        pointRadius: 2,
        pointHoverRadius: 5,
      }
    ]
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 500,
      easing: 'linear'
    },
    scales: {
      y: { beginAtZero: true, suggestedMax: 10, grid: { display: true } },
      x: { grid: { display: false } }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(10, 10, 15, 0.9)',
        titleColor: '#00f0ff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1
      }
    }
  };

  const pieChartData = {
    labels: ['TCP Traffic', 'UDP Traffic'],
    datasets: [
      {
        data: protocolStats,
        backgroundColor: [
          'rgba(176, 38, 255, 0.7)',
          'rgba(0, 255, 102, 0.7)'
        ],
        borderColor: [
          'rgba(176, 38, 255, 1)',
          'rgba(0, 255, 102, 1)'
        ],
        borderWidth: 1,
        hoverOffset: 4
      }
    ]
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { animateScale: true, animateRotate: true, duration: 800 },
    plugins: {
      legend: { position: 'bottom' }
    }
  };

  const barChartData = {
    labels: ['Traffic Classification'],
    datasets: [
      {
        label: 'Normal (%)',
        data: [riskStats[0]],
        backgroundColor: 'rgba(0, 240, 255, 0.6)',
        borderColor: '#00f0ff',
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: 'Suspicious (%)',
        data: [riskStats[1]],
        backgroundColor: 'rgba(255, 0, 60, 0.6)',
        borderColor: '#ff003c',
        borderWidth: 1,
        borderRadius: 4,
      }
    ]
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { beginAtZero: true, max: 100 }
    },
    animation: { duration: 800 },
    plugins: {
      legend: { position: 'bottom' }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Threat Visualization</h1>
          <p className="text-gray-400">Real-time analytical breakdown of live network traffic.</p>
        </div>
        <div className="flex items-center space-x-2 bg-purple-500/10 text-purple-400 px-4 py-2 rounded-full border border-purple-500/30 glow-box-purple">
          <Activity className="w-4 h-4 animate-spin-slow" />
          <span className="text-sm font-medium">Live Feed Connected</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <RiskGauge />
        </div>
        <div className="lg:col-span-3">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-panel p-6 h-full min-h-[350px] flex flex-col"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Packets Over Time</h3>
            <div className="flex-grow relative">
              <Line data={lineChartData} options={lineChartOptions} />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart - TCP vs UDP */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass-panel p-6 min-h-[350px] flex flex-col"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Protocol Distribution</h3>
          <div className="flex-grow relative">
            <Pie data={pieChartData} options={pieChartOptions} />
          </div>
        </motion.div>

        {/* Bar Chart - Normal vs Suspicious */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="glass-panel p-6 lg:col-span-2 min-h-[350px] flex flex-col"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Risk Assessment (%)</h3>
          <div className="flex-grow relative">
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
