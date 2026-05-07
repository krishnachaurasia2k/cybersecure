import { useEffect, useRef } from 'react';
import { motion, useAnimation, useInView, useSpring, useTransform } from 'framer-motion';
import { cn } from '../lib/utils';

export default function StatCard({ title, value, icon: Icon, color = 'primary', previousValue = 0 }) {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  // Spring animation for number
  const springValue = useSpring(previousValue, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.5
  });
  
  const displayValue = useTransform(springValue, (current) => Math.round(current).toLocaleString());

  useEffect(() => {
    springValue.set(value);
    
    // Trigger pulse on value change if it's not the initial mount
    if (value !== previousValue && previousValue !== 0) {
      controls.start({
        scale: [1, 1.05, 1],
        boxShadow: color === 'danger' 
          ? ["0 0 0px rgba(255,0,60,0)", "0 0 20px rgba(255,0,60,0.6)", "0 0 0px rgba(255,0,60,0)"]
          : ["0 0 0px rgba(0,240,255,0)", "0 0 20px rgba(0,240,255,0.6)", "0 0 0px rgba(0,240,255,0)"],
        transition: { duration: 0.5 }
      });
    }
  }, [value, previousValue, controls, springValue, color]);

  const colorStyles = {
    primary: "text-[#00f0ff] hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] border-[#00f0ff]/20 hover:border-[#00f0ff]/60",
    danger: "text-[#ff003c] hover:shadow-[0_0_20px_rgba(255,0,60,0.4)] border-[#ff003c]/20 hover:border-[#ff003c]/60",
    success: "text-[#00ff66] hover:shadow-[0_0_20px_rgba(0,255,102,0.4)] border-[#00ff66]/20 hover:border-[#00ff66]/60",
    purple: "text-[#b026ff] hover:shadow-[0_0_20px_rgba(176,38,255,0.4)] border-[#b026ff]/20 hover:border-[#b026ff]/60",
  };

  const bgStyles = {
    primary: "bg-[#00f0ff]/10",
    danger: "bg-[#ff003c]/10",
    success: "bg-[#00ff66]/10",
    purple: "bg-[#b026ff]/10",
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
      className={cn(
        "glass-panel p-6 flex items-center space-x-4 transition-all duration-300 relative overflow-hidden",
        colorStyles[color]
      )}
    >
      <motion.div animate={controls} className="absolute inset-0 rounded-xl" />
      
      <div className={cn("p-4 rounded-xl flex-shrink-0 z-10", bgStyles[color])}>
        <Icon className="w-8 h-8" />
      </div>
      
      <div className="flex flex-col z-10">
        <span className="text-gray-400 text-sm font-medium tracking-wider uppercase mb-1">{title}</span>
        <motion.span className="text-3xl font-bold text-white tracking-tight">
          {displayValue}
        </motion.span>
      </div>
    </motion.div>
  );
}
