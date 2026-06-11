import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { hospitalService } from '../services';
import { Building2, FileText, CheckCircle, Clock, Loader, Plus, Settings, User } from 'lucide-react';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import HospitalProfileForm from '../components/HospitalProfileForm';
import HospitalRequestForm from '../components/HospitalRequestForm';
import HospitalPatientDonorForm from '../components/HospitalPatientDonorForm';
import { Activity, Search, Eye, Award, UserPlus } from 'lucide-react';
import HistoryItem from '../components/HistoryItem';
import Certificate from '../components/Certificate';
import { matchingService } from '../services';
import MatchList from '../components/MatchList';
import { useSocket } from '../context/SocketContext';

const HospitalDashboard = () => {
  const { user } = useAuth();
  const toast = useToast();
  const { socket } = useSocket();
  const [profile, setProfile] = useState(null);
  const [requests, setRequests] = useState([]);
  const [patientDonors, setPatientDonors] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showPatientDonorModal, setShowPatientDonorModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [currentMatches, setCurrentMatches] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [filterBloodGroup, setFilterBloodGroup] = useState('');
  const [filterUrgency, setFilterUrgency] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRequests = requests.filter(req => {
    if (filterBloodGroup && req.bloodGroup !== filterBloodGroup) return false;
    if (filterUrgency && req.urgency !== filterUrgency) return false;
    if (filterStatus && req.status !== filterStatus) return false;
    if (searchQuery && !req.organType.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  useEffect(() => {
    fetchData();

    if (socket) {
      const handleSocketUpdate = (data) => {
        console.log('🔄 Dashboard refreshing due to socket event:', data);
        fetchData();
      };

      socket.on('request_matched', handleSocketUpdate);
      socket.on('match_accepted', handleSocketUpdate);
      socket.on('request_status_updated', handleSocketUpdate);

      return () => {
        socket.off('request_matched', handleSocketUpdate);
        socket.off('match_accepted', handleSocketUpdate);
        socket.off('request_status_updated', handleSocketUpdate);
      };
    }
  }, [socket]);

  const fetchData = async () => {
    try {
      const [profileData, requestsData, activityData, patientDonorsData] = await Promise.all([
        hospitalService.getProfile().catch(() => null),
        hospitalService.getRequests().catch(() => ({ requests: [] })),
        hospitalService.getActivity().catch(() => ({ activity: [] })),
        hospitalService.getPatientDonors().catch(() => ({ patientDonors: [] })),
      ]);
      setProfile(profileData?.hospital);
      setRequests(requestsData.requests || []);
      setActivity(activityData.activity || []);
      setPatientDonors(patientDonorsData.patientDonors || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSuccess = () => {
    setShowProfileModal(false);
    fetchData();
  };

  const handleRequestSuccess = () => {
    setShowRequestModal(false);
    fetchData();
  };

  const handlePatientDonorSuccess = () => {
    setShowPatientDonorModal(false);
    fetchData();
  };

  const handleViewMatches = async (request) => {
    setSelectedRequest(request);
    setLoadingMatches(true);
    setShowMatchModal(true);
    try {
      const data = await matchingService.getMatches(request._id);
      setCurrentMatches(data.matches || []);
    } catch (error) {
      toast.error('Failed to fetch matches');
    } finally {
      setLoadingMatches(false);
    }
  };

  const handleAcceptMatch = async (match) => {
    if (!window.confirm(`Are you sure you want to accept this match with Donor #${match.donor?._id?.substring(match.donor._id.length - 6) || 'N/A'}? This will mark the request as completed.`)) {
      return;
    }

    try {
      await matchingService.acceptMatch(selectedRequest._id, match.donor?._id);
      toast.success('Match accepted successfully! Coordination initiated.');
      setShowMatchModal(false);
      fetchData(); // Refresh all data
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to accept match');
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-100/50 dark:from-gray-900 dark:via-blue-950/20 dark:to-indigo-950/20 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold gradient-text">Hospital Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
                Welcome back, <span className="font-semibold">{profile?.hospitalName || user.firstName}</span>! 👋
              </p>
            </div>
            {profile && (
              <div className="flex items-center gap-3">
                <Button
                  variant="primary"
                  leftIcon={<UserPlus className="w-4 h-4" />}
                  onClick={() => setShowPatientDonorModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900/20"
                >
                  Register Patient Donor
                </Button>
                <Button
                  variant="outline"
                  leftIcon={<Settings className="w-4 h-4" />}
                  onClick={() => setShowProfileModal(true)}
                >
                  Settings
                </Button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {[
            {
              label: 'Verification Status',
              value: profile?.verificationStatus || 'Pending',
              icon: profile?.verificationStatus === 'verified' ? CheckCircle : Clock,
              color: profile?.verificationStatus === 'verified' ? 'text-green-500' : 'text-yellow-500',
            },
            {
              label: 'Active Requests',
              value: profile?.activeRequests || 0,
              icon: FileText,
              color: 'text-blue-500',
            },
            {
              label: 'Total Requests',
              value: requests.length || 0,
              icon: FileText,
              color: 'text-purple-500',
            },
            {
              label: 'Successful Matches',
              value: profile?.successfulMatches || 0,
              icon: CheckCircle,
              color: 'text-green-500',
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full">
                <Card.Content className="flex items-center justify-between p-6">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1 capitalize text-gray-900 dark:text-white">{stat.value}</p>
                  </div>
                  <stat.icon className={`w-10 h-10 ${stat.color} opacity-80`} />
                </Card.Content>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Profile Setup / Main Content */}
        {!profile ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800">
              <Card.Content className="p-8">
                <div className="flex items-start gap-6">
                  <div className="p-4 bg-yellow-100 dark:bg-yellow-900/40 rounded-2xl">
                    <Building2 className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Complete Hospital Profile</h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg max-w-2xl">
                      Please complete your hospital profile to start requesting organs. You'll need to provide hospital details and upload a registration certificate for verification.
                    </p>
                    <Button
                      size="lg"
                      leftIcon={<Plus className="w-5 h-5" />}
                      onClick={() => setShowProfileModal(true)}
                    >
                      Complete Profile Now
                    </Button>
                  </div>
                </div>
              </Card.Content>
            </Card>
          </motion.div>
        ) : profile.verificationStatus !== 'verified' ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <Card.Content className="p-8">
                <div className="flex items-start gap-6">
                  <div className="p-4 bg-blue-100 dark:bg-blue-900/40 rounded-2xl">
                    <Clock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Verification Pending</h3>
                    <p className="text-gray-700 dark:text-gray-300 text-lg max-w-2xl">
                      Thank you for submitting your details. Your hospital profile is currently under review by our admin team. You'll be able to create organ requests once your profile is verified.
                    </p>
                  </div>
                </div>
              </Card.Content>
            </Card>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Hospital Certificate Banner */}
            {profile.verificationStatus === 'verified' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="lg:col-span-3 mb-2"
              >
                <Card hover className="bg-gradient-to-r from-blue-600 to-indigo-700 border-none text-white shadow-xl shadow-blue-900/20">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-4">
                    <div className="flex items-center gap-4">
                      <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                        <Award className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-2xl mb-1 text-white shadow-black/10 text-shadow-sm">
                          Verified Transplant Center Certificate
                        </h3>
                        <p className="text-blue-100 font-medium">
                          Download your official registration certificate to display at your facility.
                        </p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => setShowCertificate(true)}
                      className="bg-white text-blue-700 hover:bg-blue-50 whitespace-nowrap px-8 py-3 text-lg shadow-sm"
                    >
                      View Certificate
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Left Column: Requests */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Organ Requests</h2>
                <Button
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={() => setShowRequestModal(true)}
                >
                  Create New Request
                </Button>
              </div>

              {/* Filters */}
              {requests.length > 0 && (
                <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-none shadow-sm">
                  <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="Search organ..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <select 
                      value={filterStatus} 
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="searching">Searching</option>
                      <option value="matched">Matched</option>
                    </select>
                    <select 
                      value={filterUrgency} 
                      onChange={(e) => setFilterUrgency(e.target.value)}
                      className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="">All Urgencies</option>
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                    <select 
                      value={filterBloodGroup} 
                      onChange={(e) => setFilterBloodGroup(e.target.value)}
                      className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="">All Blood Groups</option>
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                </Card>
              )}

              {requests.length === 0 ? (
                <Card className="text-center py-16 border-dashed border-2">
                  <Card.Content>
                    <div className="bg-gray-100 dark:bg-gray-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <FileText className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">No Requests Yet</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                      Create your first organ request to start the matching process
                    </p>
                  </Card.Content>
                </Card>
              ) : filteredRequests.length === 0 ? (
                <Card className="text-center py-12 border-dashed border-2">
                  <Card.Content>
                    <Search className="w-10 h-10 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">No matches found</h3>
                    <p className="text-gray-500 text-sm">Try adjusting your filters to see more requests.</p>
                    <Button variant="ghost" className="mt-4" onClick={() => {
                      setFilterBloodGroup(''); setFilterUrgency(''); setFilterStatus(''); setSearchQuery('');
                    }}>
                      Clear Filters
                    </Button>
                  </Card.Content>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {filteredRequests.map((request) => (
                    <motion.div
                      key={request._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <Card hover className="overflow-hidden">
                        <Card.Content className="p-6">
                          <div className="flex justify-between items-end mt-6">
                            <div className="flex gap-4">
                              <div className={`p-3 rounded-xl bg-opacity-10 ${
                                request.status === 'matched' ? 'bg-green-500 text-green-600' :
                                request.status === 'pending' ? 'bg-yellow-500 text-yellow-600' : 'bg-blue-500 text-blue-600'
                              }`}>
                                <Activity className="w-6 h-6" />
                              </div>
                              <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{request.organType}</h3>
                                <div className="flex items-center gap-3 mt-1 text-gray-600 dark:text-gray-400">
                                  <span className="flex items-center gap-1 font-medium">🩸 {request.bloodGroup}</span>
                                  <span>•</span>
                                  <span className={`font-semibold ${
                                    request.urgency === 'critical' ? 'text-red-500 pulse-text' :
                                    request.urgency === 'high' ? 'text-orange-500' : 'text-blue-500'
                                  }`}>
                                    {request.urgency.toUpperCase()} URGENCY
                                  </span>
                                </div>
                                <div className="flex items-center gap-4 mt-3">
                                  <p className="text-xs text-gray-500">
                                    ID: {request._id.substring(request._id.length - 8)}
                                  </p>
                                  {request.matchedDonors?.length > 0 && (
                                    <span className="text-xs font-bold text-green-600 dark:text-green-400 flex items-center gap-1">
                                      <CheckCircle className="w-3 h-3" />
                                      {request.matchedDonors.length} Matches Found
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-3">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize ${
                                    request.status === 'matched'
                                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                      : request.status === 'pending'
                                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                      : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                  }`}
                                >
                                  {request.status}
                                </span>
                              </div>
                              
                              <div className="flex gap-2">
                                {(request.status === 'matched' || request.status === 'searching') && (
                                  <Button 
                                    size="sm" 
                                    variant="secondary"
                                    leftIcon={<Eye className="w-4 h-4" />}
                                    onClick={() => handleViewMatches(request)}
                                  >
                                    View Matches
                                  </Button>
                                )}
                              </div>
                              <p className="text-[10px] text-gray-400">
                                Requested: {new Date(request.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </Card.Content>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Patient Donors List */}
              <div className="pt-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Registered Patients</h2>
                  <div className="bg-indigo-100 dark:bg-indigo-900/30 px-3 py-1 rounded-full">
                    <span className="text-sm font-bold text-indigo-700 dark:text-indigo-400">
                      {patientDonors.length} Donors
                    </span>
                  </div>
                </div>

                {patientDonors.length === 0 ? (
                  <Card className="text-center py-12 border-dashed border-2">
                    <Card.Content>
                      <UserPlus className="w-10 h-10 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No patient donors registered yet.</p>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => setShowPatientDonorModal(true)}
                      >
                        Register your first patient
                      </Button>
                    </Card.Content>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {patientDonors.map((donor) => (
                      <motion.div
                        key={donor._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <Card className="hover:border-indigo-500 transition-colors border-l-4 border-l-indigo-500">
                          <Card.Content className="p-4">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                  <User className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div>
                                  <h4 className="font-bold text-gray-900 dark:text-white">
                                    {donor.firstName} {donor.lastName}
                                  </h4>
                                  <p className="text-xs text-gray-500">
                                    Registered: {new Date(donor.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs font-bold">
                                  {donor.bloodGroup}
                                </div>
                                <div className="flex -space-x-1">
                                  {donor.organsForDonation.slice(0, 3).map((organ, i) => (
                                    <div 
                                      key={i} 
                                      className="w-6 h-6 rounded-full bg-white dark:bg-gray-800 border-2 border-indigo-100 dark:border-indigo-900 flex items-center justify-center text-[8px] font-bold text-indigo-600"
                                      title={organ}
                                    >
                                      {organ[0]}
                                    </div>
                                  ))}
                                  {donor.organsForDonation.length > 3 && (
                                    <div className="w-6 h-6 rounded-full bg-indigo-600 border-2 border-indigo-100 flex items-center justify-center text-[8px] font-bold text-white">
                                      +{donor.organsForDonation.length - 3}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Card.Content>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Activity */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Activity</h2>
              <Card hover className="flex flex-col h-[600px]">
                <Card.Content className="flex-1 overflow-y-auto custom-scrollbar p-0">
                  {activity.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6">
                      <Clock className="w-12 h-12 text-gray-300 mb-2" />
                      <p className="text-gray-500 text-sm">No activity records found.</p>
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

              {/* Quick Action Card */}
              <Card className="bg-gradient-to-br from-primary-500 to-pink-500 text-white border-none shadow-xl">
                <Card.Content className="p-6">
                  <h4 className="font-bold mb-2">Need Urgent Help?</h4>
                  <p className="text-sm opacity-90 mb-4">Contact our support line for critical organ search assistance.</p>
                  <Button variant="outline" className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20">
                    Call 1800-DONOR
                  </Button>
                </Card.Content>
              </Card>
            </div>
          </div>
        )}

        {/* Modals */}
        <Modal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          size="2xl"
        >
          <Modal.Header>
            <Modal.Title>{profile ? 'Update Hospital Profile' : 'Complete Hospital Profile'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <HospitalProfileForm
              initialData={profile}
              onSuccess={handleProfileSuccess}
              onCancel={() => setShowProfileModal(false)}
            />
          </Modal.Body>
        </Modal>

        <Modal
          isOpen={showRequestModal}
          onClose={() => setShowRequestModal(false)}
          size="xl"
        >
          <Modal.Header>
            <Modal.Title>Create New Organ Request</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <HospitalRequestForm
              onSuccess={handleRequestSuccess}
              onCancel={() => setShowRequestModal(false)}
            />
          </Modal.Body>
        </Modal>

        <Modal
          isOpen={showPatientDonorModal}
          onClose={() => setShowPatientDonorModal(false)}
          size="2xl"
        >
          <Modal.Header>
            <Modal.Title>Register Patient as Donor</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <HospitalPatientDonorForm
              onSuccess={handlePatientDonorSuccess}
              onCancel={() => setShowPatientDonorModal(false)}
            />
          </Modal.Body>
        </Modal>

        <Modal
          isOpen={showMatchModal}
          onClose={() => setShowMatchModal(false)}
          size="4xl"
        >
          <Modal.Header>
            <div className="flex justify-between items-center w-full pr-8">
              <div>
                <Modal.Title>Match Results: {selectedRequest?.organType}</Modal.Title>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                  <span>🩸 {selectedRequest?.bloodGroup}</span>
                  <span>•</span>
                  <span className="capitalize">{selectedRequest?.urgency} Urgency</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Request ID</p>
                <p className="text-xs font-mono">{selectedRequest?._id}</p>
              </div>
            </div>
          </Modal.Header>
          <Modal.Body>
            {loadingMatches ? (
              <div className="py-20 flex flex-col items-center justify-center">
                <div className="relative w-16 h-16">
                  <div className="absolute top-0 left-0 w-full h-full border-4 border-primary-200 rounded-full animate-pulse" />
                  <div className="absolute top-0 left-0 w-full h-full border-t-4 border-primary-600 rounded-full animate-spin" />
                </div>
                <p className="mt-4 text-gray-600 animate-pulse font-medium">Running compatibility algorithm...</p>
              </div>
            ) : (
              <MatchList 
                matches={currentMatches} 
                organType={selectedRequest?.organType}
                onSelect={handleAcceptMatch}
              />
            )}
          </Modal.Body>
        </Modal>

        {/* Certificate Modal */}
        {profile && (
          <Certificate 
            isOpen={showCertificate}
            onClose={() => setShowCertificate(false)}
            type="hospital"
            userData={{
              firstName: profile.hospitalName,
              lastName: '', // Hospitals don't have last names
              _id: user._id
            }}
            details={{ 
              city: profile.address?.city,
              date: profile.createdAt || user.createdAt
            }}
          />
        )}
      </div>
    </div>
  );
};

export default HospitalDashboard;
