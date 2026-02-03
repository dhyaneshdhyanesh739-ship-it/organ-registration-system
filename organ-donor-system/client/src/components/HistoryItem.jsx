import { motion } from 'framer-motion';
import { 
  LogIn, 
  LogOut, 
  UserPlus, 
  Edit, 
  Heart, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Plus,
  Building2,
  Activity,
  UserCheck
} from 'lucide-react';

const formatTimeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + ' years ago';
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + ' months ago';
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + ' days ago';
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + ' hours ago';
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + ' minutes ago';
  return Math.floor(seconds) + ' seconds ago';
};

const ACTION_CONFIG = {
  user_login: { icon: LogIn, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', label: 'Logged In' },
  user_logout: { icon: LogOut, color: 'text-gray-500', bg: 'bg-gray-50 dark:bg-gray-900/20', label: 'Logged Out' },
  user_register: { icon: UserPlus, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20', label: 'Registered' },
  donor_create: { icon: Plus, color: 'text-primary-500', bg: 'bg-primary-50 dark:bg-primary-900/20', label: 'Created Profile' },
  donor_update: { icon: Edit, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20', label: 'Updated Profile' },
  donor_consent_given: { icon: UserCheck, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30', label: 'Consent Given' },
  donor_consent_revoked: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30', label: 'Consent Revoked' },
  hospital_create: { icon: Building2, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30', label: 'Hospital Profile Created' },
  hospital_update: { icon: Edit, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', label: 'Hospital Profile Updated' },
  organ_request_create: { icon: FileText, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20', label: 'Organ Request Created' },
  organ_request_cancel: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', label: 'Organ Request Cancelled' },
  match_found: { icon: Activity, color: 'text-pink-500', bg: 'bg-pink-50 dark:bg-pink-900/20', label: 'New Match Found' },
};

const HistoryItem = ({ item, index }) => {
  const config = ACTION_CONFIG[item.action] || {
    icon: AlertCircle,
    color: 'text-gray-500',
    bg: 'bg-gray-50 dark:bg-gray-800',
    label: item.action.replace(/_/g, ' '),
  };

  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
    >
      <div className={`p-2.5 rounded-lg ${config.bg} ${config.color} border border-transparent group-hover:border-current/10 transition-colors`}>
        <Icon className="w-5 h-5" />
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white capitalize truncate">
          {config.label}
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {item.details?.organType ? `${item.details.organType} Match Found` : 
           item.details?.bloodGroup ? `Blood Group: ${item.details.bloodGroup}` : 
           'Action performed successfully'}
        </p>
      </div>

      <div className="text-right">
        <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
          {formatTimeAgo(item.createdAt)}
        </p>
        <div className={`mt-1 h-1 w-1 rounded-full ${item.status === 'success' ? 'bg-green-500' : 'bg-red-500'} ml-auto`} title={item.status} />
      </div>
    </motion.div>
  );
};

export default HistoryItem;
