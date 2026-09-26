import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, Users, Building2, Activity, ArrowRight, TrendingUp, Zap, Sparkles } from 'lucide-react';
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
    <div className="min-h-screen bg-[#080a15] text-slate-100 relative selection:bg-amber-400/30 selection:text-amber-200">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[92vh] flex items-center py-16">
        {/* Ambient Mesh Background Orbs */}
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-amber-500/15 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-rose-600/15 rounded-full blur-[140px] pointer-events-none animate-pulse-slow"></div>
        <div className="absolute top-1/2 left-10 w-80 h-80 bg-purple-800/20 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10 w-full">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/15 border-2 border-amber-400/50 text-amber-300 text-xs font-black uppercase tracking-widest shadow-[0_0_20px_rgba(229,193,88,0.25)]">
                <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
                <span>The Royal Organ Registry of Life</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-none tracking-tight">
                <span className="royal-title">Save Lives</span>
                <br />
                <span className="text-white drop-shadow-md">With Royal Legacy.</span>
              </h1>

              <p className="text-lg md:text-xl text-slate-300/90 font-medium leading-relaxed max-w-xl">
                Join thousands of noble pledge heroes giving the sacred gift of life. Experience our royal-grade, automated organ matching system.
              </p>

              <div className="flex flex-wrap gap-5 pt-2">
                <Link to="/register" className="btn-primary text-base px-8 py-4">
                  <span>Register As Hero</span>
                  <ArrowRight className="w-5 h-5 text-slate-950" />
                </Link>
                <Link to="/login" className="btn-secondary text-base px-8 py-4">
                  <span>Sign In</span>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative flex justify-center items-center"
            >
              <div className="glass-card p-4 border-2 border-amber-400/40 shadow-royal-glass rounded-3xl relative">
                <HeroVisual />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section 
        className="py-16 bg-[#0c0f24]/90 backdrop-blur-2xl border-y-2 border-amber-400/30 relative z-20"
        aria-label="Impact Statistics"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {statItems.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-brutal p-6 text-center space-y-3 group hover:border-amber-300 hover:shadow-[7px_7px_0px_0px_#E5C158] transition-all"
              >
                <div 
                  className="inline-flex items-center justify-center w-14 h-14 bg-amber-400/15 border-2 border-amber-400/50 rounded-xl mb-1 group-hover:rotate-6 transition-transform shadow-[0_0_15px_rgba(229,193,88,0.2)]"
                  aria-hidden="true"
                >
                  <stat.icon className="w-7 h-7 text-amber-300" />
                </div>
                <h3 className="text-3xl font-black royal-title">{stat.value}</h3>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Activity & Organ Demand Section */}
      <section className="py-24 relative overflow-hidden bg-[#080a15]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12">
            {/* Left Col: Live Activity */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-400/15 border border-emerald-400/50 text-emerald-300 text-xs font-black uppercase tracking-wider">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10B981]" />
                  Live Network Impact
                </div>
                <h2 className="text-4xl font-black text-white leading-tight">
                  Royal Community <span className="royal-title">Milestones</span>
                </h2>
                <p className="text-slate-300/80 font-medium">
                  Real-time organ registration milestones and successful live hospital matching operations.
                </p>
              </div>

              <div className="glass-card p-6 border-2 border-amber-400/30">
                <ActivityFeed activities={activities} loading={loading} />
              </div>
            </div>

            {/* Right Col: Organ Demand */}
            <div className="lg:col-span-7">
              <div className="glass-card p-8 md:p-10 border-2 border-amber-400/40 shadow-royal-glass relative overflow-hidden">
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-3xl font-black text-white flex items-center gap-3">
                        <span>Real-time Organ Demand</span>
                        <Zap className="w-6 h-6 text-amber-400 fill-amber-400 animate-pulse" />
                      </h3>
                      <p className="text-slate-400 text-sm font-medium mt-1">Priority waitlists active across accredited medical centers</p>
                    </div>
                    <div className="hidden sm:block text-right">
                      <div className="royal-badge">ACTIVE ROYAL NETWORK</div>
                    </div>
                  </div>

                  <OrganDemandList demand={demand} loading={loading} />

                  <div className="p-5 rounded-xl bg-amber-400/10 border-2 border-amber-400/30 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-amber-200 text-sm uppercase tracking-wide">Optimized Matching Engine</h4>
                      <p className="text-xs text-slate-300/80 font-medium">Recipient matching accuracy elevated with multi-variable algorithms.</p>
                    </div>
                    <Link to="/organs" className="ml-auto text-amber-300 text-xs font-black uppercase tracking-wider hover:underline shrink-0">
                      Registry Insights →
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
        className="py-24 bg-[#0c0f24]/90 backdrop-blur-2xl border-t-2 border-amber-400/30"
        aria-label="Onboarding Steps"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16 space-y-3"
          >
            <h2 className="text-4xl md:text-5xl font-black royal-title">The Noble Hero's Journey</h2>
            <p className="text-slate-300 text-lg font-medium">Three seamless steps to seal an eternal gift</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Pledge & Register', desc: 'Create your royal donor profile and select organ donation preferences.' },
              { step: '02', title: 'Identity & Medical Check', desc: 'Authenticated medical encryption verifies donor records securely.' },
              { step: '03', title: 'Gift of Eternal Life', desc: 'Automatic matching notifies verified hospital surgical teams in emergency priority.' },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="glass-brutal p-8 relative overflow-hidden group hover:border-amber-300 hover:shadow-[7px_7px_0px_0px_#E5C158] transition-all"
              >
                <div className="text-7xl font-black royal-title opacity-20 absolute -top-4 -left-2 group-hover:opacity-40 transition-opacity">
                  {item.step}
                </div>
                <h3 className="text-2xl font-black text-amber-200 mb-3 relative z-10 font-sans tracking-tight">{item.title}</h3>
                <p className="text-slate-300 relative z-10 leading-relaxed font-medium text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-[#170e30] via-[#24133b] to-[#121633] text-white relative overflow-hidden border-t-2 border-amber-400/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-4xl md:text-5xl font-black royal-title">Be The Light In Someone's Darkest Hour</h2>
            <p className="text-slate-200 text-lg max-w-2xl mx-auto font-medium">
              A single donor can save up to 8 lives and improve 75 more. Establish your legacy today.
            </p>
            <div className="flex flex-wrap justify-center gap-6 pt-4">
              <Link
                to="/register"
                className="btn-primary text-base px-10 py-5"
              >
                <span>Sign The Royal Pledge</span>
              </Link>
              <Link
                to="/organs"
                className="btn-secondary text-base px-10 py-5"
              >
                <span>Explore Organs</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

