import { motion } from 'framer-motion';
import { Heart, Crown } from 'lucide-react';

const organIcons = {
  Heart: '🫀',
  Liver: '🫁',
  Kidneys: '🫘',
  Lungs: '🫁',
  Pancreas: '🥞',
  Intestines: '🌀',
  Corneas: '👁️',
  Skin: '🤚',
};

const OrganCard = ({ organ, isSelected, onClick, disabled = false }) => {
  return (
    <motion.div
      whileHover={{ scale: disabled ? 1 : 1.03, y: disabled ? 0 : -3 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      onClick={disabled ? undefined : onClick}
      className={`
        relative p-6 rounded-2xl cursor-pointer transition-all duration-200 backdrop-blur-2xl overflow-hidden
        ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
        ${
          isSelected
            ? 'bg-[#1c0a1a]/95 border-2 border-rose-400 text-white shadow-[7px_7px_0px_0px_#E63946]'
            : 'bg-[#0e122d]/90 border-2 border-amber-400/50 hover:border-amber-300 text-slate-100 shadow-[5px_5px_0px_0px_#E5C158] hover:shadow-[7px_7px_0px_0px_#E5C158]'
        }
      `}
    >
      {/* Refractive Light Sweep Line */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-300/40 to-transparent pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 text-center space-y-3">
        {/* Icon Container */}
        <motion.div
          animate={isSelected ? { scale: [1, 1.25, 1], rotate: [0, -5, 5, 0] } : {}}
          transition={{ duration: 0.6, repeat: isSelected ? Infinity : 0, repeatDelay: 1.5 }}
          className="text-5xl filter drop-shadow-[0_4px_12px_rgba(229,193,88,0.3)] inline-block"
        >
          {organIcons[organ] || '🫀'}
        </motion.div>

        {/* Name */}
        <h3 className={`font-black text-lg tracking-wide ${isSelected ? 'text-rose-200' : 'royal-title'}`}>
          {organ}
        </h3>

        {/* Status Pill */}
        <div className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-amber-400/40 bg-amber-400/10 text-amber-300">
          <Crown className="w-3 h-3 text-amber-300" />
          <span>Verified Organ</span>
        </div>

        {/* Selection Indicator Badge */}
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-3 -right-3 w-8 h-8 bg-rose-500 border-2 border-white rounded-full flex items-center justify-center shadow-[2px_2px_0px_0px_#000000]"
          >
            <Heart className="w-4 h-4 text-white" fill="currentColor" />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default OrganCard;

