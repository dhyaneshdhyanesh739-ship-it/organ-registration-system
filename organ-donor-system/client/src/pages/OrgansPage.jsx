import { motion } from 'framer-motion';
import { CheckCircle, Info, Heart, Activity, Users, ShieldCheck } from 'lucide-react';
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
  const organs = [
    {
      name: 'Heart',
      image: heartImg,
      description: 'The hardest working muscle in the human body, pumping blood to all parts of the body.',
      facts: [
        'A single heart donor can save one life.',
        'Heart transplants are needed for end-stage heart failure.',
        'The heart must be transplanted within 4-6 hours.',
      ],
      impact: 'Critical Life Saver',
    },
    {
      name: 'Liver',
      image: liverImg,
      description: 'The body\'s chemical factory, performing over 500 essential functions.',
      facts: [
        'The liver can be donated by a living donor (partial).',
        'It is the only organ that can regenerate itself.',
        'Needed for cirrhosis, liver cancer, and metabolic diseases.',
      ],
      impact: 'Regenerative Marvel',
    },
    {
      name: 'Kidneys',
      image: kidneysImg,
      description: 'Filter waste and excess fluid from the blood, producing urine.',
      facts: [
        'Most commonly transplanted organ.',
        'Living donation is possible with one healthy kidney.',
        'Can stay viable outside the body for up to 24-36 hours.',
      ],
      impact: 'Most Needed',
    },
    {
      name: 'Lungs',
      image: lungsImg,
      description: 'Essential for breathing, providing oxygen to the blood and removing carbon dioxide.',
      facts: [
        'Can be donated as a single lung or a pair.',
        'Critical for patients with cystic fibrosis or COPD.',
        'Viability period is relatively short (4-6 hours).',
      ],
      impact: 'Breath of Life',
    },
    {
      name: 'Pancreas',
      image: pancreasImg,
      description: 'Produces enzymes for digestion and hormones like insulin for blood sugar regulation.',
      facts: [
        'Often transplanted alongside a kidney for diabetic patients.',
        'Crucial for treating Type 1 Diabetes complications.',
        'Helps restore normal insulin production.',
      ],
      impact: 'Metabolic Balance',
    },
    {
      name: 'Intestines',
      image: intestinesImg,
      description: 'Crucial for absorbing nutrients and water from food.',
      facts: [
        'Complex transplant often performed with other abdominal organs.',
        'Needed for patients with short bowel syndrome or intestinal failure.',
        'Greatly improves quality of life and nutrition.',
      ],
      impact: 'Nutritional Foundation',
    },
    {
      name: 'Corneas',
      image: corneasImg,
      description: 'The clear, front surface of the eye that helps focus light.',
      facts: [
        'Restores sight to those with corneal blindness.',
        'Can be donated up to 24 hours after death.',
        'One of the most successful transplant procedures.',
      ],
      impact: 'Gift of Sight',
    },
    {
      name: 'Skin',
      image: skinImg,
      description: 'The body\'s largest organ, providing protection and regulation.',
      facts: [
        'Used for life-saving grafts for severe burn victims.',
        'Can be stored in skin banks for several years.',
        'Helps prevent infection and fluid loss in trauma patients.',
      ],
      impact: 'Protective Shield',
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
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700"
            >
              {/* Image Container */}
              <div className="h-64 relative overflow-hidden bg-gray-100 dark:bg-gray-700">
                <img
                  src={organ.image}
                  alt={organ.name}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                  {organ.impact}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-bold gradient-text">{organ.name}</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  {organ.description}
                </p>

                <div className="space-y-2 py-2 border-t border-gray-100 dark:border-gray-700 pt-4">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Info className="w-4 h-4 text-primary-500" />
                    Quick Facts
                  </h4>
                  {organ.facts.map((fact, idx) => (
                    <div key={idx} className="flex gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{fact}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

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
