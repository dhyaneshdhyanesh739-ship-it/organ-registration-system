import { motion } from 'framer-motion';

const Skeleton = ({ className, variant = 'rectangular', animation = 'pulse' }) => {
  const variants = {
    rectangular: 'rounded-lg',
    circular: 'rounded-full',
    text: 'rounded h-4',
  };

  const animations = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`bg-gray-200 dark:bg-gray-700 ${variants[variant]} ${animations[animation]} ${className}`}
    />
  );
};

export const SkeletonCard = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
    <div className="flex items-center gap-4 mb-4">
      <Skeleton variant="circular" className="w-12 h-12" />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" className="w-3/4" />
        <Skeleton variant="text" className="w-1/2" />
      </div>
    </div>
    <Skeleton variant="rectangular" className="h-32 mb-4" />
    <div className="space-y-2">
      <Skeleton variant="text" className="w-full" />
      <Skeleton variant="text" className="w-5/6" />
      <Skeleton variant="text" className="w-4/6" />
    </div>
  </div>
);

export const SkeletonTable = ({ rows = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg">
        <Skeleton variant="circular" className="w-10 h-10" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" className="w-1/4" />
          <Skeleton variant="text" className="w-1/3" />
        </div>
        <Skeleton variant="rectangular" className="w-20 h-8" />
      </div>
    ))}
  </div>
);

export default Skeleton;
