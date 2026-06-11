import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, Users, Building2, Activity, ArrowRight, TrendingUp, Zap } from 'lucide-react';
import HeroVisual from '../components/HeroVisual';
import ActivityFeed from '../components/ActivityFeed';
import OrganDemandList from '../components/OrganDemandList';
import axios from 'axios';
import homepageBg from '../assets/homepage_bg.png';

const LandingPage = () => {
  const [stats, setStats] = useState({
    totalDonors: '10,000+',
    livesSaved: '2,500+',
    hospitals: '150+',
    successRate: '95%'
  });
  const [activities, setActivities] = useState([]);
  const [demand, setDemand] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        const [statsRes, activityRes, demandRes] = await Promise.all([
          axios.get('/api/public/stats'),
          axios.get('/api/public/activity'),
          axios.get('/api/public/orders')
        ]);

        if (statsRes.data.success) {
          setStats({
            totalDonors: statsRes.data.stats.totalDonors.toLocaleString() + '+',
            livesSaved: statsRes.data.stats.totalMatches.toLocaleString() + '+',
            hospitals: statsRes.data.stats.totalHospitals.toLocaleString() + '+',
            successRate: statsRes.data.stats.successRate
          });
        }
        if (activityRes.data.success) setActivities(activityRes.data.activities);
        if (demandRes.data.success) setDemand(demandRes.data.demand);
      } catch (error) {
        console.error('Error fetching public data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicData();
  }, []);

  const statItems = [
    { label: 'Registered Donors', value: stats.totalDonors, icon: Users },
    { label: 'Lives Saved', value: stats.livesSaved, icon: Heart },
    { label: 'Partner Hospitals', value: stats.hospitals, icon: Building2 },
    { label: 'Success Rate', value: stats.successRate, icon: Activity },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-bottom bg-no-repeat"
          style={{ backgroundImage: `url(${homepageBg})` }}
        />
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-white/90 via-white/80 to-primary-50/70 dark:from-gray-900/95 dark:via-gray-900/90 dark:to-gray-800/80 backdrop-blur-[2px]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative z-10 w-full">
          <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                <span className="gradient-text">Save Lives</span>
                <br />
                Through Organ Donation
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Join thousands of heroes who have pledged to give the gift of life. Register as an organ donor today and make a lasting impact.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/register" className="btn-primary flex items-center gap-2 shadow-xl shadow-primary-500/20">
                  Register Now
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/login" className="btn-secondary">
                  Sign In
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative flex justify-center items-center"
            >
              <HeroVisual />
            </motion.div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow pointer-events-none"></div>
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow animation-delay-400 pointer-events-none"></div>
      </section>

      {/* Stats Section */}
      <section 
        className="py-16 bg-white dark:bg-gray-800 border-y border-gray-100 dark:border-gray-700"
        aria-label="Impact Statistics"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8" aria-live="polite">
            {statItems.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center space-y-2 group"
              >
                <div 
                  className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-pink-500 rounded-2xl mb-4 group-hover:rotate-6 transition-transform shadow-lg shadow-primary-500/20"
                  aria-hidden="true"
                >
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-black gradient-text">{stat.value}</h3>
                <p className="text-gray-600 dark:text-gray-400 font-medium tracking-tight">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Activity & Organ Demand Section */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-16">
            {/* Left Col: Live Activity */}
            <div className="lg:col-span-5">
              <div className="mb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 text-primary-500 text-xs font-bold uppercase tracking-wider mb-4">
                  <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                  Live Network Impact
                </div>
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Community <span className="text-primary-500">Milestones</span>
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Every action on our platform brings us closer to a world where no one dies waiting for an organ. Refresh to see the latest updates.
                </p>
              </div>

              <ActivityFeed activities={activities} loading={loading} />
            </div>

            {/* Right Col: Organ Demand */}
            <div className="lg:col-span-7">
              <div className="p-8 md:p-12 rounded-[2.5rem] bg-gray-900 border border-white/5 shadow-2xl relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                     style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-3xl font-bold text-white flex items-center gap-3">
                        Real-time Demand
                        <Zap className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                      </h3>
                      <p className="text-gray-400 mt-2">Current priority waitlist across all partner hospitals</p>
                    </div>
                    <div className="hidden sm:block text-right">
                      <div className="text-2xl font-black text-white">Active</div>
                      <div className="text-xs text-primary-400 font-bold uppercase tracking-widest">Network Status</div>
                    </div>
                  </div>

                  <OrganDemandList demand={demand} loading={loading} />

                  <div className="mt-10 p-6 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">Growing Network</h4>
                      <p className="text-xs text-gray-500">Matching efficiency increased by 12% this month.</p>
                    </div>
                    <Link to="/organs" className="ml-auto text-primary-400 text-xs font-bold hover:underline">
                      View Insights
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section 
        className="py-24 bg-white dark:bg-gray-800"
        aria-label="Onboarding Steps"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">The Hero's Journey</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">Simple steps to make an eternal impact</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              { step: '01', title: 'Pledge & Register', desc: 'Securely create your hero profile and express your donation preferences.' },
              { step: '02', title: 'Identity Verification', desc: 'We verify your identification to maintain the highest standards of trust.' },
              { step: '03', title: 'Legacy of Life', desc: 'Get matched with those in need and give the ultimate gift of a second chance.' },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative p-8 rounded-3xl bg-gray-50 dark:bg-gray-900 border border-transparent hover:border-primary-500/20 transition-all group"
              >
                <div className="text-6xl font-black text-primary-500/10 absolute -top-4 -left-2 group-hover:text-primary-500/20 transition-colors">
                  {item.step}
                </div>
                <h3 className="text-2xl font-bold mb-3 relative z-10">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 relative z-10 leading-relaxed font-medium">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary-600 to-pink-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-5xl font-black">Be the Light in Someone's Darkest Hour</h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              A single donor can save up to 8 lives and improve up to 75 more. Your legacy starts here.
            </p>
            <div className="flex flex-wrap justify-center gap-6 pt-4">
              <Link
                to="/register"
                className="px-10 py-5 bg-white text-primary-600 font-black rounded-2xl shadow-2xl hover:bg-gray-50 transform hover:-translate-y-1 transition-all duration-200 text-lg"
              >
                Sign the Pledge
              </Link>
              <Link
                to="/organs"
                className="px-10 py-5 bg-primary-700/30 text-white border border-white/20 font-black rounded-2xl backdrop-blur-md hover:bg-primary-700/50 transition-all text-lg"
              >
                Learn More
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

