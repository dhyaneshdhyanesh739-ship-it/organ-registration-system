import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { receiverService } from '../services';
import { Heart, Search, Activity, Loader, Send, Filter, ChevronDown, CheckCircle, AlertTriangle, Clock, MapPin, Award } from 'lucide-react';
import Certificate from '../components/Certificate';

const ORGANS = ['Heart', 'Liver', 'Kidneys', 'Lungs', 'Pancreas', 'Intestines', 'Corneas', 'Skin', 'Bone', 'Heart Valves', 'Blood Vessels'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const URGENCY_LEVELS = ['critical', 'high', 'medium', 'low'];

const URGENCY_COLORS = {
  critical: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
  high: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800',
  medium: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
  low: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
};

const ORGAN_ICONS = {
  Heart: '❤️', Liver: '🫀', Kidneys: '🫘', Lungs: '🫁',
  Pancreas: '🟤', Intestines: '🔵', Corneas: '👁️', Skin: '🧬',
  Bone: '🦴', 'Heart Valves': '💗', 'Blood Vessels': '🩸',
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
    } catch {
      toast.error('Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
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
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50/40 to-cyan-100/50 dark:from-gray-900 dark:via-teal-950/20 dark:to-emerald-950/20 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold gradient-text">Receiver Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
                Welcome, <span className="font-semibold">{user?.firstName}</span>! Find the organ you need.
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowRequestForm(true)}
              className="btn-primary flex items-center gap-2 self-start md:self-auto"
            >
              <Send className="w-4 h-4" />
              Submit Organ Request
            </motion.button>
          </div>
        </motion.div>

        {/* Success Banner - Form Submission */}
        <AnimatePresence>
          {requestSubmitted && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3 shadow-sm"
            >
              <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
              <p className="text-green-700 dark:text-green-400 font-medium">
                Your organ request has been submitted. Our matching team will contact you soon.
              </p>
            </motion.div>
          )}

          {/* Certificate Section for Receivers */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl shadow-xl border border-blue-400 text-white flex flex-col md:flex-row items-center justify-between gap-6 p-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-2xl mb-1 text-white shadow-black/10 text-shadow-sm">
                    Official Receiver Certificate
                  </h3>
                  <p className="text-blue-50 font-medium">
                    View and download your official system registration certificate.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowCertificate(true)}
                className="bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-sm whitespace-nowrap px-8 py-3 text-lg"
              >
                View Certificate
              </button>
            </div>
          </motion.div>

          {/* Approved Organ Request Banner */}
          {myRequests.filter(r => r.status === 'approved').map((approvedRequest) => (
            <motion.div
              key={approvedRequest._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8 p-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg border border-green-400 text-white flex flex-col sm:flex-row items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                  <Heart className="w-8 h-8 text-white fill-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    Match Found! 🎉
                  </h3>
                  <p className="text-green-50 mt-1">
                    Congratulations! You have been successfully matched to receive a <span className="font-bold underline">{approvedRequest.organType}</span>.
                    Our medical team will contact you immediately with next steps.
                  </p>
                </div>
              </div>
              <button 
                className="shrink-0 px-6 py-2.5 bg-white text-green-600 font-bold rounded-xl hover:bg-green-50 transition-colors shadow-sm"
                onClick={() => setSelectedRequest(approvedRequest)}
              >
                View Details
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="card text-center">
            <p className="text-3xl font-bold gradient-text">{organSummary.totalActiveDonors}</p>
            <p className="text-sm text-gray-500 mt-1 font-medium">Active Donors</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="card text-center">
            <p className="text-3xl font-bold text-blue-600">{Object.keys(organSummary.organCounts).length}</p>
            <p className="text-sm text-gray-500 mt-1 font-medium">Organ Types Available</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="card text-center">
            <p className="text-3xl font-bold text-green-600">{availableOrgans.length}</p>
            <p className="text-sm text-gray-500 mt-1 font-medium">Total Units Available</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="card text-center">
            <p className="text-3xl font-bold text-purple-600">{Object.keys(organSummary.bloodGroupCounts).length}</p>
            <p className="text-sm text-gray-500 mt-1 font-medium">Blood Groups Covered</p>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">

          {/* Left Column */}
          <div className="lg:col-span-1 space-y-8">
            {/* Waitlist Position Estimation */}
            {myRequests.filter(r => r.status === 'pending' || r.status === 'searching').length > 0 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="card bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-100 dark:border-indigo-800">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-indigo-900 dark:text-indigo-100">
                  <Clock className="w-5 h-5 text-indigo-500" />
                  Waitlist Estimate
                </h3>
                {myRequests.filter(r => r.status === 'pending' || r.status === 'searching').map((req, idx) => {
                  // Mock logic for waitlist position based on urgency
                  let position = 0;
                  let trend = '';
                  if (req.urgency === 'critical') { position = Math.floor(Math.random() * 5) + 1; trend = 'Top Priority'; }
                  else if (req.urgency === 'high') { position = Math.floor(Math.random() * 15) + 5; trend = 'High Priority'; }
                  else if (req.urgency === 'medium') { position = Math.floor(Math.random() * 50) + 20; trend = 'Standard Queue'; }
                  else { position = Math.floor(Math.random() * 100) + 50; trend = 'Extended Queue'; }

                  return (
                    <div key={idx} className="mb-4 last:mb-0 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-gray-900 dark:text-white">{req.organType}</span>
                        <span className={`text-xs px-2 py-1 rounded-full font-bold ${URGENCY_COLORS[req.urgency]}`}>
                          {req.urgency.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-end justify-between mt-4">
                        <div>
                          <p className="text-sm text-gray-500">Est. Position</p>
                          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">#{position}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">{trend}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}

            {/* Left: Organ Availability Summary */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="card">
            <h3 className="text-xl font-bold mb-5 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary-500" />
              Organ Availability
            </h3>
            <div className="space-y-3">
              {Object.entries(organSummary.organCounts).length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-6">No organs currently available.</p>
              ) : (
                Object.entries(organSummary.organCounts)
                  .sort(([, a], [, b]) => b - a)
                  .map(([organ, count]) => (
                    <div key={organ} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-colors cursor-pointer"
                      onClick={() => { setFilterOrgan(organ); handleFilter(); }}>
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{ORGAN_ICONS[organ] || '🔬'}</span>
                        <span className="font-medium text-sm">{organ}</span>
                      </div>
                      <span className="px-2.5 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs font-bold rounded-full">
                        {count} {count === 1 ? 'donor' : 'donors'}
                      </span>
                    </div>
                  ))
              )}
            </div>

            {/* Blood Group Distribution */}
            <div className="mt-6 pt-6 border-t dark:border-gray-700">
              <h4 className="font-bold mb-4 text-gray-700 dark:text-gray-300">By Blood Group</h4>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(organSummary.bloodGroupCounts).map(([bg, count]) => (
                  <div key={bg} onClick={() => { setFilterBlood(bg); handleFilter(); }}
                    className="flex flex-col items-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors cursor-pointer">
                    <span className="text-xs font-black text-red-600 dark:text-red-400">{bg}</span>
                    <span className="text-lg font-bold">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

          {/* Right: Available Organs Table */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card lg:col-span-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Search className="w-5 h-5 text-primary-500" />
                Available Organs
              </h3>
              {/* Filters */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <select
                    value={filterOrgan}
                    onChange={(e) => setFilterOrgan(e.target.value)}
                    className="appearance-none text-sm px-3 py-1.5 pr-7 bg-gray-100 dark:bg-gray-800 rounded-lg border-none focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    <option value="">All Organs</option>
                    {ORGANS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                </div>
                <div className="relative">
                  <select
                    value={filterBlood}
                    onChange={(e) => setFilterBlood(e.target.value)}
                    className="appearance-none text-sm px-3 py-1.5 pr-7 bg-gray-100 dark:bg-gray-800 rounded-lg border-none focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    <option value="">All Blood Groups</option>
                    {BLOOD_GROUPS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                </div>
                <button onClick={handleFilter} className="p-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                  <Filter className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar space-y-3">
              {availableOrgans.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No organs found for the selected filters.</p>
                  <button onClick={() => { setFilterOrgan(''); setFilterBlood(''); fetchData(); }}
                    className="mt-3 text-sm text-primary-600 hover:underline">
                    Clear filters
                  </button>
                </div>
              ) : (
                availableOrgans.map((item, idx) => (
                  <motion.div
                    key={`${item.donorId}-${item.organType}-${idx}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-transparent hover:border-primary-400 dark:hover:border-primary-600 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">{ORGAN_ICONS[item.organType] || '🔬'}</div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{item.organType}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" />
                          {item.city}, {item.state}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs font-black">
                        {item.bloodGroup}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        {new Date(item.registeredAt).toLocaleDateString()}
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Request Form Modal */}
      <AnimatePresence>
        {showRequestForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRequestForm(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="px-6 py-4 border-b dark:border-gray-800 flex items-center gap-3">
                <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
                  <Heart className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Submit Organ Request</h2>
                  <p className="text-xs text-gray-500">Tell us which organ you need</p>
                </div>
              </div>

              <form onSubmit={handleSubmitRequest} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2">Organ Needed *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {ORGANS.map(organ => (
                      <button
                        key={organ}
                        type="button"
                        onClick={() => setForm({ ...form, organType: organ })}
                        className={`px-2 py-2 rounded-lg border text-xs font-medium transition-all flex items-center gap-1.5 justify-center ${
                          form.organType === organ
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                            : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
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
                    <label className="block text-sm font-medium mb-2">Your Blood Group *</label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {BLOOD_GROUPS.map(bg => (
                        <button
                          key={bg}
                          type="button"
                          onClick={() => setForm({ ...form, bloodGroup: bg })}
                          className={`py-1.5 rounded-lg border text-xs font-bold transition-all ${
                            form.bloodGroup === bg
                              ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                              : 'border-gray-200 dark:border-gray-700 hover:border-red-300'
                          }`}
                        >
                          {bg}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Urgency Level *</label>
                    <div className="space-y-1.5">
                      {URGENCY_LEVELS.map(level => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setForm({ ...form, urgency: level })}
                          className={`w-full py-1.5 rounded-lg border text-xs font-bold capitalize transition-all ${
                            form.urgency === level
                              ? URGENCY_COLORS[level]
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                          }`}
                        >
                          {level === 'critical' && '🔴 '}
                          {level === 'high' && '🟠 '}
                          {level === 'medium' && '🟡 '}
                          {level === 'low' && '🟢 '}
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Additional Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary-500 outline-none text-sm resize-none"
                    placeholder="Any additional medical information or special requirements..."
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowRequestForm(false)}
                    className="flex-1 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting}
                    className="flex-1 btn-primary flex items-center justify-center gap-2 text-sm">
                    {submitting ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {submitting ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Donor Details Modal */}
      <AnimatePresence>
        {selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRequest(null)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="px-6 py-5 border-b dark:border-gray-800 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 flex flex-col items-center justify-center text-center">
                <div className="p-4 bg-white dark:bg-gray-800 rounded-full shadow-sm mb-3">
                  <Heart className="w-8 h-8 text-green-500 fill-green-500" />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Match Confirmed</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Your {selectedRequest.organType} request was approved.</p>
              </div>

              <div className="p-6">
                {/* Match Progress Tracker */}
                <div className="mb-8">
                  <div className="flex justify-between items-center relative">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full z-0"></div>
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1/3 h-1 bg-green-500 rounded-full z-0"></div>
                    
                    {[
                      { step: 1, label: 'Matched', active: true, done: true },
                      { step: 2, label: 'Notified', active: true, done: false },
                      { step: 3, label: 'Testing', active: false, done: false },
                      { step: 4, label: 'Surgery', active: false, done: false },
                    ].map((s) => (
                      <div key={s.step} className="relative z-10 flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-md transition-colors ${
                          s.done ? 'bg-green-500 text-white' : s.active ? 'bg-blue-500 text-white ring-4 ring-blue-100 dark:ring-blue-900/50' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                        }`}>
                          {s.done ? <CheckCircle className="w-5 h-5" /> : s.step}
                        </div>
                        <p className={`text-[10px] uppercase tracking-wider mt-2 font-bold absolute -bottom-6 whitespace-nowrap ${
                          s.active ? 'text-gray-900 dark:text-white' : 'text-gray-400'
                        }`}>
                          {s.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b dark:border-gray-800 pb-2 mt-8">Donor Details</h3>
                
                {selectedRequest.matchedDonor && selectedRequest.matchedDonor.user ? (
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                      <div className="flex-1">
                        <p className="font-bold text-lg mb-1">{selectedRequest.matchedDonor.user.firstName} {selectedRequest.matchedDonor.user.lastName}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                          <span className="font-medium text-gray-900 dark:text-gray-200">Email:</span> {selectedRequest.matchedDonor.user.email}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2 mt-1">
                          <span className="font-medium text-gray-900 dark:text-gray-200">Phone:</span> {selectedRequest.matchedDonor.user.phone}
                        </p>
                      </div>
                      <div className="text-center bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
                        <span className="block text-xs font-bold text-red-600 dark:text-red-400">BLOOD</span>
                        <span className="block text-xl font-black text-red-700 dark:text-red-300">{selectedRequest.matchedDonor.bloodGroup}</span>
                      </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-blue-800 dark:text-blue-300">Next Steps</p>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 leading-relaxed">
                          Our medical team has been notified of this match. The hospital coordinator will contact you and the donor within the next 24 hours to schedule preliminary compatibility testing and consultations.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <p className="text-gray-600 dark:text-gray-400">Match details are being finalized by the admin team.</p>
                  </div>
                )}
              </div>

              <div className="p-4 border-t dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <button 
                  onClick={() => setSelectedRequest(null)}
                  className="w-full btn-primary py-2.5 flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Acknowledge
                </button>
              </div>
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
          date: myRequests.length > 0 ? myRequests[0].createdAt : user?.createdAt 
        }}
      />
    </div>
  );
};

export default ReceiverDashboard;
