import { motion } from 'framer-motion';
import { Heart, CheckCircle, MousePointerClick } from 'lucide-react';
import heroHeart from '../assets/hero-heart.png';
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
    <div className="relative group cursor-pointer" onClick={() => setShowShowcase(true)}>
      {/* Visual Glow Effect */}
      <div className="absolute -inset-4 bg-gradient-to-r from-primary-500 to-pink-500 rounded-full opacity-20 group-hover:opacity-40 blur-3xl transition-opacity duration-500 animate-pulse"></div>
      
      {/* Heart Illustration */}
      <motion.img 
        src={heroHeart}
        alt="Glowing Human Heart Representation"
        className="relative w-full max-w-md drop-shadow-[0_20px_50px_rgba(236,72,153,0.3)] animate-float transform transition-transform duration-300 group-hover:scale-105"
        animate={{ 
          y: [0, -20, 0],
          rotate: [0, 2, 0]
        }}
        transition={{ 
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Click Indicator */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50">
        <div className="bg-black/50 backdrop-blur-md text-white px-4 py-2 rounded-full flex items-center gap-2">
          <MousePointerClick className="w-5 h-5" />
          <span className="text-sm font-medium">Click to explore organs</span>
        </div>
      </div>

      {/* Overlapping Info Card */}
      <div className="absolute -bottom-10 -right-6 glass-card p-6 space-y-4 max-w-xs border-primary-200/50 scale-90 md:scale-100 transition-transform duration-300 group-hover:translate-x-2">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg shadow-primary-500/20">
            <Heart className="w-6 h-6 text-white" fill="white" />
          </div>
          <div>
            <h3 className="text-xl font-bold">One Donor</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Pledge to save 8 lives</p>
          </div>
        </div>
        <div className="space-y-2">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
              <span className="text-gray-700 dark:text-gray-300">{feature}</span>
            </div>
          ))}
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
