'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '@/contexts/SocketContext';
import { AlertTriangle, X } from 'lucide-react';

export default function EmergencyBanner() {
  const { emergencyAlert, clearEmergency } = useSocket();
  return (
    <AnimatePresence>
      {emergencyAlert && (
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[9999] bg-red-600 text-white px-4 py-3 flex items-center justify-between gap-4 shadow-lg"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <AlertTriangle className="w-5 h-5 shrink-0 animate-bounce" />
            <div className="min-w-0">
              <p className="font-bold text-sm">{emergencyAlert.title}</p>
              <p className="text-xs text-red-100 truncate">{emergencyAlert.message}</p>
            </div>
          </div>
          <button onClick={clearEmergency} className="shrink-0 p-1 rounded hover:bg-red-700">
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
