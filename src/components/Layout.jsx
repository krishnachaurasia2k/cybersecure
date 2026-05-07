import { useEffect, useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Shield, Activity, List, BarChart2, Volume2, ShieldAlert, Target } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

export default function Layout() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Background data fetching (Continuous across all pages)
  useEffect(() => {
    const seenPackets = new Set();

    const fetchAllData = async () => {
      try {
        // 1. Fetch Packets
        const pResponse = await fetch('http://127.0.0.1:5001/api/packets');
        if (pResponse.ok) {
          const packets = await pResponse.json();
          // Dispatch individual packet events only for NEW packets
          packets.forEach(p => {
            if (p && !seenPackets.has(p.id)) {
              seenPackets.add(p.id);
              window.dispatchEvent(new CustomEvent('new-packet', { detail: p }));
              if (p.risk === 'Suspicious' || p.risk === 'Blocked') {
                window.dispatchEvent(new CustomEvent('threat-alert', { detail: p }));
              }
              
              // Keep set size manageable
              if (seenPackets.size > 500) {
                const firstItem = seenPackets.values().next().value;
                seenPackets.delete(firstItem);
              }
            }
          });
        }
        
        // 2. Fetch Stats
        const sResponse = await fetch('http://127.0.0.1:5001/api/stats');
        if (sResponse.ok) {
          const stats = await sResponse.json();
          window.dispatchEvent(new CustomEvent('stats-update', { detail: stats }));
        }
      } catch (err) {
        // Silently retry
      }
    };

    fetchAllData();
    const interval = setInterval(fetchAllData, 2000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { to: '/', icon: Activity, label: 'Overview' },
    { to: '/packets', icon: List, label: 'Stream' },
    { to: '/charts', icon: BarChart2, label: 'Analytics' },
    { to: '/alerts', icon: ShieldAlert, label: 'Threats', danger: true },
    { to: '/defense', icon: Shield, label: 'Defense' },
    { to: '/honeypot', icon: Target, label: 'Lab', danger: true },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">
      {/* Top Navbar */}
      <header 
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6 py-4 flex justify-center",
          scrolled ? "top-2" : "top-0"
        )}
      >
        <div 
          className={cn(
            "w-full container mx-auto px-6 h-16 flex items-center justify-between transition-all duration-500",
            scrolled 
              ? "glass-panel bg-[rgba(10,10,15,0.85)] border-white/10 shadow-2xl rounded-2xl max-w-6xl" 
              : "bg-transparent border-transparent"
          )}
        >
          <div className="flex items-center space-x-3 group cursor-pointer">
            <div className="relative">
              <Shield className="w-8 h-8 text-[#00f0ff] group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute inset-0 bg-[#00f0ff]/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="text-xl font-black tracking-tighter text-white">
              CYBER<span className="text-[#00f0ff]">SECURE</span>
            </span>
          </div>
          
          <nav className="hidden lg:flex items-center bg-white/5 p-1 rounded-xl border border-white/5 relative">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-300 relative z-10",
                    isActive ? "text-white" : "text-gray-400 hover:text-white"
                  )}
                >
                  <item.icon className={cn("w-4 h-4", isActive && (item.danger ? "text-[#ff003c]" : "text-[#00f0ff]"))} />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{item.label}</span>
                  
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className={cn(
                        "absolute inset-0 rounded-lg -z-10 border",
                        item.danger 
                          ? "bg-[#ff003c]/10 border-[#ff003c]/30 shadow-[0_0_15px_rgba(255,0,60,0.2)]" 
                          : "bg-[#00f0ff]/10 border-[#00f0ff]/30 shadow-[0_0_15px_rgba(0,240,255,0.2)]"
                      )}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </NavLink>
              );
            })}
          </nav>
 
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => {
                const current = localStorage.getItem('sound-alerts') === 'true';
                localStorage.setItem('sound-alerts', !current);
                window.dispatchEvent(new Event('sound-settings-changed'));
              }}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all border border-white/10 hover:border-white/20 active:scale-95"
              title="Toggle Sound Alerts"
            >
              <Volume2 className="w-5 h-5" />
            </button>
            <div 
              onClick={() => {
                localStorage.removeItem('isAuthenticated');
                window.location.reload();
              }}
              className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#00f0ff] to-[#b026ff] p-[1px] cursor-pointer active:scale-95 transition-transform hover:shadow-[0_0_15px_rgba(0,240,255,0.4)]"
              title="Logout"
            >
              <div className="w-full h-full rounded-full bg-[#0a0a0f] flex items-center justify-center overflow-hidden">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>
      </header>
 
      {/* Main Content Area */}
      <main className="flex-grow pt-28 pb-12">
        <div className="container mx-auto px-6">
          <Outlet />
        </div>
      </main>
      
      {/* Footer Decoration */}
      <footer className="py-12 text-center border-t border-white/5 bg-black/20">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-2 opacity-40">
            <Shield className="w-4 h-4 text-[#00f0ff]" />
            <span className="text-[10px] font-bold tracking-widest uppercase">Cybersecure v2.0.4</span>
          </div>
          <p className="text-[10px] text-gray-600 font-bold tracking-[0.2em] uppercase">
            &copy; 2026 AUTONOMOUS DEFENSE SYSTEM. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center space-x-4">
            <div className="w-2 h-2 rounded-full bg-[#00ff66] animate-pulse" />
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Network Stable</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
