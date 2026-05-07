import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, User, ShieldAlert, Cpu, Activity, CameraOff, RefreshCw } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [status, setStatus] = useState('idle'); // 'idle', 'scanning', 'verifying', 'success', 'error'
  const [isHumanInFrame, setIsHumanInFrame] = useState(false);
  const [progress, setProgress] = useState(0);
  const [cameraError, setCameraError] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720, facingMode: 'user' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Stabilized presence monitor
        const presenceInterval = setInterval(() => {
          // In a real app, this would be actual face-api detection
          // Here we simulate a very stable detection once it's found
          const score = Math.random();
          if (score > 0.05) {
            setIsHumanInFrame(true);
          } else {
            // Only drop if it's a significant loss of signal
            setIsHumanInFrame(false);
          }
        }, 500);
        return () => clearInterval(presenceInterval);
      }
    } catch (err) {
      console.error("Camera access denied", err);
      setCameraError("Camera Access Blocked. Please check browser permissions.");
      setStatus('error');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
  };

  const startScan = () => {
    if (status === 'error' || !videoRef.current) return;
    setStatus('scanning');
    setProgress(0);
    
    let currentProgress = 0;
    const interval = setInterval(() => {
      // Only progress if human is detected
      if (isHumanInFrame) {
        currentProgress += 1.5; // Slightly faster for responsiveness
        setProgress(Math.min(currentProgress, 100));
        
        if (currentProgress >= 100) {
          clearInterval(interval);
          verifyIdentity();
        }
      }
    }, 40);
  };

  const verifyIdentity = () => {
    setStatus('verifying');
    setTimeout(() => {
      setStatus('success');
      setTimeout(() => {
        onLoginSuccess();
      }, 1500);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#050508] flex items-center justify-center font-['Inter',sans-serif]">
      {/* Background Neural Grid */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#00f0ff 0.5px, transparent 0)', backgroundSize: '30px 30px' }} />

      <div className="relative w-full max-w-[480px] flex flex-col items-center">
        
        {/* Apple-Style Biometric Container */}
        <div className="relative w-64 h-64 mb-16">
          {/* Outer Symmetry Ring */}
          <motion.div 
            animate={status === 'scanning' ? { rotate: 360 } : {}}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className={`absolute -inset-6 border-[1px] border-dashed rounded-full transition-colors duration-1000 ${
              status === 'success' ? 'border-[#00ff66]/40' : 'border-white/10'
            }`} 
          />

          {/* Neural Portal */}
          <div className={`relative w-full h-full rounded-[60px] overflow-hidden border-[1px] transition-all duration-700 ${
            status === 'success' ? 'border-[#00ff66] shadow-[0_0_50px_rgba(0,255,102,0.2)]' : 
            status === 'error' ? 'border-red-500/50' :
            status === 'verifying' ? 'border-[#00f0ff] animate-pulse' : 
            isHumanInFrame ? 'border-white/20' : 'border-white/5'
          }`}>
            <video 
              ref={videoRef} 
              autoPlay 
              muted 
              playsInline 
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ${
                status === 'success' ? 'scale-110 blur-sm brightness-50' : 
                isHumanInFrame ? 'grayscale-0' : 'grayscale brightness-30'
              }`}
            />

            {/* Neural Mesh Overlay */}
            <AnimatePresence>
              {status === 'scanning' && isHumanInFrame && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 pointer-events-none"
                >
                  {/* Landmark Dots */}
                  {Array.from({ length: 30 }).map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ 
                        scale: [1, 1.4, 1],
                        opacity: [0.4, 0.8, 0.4]
                      }}
                      transition={{ duration: 1.5, delay: i * 0.04, repeat: Infinity }}
                      className="absolute w-1 h-1 bg-[#00f0ff] rounded-full shadow-[0_0_8px_#00f0ff]"
                      style={{ 
                        left: `${25 + Math.random() * 50}%`, 
                        top: `${25 + Math.random() * 50}%` 
                      }}
                    />
                  ))}
                  {/* Scanning HUD Line */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-[1px] bg-[#00f0ff]/60 animate-scan shadow-[0_0_20px_#00f0ff]" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Signal Lost Overlay */}
            <AnimatePresence>
              {status === 'scanning' && !isHumanInFrame && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px]"
                >
                  <ShieldAlert className="w-12 h-12 text-white/40 mb-2 animate-pulse" />
                  <span className="text-[10px] text-white/60 font-black uppercase tracking-widest">Signal Lost</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Overlay */}
            {status === 'error' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-500/10 backdrop-blur-md px-8 text-center">
                <CameraOff className="w-12 h-12 text-red-500 mb-4" />
                <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest">{cameraError}</p>
                <button 
                  onClick={startCamera}
                  className="mt-6 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-xl text-red-500 text-[10px] font-black uppercase tracking-widest flex items-center space-x-2"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Retry Connection</span>
                </button>
              </div>
            )}

            {/* Success Icon Morph */}
            <AnimatePresence>
              {status === 'success' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 flex items-center justify-center bg-[#00ff66]/10 backdrop-blur-sm"
                >
                  <motion.div
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    className="w-24 h-24 text-[#00ff66]"
                  >
                    <ShieldCheck className="w-full h-full" strokeWidth={1} />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Identity Label */}
        <div className="text-center mb-12">
          <motion.div 
            animate={isHumanInFrame ? { opacity: 1 } : { opacity: 0.3 }}
            className="inline-flex items-center space-x-2 mb-4 px-4 py-1.5 bg-white/5 rounded-full border border-white/5"
          >
            <div className={`w-1.5 h-1.5 rounded-full ${isHumanInFrame ? 'bg-[#00f0ff] animate-pulse' : 'bg-white/20'}`} />
            <span className="text-[10px] text-white/60 font-black uppercase tracking-[0.2em]">
              {status === 'success' ? 'Authorization Granted' : status === 'error' ? 'Connection Fault' : isHumanInFrame ? 'Neural Signature Found' : 'Awaiting Face Alignment'}
            </span>
          </motion.div>
          <h1 className="text-4xl font-black text-white tracking-tight">
            {status === 'success' ? 'Welcome Back' : 'Mission Control'}
          </h1>
          <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.4em] mt-2">Biometric Identity Secure</p>
        </div>

        {/* Progress / Interaction Area */}
        <div className="w-full px-12">
          <AnimatePresence mode="wait">
            {status === 'idle' || status === 'error' ? (
              <motion.button
                key="btn"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={startScan}
                disabled={status === 'error'}
                className={`w-full py-4 text-xs font-black uppercase tracking-[0.3em] rounded-2xl transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)] ${
                  status === 'error' ? 'bg-white/5 text-white/20' : 'bg-white text-black hover:bg-gray-100'
                }`}
              >
                Start Face ID Scan
              </motion.button>
            ) : status === 'success' ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full py-4 bg-[#00ff66]/10 border border-[#00ff66]/20 rounded-2xl text-center"
              >
                <span className="text-[#00ff66] text-xs font-black uppercase tracking-[0.2em]">Identity Confirmed: Commander.</span>
              </motion.div>
            ) : (
              <div className="w-full">
                <div className="flex justify-between items-end mb-3">
                  <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">
                    {!isHumanInFrame ? 'Align Face to Resume...' : status === 'verifying' ? 'Verifying Bio-Signature...' : 'Mapping Face Contours...'}
                  </span>
                  <span className="text-xs text-[#00f0ff] font-mono font-bold">{Math.floor(progress)}%</span>
                </div>
                <div className="w-full h-[2px] bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className={`h-full transition-all duration-300 ${!isHumanInFrame ? 'bg-white/20' : 'bg-gradient-to-r from-[#00f0ff] to-[#00ff66] shadow-[0_0_10px_#00f0ff]'}`}
                  />
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* System Footer Info */}
        <div className="mt-16 flex items-center space-x-8 opacity-30">
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4" />
            <span className="text-[9px] font-bold uppercase tracking-widest">Neural: Active</span>
          </div>
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4" />
            <span className="text-[9px] font-bold uppercase tracking-widest">Hz: 60fps</span>
          </div>
        </div>
      </div>
    </div>
  );
}
