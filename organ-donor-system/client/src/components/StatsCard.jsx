import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatsCard = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  trend = 'up',
  color = 'primary',
  delay = 0 
}) => {
  const colors = {
    primary: {
      bg: 'from-primary-500 to-pink-500',
      light: 'bg-primary-50 dark:bg-primary-900/20',
      text: 'text-primary-600 dark:text-primary-400',
    },
    green: {
      bg: 'from-green-500 to-emerald-500',
      light: 'bg-green-50 dark:bg-green-900/20',
      text: 'text-green-600 dark:text-green-400',
    },
    blue: {
      bg: 'from-blue-500 to-cyan-500',
      light: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-600 dark:text-blue-400',
    },
    purple: {
      bg: 'from-purple-500 to-violet-500',
      light: 'bg-purple-50 dark:bg-purple-900/20',
      text: 'text-purple-600 dark:text-purple-400',
    },
    orange: {
      bg: 'from-orange-500 to-amber-500',
      light: 'bg-orange-50 dark:bg-orange-900/20',
      text: 'text-orange-600 dark:text-orange-400',
    },
  };

  const colorScheme = colors[color] || colors.primary;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, type: 'spring' }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700"
    >
      {/* Background Gradient */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorScheme.bg} opacity-10 rounded-full blur-3xl`} />

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl ${colorScheme.light}`}>
            <Icon className={`w-6 h-6 ${colorScheme.text}`} />
          </div>
          
          {change && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              trend === 'up' 
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
            }`}>
              {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {change}
            </div>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{title}</p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.2 }}
            className="text-3xl font-bold text-gray-900 dark:text-gray-100"
          >
            {value}
          </motion.p>
        </div>
      </div>

      {/* Animated Border */}
      <motion.div
        className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${colorScheme.bg} opacity-0`}
        whileHover={{ opacity: 0.1 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};

export default StatsCard;
