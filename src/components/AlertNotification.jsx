import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export default function AlertNotification() {
  const [alerts, setAlerts] = useState([]);
  const audioRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    // We create an Audio object if sound is enabled (this requires user interaction to play usually)
    audioRef.current = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU'); // Mock tiny silent wav just to initialize, real sound logic would load a local asset
    
    const handleThreat = (e) => {
      const newAlert = {
        id: Date.now() + Math.random(),
        packet: e.detail,
        timestamp: new Date().toLocaleTimeString()
      };
      
      setAlerts(prev => [newAlert, ...prev].slice(0, 3));

      // Play sound if enabled
      if (localStorage.getItem('sound-alerts') === 'true') {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
        audio.volume = 0.3;
        audio.play().catch(err => console.log("Audio play blocked", err));
      }

      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        setAlerts(prev => prev.filter(a => a.id !== newAlert.id));
      }, 5000);
    };

    window.addEventListener('threat-alert', handleThreat);
    return () => window.removeEventListener('threat-alert', handleThreat);
  }, []);

  const dismissAlert = (id) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  // TURNED OFF (per user request) - All threats now handled in /alerts page
  return null;
}
