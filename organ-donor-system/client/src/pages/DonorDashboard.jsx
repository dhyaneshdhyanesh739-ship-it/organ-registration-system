import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { donorService } from '../services';
import { Heart, Activity, FileText, CheckCircle, XCircle, Loader, Plus, Edit } from 'lucide-react';
import StatsCard from '../components/StatsCard';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { LineChartComponent } from '../components/Charts';
import { Link } from 'react-router-dom';
import HistoryItem from '../components/HistoryItem';

const DonorDashboard = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [profile, setProfile] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConsentModal, setShowConsentModal] = useState(false);

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
      const [statsData, profileData, activityData] = await Promise.all([
        donorService.getStats(),
        donorService.getProfile().catch(() => null),
        donorService.getActivity().catch(() => ({ activity: [] })),
      ]);
      setStats(statsData.stats);
      setProfile(profileData?.donor);
      setActivity(activityData.activity || []);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/30 to-pink-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
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

        {/* Activity & History */}
        {profile && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <LineChartComponent
                data={activityData}
                dataKeys={['updates']}
                xKey="month"
                title="Profile Activity"
              />
            </div>
            
            <Card hover className="flex flex-col h-[400px]">
              <Card.Header className="pb-2">
                <Card.Title className="text-xl">Recent Activity</Card.Title>
                <Card.Description>Your latest actions</Card.Description>
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
      </div>
    </div>
  );
};

export default DonorDashboard;
