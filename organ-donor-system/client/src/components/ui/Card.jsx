import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

const Card = ({ children, className, hover = false, glow = false, ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { y: -5, scale: 1.02 } : {}}
      className={cn(
        'bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700 transition-all duration-300',
        hover && 'cursor-pointer hover:shadow-2xl',
        glow && 'hover:shadow-primary-500/50',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};

const CardHeader = ({ children, className }) => (
  <div className={cn('mb-4', className)}>{children}</div>
);

const CardTitle = ({ children, className }) => (
  <h3 className={cn('text-2xl font-bold gradient-text', className)}>{children}</h3>
);

const CardDescription = ({ children, className }) => (
  <p className={cn('text-gray-600 dark:text-gray-400 mt-2', className)}>{children}</p>
);

const CardContent = ({ children, className }) => (
  <div className={cn('', className)}>{children}</div>
);

const CardFooter = ({ children, className }) => (
  <div className={cn('mt-6 pt-4 border-t border-gray-200 dark:border-gray-700', className)}>
    {children}
  </div>
);

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;
