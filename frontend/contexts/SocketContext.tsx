'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface EmergencyAlert {
  listingId: string;
  title: string;
  message: string;
  location: { lat: number; lng: number; address: string };
  timestamp: string;
}

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  notifications: Notification[];
  unreadCount: number;
  emergencyAlert: EmergencyAlert | null;
  clearEmergency: () => void;
  markRead: (id: string) => void;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: string;
  createdAt: string;
  read: boolean;
}

const SocketContext = createContext<SocketContextType | null>(null);
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [emergencyAlert, setEmergencyAlert] = useState<EmergencyAlert | null>(null);


  useEffect(() => {
    if (user && token) {
      const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
      socketRef.current = socket;

      socket.on('connect', () => {
        setConnected(true);
        socket.emit('join', { userId: user._id, role: user.role });
      });

      socket.on('disconnect', () => setConnected(false));

      socket.on('notification', (data: Notification) => {
        setNotifications(prev => [{ ...data, read: false }, ...prev]);
        const emoji = data.priority === 'urgent' ? '🚨' : data.priority === 'high' ? '🔔' : '📢';
        toast(`${emoji} ${data.title}`, {
          duration: 4000,
          style: {
            background: '#0f1a13',
            color: '#f0fdf4',
            border: `1px solid ${data.priority === 'urgent' ? '#ef4444' : '#16a34a'}`,
          },
        });
      });

      socket.on('emergency_alert', (data: EmergencyAlert) => {
        setEmergencyAlert(data);
        toast.error(`🚨 EMERGENCY: ${data.title}`, { duration: 10000 });
      });

      socket.on('new_listing', ({ listing }) => {
        if (user.role === 'receiver' || user.role === 'volunteer') {
          toast(`🍽️ New food available: ${listing.title}`, { duration: 3000 });
        }
      });

      return () => {
        socket.disconnect();
        socketRef.current = null;
        setConnected(false);
      };
    }
  }, [user, token]);

  const clearEmergency = () => setEmergencyAlert(null);

  const markRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <SocketContext.Provider value={{
      socket: socketRef.current,
      connected,
      notifications,
      unreadCount,
      emergencyAlert,
      clearEmergency,
      markRead,
    }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
};
