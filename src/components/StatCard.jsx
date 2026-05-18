import { useEffect, useRef } from 'react';
import { motion, useAnimation, useInView, useSpring, useTransform } from 'framer-motion';
import { cn } from '../lib/utils';

export default function StatCard({ title, value, icon: Icon, color = 'primary', previousValue = 0 }) {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const springValue = useSpring(previousValue, {
    stiffness: 80,
    damping: 24,
  });

  const displayValue = useTransform(springValue, (current) => Math.round(current).toLocaleString());

  useEffect(() => {
    springValue.set(value);
    if (value !== previousValue && previousValue !== 0) {
      controls.start({
        scale: [1, 1.02, 1],
        transition: { duration: 0.3 }
      });
    }
  }, [value, previousValue, controls, springValue]);

  const variants = {
    primary: "text-primary border-primary/20 bg-primary/5",
    danger: "text-danger border-danger/20 bg-danger/5",
    success: "text-success border-success/20 bg-success/5",
    purple: "text-secondary border-secondary/20 bg-secondary/5",
  };

  const currentVariant = variants[color] || variants.primary;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
      whileHover={{ y: -5 }}
      className={cn(
        "glass-card p-1 group",
        currentVariant
      )}
    >
      {/* HUD Corners */}
      <div className="hud-corner top-0 left-0 border-t-2 border-l-2" />
      <div className="hud-corner top-0 right-0 border-t-2 border-r-2" />
      <div className="hud-corner bottom-0 left-0 border-b-2 border-l-2" />
      <div className="hud-corner bottom-0 right-0 border-b-2 border-r-2" />

      <div className="p-8 flex items-center space-x-8 relative z-10">
        <div className={cn(
          "w-20 h-20 rounded-[20px] flex items-center justify-center relative overflow-hidden transition-all duration-500 group-hover:scale-110",
          color === 'primary' ? 'bg-primary/10' :
            color === 'danger' ? 'bg-danger/10' :
              color === 'success' ? 'bg-success/10' : 'bg-secondary/10'
        )}>
          {/* Internal Glow */}
          <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Icon className="w-10 h-10 transition-transform duration-500" />
        </div>

        <div className="flex flex-col space-y-1">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 group-hover:opacity-100 transition-opacity">{title}</span>
          <motion.div
            animate={controls}
            className="text-4xl font-black text-white tracking-tighter"
          >
            {displayValue}
          </motion.div>
        </div>
      </div>

      {/* Hover Background Sweep */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
    </motion.div>
  );
}
