import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { hospitalService } from '../services';
import { Building2, FileText, CheckCircle, Clock, Loader, Plus, Settings, User, Activity, Search, Eye, Award, UserPlus, Sparkles, Crown, ShieldCheck, Stethoscope, AlertCircle, Thermometer } from 'lucide-react';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import HospitalProfileForm from '../components/HospitalProfileForm';
import HospitalRequestForm from '../components/HospitalRequestForm';
import HospitalPatientDonorForm from '../components/HospitalPatientDonorForm';
import HistoryItem from '../components/HistoryItem';
import Certificate from '../components/Certificate';
import AIDonorHistoryModal from '../components/AIDonorHistoryModal';
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
  const [showAIScannerModal, setShowAIScannerModal] = useState(false);
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
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to accept match');
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
    <div className="min-h-screen bg-gradient-to-br from-[#070913] via-[#0b1329] to-[#0c182c] text-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Imperial Glass-Brutal Banner Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-950/50 via-[#0c0f26]/90 to-amber-950/40 border-2 border-blue-400/50 backdrop-blur-2xl shadow-[6px_6px_0px_0px_#E5C158] overflow-hidden"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-blue-500/20 border border-blue-400/50 text-blue-300 font-bold text-xs uppercase tracking-widest rounded-full flex items-center gap-1.5 shadow-sm">
                  <Building2 className="w-3.5 h-3.5 text-blue-400" /> Imperial Surgical Center Command
                </span>
                {profile?.verificationStatus === 'verified' && (
                  <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 font-bold text-xs uppercase tracking-widest rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Certified Center
                  </span>
                )}
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold royal-title text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-amber-300 to-yellow-400 drop-shadow">
                {profile?.hospitalName || user.firstName}
              </h1>
              <p className="text-gray-300 text-sm sm:text-base mt-2 font-medium">
                Manage surgical organ requests, recipient waitlists, AI OCR medical scans, and live match dispatches.
              </p>
            </div>

            {profile && (
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  onClick={() => setShowAIScannerModal(true)}
                  className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold shadow-[4px_4px_0px_0px_#E63946]"
                  leftIcon={<Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />}
                >
                  AI OCR Scanner
                </Button>
                <Button
                  onClick={() => setShowPatientDonorModal(true)}
                  className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold shadow-[4px_4px_0px_0px_#4F46E5]"
                  leftIcon={<UserPlus className="w-4 h-4" />}
                >
                  Register Patient Donor
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowProfileModal(true)}
                  className="border-amber-400/60 text-amber-300 hover:bg-amber-400/20 shadow-[4px_4px_0px_0px_#E5C158]"
                  leftIcon={<Settings className="w-4 h-4" />}
                >
                  Center Settings
                </Button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Surgical Bay & Cold Ischemia Time Clock Live Bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#0c0f26]/90 border-2 border-amber-400/40 backdrop-blur-xl shadow-[6px_6px_0px_0px_#E5C158]"
        >
          <div className="flex items-center gap-3 p-3 bg-blue-950/40 border border-blue-500/30 rounded-xl">
            <Stethoscope className="w-8 h-8 text-blue-400 shrink-0" />
            <div>
              <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest">Surgical Bay-1</p>
              <p className="text-sm font-extrabold text-blue-100">Ready for Harvest</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl">
            <Thermometer className="w-8 h-8 text-rose-400 shrink-0" />
            <div>
              <p className="text-[10px] font-bold text-rose-300 uppercase tracking-widest">Cold Ischemia Clock</p>
              <p className="text-sm font-extrabold text-rose-100">Heart: 4-6h | Kidney: 24h</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl">
            <Crown className="w-8 h-8 text-amber-400 shrink-0" />
            <div>
              <p className="text-[10px] font-bold text-amber-300 uppercase tracking-widest">Match Algorithm</p>
              <p className="text-sm font-extrabold text-amber-100">HLA Crossmatch 99.4%</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl">
            <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0" />
            <div>
              <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest">Organ Transport</p>
              <p className="text-sm font-extrabold text-emerald-100">Green Corridor Active</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-[#0c0f26]/90 border-2 border-amber-400/40 shadow-[6px_6px_0px_0px_#E5C158]">
            <Card.Content className="flex items-center justify-between p-6">
              <div>
                <p className="text-xs font-bold text-amber-300 uppercase tracking-widest">Verification Status</p>
                <p className="text-2xl font-extrabold mt-1 text-emerald-400 capitalize">{profile?.verificationStatus || 'Pending'}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-emerald-400 opacity-80" />
            </Card.Content>
          </Card>

          <Card className="bg-[#0c0f26]/90 border-2 border-blue-400/40 shadow-[6px_6px_0px_0px_#3B82F6]">
            <Card.Content className="flex items-center justify-between p-6">
              <div>
                <p className="text-xs font-bold text-blue-300 uppercase tracking-widest">Active Requests</p>
                <p className="text-3xl font-extrabold mt-1 text-blue-200">{profile?.activeRequests || requests.filter(r => r.status === 'searching' || r.status === 'pending').length}</p>
              </div>
              <FileText className="w-10 h-10 text-blue-400 opacity-80" />
            </Card.Content>
          </Card>

          <Card className="bg-[#0c0f26]/90 border-2 border-purple-400/40 shadow-[6px_6px_0px_0px_#A855F7]">
            <Card.Content className="flex items-center justify-between p-6">
              <div>
                <p className="text-xs font-bold text-purple-300 uppercase tracking-widest">Total Organs Requested</p>
                <p className="text-3xl font-extrabold mt-1 text-purple-200">{requests.length}</p>
              </div>
              <Activity className="w-10 h-10 text-purple-400 opacity-80" />
            </Card.Content>
          </Card>

          <Card className="bg-[#0c0f26]/90 border-2 border-emerald-400/40 shadow-[6px_6px_0px_0px_#10B981]">
            <Card.Content className="flex items-center justify-between p-6">
              <div>
                <p className="text-xs font-bold text-emerald-300 uppercase tracking-widest">Successful Matches</p>
                <p className="text-3xl font-extrabold mt-1 text-emerald-300">{profile?.successfulMatches || requests.filter(r => r.status === 'matched' || r.status === 'completed').length}</p>
              </div>
              <Award className="w-10 h-10 text-emerald-400 opacity-80" />
            </Card.Content>
          </Card>
        </div>

        {/* Setup Prompt / Verified Banner */}
        {!profile ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="p-8 rounded-3xl bg-gradient-to-r from-amber-950/60 via-[#121638] to-rose-950/60 border-2 border-amber-400 shadow-[6px_6px_0px_0px_#E5C158]">
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className="p-4 bg-amber-500/20 border border-amber-400/50 rounded-2xl">
                  <Building2 className="w-8 h-8 text-amber-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-extrabold text-amber-300 font-serif mb-2">Complete Hospital Registration Profile</h3>
                  <p className="text-gray-300 text-sm mb-6 max-w-2xl leading-relaxed">
                    Upload hospital accreditation documents, surgical license proofs, and coordinator details to unlock organ request dispatches.
                  </p>
                  <Button
                    size="lg"
                    onClick={() => setShowProfileModal(true)}
                    className="bg-amber-400 text-gray-950 font-black px-6 py-3 shadow-[4px_4px_0px_0px_#000]"
                    leftIcon={<Plus className="w-5 h-5" />}
                  >
                    Complete Profile Now
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : profile.verificationStatus !== 'verified' ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="p-8 rounded-3xl bg-blue-950/40 border-2 border-blue-400 shadow-[6px_6px_0px_0px_#3B82F6]">
              <div className="flex items-start gap-6">
                <div className="p-4 bg-blue-500/20 rounded-2xl">
                  <Clock className="w-8 h-8 text-blue-400 animate-spin" />
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold text-blue-300 font-serif mb-2">Center Verification Under Review</h3>
                  <p className="text-gray-300 text-sm max-w-2xl leading-relaxed">
                    Your hospital documentation is currently being validated by our central medical administration board. Organ request creation will be enabled upon approval.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Hospital Certificate Banner */}
            <div className="lg:col-span-3">
              <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-900/60 via-indigo-950 to-amber-950/40 border-2 border-blue-400/60 shadow-[6px_6px_0px_0px_#3B82F6] flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-blue-500/20 rounded-2xl border border-blue-400/40">
                    <Award className="w-8 h-8 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-extrabold text-amber-300 font-serif">
                      Verified Organ Transplant Center
                    </h3>
                    <p className="text-gray-300 text-sm mt-0.5">
                      Download your official system authorization certificate for facility display.
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => setShowCertificate(true)}
                  className="bg-amber-400 hover:bg-amber-300 text-gray-950 font-black px-8 py-3 text-base shadow-[4px_4px_0px_0px_#000]"
                >
                  View Certificate
                </Button>
              </div>
            </div>

            {/* Left Column: Requests & Patient Donors */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-extrabold text-amber-300 font-serif flex items-center gap-2">
                  <FileText className="w-6 h-6 text-amber-400" /> Active Organ Requests
                </h2>
                <Button
                  onClick={() => setShowRequestModal(true)}
                  className="bg-amber-400 hover:bg-amber-300 text-gray-950 font-black shadow-[4px_4px_0px_0px_#000]"
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Create New Request
                </Button>
              </div>

              {/* Filters Card */}
              {requests.length > 0 && (
                <Card className="bg-[#0c0f26]/90 border border-amber-400/30">
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="Search organ..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-gray-950 border border-amber-500/30 rounded-xl text-xs text-amber-200 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <select 
                      value={filterStatus} 
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-950 border border-amber-500/30 rounded-xl text-xs text-amber-200 focus:outline-none"
                    >
                      <option value="">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="searching">Searching</option>
                      <option value="matched">Matched</option>
                    </select>
                    <select 
                      value={filterUrgency} 
                      onChange={(e) => setFilterUrgency(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-950 border border-amber-500/30 rounded-xl text-xs text-amber-200 focus:outline-none"
                    >
                      <option value="">All Urgencies</option>
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                    </select>
                    <select 
                      value={filterBloodGroup} 
                      onChange={(e) => setFilterBloodGroup(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-950 border border-amber-500/30 rounded-xl text-xs text-amber-200 focus:outline-none"
                    >
                      <option value="">All Blood Groups</option>
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                </Card>
              )}

              {/* Requests List */}
              {filteredRequests.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-gray-950/50 border border-dashed border-amber-500/30">
                  <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 font-bold">No active requests matching criteria</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRequests.map((request) => (
                    <motion.div
                      key={request._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-5 rounded-2xl bg-[#0c0f26]/90 border-2 border-amber-400/40 backdrop-blur-xl shadow-[4px_4px_0px_0px_#E5C158] hover:border-amber-400 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-xl border ${
                            request.urgency === 'critical' ? 'bg-rose-950/60 border-rose-500/60 text-rose-400' :
                            request.urgency === 'high' ? 'bg-amber-950/60 border-amber-500/60 text-amber-400' : 'bg-blue-950/60 border-blue-500/60 text-blue-400'
                          }`}>
                            <Activity className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-xl font-black text-amber-200">{request.organType}</h3>
                              <span className="px-2.5 py-0.5 bg-rose-950/80 border border-rose-500/40 text-rose-300 rounded-full text-xs font-bold">
                                🩸 {request.bloodGroup}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                              <span className={`font-bold uppercase tracking-wider ${
                                request.urgency === 'critical' ? 'text-rose-400 animate-pulse' : 'text-amber-400'
                              }`}>
                                {request.urgency} Urgency
                              </span>
                              <span>•</span>
                              <span>ID: #{request._id.substring(request._id.length - 8)}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${
                            request.status === 'matched' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/40' :
                            request.status === 'searching' ? 'bg-blue-500/20 text-blue-400 border border-blue-400/40' : 'bg-amber-500/20 text-amber-400 border border-amber-400/40'
                          }`}>
                            {request.status}
                          </span>

                          <Button 
                            size="sm"
                            onClick={() => handleViewMatches(request)}
                            className="bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/50 font-bold"
                            leftIcon={<Eye className="w-3.5 h-3.5" />}
                          >
                            View Compatible Matches ({request.matchedDonors?.length || 0})
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Patient Donors List */}
              <div className="pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-extrabold text-amber-300 font-serif flex items-center gap-2">
                    <UserPlus className="w-6 h-6 text-indigo-400" /> Patient Donor Registry ({patientDonors.length})
                  </h2>
                </div>

                {patientDonors.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl bg-gray-950/50 border border-dashed border-indigo-500/30">
                    <User className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm font-bold">No registered patient donors</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {patientDonors.map((donor) => (
                      <div key={donor._id} className="p-4 bg-[#0c0f26]/90 border border-indigo-500/40 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-bold">
                            {donor.firstName[0]}
                          </div>
                          <div>
                            <p className="font-bold text-gray-200">{donor.firstName} {donor.lastName}</p>
                            <p className="text-xs text-gray-400">Reg: {new Date(donor.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 bg-rose-950/60 border border-rose-500/40 text-rose-400 text-xs font-black rounded-lg">
                            {donor.bloodGroup}
                          </span>
                          <span className="px-2.5 py-1 bg-indigo-950/60 border border-indigo-500/40 text-indigo-300 text-xs font-bold rounded-lg">
                            {donor.organsForDonation?.join(', ')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Activity Logs */}
            <div className="space-y-6">
              <h2 className="text-2xl font-extrabold text-amber-300 font-serif">Surgical Action Logs</h2>
              <Card className="bg-[#0c0f26]/90 border-2 border-amber-400/40 backdrop-blur-xl shadow-[6px_6px_0px_0px_#E5C158] flex flex-col h-[520px]">
                <Card.Content className="flex-1 overflow-y-auto custom-scrollbar p-0">
                  {activity.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6">
                      <Clock className="w-12 h-12 text-gray-600 mb-2" />
                      <p className="text-gray-400 text-sm">No activity records logged.</p>
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

              {/* Quick Hotline Card */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-rose-950/80 via-amber-950/60 to-rose-950/80 border-2 border-rose-500/60 shadow-[4px_4px_0px_0px_#E63946] text-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <AlertCircle className="w-6 h-6 text-rose-400" />
                  <h4 className="font-extrabold text-lg text-rose-300 font-serif">Critical Transport Dispatch</h4>
                </div>
                <p className="text-xs text-gray-300 mb-4 leading-relaxed">
                  Direct helicopter corridor request and rapid organ preservation cold ischemia team support.
                </p>
                <Button className="w-full bg-rose-600 hover:bg-rose-500 text-white font-black shadow-[3px_3px_0px_0px_#000]">
                  Call Emergency Dispatch (1800-DONOR)
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Modals */}
        <Modal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} size="2xl">
          <Modal.Header>
            <Modal.Title className="text-amber-300 font-serif">{profile ? 'Update Hospital Center Profile' : 'Complete Hospital Registration'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <HospitalProfileForm
              initialData={profile}
              onSuccess={handleProfileSuccess}
              onCancel={() => setShowProfileModal(false)}
            />
          </Modal.Body>
        </Modal>

        <Modal isOpen={showRequestModal} onClose={() => setShowRequestModal(false)} size="xl">
          <Modal.Header>
            <Modal.Title className="text-amber-300 font-serif">Create Surgical Organ Request</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <HospitalRequestForm
              onSuccess={handleRequestSuccess}
              onCancel={() => setShowRequestModal(false)}
            />
          </Modal.Body>
        </Modal>

        <Modal isOpen={showPatientDonorModal} onClose={() => setShowPatientDonorModal(false)} size="2xl">
          <Modal.Header>
            <Modal.Title className="text-amber-300 font-serif">Register Patient Donor</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <HospitalPatientDonorForm
              onSuccess={handlePatientDonorSuccess}
              onCancel={() => setShowPatientDonorModal(false)}
            />
          </Modal.Body>
        </Modal>

        <Modal isOpen={showMatchModal} onClose={() => setShowMatchModal(false)} size="4xl">
          <Modal.Header>
            <div className="flex justify-between items-center w-full pr-8">
              <div>
                <Modal.Title className="text-amber-300 font-serif">Crossmatch Matrix: {selectedRequest?.organType}</Modal.Title>
                <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                  <span>🩸 Blood Group: {selectedRequest?.bloodGroup}</span>
                  <span>•</span>
                  <span className="capitalize text-amber-400 font-bold">{selectedRequest?.urgency} Urgency</span>
                </div>
              </div>
            </div>
          </Modal.Header>
          <Modal.Body>
            {loadingMatches ? (
              <div className="py-16 flex flex-col items-center justify-center">
                <Loader className="w-10 h-10 animate-spin text-amber-400 mb-3" />
                <p className="text-amber-300 font-bold animate-pulse">Running compatibility algorithm...</p>
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
              lastName: '',
              _id: user._id
            }}
            details={{ 
              city: profile.address?.city,
              date: profile.createdAt || user.createdAt
            }}
          />
        )}

        {/* AI Scanner Modal */}
        <AIDonorHistoryModal
          isOpen={showAIScannerModal}
          onClose={() => setShowAIScannerModal(false)}
          onHistoryUpdated={fetchData}
        />
      </div>
    </div>
  );
};

export default HospitalDashboard;
