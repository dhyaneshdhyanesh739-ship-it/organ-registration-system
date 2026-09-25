import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import AIDonorHistoryScanner from './AIDonorHistoryScanner';

const AIDonorHistoryModal = ({ isOpen, onClose, onHistoryUpdated }) => {
  if (typeof window === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-md z-[9998]"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-y-auto custom-scrollbar my-auto z-[9999] border border-rose-100 dark:border-rose-900/50"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-30 p-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full transition-all shadow-md hover:scale-110"
              title="Close AI Scanner"
            >
              <X className="w-5 h-5 font-bold" />
            </button>

            {/* Scanner Component */}
            <div className="p-2 sm:p-4">
              <AIDonorHistoryScanner onHistoryUpdated={() => {
                if (onHistoryUpdated) onHistoryUpdated();
              }} />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default AIDonorHistoryModal;
