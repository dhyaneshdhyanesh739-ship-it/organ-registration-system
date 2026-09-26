import { motion } from 'framer-motion';
import { Heart, CheckCircle, MousePointerClick, Sparkles } from 'lucide-react';
import goldenHeart from '../assets/royal-golden-heart.jpg';
import { useState } from 'react';
import OrganShowcase from './OrganShowcase';

const HeroVisual = () => {
  const [showShowcase, setShowShowcase] = useState(false);

  const features = [
    'Secure & confidential registration',
    'Smart donor-recipient matching',
    'Real-time notifications',
  ];

  return (
    <div className="relative group cursor-pointer flex justify-center items-center py-4" onClick={() => setShowShowcase(true)}>
      {/* Radiant Golden Glow Orbs */}
      <div className="absolute -inset-6 bg-gradient-to-r from-amber-400/30 via-yellow-500/20 to-amber-600/30 rounded-full opacity-60 group-hover:opacity-90 blur-3xl transition-opacity duration-700 animate-pulse"></div>
      <div className="absolute w-72 h-72 bg-amber-400/25 rounded-full blur-[90px] animate-pulse-slow"></div>

      {/* Golden Heart Image with Specular Glow Frame */}
      <div className="relative p-2 rounded-3xl bg-gradient-to-b from-amber-300/40 via-amber-500/20 to-transparent border-2 border-amber-400/50 shadow-[0_0_50px_rgba(229,193,88,0.4)] transition-all duration-500 group-hover:shadow-[0_0_80px_rgba(255,215,0,0.7)] group-hover:border-amber-300">
        <motion.img 
          src={goldenHeart}
          alt="Royal 3D Glowing Golden Heart"
          className="relative w-full max-w-sm rounded-2xl object-cover drop-shadow-[0_0_35px_rgba(229,193,88,0.8)] transform transition-transform duration-500 group-hover:scale-105"
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
        <div className="absolute inset-0 rounded-2xl border border-amber-300/30 pointer-events-none group-hover:border-amber-300/60 transition-colors"></div>
      </div>

      {/* Click Hover Badge */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-50">
        <div className="bg-[#090b17]/90 backdrop-blur-xl border-2 border-amber-400/80 text-amber-200 px-5 py-2.5 rounded-full flex items-center gap-2.5 shadow-[0_0_25px_rgba(229,193,88,0.5)] font-bold text-xs uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
          <span>Explore Organs Registry</span>
        </div>
      </div>

      <OrganShowcase isOpen={showShowcase} onClose={(e) => {
        e.stopPropagation();
        setShowShowcase(false);
      }} />
    </div>
  );
};

export default HeroVisual;
