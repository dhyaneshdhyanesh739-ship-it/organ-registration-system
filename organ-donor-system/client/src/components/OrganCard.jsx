import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

const organIcons = {
  Heart: '🫀',
  Liver: '🫁',
  Kidneys: '🫘',
  Lungs: '🫁',
  Pancreas: '🥞',
  Intestines: '🌀',
  Corneas: '👁️',
  Skin: '🤚',
  Bone: '🦴',
  'Heart Valves': '💝',
  'Blood Vessels': '🩸',
};

const OrganCard = ({ organ, isSelected, onClick, disabled = false }) => {
  return (
    <motion.div
      whileHover={{ scale: disabled ? 1 : 1.05, rotateY: disabled ? 0 : 5 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      onClick={disabled ? undefined : onClick}
      className={`
        relative p-6 rounded-2xl cursor-pointer transition-all duration-300
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${
          isSelected
            ? 'bg-gradient-to-br from-primary-500 to-pink-500 text-white shadow-2xl scale-105'
            : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-primary-400'
        }
      `}
      style={{
        transformStyle: 'preserve-3d',
      }}
    >
      {/* 3D Effect Background */}
      <div
        className={`absolute inset-0 rounded-2xl transition-opacity duration-300 ${
          isSelected ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
          transform: 'translateZ(-10px)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center space-y-3">
        {/* Icon */}
        <motion.div
          animate={isSelected ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.5, repeat: isSelected ? Infinity : 0, repeatDelay: 2 }}
          className="text-5xl"
        >
          {organIcons[organ] || '🫀'}
        </motion.div>

        {/* Name */}
        <h3 className={`font-bold text-lg ${isSelected ? 'text-white' : 'text-gray-900 dark:text-gray-100'}`}>
          {organ}
        </h3>

        {/* Selection Indicator */}
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center"
          >
            <Heart className="w-4 h-4 text-primary-600" fill="currentColor" />
          </motion.div>
        )}
      </div>

      {/* Glow Effect */}
      {isSelected && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-400 to-pink-400 blur-xl opacity-50 -z-10" />
      )}
    </motion.div>
  );
};

export default OrganCard;
