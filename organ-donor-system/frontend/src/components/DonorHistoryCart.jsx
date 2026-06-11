import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Clock, User, CheckCircle2, Calendar } from 'lucide-react';
import { donorService } from '../services';

const DonorHistoryCart = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
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

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await donorService.getDonationHistory();
      setHistory(data.history || []);
    } catch (error) {
      console.error('Failed to fetch donation history:', error);
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

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative group"
        title="Donation History"
      >
        <ShoppingBag className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-primary-600" />
        {history.length > 0 && (
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
                Donation History
              </h3>
            </div>

            <div className="max-h-96 overflow-y-auto custom-scrollbar">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500">Loading history...</p>
                </div>
              ) : history.length === 0 ? (
                <div className="p-8 text-center">
                  <ShoppingBag className="w-12 h-12 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium">No donations found</p>
                  <p className="text-xs text-gray-400 mt-1">Your matched requests will appear here</p>
                </div>
              ) : (
                <div className="divide-y dark:divide-gray-800">
                  {history.map((item) => {
                    const { day, date, time } = formatDate(item.date);
                    return (
                      <div key={item.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                            <CheckCircle2 className="w-4 h-4 text-primary-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                              {item.organType} Donated
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-1">
                              <User className="w-3 h-3" />
                              To: {item.recipientName} ({item.recipientType})
                            </p>
                            <div className="mt-2 flex flex-col gap-1">
                              <p className="text-[10px] text-gray-500 flex items-center gap-1 uppercase tracking-wider font-bold">
                                <Calendar className="w-3 h-3" />
                                {day}, {date}
                              </p>
                              <p className="text-[10px] text-gray-400 flex items-center gap-1 italic">
                                <Clock className="w-3 h-3" />
                                {time}
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
            
            {history.length > 0 && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 border-t dark:border-gray-800 text-center">
                <p className="text-[10px] text-gray-500 font-medium">
                  Thank you for your life-saving donation!
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DonorHistoryCart;
