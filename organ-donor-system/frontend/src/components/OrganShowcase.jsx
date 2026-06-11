import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { X, Heart, Activity, Shield, Wind, Zap, Eye, Layers, ArrowLeft, Clock, TrendingUp, Users, CheckCircle } from 'lucide-react';

// Import organ images
import heartImg from '../assets/organs/heart.png';
import liverImg from '../assets/organs/liver.png';
import kidneysImg from '../assets/organs/kidneys.png';
import lungsImg from '../assets/organs/lungs.png';
import pancreasImg from '../assets/organs/pancreas.png';
import intestinesImg from '../assets/organs/intestines.png';
import corneasImg from '../assets/organs/corneas.png';
import skinImg from '../assets/organs/skin.png';

const organs = [
  {
    id: 'heart',
    name: 'Heart',
    description: 'The hardest working muscle in the human body, pumping life-sustaining blood to every cell.',
    image: heartImg,
    badge: 'Critical Life Saver',
    color: 'from-red-500 to-pink-600',
    icon: Heart,
    details: 'A single heart donor can save a life immediately. It is the core of our existence, responsible for circulating oxygen and nutrients throughout the body.',
    stats: [
      { label: 'Waiting List', value: '3,000+', icon: Users },
      { label: 'Success Rate', value: '91%', icon: TrendingUp },
      { label: 'Avg. Wait Time', value: '4-6 Months', icon: Clock }
    ]
  },
  {
    id: 'liver',
    name: 'Liver',
    description: "The body's chemical factory, performing over 500 essential functions including detoxifying blood.",
    image: liverImg,
    badge: 'Regenerative Marvel',
    color: 'from-amber-500 to-orange-600',
    icon: Activity,
    details: 'The liver is unique because it can regenerate itself. A living donor can donate a portion of their liver, and it will grow back to full size in both the donor and recipient.',
    stats: [
      { label: 'Waiting List', value: '12,000+', icon: Users },
      { label: 'Success Rate', value: '88%', icon: TrendingUp },
      { label: 'Avg. Wait Time', value: '11 Months', icon: Clock }
    ]
  },
  {
    id: 'kidneys',
    name: 'Kidneys',
    description: 'Filter waste and excess fluid from the blood, maintaining vital chemical balance.',
    image: kidneysImg,
    badge: 'Most Needed',
    color: 'from-blue-500 to-indigo-600',
    icon: Shield,
    details: 'Kidneys are the most frequently transplanted organs. Living donation is common because most people can live a healthy life with just one kidney.',
    stats: [
      { label: 'Waiting List', value: '90,000+', icon: Users },
      { label: 'Success Rate', value: '95%', icon: TrendingUp },
      { label: 'Avg. Wait Time', value: '3-5 Years', icon: Clock }
    ]
  },
  {
    id: 'lungs',
    name: 'Lungs',
    description: 'Supply oxygen to the blood and remove carbon dioxide, enabling every breath you take.',
    image: lungsImg,
    badge: 'Breath of Life',
    color: 'from-cyan-500 to-blue-500',
    icon: Wind,
    details: 'Lung transplants provide a second chance at life for patients with chronic respiratory failure. A donor can provide one or both lungs.',
    stats: [
      { label: 'Waiting List', value: '1,000+', icon: Users },
      { label: 'Success Rate', value: '85%', icon: TrendingUp },
      { label: 'Avg. Wait Time', value: '4 Months', icon: Clock }
    ]
  },
  {
    id: 'pancreas',
    name: 'Pancreas',
    description: 'Produces insulin to regulate blood sugar and enzymes to aid in vital digestion.',
    image: pancreasImg,
    badge: 'Metabolic Master',
    color: 'from-yellow-400 to-amber-500',
    icon: Zap,
    details: 'Often transplanted alongside a kidney, a pancreas transplant can cure type 1 diabetes, eliminating the need for insulin injections.',
    stats: [
      { label: 'Waiting List', value: '800+', icon: Users },
      { label: 'Success Rate', value: '90%', icon: TrendingUp },
      { label: 'Avg. Wait Time', value: '2 Years', icon: Clock }
    ]
  },
  {
    id: 'intestines',
    name: 'Intestines',
    description: 'Absorb essential nutrients and water from food, crucial for energy and growth.',
    image: intestinesImg,
    badge: 'Nutrient Core',
    color: 'from-rose-400 to-red-500',
    icon: Activity,
    details: 'Intestinal transplants are complex and life-saving for patients with intestinal failure who can no longer receive nutrition through an IV.',
    stats: [
      { label: 'Waiting List', value: '200+', icon: Users },
      { label: 'Success Rate', value: '75%', icon: TrendingUp },
      { label: 'Avg. Wait Time', value: '6 Months', icon: Clock }
    ]
  },
  {
    id: 'corneas',
    name: 'Corneas',
    description: 'Restore vision to those with blindness, allowing them to see the world again.',
    image: corneasImg,
    badge: 'Gift of Sight',
    color: 'from-emerald-400 to-teal-500',
    icon: Eye,
    details: 'Corneal transplants are one of the most successful transplant procedures. They can restore sight for people with damaged or diseased corneas.',
    stats: [
      { label: 'Waiting List', value: 'Short', icon: Users },
      { label: 'Success Rate', value: '98%', icon: TrendingUp },
      { label: 'Recovery', value: 'Few Weeks', icon: Clock }
    ]
  },
  {
    id: 'skin',
    name: 'Skin',
    description: 'Used for burn victims and reconstruction, protecting the body from infection.',
    image: skinImg,
    badge: 'Protective Shield',
    color: 'from-orange-300 to-amber-400',
    icon: Layers,
    details: 'Donated skin is a critical resource for treating severe burn injuries. It acts as a biological dressing, reducing pain and risk of infection while healing.',
    stats: [
      { label: 'Demand', value: 'Constant', icon: Users },
      { label: 'Lives Improved', value: 'Thousands', icon: Heart },
      { label: 'Usage', value: 'Grafts', icon: Shield }
    ]
  }
];

const OrganCard = ({ organ, index, onClick, onPledge }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ delay: index * 0.1 }}
      onClick={onClick}
      className="bg-gray-800/50 backdrop-blur-md rounded-2xl overflow-hidden shadow-xl border border-white/5 group hover:border-primary-500/50 transition-all cursor-pointer flex flex-col h-full"
    >
      <div className="h-44 relative overflow-hidden bg-gray-900/50 p-6 flex items-center justify-center">
        <div className={`absolute inset-0 bg-gradient-to-br ${organ.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
        
        <div className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold text-white bg-gradient-to-r ${organ.color} shadow-lg z-10`}>
          {organ.badge}
        </div>

        <motion.img
          src={organ.image}
          alt={organ.name}
          className="w-auto h-full max-h-32 object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] z-0 transform group-hover:scale-110 transition-transform duration-700"
        />
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <div className={`p-1.5 rounded-lg bg-gradient-to-br ${organ.color} bg-opacity-10`}>
            <organ.icon className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-lg font-bold text-white group-hover:text-primary-400 transition-colors">
            {organ.name}
          </h3>
        </div>
        <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-2">
          {organ.description}
        </p>
        <div className="mt-auto flex items-center justify-between">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onPledge(organ.name);
            }}
            className="text-xs font-bold text-white px-3 py-1.5 rounded-lg bg-gradient-to-r from-primary-600 to-pink-600 hover:shadow-lg transition-all opacity-0 group-hover:opacity-100"
          >
            Pledge Now
          </button>
          <div className="flex items-center gap-1 text-xs font-medium text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity">
            <span>Learn More</span>
            <TrendingUp className="w-3 h-3" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const OrganDetailView = ({ organ, onBack, onPledge }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="flex flex-col h-full flex-1 overflow-hidden"
    >
      <div className="p-6 border-b border-gray-800 flex items-center gap-4 bg-gray-900/50 backdrop-blur-md sticky top-0 z-20">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white transition-all flex items-center gap-2 pr-4 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-semibold">Back to All</span>
        </button>
        <div className="h-8 w-px bg-gray-800" />
        <h2 className={`text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${organ.color}`}>
          {organ.name} Details
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10">
        <div className="grid lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Image & Badge */}
          <div className="lg:col-span-5 space-y-6">
            <div className="relative aspect-square rounded-3xl bg-gray-800/50 border border-white/5 flex items-center justify-center p-12 overflow-hidden overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br ${organ.color} opacity-10`} />
              <motion.img
                initial={{ scale: 0.8, rotate: -5 }}
                animate={{ scale: 1, rotate: 0 }}
                src={organ.image}
                alt={organ.name}
                className="w-full h-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)] z-10"
              />
            </div>
            
            <div className={`p-4 rounded-2xl bg-gradient-to-r ${organ.color} text-white text-center font-bold shadow-xl shadow-primary-500/10`}>
              {organ.badge}
            </div>
          </div>

          {/* Right Column: Info & Stats */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <h3 className="text-3xl font-bold text-white">Understanding the {organ.name}</h3>
              <p className="text-gray-300 text-lg leading-relaxed italic">
                "{organ.description}"
              </p>
              <p className="text-gray-400 text-base leading-relaxed">
                {organ.details}
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              {organ.stats.map((stat, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-gray-800/50 border border-white/5 space-y-2">
                  <stat.icon className="w-5 h-5 text-primary-400" />
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{stat.label}</p>
                  <p className="text-xl font-bold text-white">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="p-6 rounded-2xl bg-primary-500/5 border border-primary-500/10 space-y-4">
              <h4 className="font-bold text-white flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Impact of Donation
              </h4>
              <p className="text-sm text-gray-400">
                Pledging a {organ.name} can provide hope to patients who have been on the waiting list for years. Each donation is a legacy of life that transcends generations.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-6 border-t border-gray-800 bg-gray-900/50 backdrop-blur-md sticky bottom-0">
        <button 
          onClick={() => onPledge(organ.name)}
          className="w-full py-4 bg-gradient-to-r from-primary-600 to-pink-600 rounded-2xl text-white font-bold text-lg hover:shadow-2xl hover:shadow-primary-500/20 transition-all transform hover:-translate-y-1 active:scale-95"
        >
          Pledge to Donate
        </button>
      </div>
    </motion.div>
  );
};

const OrganShowcase = ({ isOpen, onClose }) => {
  const [selectedOrgan, setSelectedOrgan] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handlePledge = (organName) => {
    if (!user) {
      navigate('/login', { state: { from: '/', selectedOrgan: organName } });
    } else if (user.role === 'donor') {
      // If donor, go to profile (create or edit)
      navigate('/donor/profile/create', { state: { selectedOrgan: organName } });
    } else {
      // For hospital/admin, maybe just a toast or ignore
      alert('Only donors can pledge to donate organs.');
    }
    onClose();
  };

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Reset selection when closing modal
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => setSelectedOrgan(null), 300);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-6xl max-h-[90vh] bg-gray-900/90 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col border border-white/10"
          >
            <AnimatePresence mode="wait">
              {selectedOrgan ? (
                <OrganDetailView 
                  key="detail" 
                  organ={selectedOrgan} 
                  onBack={() => setSelectedOrgan(null)} 
                  onPledge={handlePledge}
                />
              ) : (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col h-full flex-1 overflow-hidden"
                >
                  {/* Header */}
                  <div className="p-8 border-b border-white/5 flex items-center justify-between bg-gray-900/50 backdrop-blur-md z-10 sticky top-0">
                    <div>
                      <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
                        The Legacy of Life
                      </h2>
                      <p className="text-gray-400 text-base mt-2">
                        Explore how your pledge can save up to 8 precious lives
                      </p>
                    </div>
                    <button
                      onClick={onClose}
                      className="p-3 rounded-2xl bg-gray-800 hover:bg-gray-700 text-white transition-all transform hover:rotate-90"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Grid Content */}
                  <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {organs.map((organ, index) => (
                        <OrganCard 
                          key={organ.id} 
                          organ={organ} 
                          index={index} 
                          onClick={() => setSelectedOrgan(organ)}
                          onPledge={handlePledge}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default OrganShowcase;
