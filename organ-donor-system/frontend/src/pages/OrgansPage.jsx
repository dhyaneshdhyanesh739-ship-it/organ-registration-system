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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <section className="bg-gradient-to-r from-primary-600 to-pink-600 py-20 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            The Gift of Life: Organs & Tissues
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl opacity-90 max-w-3xl mx-auto"
          >
            One single donor can save up to 8 lives and enhance the lives of over 75 others. 
            Explore the incredible impact of organ donation.
          </motion.p>
        </div>
      </section>

      {/* Gallery Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {organs.map((organ, index) => (
            <motion.div
              key={organ.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedOrgan(organ)}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700 cursor-pointer"
            >
              {/* Image Container */}
              <div className="h-64 relative overflow-hidden bg-gray-100 dark:bg-gray-700 p-8 flex items-center justify-center">
                <img
                  src={organ.image}
                  alt={organ.name}
                  className="max-h-full max-w-full object-contain transform group-hover:scale-110 transition-transform duration-500 drop-shadow-2xl"
                />
                <div className="absolute top-4 right-4 bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                  {organ.impact}
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                  <span className="text-white font-bold px-4 py-2 rounded-xl border border-white/50">View Details</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-bold gradient-text">{organ.name}</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed line-clamp-2">
                  {organ.description}
                </p>

                <div className="space-y-2 py-2 border-t border-gray-100 dark:border-gray-700 pt-4">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Info className="w-4 h-4 text-primary-500" />
                    Quick Facts
                  </h4>
                  {organ.facts.slice(0, 2).map((fact, idx) => (
                    <div key={idx} className="flex gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{fact}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-1 text-xs font-medium text-primary-500 pt-1">
                    <span>Click for more details & waiting times</span>
                    <TrendingUp className="w-3 h-3" />
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
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-white/10"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-10">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl bg-gradient-to-br ${selectedOrgan.color} text-white`}>
                    <Heart className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold dark:text-white">{selectedOrgan.name}</h2>
                    <p className="text-sm text-gray-500">{selectedOrgan.impact}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedOrgan(null)}
                  className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all transform hover:rotate-90"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
                <div className="grid md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div className="relative aspect-square rounded-3xl bg-gray-100 dark:bg-gray-800 p-8 flex items-center justify-center overflow-hidden">
                      <div className={`absolute inset-0 bg-gradient-to-br ${selectedOrgan.color} opacity-10 animate-pulse`} />
                      <motion.img
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        src={selectedOrgan.image}
                        alt={selectedOrgan.name}
                        className="w-full h-full object-contain drop-shadow-2xl relative z-10"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-2 mb-2 text-primary-500">
                          <Clock className="w-4 h-4" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Avg. Wait Period</span>
                        </div>
                        <p className="text-xl font-black dark:text-white">{selectedOrgan.waitingPeriod}</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-2 mb-2 text-pink-500">
                          <Zap className="w-4 h-4" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Priority Level</span>
                        </div>
                        <p className="text-xl font-black dark:text-white">High</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold dark:text-white">Why it Matters</h3>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {selectedOrgan.fullDetails}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-xl font-bold dark:text-white">Key Facts</h3>
                      <div className="space-y-3">
                        {selectedOrgan.facts.map((fact, idx) => (
                          <div key={idx} className="flex gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">{fact}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-primary-500/5 border border-primary-500/10">
                      <p className="text-sm text-primary-600 dark:text-primary-400 font-medium italic">
                        "Your decision to pledge a {selectedOrgan.name.toLowerCase()} can be the dawn of a new life for someone in desperate need."
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex gap-4 bg-white dark:bg-gray-900 sticky bottom-0">
                <Link
                  to="/register"
                  className="flex-1 py-4 bg-primary-600 text-white rounded-2xl font-bold text-center hover:bg-primary-700 transition-all shadow-xl shadow-primary-500/20"
                >
                  Pledge this Organ
                </Link>
                <button
                  onClick={() => setSelectedOrgan(null)}
                  className="px-8 py-4 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Impact Stats */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold gradient-text">Incredible Impact</h2>
          <p className="text-gray-600 dark:text-gray-400">Every donation tells a story of hope and life</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mx-auto">
              <Heart className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-4xl font-bold text-gray-900 dark:text-white">8 Lives</h3>
            <p className="text-gray-600 dark:text-gray-400">Saved by one single organ donor</p>
          </div>
          <div className="space-y-4">
            <div className="w-16 h-16 bg-pink-100 dark:bg-pink-900/30 rounded-2xl flex items-center justify-center mx-auto">
              <Users className="w-8 h-8 text-pink-600" />
            </div>
            <h3 className="text-4xl font-bold text-gray-900 dark:text-white">75+ Lives</h3>
            <p className="text-gray-600 dark:text-gray-400">Improved through tissue donation</p>
          </div>
          <div className="space-y-4">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mx-auto">
              <Activity className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-4xl font-bold text-gray-900 dark:text-white">100%</h3>
            <p className="text-gray-600 dark:text-gray-400">Of donation is out of altruism</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center mt-20">
        <div className="glass-card p-12 bg-gradient-to-br from-primary-600 to-pink-600 text-white rounded-3xl relative overflow-hidden">
          <div className="relative z-10 space-y-6">
            <h2 className="text-3xl font-bold">Be a Hero Today</h2>
            <p className="text-xl opacity-90">Your one decision can change the world for someone.</p>
            <Link to="/register" className="px-8 py-4 bg-white text-primary-600 font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 inline-block">
              Register Now as a Donor
            </Link>
          </div>
          <ShieldCheck className="absolute -bottom-10 -right-10 w-64 h-64 text-white/10" />
        </div>
      </div>
    </div>
  );
};

export default OrgansPage;
