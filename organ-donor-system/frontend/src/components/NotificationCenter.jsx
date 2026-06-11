import { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, AlertCircle, Info, Clock, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import Button from './ui/Button';

const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { socket } = useSocket();
  const toast = useToast();

  useEffect(() => {
    if (socket) {
      const handleNotification = (data) => {
        const newNotification = {
          id: Date.now(),
          type: data.type || 'info',
          message: data.message,
          timestamp: new Date(),
          read: false,
          data: data.data || {}
        };
        
        setNotifications(prev => [newNotification, ...prev].slice(0, 50));
        setUnreadCount(prev => prev + 1);
      };

      socket.on('notification', handleNotification);
      socket.on('request_matched', (data) => handleNotification({
          type: 'success',
          message: `Match found for ${data.organType}!`,
          data
      }));

      return () => {
        socket.off('notification', handleNotification);
        socket.off('request_matched');
      };
    }
  }, [socket]);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-red-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-primary-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-gray-900">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for closing */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="absolute right-0 mt-2 w-80 md:w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden"
            >
              <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
                <div className="flex gap-4">
                  <button 
                    onClick={markAllAsRead}
                    className="text-xs text-primary-600 hover:underline font-medium"
                  >
                    Mark all read
                  </button>
                  <button onClick={() => setIsOpen(false)}>
                    <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-10 text-center">
                    <div className="w-12 h-12 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Bell className="w-6 h-6 text-gray-300" />
                    </div>
                    <p className="text-sm text-gray-500">No new notifications</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50 dark:divide-gray-700">
                    {notifications.map((n) => (
                      <div 
                        key={n.id} 
                        className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex gap-4 ${!n.read ? 'bg-primary-50/30 dark:bg-primary-900/10' : ''}`}
                      >
                        <div className="mt-1">{getIcon(n.type)}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-800 dark:text-gray-200 leading-snug">
                            {n.message}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                             <Clock className="w-3 h-3 text-gray-400" />
                             <span className="text-[10px] text-gray-400">
                               {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-numeric', minute: '2-numeric' })}
                             </span>
                          </div>
                        </div>
                        <button 
                          onClick={() => removeNotification(n.id)}
                          className="text-gray-300 hover:text-gray-500 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-3 border-t border-gray-100 dark:border-gray-700 text-center">
                <button 
                  className="text-xs text-gray-500 hover:text-primary-600 font-medium flex items-center justify-center gap-1 mx-auto"
                  onClick={() => setIsOpen(false)}
                >
                  View all activity <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationCenter;
