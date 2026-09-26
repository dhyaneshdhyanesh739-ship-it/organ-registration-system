import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { CheckCircle, Info, Heart, Activity, Users, ShieldCheck, X, Clock, Zap, TrendingUp } from 'lucide-react';
import heartImg from '../assets/organs/heart.png';
import liverImg from '../assets/organs/liver.png';
import kidneysImg from '../assets/organs/kidneys.png';
import lungsImg from '../assets/organs/lungs.png';
import pancreasImg from '../assets/organs/pancreas.png';
import intestinesImg from '../assets/organs/intestines.png';
import corneasImg from '../assets/organs/corneas.png';
import skinImg from '../assets/organs/skin.png';
import { Link } from 'react-router-dom';

const OrgansPage = () => {
  const [selectedOrgan, setSelectedOrgan] = useState(null);

  const organs = [
    {
      name: 'Heart',
      image: heartImg,
      description: 'The hardest working muscle in the human body, pumping blood to all parts of the body.',
      waitingPeriod: '4-6 Months',
      fullDetails: 'The heart is a vital organ that pumps oxygen-rich blood through the body. A transplant is often the only option for patients with end-stage heart failure. Each heart donation is a critical life-saver that can immediately restore a recipient\'s quality of life and longevity.',
      facts: [
        'A single heart donor can save one life.',
        'Heart transplants are needed for end-stage heart failure.',
        'The heart must be transplanted within 4-6 hours.',
      ],
      impact: 'Critical Life Saver',
      color: 'from-red-500 to-pink-600',
    },
    {
      name: 'Liver',
      image: liverImg,
      description: 'The body\'s chemical factory, performing over 500 essential functions.',
      waitingPeriod: '11 Months',
      fullDetails: 'The liver is responsible for detoxifying blood, synthesizing proteins, and producing biochemicals necessary for digestion. It is remarkably unique in its ability to regenerate, meaning a living donor can provide a portion of their liver, and it will grow back to full size in both the donor and recipient.',
      facts: [
        'The liver can be donated by a living donor (partial).',
        'It is the only organ that can regenerate itself.',
        'Needed for cirrhosis, liver cancer, and metabolic diseases.',
      ],
      impact: 'Regenerative Marvel',
      color: 'from-amber-500 to-orange-600',
    },
    {
      name: 'Kidneys',
      image: kidneysImg,
      description: 'Filter waste and excess fluid from the blood, producing urine.',
      waitingPeriod: '3-5 Years',
      fullDetails: 'Kidneys maintain vital chemical balance by filtering waste from the blood. They are the most frequently transplanted organs. Since most people can live a healthy life with just one kidney, living donation is a very common and life-saving option.',
      facts: [
        'Most commonly transplanted organ.',
        'Living donation is possible with one healthy kidney.',
        'Can stay viable outside the body for up to 24-36 hours.',
      ],
      impact: 'Most Needed',
      color: 'from-blue-500 to-indigo-600',
    },
    {
      name: 'Lungs',
      image: lungsImg,
      description: 'Essential for breathing, providing oxygen to the blood and removing carbon dioxide.',
      waitingPeriod: '4-6 Months',
      fullDetails: 'Lungs provide the oxygen necessary for life and remove carbon dioxide. Lung transplants provide a second chance at life for patients with chronic respiratory failure caused by conditions like cystic fibrosis or COPD.',
      facts: [
        'Can be donated as a single lung or a pair.',
        'Critical for patients with cystic fibrosis or COPD.',
        'Viability period is relatively short (4-6 hours).',
      ],
      impact: 'Breath of Life',
      color: 'from-cyan-500 to-blue-500',
    },
    {
      name: 'Pancreas',
      image: pancreasImg,
      description: 'Produces enzymes for digestion and hormones like insulin for blood sugar regulation.',
      waitingPeriod: '2 Years',
      fullDetails: 'The pancreas regulates blood sugar through insulin production and aids digestion with enzymes. Often transplanted alongside a kidney, a pancreas transplant can cure Type 1 Diabetes, eliminating the need for insulin injections.',
      facts: [
        'Often transplanted alongside a kidney for diabetic patients.',
        'Crucial for treating Type 1 Diabetes complications.',
        'Helps restore normal insulin production.',
      ],
      impact: 'Metabolic Balance',
      color: 'from-yellow-400 to-amber-500',
    },
    {
      name: 'Intestines',
      image: intestinesImg,
      description: 'Crucial for absorbing nutrients and water from food.',
      waitingPeriod: '6-12 Months',
      fullDetails: 'Intestines are vital for nutrition and growth. Intestinal transplants are complex and life-saving for patients with intestinal failure who can no longer receive nutrition through traditional means.',
      facts: [
        'Complex transplant often performed with other abdominal organs.',
        'Needed for patients with short bowel syndrome or intestinal failure.',
        'Greatly improves quality of life and nutrition.',
      ],
      impact: 'Nutritional Foundation',
      color: 'from-rose-400 to-red-500',
    },
    {
      name: 'Corneas',
      image: corneasImg,
      description: 'The clear, front surface of the eye that helps focus light.',
      waitingPeriod: 'Short (few weeks)',
      fullDetails: 'Corneas are essential for vision. Corneal transplants are among the most successful procedures, restoring sight to those suffering from corneal blindness or severe damage.',
      facts: [
        'Restores sight to those with corneal blindness.',
        'Can be donated up to 24 hours after death.',
        'One of the most successful transplant procedures.',
      ],
      impact: 'Gift of Sight',
      color: 'from-emerald-400 to-teal-500',
    },
    {
      name: 'Skin',
      image: skinImg,
      description: 'The body\'s largest organ, providing protection and regulation.',
      waitingPeriod: 'Constant Demand',
      fullDetails: 'Donated skin is a critical medical resource, primarily used as a biological dressing for severe burn victims, preventing infection and fluid loss while healing.',
      facts: [
        'Used for life-saving grafts for severe burn victims.',
        'Can be stored in skin banks for several years.',
        'Helps prevent infection and fluid loss in trauma patients.',
      ],
      impact: 'Protective Shield',
      color: 'from-orange-300 to-amber-400',
    },
  ];

  return (
    <div className="min-h-screen bg-[#070914] text-slate-100 pb-20 relative selection:bg-amber-400/30 selection:text-amber-200">
      {/* Header */}
      <section className="bg-[#0b0e26] border-b-4 border-amber-400 py-20 text-white relative overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-4">
          <div className="royal-badge inline-flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-400" fill="#f43f5e" />
            <span>👑 THE ROYAL GIFT OF LIFE</span>
          </div>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black royal-title"
          >
            Sacred Organs & Tissue Registry
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-slate-300 font-semibold max-w-3xl mx-auto leading-relaxed"
          >
            One single noble donor can save up to 8 lives and restore vitality to over 75 others. 
            Explore the royal impact of life pledge registry.
          </motion.p>
        </div>
      </section>

      {/* Gallery Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {organs.map((organ, index) => (
            <motion.div
              key={organ.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedOrgan(organ)}
              className="glass-card border-2 border-amber-400/50 shadow-[6px_6px_0px_0px_#E5C158] hover:shadow-[9px_9px_0px_0px_#E5C158] hover:-translate-x-1 hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
            >
              {/* Image Container */}
              <div className="h-64 relative overflow-hidden bg-[#080a1c] p-8 flex items-center justify-center border-b-2 border-amber-400/30">
                <img
                  src={organ.image}
                  alt={organ.name}
                  className="max-h-full max-w-full object-contain transform group-hover:scale-110 transition-transform duration-500 filter drop-shadow-[0_10px_20px_rgba(229,193,88,0.3)]"
                />
                <div className="absolute top-4 right-4 royal-badge shadow-[2px_2px_0px_0px_#000000]">
                  {organ.impact}
                </div>
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                  <span className="btn-primary text-xs !py-2.5">Inspect Details</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-black royal-title">{organ.name}</h3>
                </div>
                <p className="text-slate-300 text-sm font-medium leading-relaxed line-clamp-2">
                  {organ.description}
                </p>

                <div className="space-y-2 py-2 border-t-2 border-amber-400/20 pt-4">
                  <h4 className="text-xs font-black uppercase text-amber-300 flex items-center gap-2 tracking-wider">
                    <Info className="w-4 h-4 text-amber-400" />
                    Royal Registry Facts
                  </h4>
                  {organ.facts.slice(0, 2).map((fact, idx) => (
                    <div key={idx} className="flex gap-2 text-xs font-medium text-slate-300">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{fact}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-300 pt-1">
                    <span>Inspect full details & waitlists</span>
                    <TrendingUp className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {selectedOrgan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrgan(null)}
              className="absolute inset-0 bg-black/85 backdrop-blur-xl"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-[#0c0f26]/95 backdrop-blur-2xl rounded-[2.5rem] shadow-[10px_10px_0px_0px_#E5C158] overflow-hidden flex flex-col max-h-[90vh] border-2 border-amber-400"
            >
              {/* Modal Header */}
              <div className="p-6 border-b-2 border-amber-400/40 flex items-center justify-between sticky top-0 bg-[#0c0f26]/90 backdrop-blur-md z-10">
                <div className="flex items-center gap-4">
                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-bold border-2 border-amber-200 shadow-[3px_3px_0px_0px_#000000]">
                    <Heart className="w-6 h-6 fill-slate-950" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black royal-title">{selectedOrgan.name}</h2>
                    <p className="text-xs font-bold text-amber-300 uppercase tracking-widest">{selectedOrgan.impact}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedOrgan(null)}
                  className="p-2 rounded-xl bg-amber-400/10 border-2 border-amber-400/40 text-amber-300 hover:text-white transition-all shadow-[3px_3px_0px_0px_#E5C158] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar space-y-6">
                <div className="grid md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div className="relative aspect-square rounded-3xl bg-[#070918] p-8 flex items-center justify-center overflow-hidden border-2 border-amber-400/30">
                      <div className={`absolute inset-0 bg-gradient-to-br ${selectedOrgan.color} opacity-15 animate-pulse`} />
                      <motion.img
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        src={selectedOrgan.image}
                        alt={selectedOrgan.name}
                        className="w-full h-full object-contain drop-shadow-[0_10px_25px_rgba(229,193,88,0.4)] relative z-10"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-[#0e122e] border-2 border-amber-400/40 shadow-[4px_4px_0px_0px_#E5C158]">
                        <div className="flex items-center gap-2 mb-2 text-amber-300">
                          <Clock className="w-4 h-4" />
                          <span className="text-[10px] font-black uppercase tracking-wider">Avg Wait Period</span>
                        </div>
                        <p className="text-xl font-black royal-title">{selectedOrgan.waitingPeriod}</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-[#0e122e] border-2 border-rose-500/40 shadow-[4px_4px_0px_0px_#E63946]">
                        <div className="flex items-center gap-2 mb-2 text-rose-400">
                          <Zap className="w-4 h-4" />
                          <span className="text-[10px] font-black uppercase tracking-wider">Priority Level</span>
                        </div>
                        <p className="text-xl font-black text-rose-300">Imperial Priority</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="space-y-4">
                      <h3 className="text-xl font-black text-white">Why It Matters</h3>
                      <p className="text-slate-300 font-medium leading-relaxed">
                        {selectedOrgan.fullDetails}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-xl font-black text-white">Key Medical Facts</h3>
                      <div className="space-y-3">
                        {selectedOrgan.facts.map((fact, idx) => (
                          <div key={idx} className="flex gap-3 p-3.5 rounded-xl bg-[#080a1c] border border-amber-400/30">
                            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                            <span className="text-sm font-medium text-slate-200">{fact}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-amber-400/10 border-2 border-amber-400/40">
                      <p className="text-sm text-amber-200 font-bold italic leading-relaxed">
                        "Your decision to pledge a {selectedOrgan.name.toLowerCase()} establishes an eternal hero legacy for a recipient in desperate need."
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t-2 border-amber-400/40 flex gap-4 bg-[#0c0f26] sticky bottom-0">
                <Link
                  to="/register"
                  className="btn-primary flex-1 text-center text-sm py-4"
                >
                  Pledge This Organ
                </Link>
                <button
                  onClick={() => setSelectedOrgan(null)}
                  className="btn-secondary !px-8 text-sm"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Impact Stats */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 glass-card border-2 border-amber-400/50 shadow-[8px_8px_0px_0px_#E5C158] rounded-[2.5rem]">
        <div className="text-center mb-12 space-y-2">
          <h2 className="text-3xl font-black royal-title">Incredible Royal Impact</h2>
          <p className="text-slate-300 font-semibold">Every donation tells a story of hope and life</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="space-y-4 glass-brutal p-6">
            <div className="w-16 h-16 bg-amber-400/20 border-2 border-amber-400/60 rounded-2xl flex items-center justify-center mx-auto shadow-[4px_4px_0px_0px_#E5C158]">
              <Heart className="w-8 h-8 text-amber-300" />
            </div>
            <h3 className="text-4xl font-black royal-title">8 Lives</h3>
            <p className="text-slate-300 text-xs font-bold uppercase tracking-wider">Saved by one organ donor</p>
          </div>
          <div className="space-y-4 glass-brutal p-6">
            <div className="w-16 h-16 bg-rose-500/20 border-2 border-rose-500/60 rounded-2xl flex items-center justify-center mx-auto shadow-[4px_4px_0px_0px_#E63946]">
              <Users className="w-8 h-8 text-rose-300" />
            </div>
            <h3 className="text-4xl font-black text-rose-300">75+ Lives</h3>
            <p className="text-slate-300 text-xs font-bold uppercase tracking-wider">Improved through tissue donation</p>
          </div>
          <div className="space-y-4 glass-brutal p-6">
            <div className="w-16 h-16 bg-emerald-500/20 border-2 border-emerald-500/60 rounded-2xl flex items-center justify-center mx-auto shadow-[4px_4px_0px_0px_#10B981]">
              <Activity className="w-8 h-8 text-emerald-300" />
            </div>
            <h3 className="text-4xl font-black text-emerald-300">100%</h3>
            <p className="text-slate-300 text-xs font-bold uppercase tracking-wider">Altruistic Noble Pledge</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center mt-20">
        <div className="glass-card p-12 bg-gradient-to-br from-[#121638] via-[#1c0f2f] to-[#121638] border-2 border-amber-400/60 shadow-[8px_8px_0px_0px_#E5C158] rounded-[2.5rem] relative overflow-hidden">
          <div className="relative z-10 space-y-6">
            <h2 className="text-4xl font-black royal-title">Be A Hero Today</h2>
            <p className="text-lg text-slate-200 font-semibold max-w-xl mx-auto">Your single decision can change the world for someone.</p>
            <Link to="/register" className="btn-primary text-base px-10 py-5 inline-flex items-center gap-2">
              <span>Register Now As Hero</span>
            </Link>
          </div>
          <ShieldCheck className="absolute -bottom-10 -right-10 w-64 h-64 text-amber-400/10 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

export default OrgansPage;
