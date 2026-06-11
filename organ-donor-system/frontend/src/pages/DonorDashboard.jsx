import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { donorService } from '../services';
import { Heart, Activity, FileText, CheckCircle, XCircle, Loader, Plus, Edit, Award, Shield, Star, Trophy } from 'lucide-react';
import StatsCard from '../components/StatsCard';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { LineChartComponent } from '../components/Charts';
import { Link } from 'react-router-dom';
import HistoryItem from '../components/HistoryItem';
import Certificate from '../components/Certificate';

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
  const [pledgeStory, setPledgeStory] = useState("I'm donating because I believe everyone deserves a second chance at life.");
  const [isEditingPledge, setIsEditingPledge] = useState(false);

  // Calculate Gamification Score (0-100)
  const getCompletionScore = () => {
    let score = 20; // Base score for creating account
    if (user?.isVerified) score += 20;
    if (profile) score += 30;
    if (stats?.consentGiven) score += 30;
    return score;
  };

  const getBadges = () => {
    const badges = [];
    if (user?.isVerified) badges.push({ icon: Shield, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30', label: 'Verified Identity' });
    if (profile) badges.push({ icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/30', label: 'Profile Complete' });
    if (stats?.consentGiven) badges.push({ icon: Trophy, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30', label: 'Organ Hero' });
    return badges;
  };

  // Mock data for activity chart
  const activityData = [
    { month: 'Jan', updates: 2 },
    { month: 'Feb', updates: 3 },
    { month: 'Mar', updates: 1 },
    { month: 'Apr', updates: 4 },
    { month: 'May', updates: 2 },
    { month: 'Jun', updates: 5 },
  ];

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
      toast.success(`Consent ${newConsent ? 'given' : 'revoked'} successfully`);
      setShowConsentModal(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to update consent');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-orange-50/40 to-pink-100/50 dark:from-gray-900 dark:via-rose-950/20 dark:to-orange-950/20 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold gradient-text">Donor Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
                Welcome back, <span className="font-semibold">{user.firstName}</span>! 👋
              </p>
            </div>
            {profile && (
              <Link to="/donor/profile/edit">
                <Button variant="outline" leftIcon={<Edit className="w-4 h-4" />}>
                  Edit Profile
                </Button>
              </Link>
            )}
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Profile Status"
            value={user.isVerified ? 'Verified' : 'Pending'}
            icon={user.isVerified ? CheckCircle : XCircle}
            color={user.isVerified ? 'green' : 'orange'}
            change={user.isVerified ? '100%' : 'In Review'}
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
            title="Organs Registered"
            value={stats?.organsRegistered || 0}
            icon={Heart}
            color="primary"
            change="+2 this month"
            trend="up"
            delay={0.2}
          />
          <StatsCard
            title="Consent Status"
            value={stats?.consentGiven ? 'Given' : 'Not Given'}
            icon={FileText}
            color={stats?.consentGiven ? 'green' : 'purple'}
            delay={0.3}
          />
        </div>

        {/* Gamification Bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8"
        >
          <Card className="bg-white dark:bg-gray-800 border-none shadow-sm">
            <Card.Content className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex-1 w-full">
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">Donor Journey Progress</h3>
                      <p className="text-sm text-gray-500">Complete tasks to unlock your donor certificate.</p>
                    </div>
                    <span className="font-black text-2xl text-primary-600">{getCompletionScore()}%</span>
                  </div>
                  <div className="h-3 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-primary-500 to-pink-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${getCompletionScore()}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 shrink-0">
                  {getBadges().map((badge, idx) => (
                    <div key={idx} className="flex flex-col items-center group relative cursor-help">
                      <div className={`w-12 h-12 rounded-full ${badge.bg} flex items-center justify-center transition-transform group-hover:-translate-y-1`}>
                        <badge.icon className={`w-6 h-6 ${badge.color}`} />
                      </div>
                      {/* Tooltip */}
                      <div className="absolute -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none z-10">
                        {badge.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card.Content>
          </Card>
        </motion.div>

        {/* Profile Setup Alert */}
        {!profile ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                  <FileText className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-xl mb-2 text-gray-900 dark:text-gray-100">
                    Complete Your Profile to Save Lives
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    You're just a few steps away from becoming a registered organ donor. Complete your profile with medical details and ID proof to get verified.
                  </p>
                  <Link to="/donor/profile/create">
                    <Button leftIcon={<Plus className="w-4 h-4" />}>
                      Complete Profile Now
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* Profile Info */}
            <Card hover glow className="lg:col-span-2">
              <Card.Header>
                <Card.Title>Profile Information</Card.Title>
                <Card.Description>Your registered donor details</Card.Description>
              </Card.Header>
              <Card.Content>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl">
                    <div className="text-3xl mb-2">🩸</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Blood Group</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">{profile.bloodGroup}</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl">
                    <div className="text-3xl mb-2">🎂</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Age</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{profile.age} years</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                    <div className="text-3xl mb-2">📍</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Location</p>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">
                      {profile.address.city}
                    </p>
                  </div>
                </div>
                
                {profile.organsForDonation && profile.organsForDonation.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold mb-3">Registered Organs</h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.organsForDonation.map((organ) => (
                        <span
                          key={organ}
                          className="px-3 py-1.5 bg-gradient-to-r from-primary-500 to-pink-500 text-white rounded-full text-sm font-medium shadow-lg"
                        >
                          {organ}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </Card.Content>
            </Card>

            {/* Pledge Story */}
            <Card hover className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
              <Card.Header>
                <Card.Title className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-indigo-500" />
                  My Pledge Story
                </Card.Title>
              </Card.Header>
              <Card.Content>
                <div className="text-center py-4">
                  {isEditingPledge ? (
                    <div className="space-y-3">
                      <textarea 
                        className="w-full p-3 bg-white dark:bg-gray-800 rounded-xl border border-indigo-100 dark:border-indigo-900 focus:ring-2 focus:ring-indigo-500 outline-none text-sm resize-none text-gray-700 dark:text-gray-300"
                        rows="3"
                        value={pledgeStory}
                        onChange={(e) => setPledgeStory(e.target.value)}
                        placeholder="Why I'm donating..."
                      />
                      <Button size="sm" onClick={() => setIsEditingPledge(false)} className="w-full bg-indigo-600 hover:bg-indigo-700">Save Story</Button>
                    </div>
                  ) : (
                    <div className="group relative">
                      <p className="text-gray-700 dark:text-gray-300 italic mb-4">
                        "{pledgeStory}"
                      </p>
                      <button 
                        onClick={() => setIsEditingPledge(true)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-medium text-indigo-600 dark:text-indigo-400 mx-auto flex items-center gap-1"
                      >
                        <Edit className="w-3 h-3" /> Edit Story
                      </button>
                    </div>
                  )}
                </div>
              </Card.Content>
            </Card>

            {/* Consent Management */}
            <Card hover className="bg-gradient-to-br from-primary-50 to-pink-50 dark:from-primary-900/20 dark:to-pink-900/20">
              <Card.Header>
                <Card.Title>Consent</Card.Title>
              </Card.Header>
              <Card.Content>
                <div className="text-center py-6">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="inline-block mb-4"
                  >
                    <Heart className="w-16 h-16 text-primary-600" fill={stats?.consentGiven ? 'currentColor' : 'none'} />
                  </motion.div>
                  <p className="text-gray-700 dark:text-gray-300 mb-6">
                    {stats?.consentGiven
                      ? 'Thank you for your generosity! Your consent is active.'
                      : 'Give consent to become an active organ donor.'}
                  </p>
                  <Button
                    variant={stats?.consentGiven ? 'outline' : 'primary'}
                    onClick={() => setShowConsentModal(true)}
                    className="w-full"
                  >
                    {stats?.consentGiven ? 'Revoke Consent' : 'Give Consent'}
                  </Button>
                </div>
              </Card.Content>
            </Card>
          </div>
        )}

        {/* Certificate Section */}
        {profile && stats?.consentGiven && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <Card hover className="bg-gradient-to-r from-yellow-500 to-amber-600 border-none text-white shadow-xl shadow-yellow-500/20">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-4">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-2xl mb-1 text-white shadow-black/10 text-shadow-sm">
                      Official Donor Certificate
                    </h3>
                    <p className="text-yellow-100 font-medium">
                      Download your certificate of registration. Thank you for your noble pledge!
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => setShowCertificate(true)}
                  className="bg-white text-yellow-600 hover:bg-yellow-50 whitespace-nowrap px-8 py-3 text-lg shadow-sm"
                >
                  View Certificate
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Activity & History */}
        {profile && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card hover className="h-full">
                <Card.Header>
                  <Card.Title className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-primary-500" />
                    Donation Impact & History
                  </Card.Title>
                  <Card.Description>Track your matched and completed donations</Card.Description>
                </Card.Header>
                <Card.Content>
                  {history.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                      <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">No donations recorded yet</p>
                      <p className="text-xs text-gray-400 mt-1">Your matched requests will appear here once approved by Admin</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {history.map((item) => (
                        <div key={item.id} className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-primary-500/30 transition-all flex items-center justify-between group">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
                              <CheckCircle className="w-6 h-6 text-primary-600" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 dark:text-white">{item.organType} Match</p>
                              <p className="text-sm text-gray-500 flex items-center gap-1">
                                <Activity className="w-3 h-3" />
                                To: {item.recipientName} ({item.recipientType})
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                              item.status === 'completed' 
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
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
            </div>
            
            <Card hover className="flex flex-col h-full max-h-[500px]">
              <Card.Header className="pb-2">
                <Card.Title className="text-xl">System Activity</Card.Title>
                <Card.Description>Logs of your recent dashboard interactions</Card.Description>
              </Card.Header>
              <Card.Content className="flex-1 overflow-y-auto custom-scrollbar pt-0">
                {activity.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6">
                    <Activity className="w-12 h-12 text-gray-300 mb-2" />
                    <p className="text-gray-500 text-sm">No activity logs found yet.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
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
            <Modal.Title>
              {stats?.consentGiven ? 'Revoke Consent' : 'Give Consent'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p className="text-gray-700 dark:text-gray-300">
              {stats?.consentGiven
                ? 'Are you sure you want to revoke your organ donation consent? This will make you inactive as a donor.'
                : 'By giving consent, you agree to donate your organs after death. This is a noble decision that can save multiple lives.'}
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="ghost" onClick={() => setShowConsentModal(false)}>
              Cancel
            </Button>
            <Button
              variant={stats?.consentGiven ? 'danger' : 'success'}
              onClick={handleConsentToggle}
            >
              {stats?.consentGiven ? 'Revoke' : 'Confirm'}
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
