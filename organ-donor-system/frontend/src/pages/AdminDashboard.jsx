import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { adminService } from '../services';
import { Users, Heart, Building2, Activity, CheckCircle, Loader, BarChart as BarChartIcon, PieChart as PieChartIcon, TrendingUp, History, Clock, Search, Zap, XCircle, UserPlus } from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  Legend 
} from 'recharts';

const AdminDashboard = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [analytics, setAnalytics] = useState(null);
  const [pending, setPending] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDonors, setSelectedDonors] = useState({}); // Track selected donor per request id

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [analyticsData, pendingData] = await Promise.all([
        adminService.getAnalytics(),
        adminService.getPendingVerifications(),
      ]);
      setAnalytics(analyticsData.analytics);
      setPending(pendingData.pending);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyDonor = async (donorId) => {
    try {
      await adminService.verifyDonor(donorId);
      toast.success('Donor verified successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to verify donor');
    }
  };

  const handleVerifyHospital = async (hospitalId, status) => {
    try {
      await adminService.verifyHospital(hospitalId, status);
      toast.success(`Hospital ${status} successfully`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update hospital status');
    }
  };

  const handleVerifyReceiver = async (receiverId) => {
    try {
      await adminService.verifyReceiver(receiverId);
      toast.success('Receiver verified successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to verify receiver');
    }
  };

  const handleApproveRequest = async (requestId) => {
    try {
      const donorId = selectedDonors[requestId];
      if (!donorId) {
        toast.error('Please select a donor first');
        return;
      }
      await adminService.approveReceiverRequest(requestId, { donorId });
      toast.success('Organ request approved successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to approve request');
    }
  };

  const handleCompleteRequest = async (requestId) => {
    try {
      await adminService.completeReceiverRequest(requestId);
      toast.success('Organ request marked as completed successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to complete request');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#070914] text-amber-300 gap-4">
        <Loader className="w-10 h-10 animate-spin text-amber-400" />
        <p className="font-black royal-title text-xl">Loading Imperial Admin Command...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070914] text-slate-100 py-10 selection:bg-amber-400/30 selection:text-amber-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Imperial Admin Command Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 border-2 border-amber-400/60 shadow-[8px_8px_0px_0px_#E5C158] relative overflow-hidden"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3">
              <div className="royal-badge inline-flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10B981]" />
                <span>👑 IMPERIAL SYSTEM COMMAND CENTER</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black royal-title">System Overview & Operations</h1>
              <p className="text-slate-300 font-medium text-base">
                Real-time monitoring, hospital verification controls, organ match dispatch, and network health metrics.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <button 
                onClick={fetchData} 
                className="btn-secondary text-xs !py-3 flex items-center gap-2"
              >
                <Zap className="w-4 h-4 text-amber-300 animate-pulse" />
                <span>Refresh Live Feeds</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Overview Stats */}
        <div className="grid md:grid-cols-5 gap-6">
          {[
            {
              label: 'Total Registered Donors',
              value: analytics?.overview?.totalDonors || 0,
              icon: Users,
              color: 'border-amber-400/60 text-amber-300',
              shadow: 'shadow-[6px_6px_0px_0px_#E5C158]',
            },
            {
              label: 'Active Verified Donors',
              value: analytics?.overview?.activeDonors || 0,
              icon: Heart,
              color: 'border-rose-500/60 text-rose-400',
              shadow: 'shadow-[6px_6px_0px_0px_#E63946]',
            },
            {
              label: 'Accredited Hospitals',
              value: analytics?.overview?.totalHospitals || 0,
              icon: Building2,
              color: 'border-emerald-400/60 text-emerald-300',
              shadow: 'shadow-[6px_6px_0px_0px_#10B981]',
            },
            {
              label: 'Registered Receivers',
              value: analytics?.overview?.totalReceivers || 0,
              icon: UserPlus,
              color: 'border-purple-400/60 text-purple-300',
              shadow: 'shadow-[6px_6px_0px_0px_#A855F7]',
            },
            {
              label: 'Total Organ Requests',
              value: analytics?.overview?.totalRequests || 0,
              icon: Activity,
              color: 'border-blue-400/60 text-blue-300',
              shadow: 'shadow-[6px_6px_0px_0px_#3B82F6]',
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`glass-card p-6 border-2 ${stat.color} ${stat.shadow} hover:-translate-x-1 hover:-translate-y-1 transition-all duration-300`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-slate-300">{stat.label}</p>
                  <p className="text-3xl font-black mt-2 text-white font-mono">{stat.value}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-amber-400/10 border border-amber-400/30">
                  <stat.icon className="w-7 h-7" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* System Health & Operations Panel */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass-brutal p-5 text-center space-y-2">
            <p className="text-xs font-black uppercase tracking-wider text-amber-300">Average Match Time</p>
            <p className="text-2xl font-black royal-title">1.8 Hours</p>
            <p className="text-[11px] text-slate-400 font-medium">Auto-match dispatch SLA active</p>
          </div>
          <div className="glass-brutal p-5 text-center space-y-2">
            <p className="text-xs font-black uppercase tracking-wider text-emerald-300">Verification Accuracy</p>
            <p className="text-2xl font-black text-emerald-300 font-mono">99.4%</p>
            <p className="text-[11px] text-slate-400 font-medium">Multi-stage document check</p>
          </div>
          <div className="glass-brutal p-5 text-center space-y-2">
            <p className="text-xs font-black uppercase tracking-wider text-rose-300">Critical Emergency Queue</p>
            <p className="text-2xl font-black text-rose-400 font-mono">{pending?.organRequests?.filter(r => r.urgency === 'critical')?.length || 0}</p>
            <p className="text-[11px] text-slate-400 font-medium">Priority dispatch active</p>
          </div>
          <div className="glass-brutal p-5 text-center space-y-2">
            <p className="text-xs font-black uppercase tracking-wider text-purple-300">Real-time Socket Nodes</p>
            <p className="text-2xl font-black text-purple-300 font-mono">Connected</p>
            <p className="text-[11px] text-slate-400 font-medium">Socket.io server port 5001</p>
          </div>
        </div>

        {/* Request Status Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Pending Requests', value: analytics?.requests?.pending || 0, icon: Clock, color: 'text-amber-300', shadow: 'shadow-[6px_6px_0px_0px_#E5C158]', border: 'border-amber-400/50' },
            { label: 'Matched Organs', value: analytics?.requests?.matched || 0, icon: CheckCircle, color: 'text-blue-300', shadow: 'shadow-[6px_6px_0px_0px_#3B82F6]', border: 'border-blue-400/50' },
            { label: 'Completed Transplants', value: analytics?.requests?.completed || 0, icon: Zap, color: 'text-emerald-300', shadow: 'shadow-[6px_6px_0px_0px_#10B981]', border: 'border-emerald-400/50' },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + idx * 0.1 }}
              className={`glass-card p-6 border-2 ${item.border} ${item.shadow} flex items-center justify-between group hover:-translate-x-1 hover:-translate-y-1 transition-all`}
            >
              <div>
                <p className="text-xs font-black text-slate-300 uppercase tracking-wider">{item.label}</p>
                <p className="text-3xl font-black mt-2 font-mono text-white">{item.value}</p>
              </div>
              <item.icon className={`w-10 h-10 ${item.color} group-hover:rotate-12 transition-transform`} />
            </motion.div>
          ))}
        </div>

        {/* Analytics Charts */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Organ Distribution */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-6 border-2 border-amber-400/40 shadow-[6px_6px_0px_0px_#E5C158]"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black royal-title flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-amber-400" />
                Organ Distribution Metrics
              </h3>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics?.organDistribution || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="_id"
                    label
                  >
                    {(analytics?.organDistribution || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={[`#E5C158`, `#10B981`, `#E63946`, `#3B82F6`, `#8B5CF6`, `#EC4899`][index % 6]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0d1026', borderRadius: '12px', border: '2px solid #E5C158', color: '#fff' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Blood Group Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-6 border-2 border-amber-400/40 shadow-[6px_6px_0px_0px_#E5C158]"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black royal-title flex items-center gap-2">
                <BarChartIcon className="w-5 h-5 text-emerald-400" />
                Blood Group Distribution
              </h3>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics?.bloodGroupDistribution || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} stroke="#E5C158" />
                  <XAxis dataKey="_id" axisLine={false} tickLine={false} stroke="#E5C158" />
                  <YAxis axisLine={false} tickLine={false} stroke="#E5C158" />
                  <Tooltip 
                    cursor={{ fill: 'rgba(229,193,88,0.1)' }}
                    contentStyle={{ backgroundColor: '#0d1026', borderRadius: '12px', border: '2px solid #E5C158', color: '#fff' }}
                  />
                  <Bar dataKey="count" fill="#E5C158" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Registration Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 border-2 border-amber-400/40 shadow-[6px_6px_0px_0px_#E5C158]"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black royal-title flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-400" />
              Donor Registration Trends (6 Months)
            </h3>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={(analytics?.monthlyRegistrations || []).map(d => ({
                month: d?._id ? `${d._id.month}/${d._id.year}` : 'N/A',
                count: d?.count || 0
              }))}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} stroke="#E5C158" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} stroke="#E5C158" />
                <YAxis axisLine={false} tickLine={false} stroke="#E5C158" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0d1026', borderRadius: '12px', border: '2px solid #E5C158', color: '#fff' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#E5C158" 
                  strokeWidth={3} 
                  dot={{ r: 6, fill: '#E5C158', strokeWidth: 2, stroke: '#fff' }} 
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Verifications & Operations */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Pending Donors */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-6 border-2 border-amber-400/40 shadow-[6px_6px_0px_0px_#E5C158]"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-black text-white">Pending Donor Verifications</h3>
                <span className="royal-badge">
                  {pending?.donors?.length || 0} PENDING
                </span>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                {pending?.donors?.length === 0 ? (
                  <p className="text-center text-slate-400 py-8 font-medium">No pending donor verifications</p>
                ) : (
                  pending?.donors?.map((donor) => (
                    <div
                      key={donor._id}
                      className="p-4 bg-[#080a1c] border-2 border-amber-400/30 rounded-xl flex justify-between items-center"
                    >
                      <div>
                        <p className="font-black text-amber-200 text-base">
                          {donor.user?.firstName} {donor.user?.lastName}
                        </p>
                        <p className="text-xs text-slate-300 font-mono">
                          {donor.user?.email}
                        </p>
                        <p className="text-xs text-slate-400 mt-1 font-bold">
                          Blood: <span className="text-rose-400 font-mono">{donor.bloodGroup}</span> | Organs: <span className="text-amber-300 font-bold">{donor.organsForDonation?.length || 0}</span>
                        </p>
                      </div>
                      <button
                        onClick={() => handleVerifyDonor(donor._id)}
                        className="btn-primary text-xs py-2 px-4"
                      >
                        <CheckCircle className="w-4 h-4 text-slate-950" />
                        Verify
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>

            {/* Pending Hospitals */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-6 border-2 border-amber-400/40 shadow-[6px_6px_0px_0px_#E5C158]"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-black text-white">Pending Hospital Accreditation</h3>
                <span className="royal-badge">
                  {pending?.hospitals?.length || 0} PENDING
                </span>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                {pending?.hospitals?.length === 0 ? (
                  <p className="text-center text-slate-400 py-8 font-medium">No pending hospital verifications</p>
                ) : (
                  pending?.hospitals?.map((hospital) => (
                    <div
                      key={hospital._id}
                      className="p-4 bg-[#080a1c] border-2 border-amber-400/30 rounded-xl"
                    >
                      <div className="mb-3">
                        <p className="font-black text-amber-200 text-lg">{hospital.hospitalName}</p>
                        <p className="text-xs text-slate-300 font-mono">
                          {hospital.user?.email}
                        </p>
                        <p className="text-xs text-slate-400 mt-1 font-bold">
                          Type: {hospital.hospitalType} | Reg No: <span className="font-mono text-amber-300">{hospital.registrationNumber}</span>
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleVerifyHospital(hospital._id, 'verified')}
                          className="btn-emerald flex-1 text-xs py-2"
                        >
                          Accredit Hospital
                        </button>
                        <button
                          onClick={() => handleVerifyHospital(hospital._id, 'rejected')}
                          className="btn-ruby flex-1 text-xs py-2"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>

            {/* Pending Receivers */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-6 border-2 border-amber-400/40 shadow-[6px_6px_0px_0px_#E5C158]"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-black text-white">Pending Receiver Accounts</h3>
                <span className="royal-badge">
                  {pending?.receivers?.length || 0} PENDING
                </span>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                {pending?.receivers?.length === 0 ? (
                  <p className="text-center text-slate-400 py-8 font-medium">No pending receiver verifications</p>
                ) : (
                  pending?.receivers?.map((receiver) => (
                    <div
                      key={receiver._id}
                      className="p-4 bg-[#080a1c] border-2 border-amber-400/30 rounded-xl flex justify-between items-center"
                    >
                      <div>
                        <p className="font-black text-amber-200">
                          {receiver.firstName} {receiver.lastName}
                        </p>
                        <p className="text-xs text-slate-300 font-mono">
                          {receiver.email}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Registered: {new Date(receiver.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleVerifyReceiver(receiver._id)}
                        className="btn-primary text-xs py-2 px-4"
                      >
                        <CheckCircle className="w-4 h-4 text-slate-950" />
                        Verify
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>

            {/* Pending Organ Requests */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-6 border-2 border-amber-400/40 shadow-[6px_6px_0px_0px_#E5C158]"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-black text-white">Pending Organ Match Approvals</h3>
                <span className="royal-badge">
                  {pending?.organRequests?.length || 0} PENDING
                </span>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                {pending?.organRequests?.length === 0 ? (
                  <p className="text-center text-slate-400 py-8 font-medium">No pending organ requests</p>
                ) : (
                  pending?.organRequests?.map((request) => (
                    <div
                      key={request._id}
                      className="p-4 bg-[#080a1c] border-2 border-amber-400/30 rounded-xl space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-black royal-title text-xl">{request.organType}</p>
                          <p className="text-xs font-bold text-slate-300 flex items-center gap-2 mt-1">
                            <span>Requester: {request.requesterName}</span>
                            <span className="royal-badge !py-0.5 !px-2 text-[10px]">
                              {request.requestType}
                            </span>
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="ruby-badge">
                            {request.bloodGroup}
                          </span>
                          <p className="text-xs text-rose-400 font-black uppercase tracking-wider mt-2">
                            {request.urgency} Priority
                          </p>
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="text-xs font-black text-amber-300 uppercase block mb-1">Select Compatible Donor:</label>
                        <select 
                          className="input-field text-xs py-2"
                          value={selectedDonors[request._id] || ''}
                          onChange={(e) => setSelectedDonors(prev => ({ ...prev, [request._id]: e.target.value }))}
                        >
                          <option value="">-- Select Matching Donor --</option>
                          {pending?.eligibleDonors?.filter(d => 
                            d.organsForDonation.includes(request.organType) && d.bloodGroup === request.bloodGroup
                          ).map(donor => (
                            <option key={donor._id} value={donor._id}>
                              {donor.user?.firstName} {donor.user?.lastName} ({donor.bloodGroup})
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        onClick={() => handleApproveRequest(request._id)}
                        className="btn-primary w-full text-xs py-3"
                        disabled={!selectedDonors[request._id]}
                      >
                        <CheckCircle className="w-4 h-4 text-slate-950" />
                        Approve & Dispatch Match
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>

          {/* Recent System Activity Log */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-6 border-2 border-amber-400/40 shadow-[6px_6px_0px_0px_#E5C158] h-full"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black royal-title flex items-center gap-2">
                <History className="w-5 h-5 text-amber-400" />
                Live System Activity Log
              </h3>
            </div>
            <div className="space-y-4 max-h-[800px] overflow-y-auto custom-scrollbar pr-2">
              {analytics?.recentActivity?.length === 0 ? (
                <p className="text-center text-slate-400 py-8 font-medium">No recent activity logs</p>
              ) : (
                analytics?.recentActivity?.map((log) => (
                  <div key={log._id} className="relative pl-6 pb-4 border-l-2 border-amber-400/30 last:pb-0">
                    <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-amber-400 border-2 border-slate-950"></div>
                    <div className="bg-[#080a1c] p-3.5 rounded-xl border border-amber-400/30">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
                          {log.action?.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-400" />
                          {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm font-black text-white">
                        {log.user?.firstName} {log.user?.lastName}
                      </p>
                      <p className="text-xs text-slate-300 mt-0.5 font-bold">
                        Role: <span className="text-amber-400 uppercase">{log.user?.role}</span>
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
