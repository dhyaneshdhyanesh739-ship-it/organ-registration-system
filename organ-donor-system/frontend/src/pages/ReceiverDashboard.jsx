import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { receiverService } from '../services';
import { Heart, Search, Activity, Loader, Send, Filter, ChevronDown, CheckCircle, AlertTriangle, Clock, MapPin, Award, Sparkles, Crown, Shield, Compass, Scale, PhoneCall } from 'lucide-react';
import Certificate from '../components/Certificate';
import AIDonorHistoryModal from '../components/AIDonorHistoryModal';

const ORGANS = ['Heart', 'Liver', 'Kidneys', 'Lungs', 'Pancreas', 'Intestines', 'Corneas', 'Skin'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const URGENCY_LEVELS = ['critical', 'high', 'medium', 'low'];

const URGENCY_COLORS = {
  critical: 'bg-rose-950/80 text-rose-300 border border-rose-500/50',
  high: 'bg-amber-950/80 text-amber-300 border border-amber-500/50',
  medium: 'bg-yellow-950/80 text-yellow-300 border border-yellow-500/50',
  low: 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/50',
};

const ORGAN_ICONS = {
  Heart: '❤️', Liver: '🫀', Kidneys: '🫘', Lungs: '🫁',
  Pancreas: '🟤', Intestines: '🔵', Corneas: '👁️', Skin: '🧬',
};

const ReceiverDashboard = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [organSummary, setOrganSummary] = useState({ organCounts: {}, bloodGroupCounts: {}, totalActiveDonors: 0 });
  const [availableOrgans, setAvailableOrgans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [filterOrgan, setFilterOrgan] = useState('');
  const [filterBlood, setFilterBlood] = useState('');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [myRequests, setMyRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showCertificate, setShowCertificate] = useState(false);
  const [showAIScannerModal, setShowAIScannerModal] = useState(false);

  // Interactive Waitlist Priority Calculator
  const [calcUrgency, setCalcUrgency] = useState('high');
  const [calcMeldScore, setCalcMeldScore] = useState(24);
  const [estimatedQueuePos, setEstimatedQueuePos] = useState(3);

  useEffect(() => {
    let pos = Math.max(1, 45 - Math.round(calcMeldScore * 1.5));
    if (calcUrgency === 'critical') pos = 1;
    setEstimatedQueuePos(pos);
  }, [calcMeldScore, calcUrgency]);

  const [form, setForm] = useState({
    organType: '',
    bloodGroup: '',
    urgency: 'medium',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [summary, organs, requestsRes] = await Promise.all([
        receiverService.getOrganSummary(),
        receiverService.getAvailableOrgans(),
        receiverService.getMyRequests(),
      ]);
      setOrganSummary(summary);
      setAvailableOrgans(organs.availableOrgans || []);
      setMyRequests(requestsRes.requests || []);
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = async () => {
    try {
      const params = {};
      if (filterOrgan) params.organType = filterOrgan;
      if (filterBlood) params.bloodGroup = filterBlood;
      const data = await receiverService.getAvailableOrgans(params);
      setAvailableOrgans(data.availableOrgans || []);
    } catch {
      toast.error('Failed to filter organs');
    }
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!form.organType || !form.bloodGroup) {
      toast.error('Please select organ type and blood group');
      return;
    }
    setSubmitting(true);
    try {
      await receiverService.submitRequest(form);
      setRequestSubmitted(true);
      setShowRequestForm(false);
      toast.success('Your organ request has been submitted successfully!');
      setForm({ organType: '', bloodGroup: '', urgency: 'medium', notes: '' });
      fetchData();
    } catch {
      toast.error('Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070913]">
        <Loader className="w-10 h-10 animate-spin text-emerald-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#070913] via-[#091a18] to-[#0a241e] text-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Imperial Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950/50 via-[#0c0f26]/90 to-cyan-950/40 border-2 border-emerald-400/50 backdrop-blur-2xl shadow-[6px_6px_0px_0px_#10B981] flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 font-bold text-xs uppercase tracking-widest rounded-full flex items-center gap-1.5 shadow-sm">
                  <Crown className="w-3.5 h-3.5 text-emerald-400" /> Imperial Recipient Waitlist Portal
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold royal-title text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-teal-300 to-cyan-400 drop-shadow">
                Welcome, {user?.firstName}!
              </h1>
              <p className="text-gray-300 text-sm sm:text-base mt-2 font-medium">
                Locate compatible donor organs, track real-time waitlist priorities, and coordinate surgical transport.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={() => setShowAIScannerModal(true)}
                className="bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold shadow-[4px_4px_0px_0px_#E63946]"
                leftIcon={<Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />}
              >
                AI OCR Scanner
              </Button>
              <Button
                onClick={() => setShowRequestForm(true)}
                className="bg-emerald-400 hover:bg-emerald-300 text-gray-950 font-black px-6 py-3 shadow-[4px_4px_0px_0px_#000]"
                leftIcon={<Send className="w-4 h-4" />}
              >
                Submit Organ Request
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Success Banner */}
        <AnimatePresence>
          {requestSubmitted && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 bg-emerald-950/80 border-2 border-emerald-400 text-emerald-200 rounded-2xl flex items-center gap-3 shadow-[4px_4px_0px_0px_#10B981]"
            >
              <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0" />
              <p className="font-bold text-sm">
                Your organ request has been officially recorded in the national waitlist. Hospital matching algorithms are evaluating donor availability.
              </p>
            </motion.div>
          )}

          {/* Receiver Certificate Section */}
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-900/60 via-cyan-950 to-emerald-950/60 border-2 border-cyan-400/60 shadow-[6px_6px_0px_0px_#06B6D4] flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-cyan-500/20 rounded-2xl border border-cyan-400/40">
                  <Award className="w-8 h-8 text-cyan-300" />
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold text-cyan-200 font-serif">
                    Official Recipient Certificate
                  </h3>
                  <p className="text-gray-300 text-sm mt-0.5">
                    View your verified registration credentials for hospital patient intake.
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => setShowCertificate(true)}
                className="bg-cyan-400 hover:bg-cyan-300 text-gray-950 font-black px-8 py-3 text-base shadow-[4px_4px_0px_0px_#000]"
              >
                View Certificate
              </Button>
            </div>
          </motion.div>

          {/* Approved Organ Request Banner */}
          {myRequests.filter(r => r.status === 'approved' || r.status === 'matched').map((approvedRequest) => (
            <motion.div
              key={approvedRequest._id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-700 border-2 border-emerald-300 text-gray-950 shadow-[6px_6px_0px_0px_#000] flex flex-col sm:flex-row items-center justify-between gap-6"
            >
              <div className="flex items-center gap-4">
                <div className="p-4 bg-gray-950/20 rounded-2xl border border-gray-950/30">
                  <Heart className="w-8 h-8 text-gray-950 fill-gray-950 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-2xl font-black font-serif flex items-center gap-2">
                    Transplant Match Confirmed! 🎉
                  </h3>
                  <p className="text-gray-900 font-bold text-sm mt-1">
                    You have been matched for a <span className="underline">{approvedRequest.organType}</span> harvest! Contact your coordinator immediately.
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => setSelectedRequest(approvedRequest)}
                className="bg-gray-950 text-emerald-300 hover:bg-gray-900 font-black px-8 py-3 shadow-[4px_4px_0px_0px_#fff]"
              >
                View Match Details
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Overview Stat Counters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-6 rounded-2xl bg-[#0c0f26]/90 border-2 border-emerald-400/40 shadow-[4px_4px_0px_0px_#10B981] text-center">
            <p className="text-4xl font-black text-emerald-400">{organSummary.totalActiveDonors}</p>
            <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Active Pledged Donors</p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0c0f26]/90 border-2 border-cyan-400/40 shadow-[4px_4px_0px_0px_#06B6D4] text-center">
            <p className="text-4xl font-black text-cyan-300">{Object.keys(organSummary.organCounts).length}</p>
            <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Organ Types Cataloged</p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0c0f26]/90 border-2 border-teal-400/40 shadow-[4px_4px_0px_0px_#14B8A6] text-center">
            <p className="text-4xl font-black text-teal-300">{availableOrgans.length}</p>
            <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Total Harvest Units Available</p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0c0f26]/90 border-2 border-rose-400/40 shadow-[4px_4px_0px_0px_#F43F5E] text-center">
            <p className="text-4xl font-black text-rose-400">{Object.keys(organSummary.bloodGroupCounts).length}</p>
            <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Blood Types Covered</p>
          </div>
        </div>

        {/* Interactive Clinical Waitlist Priority Calculator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0c0f26] via-[#091a18] to-[#0a241e] border-2 border-cyan-400/40 backdrop-blur-2xl shadow-[6px_6px_0px_0px_#06B6D4]"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 rounded-full text-xs font-bold uppercase tracking-widest">
                <Scale className="w-4 h-4 text-cyan-400" /> Interactive MELD / EPTS Queue Priority Model
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-cyan-300 font-serif">
                Clinical Waitlist Priority Estimator
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Simulate your projected waitlist position using standardized MELD (Model for End-Stage Liver/Kidney Disease) score parameters and urgency tiering.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Urgency Tier</label>
                  <select
                    value={calcUrgency}
                    onChange={(e) => setCalcUrgency(e.target.value)}
                    className="w-full bg-gray-950 border border-cyan-500/40 rounded-xl px-3 py-2 text-sm text-cyan-200 font-bold focus:outline-none"
                  >
                    <option value="critical">🔴 Critical (Status 1A)</option>
                    <option value="high">🟠 High Urgency</option>
                    <option value="medium">🟡 Standard Waitlist</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Clinical Score ({calcMeldScore} pts)</label>
                  <input 
                    type="range" 
                    min="6" 
                    max="40" 
                    value={calcMeldScore}
                    onChange={(e) => setCalcMeldScore(Number(e.target.value))}
                    className="w-full accent-cyan-400 bg-gray-950 rounded-lg cursor-pointer h-2"
                  />
                </div>
              </div>
            </div>

            {/* Display Box */}
            <div className="flex flex-col items-center justify-center p-6 bg-gray-950/80 border-2 border-cyan-400 rounded-2xl min-w-[240px] text-center shadow-inner">
              <p className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-1">Estimated Queue Position</p>
              <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-emerald-400 my-2">
                #{estimatedQueuePos}
              </div>
              <div className="px-3 py-1 bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 rounded-full text-[11px] font-bold">
                {estimatedQueuePos === 1 ? '🚨 Top National Priority' : 'High Match Eligibility'}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Grid: Left Organ Summary, Right Available Marketplace */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left Column: Summary & Blood Groups */}
          <div className="space-y-6">
            <Card className="bg-[#0c0f26]/90 border-2 border-emerald-400/40 shadow-[6px_6px_0px_0px_#10B981]">
              <Card.Header>
                <Card.Title className="text-emerald-300 font-serif flex items-center gap-2 text-xl">
                  <Activity className="w-5 h-5 text-emerald-400" /> Organ Availability Summary
                </Card.Title>
              </Card.Header>
              <Card.Content>
                <div className="space-y-2">
                  {Object.entries(organSummary.organCounts).length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-4">No organs currently recorded.</p>
                  ) : (
                    Object.entries(organSummary.organCounts)
                      .sort(([, a], [, b]) => b - a)
                      .map(([organ, count]) => (
                        <div
                          key={organ}
                          onClick={() => { setFilterOrgan(organ); handleFilter(); }}
                          className="flex items-center justify-between p-3 bg-gray-950/60 border border-emerald-500/30 rounded-xl hover:border-emerald-400 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{ORGAN_ICONS[organ] || '🔬'}</span>
                            <span className="font-bold text-sm text-gray-200">{organ}</span>
                          </div>
                          <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-black rounded-full">
                            {count} available
                          </span>
                        </div>
                      ))
                  )}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-800">
                  <h4 className="font-bold text-xs uppercase tracking-widest text-gray-400 mb-3">By Blood Compatibility</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {Object.entries(organSummary.bloodGroupCounts).map(([bg, count]) => (
                      <div
                        key={bg}
                        onClick={() => { setFilterBlood(bg); handleFilter(); }}
                        className="flex flex-col items-center p-2 bg-gray-950 border border-rose-500/30 rounded-xl hover:border-rose-400 transition-colors cursor-pointer text-center"
                      >
                        <span className="text-xs font-black text-rose-400">{bg}</span>
                        <span className="text-lg font-black text-gray-200">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card.Content>
            </Card>

            {/* Emergency Support Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-rose-950/80 via-emerald-950/60 to-rose-950/80 border-2 border-rose-500/60 shadow-[4px_4px_0px_0px_#E63946] text-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <PhoneCall className="w-6 h-6 text-rose-400" />
                <h4 className="font-extrabold text-lg text-rose-300 font-serif">Recipient Support Hotline</h4>
              </div>
              <p className="text-xs text-gray-300 mb-4 leading-relaxed">
                Need urgent waitlist status confirmation or emergency crossmatch consultation?
              </p>
              <Button className="w-full bg-rose-600 hover:bg-rose-500 text-white font-black shadow-[3px_3px_0px_0px_#000]">
                Call 1800-TRANSPLANT
              </Button>
            </div>
          </div>

          {/* Right Column: Available Organs Marketplace */}
          <Card className="lg:col-span-2 bg-[#0c0f26]/90 border-2 border-cyan-400/40 shadow-[6px_6px_0px_0px_#06B6D4]">
            <Card.Header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
              <Card.Title className="text-cyan-300 font-serif text-xl flex items-center gap-2">
                <Search className="w-5 h-5 text-cyan-400" /> Live Organ Availability Registry
              </Card.Title>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <select
                  value={filterOrgan}
                  onChange={(e) => setFilterOrgan(e.target.value)}
                  className="bg-gray-950 border border-cyan-500/40 rounded-xl px-3 py-1.5 text-xs text-cyan-200 font-bold focus:outline-none"
                >
                  <option value="">All Organs</option>
                  {ORGANS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                <select
                  value={filterBlood}
                  onChange={(e) => setFilterBlood(e.target.value)}
                  className="bg-gray-950 border border-cyan-500/40 rounded-xl px-3 py-1.5 text-xs text-cyan-200 font-bold focus:outline-none"
                >
                  <option value="">All Bloods</option>
                  {BLOOD_GROUPS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                <button
                  onClick={handleFilter}
                  className="p-2 bg-cyan-400 text-gray-950 font-black rounded-xl hover:bg-cyan-300 transition-colors shadow-sm"
                >
                  <Filter className="w-4 h-4" />
                </button>
              </div>
            </Card.Header>

            <Card.Content className="pt-4">
              <div className="max-h-[60vh] overflow-y-auto custom-scrollbar space-y-3">
                {availableOrgans.length === 0 ? (
                  <div className="text-center py-12 bg-gray-950/40 rounded-2xl border border-dashed border-cyan-500/30">
                    <Heart className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400 font-bold">No registered organs found matching filters</p>
                    <button
                      onClick={() => { setFilterOrgan(''); setFilterBlood(''); fetchData(); }}
                      className="mt-2 text-xs text-cyan-400 hover:underline font-bold"
                    >
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  availableOrgans.map((item, idx) => (
                    <div
                      key={`${item.donorId}-${item.organType}-${idx}`}
                      className="p-4 bg-gray-950 border border-cyan-500/30 rounded-2xl hover:border-cyan-400 transition-all flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-3xl">{ORGAN_ICONS[item.organType] || '🔬'}</div>
                        <div>
                          <p className="font-extrabold text-amber-200 text-lg">{item.organType}</p>
                          <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                            <span>{item.city}, {item.state}</span>
                            {item.hospitalName && (
                              <span className="font-bold text-cyan-300">• {item.hospitalName}</span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs font-black rounded-full">
                          🩸 {item.bloodGroup}
                        </span>
                        <Button
                          size="sm"
                          onClick={() => {
                            setForm({ ...form, organType: item.organType, bloodGroup: item.bloodGroup });
                            setShowRequestForm(true);
                          }}
                          className="bg-cyan-400 hover:bg-cyan-300 text-gray-950 font-black text-xs shadow-[2px_2px_0px_0px_#000]"
                        >
                          Request Match
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card.Content>
          </Card>
        </div>

        {/* Request Form Modal */}
        <AnimatePresence>
          {showRequestForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setShowRequestForm(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="relative bg-[#0c0f26] border-2 border-emerald-400 rounded-3xl shadow-[8px_8px_0px_0px_#10B981] w-full max-w-lg overflow-hidden text-gray-100 p-6 z-10"
              >
                <h2 className="text-2xl font-extrabold text-emerald-300 font-serif mb-1">Submit Organ Request</h2>
                <p className="text-xs text-gray-400 mb-6">Enter medical requirement details for algorithm crossmatching.</p>

                <form onSubmit={handleSubmitRequest} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase mb-2">Target Organ *</label>
                    <div className="grid grid-cols-4 gap-2">
                      {ORGANS.map(organ => (
                        <button
                          key={organ}
                          type="button"
                          onClick={() => setForm({ ...form, organType: organ })}
                          className={`p-2 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                            form.organType === organ
                              ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200'
                              : 'border-gray-800 bg-gray-950 text-gray-400 hover:border-gray-700'
                          }`}
                        >
                          <span>{ORGAN_ICONS[organ]}</span>
                          <span>{organ}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-300 uppercase mb-2">Blood Group *</label>
                      <select
                        value={form.bloodGroup}
                        onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                        className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-xs font-bold text-rose-300 focus:outline-none focus:border-rose-400"
                      >
                        <option value="">Select Group</option>
                        {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-300 uppercase mb-2">Urgency Level *</label>
                      <select
                        value={form.urgency}
                        onChange={(e) => setForm({ ...form, urgency: e.target.value })}
                        className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-xs font-bold text-amber-300 focus:outline-none"
                      >
                        {URGENCY_LEVELS.map(u => <option key={u} value={u}>{u.toUpperCase()}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase mb-2">Medical Notes</label>
                    <textarea
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      rows={3}
                      className="w-full p-3 bg-gray-950 border border-gray-800 rounded-xl text-xs text-gray-200 focus:outline-none focus:border-emerald-400 resize-none"
                      placeholder="Hospital details, physician notes..."
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="ghost" onClick={() => setShowRequestForm(false)} className="flex-1">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting} className="flex-1 bg-emerald-400 text-gray-950 font-black shadow-[3px_3px_0px_0px_#000]">
                      {submitting ? 'Submitting...' : 'Submit Request'}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Certificate Modal */}
        <Certificate 
          isOpen={showCertificate}
          onClose={() => setShowCertificate(false)}
          type="receiver"
          userData={user}
          details={{ 
            organNeeded: myRequests.length > 0 ? myRequests[0].organType : 'an organ',
          }}
        />

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

export default ReceiverDashboard;
