import { motion } from 'framer-motion';

export default function CyberCore() {
  return (
    <div className="relative w-[350px] h-[350px] md:w-[550px] md:h-[550px] flex items-center justify-center">
      {/* Background Deep Glow */}
      <div className="absolute inset-0 bg-primary/20 blur-[150px] animate-pulse rounded-full" />
      
      {/* Outer Data Ring (Segments) */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 border-[0.5px] border-primary/10 rounded-full"
      >
        {[...Array(24)].map((_, i) => (
          <div
            key={i}
            className="absolute w-[2px] h-[10px] bg-primary/20"
            style={{
              top: '50%',
              left: '50%',
              transform: `rotate(${i * 15}deg) translateY(-270px) translateX(-50%)`,
              transformOrigin: 'top center'
            }}
          />
        ))}
      </motion.div>
      
      {/* Middle Rotating HUD Layer */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute inset-[10%] border border-white/5 rounded-full flex items-center justify-center"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary shadow-[0_0_20px_#00f0ff] rounded-full" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-secondary shadow-[0_0_20px_#7000ff] rounded-full" />
      </motion.div>
      
      {/* The Core Holographic Sphere */}
      <motion.div
        animate={{ 
          scale: [1, 1.05, 1],
          rotateY: [0, 10, -10, 0]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="relative z-10 w-48 h-48 md:w-72 md:h-72 rounded-full flex items-center justify-center overflow-hidden border border-white/10 shadow-[0_0_100px_rgba(0,240,255,0.2)] backdrop-blur-3xl"
      >
        {/* Internal Gradient Layers */}
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-secondary/10 to-transparent opacity-50" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,240,255,0.1),transparent_70%)]" />
        
        {/* Core Content */}
        <div className="relative z-20 flex flex-col items-center">
           <motion.div 
             animate={{ opacity: [0.3, 1, 0.3] }}
             transition={{ duration: 3, repeat: Infinity }}
             className="text-[12px] font-black tracking-[0.8em] text-white/40 uppercase mb-4"
           >
              Neural_Core
           </motion.div>
           <div className="text-7xl font-black text-white glow-text-primary tracking-tighter">AI</div>
        </div>

        {/* Dynamic Scanning Ribbon */}
        <motion.div
          animate={{ top: ['-50%', '150%'] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute left-0 right-0 h-[20%] bg-white/10 blur-xl z-30 pointer-events-none"
        />
      </motion.div>
      
      {/* Outer Floating Accents */}
      <div className="absolute inset-[-15%] pointer-events-none animate-spin-slow" style={{ animationDuration: '60s' }}>
        <div className="absolute top-0 right-0 p-8 border-t-2 border-r-2 border-primary/20 w-24 h-24 rounded-tr-[50px]" />
        <div className="absolute bottom-0 left-0 p-8 border-b-2 border-l-2 border-secondary/20 w-24 h-24 rounded-bl-[50px]" />
      </div>

      {/* Rotating Data Orbitals */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          animate={{ rotate: 360 }}
          transition={{ duration: 30 + i * 10, repeat: Infinity, ease: "linear" }}
          className="absolute border border-primary/5 rounded-full"
          style={{ inset: `${-10 - i * 10}%` }}
        />
      ))}
    </div>
  );
}
