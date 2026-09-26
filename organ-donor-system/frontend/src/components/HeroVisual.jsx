import { motion } from 'framer-motion';
import goldenHeart from '../assets/royal-golden-heart.jpg';

const HeroVisual = () => {
  return (
    <div className="relative flex justify-center items-center py-4 select-none">
      {/* Radiant Golden Glow Orbs */}
      <div className="absolute -inset-6 bg-gradient-to-r from-amber-400/30 via-yellow-500/20 to-amber-600/30 rounded-full opacity-60 blur-3xl transition-opacity duration-700 animate-pulse"></div>
      <div className="absolute w-72 h-72 bg-amber-400/25 rounded-full blur-[90px] animate-pulse-slow"></div>

      {/* Golden Heart Image with Specular Glow Frame */}
      <div className="relative p-2 rounded-3xl bg-gradient-to-b from-amber-300/40 via-amber-500/20 to-transparent border-2 border-amber-400/50 shadow-[0_0_50px_rgba(229,193,88,0.4)]">
        <motion.img 
          src={goldenHeart}
          alt="Royal 3D Glowing Golden Heart"
          className="relative w-full max-w-sm rounded-2xl object-cover drop-shadow-[0_0_35px_rgba(229,193,88,0.8)]"
          animate={{ 
            y: [0, -12, 0],
            rotate: [0, 1.5, 0]
          }}
          transition={{ 
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Ambient Golden Particle Ring */}
        <div className="absolute inset-0 rounded-2xl border border-amber-300/30 pointer-events-none"></div>
      </div>
    </div>
  );
};

export default HeroVisual;
