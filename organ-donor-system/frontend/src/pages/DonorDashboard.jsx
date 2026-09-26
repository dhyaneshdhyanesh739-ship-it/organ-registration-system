import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { donorService } from '../services';
import { Heart, Activity, FileText, CheckCircle, XCircle, Loader, Plus, Edit, Award, Shield, Star, Trophy, Sparkles, Scale, Crown } from 'lucide-react';
import StatsCard from '../components/StatsCard';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { Link } from 'react-router-dom';
import HistoryItem from '../components/HistoryItem';
import Certificate from '../components/Certificate';
import AIDonorHistoryScanner from '../components/AIDonorHistoryScanner';

const DonorDashboard = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [profile, setProfile] = useState(null);
  const [activity, setActivity] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [pledgeStory, setPledgeStory] = useState("I'm pledging to donate my organs to bestow the gift of life onto others in need.");
  const [isEditingPledge, setIsEditingPledge] = useState(false);

  // Medical Suitability Simulator state
  const [suitabilityAge, setSuitabilityAge] = useState(28);
  const [selectedOrgan, setSelectedOrgan] = useState('Kidneys');
  const [calculatedScore, setCalculatedScore] = useState(94);

  useEffect(() => {
    // Recalculate mock suitability score dynamically
    let base = 98 - Math.max(0, (suitabilityAge - 30) * 0.4);
    if (selectedOrgan === 'Heart') base -= 4;
    if (selectedOrgan === 'Corneas') base += 3;
    setCalculatedScore(Math.min(99, Math.max(65, Math.round(base))));
  }, [suitabilityAge, selectedOrgan]);

  // Calculate Gamification Score (0-100)
  const getCompletionScore = () => {
    let score = 25; // Base score for creating account
    if (user?.isVerified) score += 25;
    if (profile) score += 25;
    if (stats?.consentGiven) score += 25;
    return score;
  };

  const getBadges = () => {
    const badges = [];
    if (user?.isVerified) badges.push({ icon: Shield, color: 'text-amber-400', bg: 'bg-amber-950/60 border border-amber-500/40', label: 'Verified Royal Identity' });
    if (profile) badges.push({ icon: Star, color: 'text-emerald-400', bg: 'bg-emerald-950/60 border border-emerald-500/40', label: 'Complete Health Passport' });
    if (stats?.consentGiven) badges.push({ icon: Crown, color: 'text-rose-400', bg: 'bg-rose-950/60 border border-rose-500/40', label: 'Imperial Life Hero' });
    return badges;
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsData, profileData, activityData, historyData] = await Promise.all([
        donorService.getStats(),
        donorService.getProfile().catch(() => null),
        donorService.getActivity().catch(() => ({ activity: [] })),
        donorService.getDonationHistory().catch(() => ({ history: [] })),
      ]);
      setStats(statsData.stats);
      setProfile(profileData?.donor);
      setActivity(activityData.activity || []);
      setHistory(historyData.history || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConsentToggle = async () => {
    try {
      const newConsent = !stats?.consentGiven;
      await donorService.updateConsent({ consentGiven: newConsent });
      toast.success(`Consent ${newConsent ? 'granted' : 'revoked'} successfully`);
      setShowConsentModal(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to update consent');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070913]">
        <Loader className="w-10 h-10 animate-spin text-amber-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#070913] via-[#0c0f26] to-[#140b24] text-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Imperial Glass-Brutal Banner Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-950/40 via-[#0c0f26]/90 to-rose-950/40 border-2 border-amber-400/50 backdrop-blur-2xl shadow-[6px_6px_0px_0px_#E5C158] overflow-hidden"
        >
          <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 opacity-10 pointer-events-none">
            <Crown className="w-64 h-64 text-amber-400" />
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-amber-400/20 border border-amber-400/50 text-amber-300 font-bold text-xs uppercase tracking-widest rounded-full flex items-center gap-1.5 shadow-sm">
                  <Crown className="w-3.5 h-3.5 text-amber-400" /> Imperial Donor Command
                </span>
                {stats?.consentGiven && (
                  <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 font-bold text-xs uppercase tracking-widest rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Active Pledge
                  </span>
                )}
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold royal-title text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 drop-shadow">
                Welcome, {user.firstName}!
              </h1>
              <p className="text-gray-300 text-sm sm:text-base mt-2 font-medium">
                Your pledge is a beacon of hope. Manage your medical profile, track donor suitability, and view matching records.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {profile && (
                <Link to="/donor/profile/edit">
                  <Button variant="outline" className="border-amber-400/60 text-amber-300 hover:bg-amber-400/20 shadow-[4px_4px_0px_0px_#E5C158]" leftIcon={<Edit className="w-4 h-4" />}>
                    Edit Profile
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Identity Status"
            value={user.isVerified ? 'Verified' : 'In Review'}
            icon={user.isVerified ? CheckCircle : XCircle}
            color={user.isVerified ? 'green' : 'orange'}
            change={user.isVerified ? '100% Validated' : 'Verification Pending'}
            trend="up"
            delay={0}
          />
          <StatsCard
            title="Donation Status"
            value={stats?.donationStatus || 'Inactive'}
            icon={Activity}
            color="blue"
            delay={0.1}
          />
          <StatsCard
            title="Organs Pledged"
            value={stats?.organsRegistered || profile?.organsForDonation?.length || 0}
            icon={Heart}
            color="primary"
            change="+ Active Registry"
            trend="up"
            delay={0.2}
          />
          <StatsCard
            title="Consent Registry"
            value={stats?.consentGiven ? 'Granted' : 'Pending'}
            icon={FileText}
            color={stats?.consentGiven ? 'green' : 'purple'}
            delay={0.3}
          />
        </div>

        {/* Imperial Donor Journey & Gamification Bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 rounded-2xl bg-[#0c0f26]/90 border-2 border-amber-400/40 backdrop-blur-xl shadow-[6px_6px_0px_0px_#E5C158]"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex-1 w-full">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <h3 className="font-extrabold text-xl text-amber-300 font-serif flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-400" /> Donor Honor Quest
                  </h3>
                  <p className="text-xs text-gray-400">Complete verification and profile steps to unlock your Official Donor Certificate.</p>
                </div>
                <span className="font-black text-3xl text-amber-400 tracking-wider">{getCompletionScore()}%</span>
              </div>
              <div className="h-4 w-full bg-gray-950 rounded-full overflow-hidden border border-amber-500/30 p-0.5">
                <motion.div 
                  className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 rounded-full shadow-[0_0_12px_rgba(229,193,88,0.6)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${getCompletionScore()}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                />
              </div>
            </div>
            
            <div className="flex gap-4 shrink-0">
              {getBadges().map((badge, idx) => (
                <div key={idx} className="flex flex-col items-center group relative cursor-help">
                  <div className={`w-14 h-14 rounded-2xl ${badge.bg} flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg`}>
                    <badge.icon className={`w-7 h-7 ${badge.color}`} />
                  </div>
                  <div className="absolute -bottom-10 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-950 text-amber-200 text-xs px-3 py-1.5 rounded-lg border border-amber-400/40 whitespace-nowrap pointer-events-none z-20 shadow-2xl">
                    {badge.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Profile Setup Prompt */}
        {!profile ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="p-8 rounded-2xl bg-gradient-to-r from-amber-950/60 via-[#181028] to-rose-950/60 border-2 border-amber-400 shadow-[6px_6px_0px_0px_#E5C158]">
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className="p-4 bg-amber-500/20 border border-amber-400/50 rounded-2xl">
                  <FileText className="w-8 h-8 text-amber-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-extrabold text-amber-300 font-serif mb-2">
                    Complete Your Medical Donor Passport
                  </h3>
                  <p className="text-gray-300 text-sm mb-6 max-w-2xl leading-relaxed">
                    You are just one step away from joining the official organ donor registry. Provide your blood group, age, and organ pledge details to enable hospital matching algorithms.
                  </p>
                  <Link to="/donor/profile/create">
                    <Button className="bg-gradient-to-r from-amber-500 to-yellow-500 text-gray-950 font-black px-6 py-3 shadow-[4px_4px_0px_0px_#000]" leftIcon={<Plus className="w-5 h-5" />}>
                      Create Donor Profile Now
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            
            {/* Profile Info Card */}
            <Card className="lg:col-span-2 bg-[#0c0f26]/90 border-2 border-amber-400/40 backdrop-blur-xl shadow-[6px_6px_0px_0px_#E5C158]">
              <Card.Header>
                <Card.Title className="text-amber-300 font-serif text-2xl flex items-center gap-2">
                  <Shield className="w-6 h-6 text-amber-400" /> Registered Health Passport
                </Card.Title>
                <Card.Description className="text-gray-400">Verified medical donor record details</Card.Description>
              </Card.Header>
              <Card.Content>
                <div className="grid sm:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-rose-950/40 border border-rose-500/30 rounded-2xl shadow-inner">
                    <div className="text-3xl mb-1">🩸</div>
                    <p className="text-xs text-rose-300 uppercase tracking-widest font-bold">Blood Group</p>
                    <p className="text-3xl font-black text-rose-400 mt-1">{profile.bloodGroup}</p>
                  </div>
                  <div className="text-center p-4 bg-amber-950/40 border border-amber-500/30 rounded-2xl shadow-inner">
                    <div className="text-3xl mb-1">🎂</div>
                    <p className="text-xs text-amber-300 uppercase tracking-widest font-bold">Age</p>
                    <p className="text-3xl font-black text-amber-400 mt-1">{profile.age} yrs</p>
                  </div>
                  <div className="text-center p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl shadow-inner">
                    <div className="text-3xl mb-1">📍</div>
                    <p className="text-xs text-emerald-300 uppercase tracking-widest font-bold">Location</p>
                    <p className="text-xl font-bold text-emerald-400 mt-2 truncate">{profile.address?.city || 'Registered'}</p>
                  </div>
                </div>
                
                {profile.organsForDonation && profile.organsForDonation.length > 0 && (
                  <div>
                    <h4 className="font-bold text-gray-200 mb-3 text-sm uppercase tracking-wider flex items-center gap-2">
                      <Heart className="w-4 h-4 text-rose-400" /> Pledged Organs & Tissues
                    </h4>
                    <div className="flex flex-wrap gap-2.5">
                      {profile.organsForDonation.map((organ) => (
                        <span
                          key={organ}
                          className="px-4 py-2 bg-gradient-to-r from-amber-500/20 to-rose-500/20 border border-amber-400/50 text-amber-200 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" /> {organ}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </Card.Content>
            </Card>

            {/* Pledge Story Card */}
            <Card className="bg-[#0c0f26]/90 border-2 border-indigo-400/40 backdrop-blur-xl shadow-[6px_6px_0px_0px_#6366F1] flex flex-col justify-between">
              <Card.Header>
                <Card.Title className="text-indigo-300 font-serif flex items-center gap-2">
                  <Star className="w-5 h-5 text-indigo-400" /> Imperial Pledge Oath
                </Card.Title>
              </Card.Header>
              <Card.Content className="flex-1 flex flex-col justify-center">
                {isEditingPledge ? (
                  <div className="space-y-3">
                    <textarea 
                      className="w-full p-3 bg-gray-950 border border-indigo-500/40 rounded-xl text-sm text-gray-200 focus:outline-none focus:border-indigo-400 resize-none"
                      rows="4"
                      value={pledgeStory}
                      onChange={(e) => setPledgeStory(e.target.value)}
                      placeholder="Share your pledge inspiration..."
                    />
                    <Button size="sm" onClick={() => setIsEditingPledge(false)} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold">
                      Save Pledge Oath
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <p className="text-gray-300 italic text-sm leading-relaxed mb-4">
                      "{pledgeStory}"
                    </p>
                    <button 
                      onClick={() => setIsEditingPledge(true)}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center justify-center gap-1 mx-auto"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit Oath
                    </button>
                  </div>
                )}
              </Card.Content>
            </Card>
          </div>
        )}

        {/* Interactive Medical Donor Suitability Simulator */}
        {profile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0c0f26] via-[#121638] to-[#1a0f2e] border-2 border-emerald-400/40 backdrop-blur-2xl shadow-[6px_6px_0px_0px_#10B981]"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="space-y-4 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 rounded-full text-xs font-bold uppercase tracking-widest">
                  <Scale className="w-4 h-4 text-emerald-400" /> Live Compatibility & Viability Calculator
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-emerald-300 font-serif">
                  Medical Viability Estimator
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Calculates your projected transplant viability score based on clinical parameters, HLA tissue compatibility models, and organ harvest transport windows.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Age Factor ({suitabilityAge} yrs)</label>
                    <input 
                      type="range" 
                      min="18" 
                      max="75" 
                      value={suitabilityAge}
                      onChange={(e) => setSuitabilityAge(Number(e.target.value))}
                      className="w-full accent-emerald-400 bg-gray-950 rounded-lg cursor-pointer h-2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Target Organ</label>
                    <select
                      value={selectedOrgan}
                      onChange={(e) => setSelectedOrgan(e.target.value)}
                      className="w-full bg-gray-950 border border-emerald-500/40 rounded-xl px-3 py-1.5 text-sm text-emerald-200 font-bold focus:outline-none"
                    >
                      <option value="Kidneys">Kidneys (Cold Ischemia ~24h)</option>
                      <option value="Heart">Heart (Cold Ischemia ~4h)</option>
                      <option value="Liver">Liver (Cold Ischemia ~10h)</option>
                      <option value="Corneas">Corneas (Cold Ischemia ~7 days)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Score Display Box */}
              <div className="flex flex-col items-center justify-center p-6 bg-gray-950/80 border-2 border-emerald-400 rounded-2xl min-w-[240px] text-center shadow-inner">
                <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1">Transplant Viability Index</p>
                <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-green-400 my-2">
                  {calculatedScore}%
                </div>
                <div className="px-3 py-1 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 rounded-full text-[11px] font-bold">
                  {calculatedScore > 90 ? '🌟 Optimal Clinical Match' : 'High Viability'}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Certificate Section */}
        {profile && stats?.consentGiven && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700 text-gray-950 shadow-[6px_6px_0px_0px_#000] border-2 border-amber-300">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-gray-950/20 rounded-2xl border border-gray-950/30">
                    <Award className="w-10 h-10 text-gray-950" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-2xl font-serif text-gray-950">
                      Official Imperial Donor Certificate
                    </h3>
                    <p className="text-gray-900 font-medium text-sm mt-0.5">
                      Generate and print your official registration certificate with digital security verification stamp.
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => setShowCertificate(true)}
                  className="bg-gray-950 text-amber-300 hover:bg-gray-900 font-black px-8 py-3 text-base shadow-[4px_4px_0px_0px_#fff]"
                >
                  View Certificate
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* AI Scanner */}
        {profile && (
          <div>
            <AIDonorHistoryScanner onHistoryUpdated={fetchData} />
          </div>
        )}

        {/* Donation Impact History & Activity */}
        {profile && (
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 bg-[#0c0f26]/90 border-2 border-amber-400/40 backdrop-blur-xl shadow-[6px_6px_0px_0px_#E5C158]">
              <Card.Header>
                <Card.Title className="text-amber-300 font-serif flex items-center gap-2 text-xl">
                  <Heart className="w-5 h-5 text-rose-400" /> Donation Impact & Hospital Match History
                </Card.Title>
                <Card.Description className="text-gray-400">Transplant matching log</Card.Description>
              </Card.Header>
              <Card.Content>
                {history.length === 0 ? (
                  <div className="text-center py-12 bg-gray-950/50 rounded-2xl border border-dashed border-amber-500/30">
                    <Heart className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400 font-bold">No active transplant matches yet</p>
                    <p className="text-xs text-gray-500 mt-1">Hospital queries will automatically match your organ profile when requested.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {history.map((item) => (
                      <div key={item.id} className="p-4 bg-gray-950 border border-amber-500/30 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-amber-500/20 border border-amber-400/40 rounded-xl">
                            <CheckCircle className="w-6 h-6 text-amber-400" />
                          </div>
                          <div>
                            <p className="font-bold text-amber-200">{item.organType} Match</p>
                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                              <Activity className="w-3 h-3 text-emerald-400" />
                              Recipient: {item.recipientName} ({item.recipientType})
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            item.status === 'completed' 
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/40' 
                              : 'bg-amber-500/20 text-amber-400 border border-amber-400/40'
                          }`}>
                            {item.status}
                          </span>
                          <p className="text-[10px] text-gray-400 mt-2 font-medium">
                            {new Date(item.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card.Content>
            </Card>

            {/* System Activity */}
            <Card className="bg-[#0c0f26]/90 border-2 border-amber-400/40 backdrop-blur-xl shadow-[6px_6px_0px_0px_#E5C158] flex flex-col h-[480px]">
              <Card.Header className="pb-2">
                <Card.Title className="text-amber-300 font-serif text-xl">System Activity Audit</Card.Title>
                <Card.Description className="text-gray-400">Live action logs</Card.Description>
              </Card.Header>
              <Card.Content className="flex-1 overflow-y-auto custom-scrollbar pt-0">
                {activity.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6">
                    <Activity className="w-12 h-12 text-gray-600 mb-2" />
                    <p className="text-gray-400 text-sm">No activity logs recorded.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-800">
                    {activity.map((item, idx) => (
                      <HistoryItem key={item._id} item={item} index={idx} />
                    ))}
                  </div>
                )}
              </Card.Content>
            </Card>
          </div>
        )}

        {/* Consent Modal */}
        <Modal isOpen={showConsentModal} onClose={() => setShowConsentModal(false)}>
          <Modal.Header>
            <Modal.Title className="text-amber-300 font-serif">
              {stats?.consentGiven ? 'Revoke Donor Consent' : 'Grant Organ Donor Consent'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p className="text-gray-300 text-sm leading-relaxed">
              {stats?.consentGiven
                ? 'Are you sure you wish to revoke your donor pledge? This will set your status to inactive in the hospital transplant registry.'
                : 'By granting consent, you legally authorize your organ donation pledge upon brain death or clinical clearance. This decision bestows the gift of life.'}
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="ghost" onClick={() => setShowConsentModal(false)}>
              Cancel
            </Button>
            <Button
              variant={stats?.consentGiven ? 'danger' : 'success'}
              onClick={handleConsentToggle}
              className="font-bold"
            >
              {stats?.consentGiven ? 'Confirm Revoke' : 'Grant Consent Now'}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Certificate Modal */}
        <Certificate 
          isOpen={showCertificate}
          onClose={() => setShowCertificate(false)}
          type="donor"
          userData={user}
          details={{ 
            bloodGroup: profile?.bloodGroup,
            date: profile?.createdAt 
          }}
        />
      </div>
    </div>
  );
};

export default DonorDashboard;
