import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className, 
  isLoading = false,
  leftIcon,
  rightIcon,
  type = 'button',
  'aria-label': ariaLabel,
  ...props 
}) => {
  const variants = {
    primary: 'bg-gradient-to-r from-primary-600 to-pink-600 text-white hover:shadow-2xl hover:scale-105 focus:ring-primary-500',
    secondary: 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-2 border-gray-300 dark:border-gray-600 hover:border-primary-500 focus:ring-primary-500',
    outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 focus:ring-primary-500',
    ghost: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-gray-400',
    danger: 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:shadow-2xl hover:scale-105 focus:ring-red-500',
    success: 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-2xl hover:scale-105 focus:ring-green-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <motion.button
      type={type}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      aria-busy={isLoading}
      aria-label={ariaLabel}
      className={cn(
        'relative font-semibold rounded-lg shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <>
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {leftIcon && <span aria-hidden="true">{leftIcon}</span>}
          {children}
          {rightIcon && <span aria-hidden="true">{rightIcon}</span>}
        </>
      )}
    </motion.button>
  );
};

export default Button;
