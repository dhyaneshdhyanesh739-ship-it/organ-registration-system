import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, User, Building2, Calendar, CheckCircle, Clock, Activity } from 'lucide-react';
import { useState } from 'react';

const AdminDataViewModal = ({ isOpen, onClose, title, data, type }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = data?.filter(item => {
    if (!item) return false;
    if (type === 'donor') {
      const name = `${item.user?.firstName || ''} ${item.user?.lastName || ''}`.toLowerCase();
      return name.includes(searchTerm.toLowerCase()) || item.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    } else if (type === 'receiver') {
      const name = `${item.firstName || ''} ${item.lastName || ''}`.toLowerCase();
      return name.includes(searchTerm.toLowerCase()) || item.email?.toLowerCase().includes(searchTerm.toLowerCase());
    } else if (type === 'patient-donor') {
      const name = `${item.firstName || ''} ${item.lastName || ''}`.toLowerCase();
      return name.includes(searchTerm.toLowerCase()) || (item.hospital?.hospitalName || '').toLowerCase().includes(searchTerm.toLowerCase());
    } else {
      return (item.hospitalName || '').toLowerCase().includes(searchTerm.toLowerCase()) || item.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    }
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b dark:border-gray-800 flex flex-shrink-0 items-center justify-between bg-white dark:bg-gray-900">
              <div>
                <h2 className="text-xl font-bold gradient-text">{title}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Total Registered: {data?.length || 0}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 ml-4 bg-red-100 hover:bg-red-200 dark:bg-red-900/50 dark:hover:bg-red-900/70 text-red-600 dark:text-red-400 rounded-lg transition-colors flex items-center justify-center border border-red-200 dark:border-red-800"
                title="Close Modal"
              >
                <X className="w-5 h-5 font-bold" strokeWidth={3} />
              </button>
            </div>

            {/* Search Bar */}
            <div className="px-6 py-4 border-b dark:border-gray-800 flex-shrink-0 bg-white dark:bg-gray-900">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Search by name or email...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              {filteredData?.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No matching records found.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredData?.map((item) => {
                    if (!item) return null;
                    return (
                      <motion.div
                        key={item._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 transition-colors"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                              {type === 'donor' || type === 'receiver' || type === 'patient-donor' ? (
                                <User className="w-6 h-6 text-primary-600" />
                              ) : (
                                <Building2 className="w-6 h-6 text-primary-600" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 dark:text-white">
                                {type === 'donor' 
                                  ? `${item.user?.firstName || ''} ${item.user?.lastName || ''}`
                                  : (type === 'receiver' || type === 'patient-donor')
                                  ? `${item.firstName || ''} ${item.lastName || ''}`
                                  : item.hospitalName
                                }
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {type === 'receiver' ? item.email : type === 'patient-donor' ? `Hospital: ${item.hospital?.hospitalName}` : item.user?.email}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-gray-800 rounded-full text-xs font-medium border dark:border-gray-700">
                              <Clock className="w-3.5 h-3.5 text-gray-400" />
                              {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
                            </div>
                            {(type === 'receiver' ? item.isVerified : (type === 'patient-donor' ? true : (item.user?.isVerified || item.verificationStatus === 'verified'))) ? (
                              <div className="flex items-center gap-1.5 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                                <CheckCircle className="w-3.5 h-3.5" />
                                {type === 'patient-donor' ? 'Hospital Verified' : 'Verified'}
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-xs font-medium">
                                <Clock className="w-3.5 h-3.5" />
                                Pending
                              </div>
                            )}
                            {(type === 'donor' || type === 'patient-donor') && (
                              <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-medium">
                                {item.bloodGroup}
                              </div>
                            )}
                            {type === 'patient-donor' && (
                              <div className="flex -space-x-1">
                                {item.organsForDonation?.slice(0, 2).map((organ, i) => (
                                  <div key={i} className="w-6 h-6 rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center text-[8px] font-bold" title={organ}>
                                    {organ[0]}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AdminDataViewModal;
