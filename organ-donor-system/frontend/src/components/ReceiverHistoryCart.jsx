import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Clock, Activity, CheckCircle2, Calendar, AlertCircle } from 'lucide-react';
import { receiverService } from '../services';

const ORGAN_ICONS = {
  Heart: '❤️', Liver: '🫀', Kidneys: '🫘', Lungs: '🫁',
  Pancreas: '🟤', Intestines: '🔵', Corneas: '👁️', Skin: '🧬',
  Bone: '🦴', 'Heart Valves': '💗', 'Blood Vessels': '🩸',
};

const ReceiverHistoryCart = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetchRequests();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await receiverService.getMyRequests();
      setRequests(data.requests || []);
    } catch (error) {
      console.error('Failed to fetch receiver requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      day: date.toLocaleDateString(undefined, { weekday: 'long' }),
      date: date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <Activity className="w-4 h-4 text-primary-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
      case 'completed':
        return 'bg-green-100 dark:bg-green-900/30';
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/30';
      default:
        return 'bg-primary-100 dark:bg-primary-900/30';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative group"
        title="My Requests"
      >
        <ShoppingBag className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-primary-600" />
        {requests.length > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary-500 rounded-full border-2 border-white dark:border-gray-900"></span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 z-50 overflow-hidden"
          >
            <div className="p-4 border-b dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-primary-500" />
                My Organ Requests
              </h3>
            </div>

            <div className="max-h-96 overflow-y-auto custom-scrollbar">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500">Loading requests...</p>
                </div>
              ) : requests.length === 0 ? (
                <div className="p-8 text-center">
                  <ShoppingBag className="w-12 h-12 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium">No requests found</p>
                  <p className="text-xs text-gray-400 mt-1">Submit an organ request from your dashboard</p>
                </div>
              ) : (
                <div className="divide-y dark:divide-gray-800">
                  {requests.map((item) => {
                    const { day, date, time } = formatDate(item.createdAt || item.updatedAt || new Date());
                    return (
                      <div key={item._id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${getStatusColor(item.status)}`}>
                            {getStatusIcon(item.status)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <p className="text-sm font-bold text-gray-900 dark:text-white truncate flex items-center gap-1.5">
                                <span className="text-lg leading-none">{ORGAN_ICONS[item.organType] || '🔬'}</span>
                                {item.organType}
                              </p>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                item.status === 'approved' || item.status === 'completed' 
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                  : item.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                    : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                              }`}>
                                {item.status}
                              </span>
                            </div>
                            
                            <div className="flex gap-2 mt-1.5">
                              <span className="text-xs px-2 py-0.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md font-bold self-start">
                                {item.bloodGroup}
                              </span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold self-start uppercase ${
                                item.urgency === 'critical' ? 'text-red-600 border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400' :
                                item.urgency === 'high' ? 'text-orange-600 border border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20 dark:text-orange-400' :
                                'text-gray-600 border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400'
                              }`}>
                                {item.urgency}
                              </span>
                            </div>
                            
                            <div className="mt-2 flex flex-col gap-1">
                              <p className="text-[10px] text-gray-500 flex items-center gap-1 uppercase tracking-wider font-bold">
                                <Calendar className="w-3 h-3" />
                                {day}, {date} <span className="normal-case italic font-normal text-gray-400 ml-1">at {time}</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReceiverHistoryCart;
