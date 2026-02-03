import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Connect to Socket.io server
      const newSocket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000', {
        auth: {
          userId: user._id,
          role: user.role,
        },
      });

      newSocket.on('connect', () => {
        console.log('✅ Socket connected');
        setConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('❌ Socket disconnected');
        setConnected(false);
      });

      // Listen for notifications
      newSocket.on('notification', (data) => {
        console.log('🔔 Notification received:', data);
        toast.info(data.message);
      });

      // Donor-specific events
      if (user.role === 'donor') {
        newSocket.on('profile_verified', (data) => {
          toast.success('🎉 Your profile has been verified!');
        });

        newSocket.on('match_found', (data) => {
          toast.success(`💝 Match found for ${data.organType}!`);
        });
      }

      // Hospital-specific events
      if (user.role === 'hospital') {
        newSocket.on('request_matched', (data) => {
          toast.success(`✅ Match found for your ${data.organType} request!`);
        });

        newSocket.on('hospital_verified', (data) => {
          toast.success('🎉 Your hospital has been verified!');
        });
      }

      // Admin-specific events
      if (user.role === 'admin') {
        newSocket.on('new_donor_registration', (data) => {
          toast.info(`👤 New donor registration: ${data.name}`);
        });

        newSocket.on('new_hospital_registration', (data) => {
          toast.info(`🏥 New hospital registration: ${data.name}`);
        });

        newSocket.on('new_organ_request', (data) => {
          toast.info(`📋 New organ request: ${data.organType}`);
        });
      }

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [isAuthenticated, user]);

  const emit = (event, data) => {
    if (socket && connected) {
      socket.emit(event, data);
    }
  };

  const value = {
    socket,
    connected,
    emit,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
