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
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold gradient-text">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            System Overview & Management
          </p>
        </motion.div>

        {/* Overview Stats */}
        <div className="grid md:grid-cols-5 gap-6 mb-8">
          {[
            {
              label: 'Total Donors',
              value: analytics?.overview?.totalDonors || 0,
              icon: Users,
              color: 'bg-blue-500',
              textColor: 'text-blue-600',
            },
            {
              label: 'Active Donors',
              value: analytics?.overview?.activeDonors || 0,
              icon: Heart,
              color: 'bg-green-500',
              textColor: 'text-green-600',
            },
            {
              label: 'Hospitals',
              value: analytics?.overview?.totalHospitals || 0,
              icon: Building2,
              color: 'bg-purple-500',
              textColor: 'text-purple-600',
            },
            {
              label: 'Receivers',
              value: analytics?.overview?.totalReceivers || 0,
              icon: UserPlus,
              color: 'bg-[#A855F7]',
              textColor: 'text-[#A855F7]',
            },
            {
              label: 'Total Requests',
              value: analytics?.overview?.totalRequests || 0,
              icon: Activity,
              color: 'bg-orange-500',
              textColor: 'text-orange-600',
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card group hover:scale-[1.02] transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-2xl ${stat.color} bg-opacity-10 dark:bg-opacity-20`}>
                  <stat.icon className={`w-8 h-8 ${stat.textColor}`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Request Status Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Pending Requests', value: analytics?.requests?.pending || 0, icon: Clock, color: 'text-yellow-500', bgColor: 'bg-yellow-50 dark:bg-yellow-900/10' },
            { label: 'Matched', value: analytics?.requests?.matched || 0, icon: CheckCircle, color: 'text-blue-500', bgColor: 'bg-blue-50 dark:bg-blue-900/10' },
            { label: 'Completed', value: analytics?.requests?.completed || 0, icon: Zap, color: 'text-green-500', bgColor: 'bg-green-50 dark:bg-green-900/10' },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + idx * 0.1 }}
              className={`p-6 rounded-2xl ${item.bgColor} border border-transparent hover:border-current transition-all duration-300 flex items-center justify-between group`}
            >
              <div>
                <p className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">{item.label}</p>
                <p className="text-2xl font-black mt-1">{item.value}</p>
              </div>
              <item.icon className={`w-10 h-10 ${item.color} group-hover:scale-110 transition-transform`} />
            </motion.div>
          ))}
        </div>

        {/* Analytics Charts */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Organ Distribution */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card overflow-hidden"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-primary-500" />
                Organ Distribution
              </h3>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics?.organDistribution || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="_id"
                    label
                  >
                    {(analytics?.organDistribution || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={[`#4F46E5`, `#10B981`, `#F59E0B`, `#EF4444`, `#8B5CF6`, `#EC4899`][index % 6]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
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
            className="card"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <BarChartIcon className="w-5 h-5 text-green-500" />
                Blood Group Distribution
              </h3>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics?.bloodGroupDistribution || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                  <XAxis dataKey="_id" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Registration Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Donor Registration Trends (6 Months)
            </h3>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={(analytics?.monthlyRegistrations || []).map(d => ({
                month: d?._id ? `${d._id.month}/${d._id.year}` : 'N/A',
                count: d?.count || 0
              }))}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#4F46E5" 
                  strokeWidth={3} 
                  dot={{ r: 6, fill: '#4F46E5', strokeWidth: 2, stroke: '#fff' }} 
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Verifications & Activity */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Pending Donors */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Pending Donor Verifications</h3>
                <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-sm font-medium">
                  {pending?.donors?.length || 0}
                </span>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                {pending?.donors?.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No pending verifications</p>
                ) : (
                  pending?.donors?.map((donor) => (
                    <div
                      key={donor._id}
                      className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg flex justify-between items-center"
                    >
                      <div>
                        <p className="font-semibold">
                          {donor.user?.firstName} {donor.user?.lastName}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {donor.user?.email}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Blood: {donor.bloodGroup} | Organs: {donor.organsForDonation?.length || 0}
                        </p>
                      </div>
                      <button
                        onClick={() => handleVerifyDonor(donor._id)}
                        className="btn-primary py-2 px-4 text-sm flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
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
              className="card"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Pending Hospital Verifications</h3>
                <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-sm font-medium">
                  {pending?.hospitals?.length || 0}
                </span>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                {pending?.hospitals?.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No pending verifications</p>
                ) : (
                  pending?.hospitals?.map((hospital) => (
                    <div
                      key={hospital._id}
                      className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="mb-3">
                        <p className="font-semibold">{hospital.hospitalName}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {hospital.user?.email}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Type: {hospital.hospitalType} | Reg: {hospital.registrationNumber}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleVerifyHospital(hospital._id, 'verified')}
                          className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleVerifyHospital(hospital._id, 'rejected')}
                          className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
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
              className="card"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Pending Receiver Verifications</h3>
                <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-sm font-medium">
                  {pending?.receivers?.length || 0}
                </span>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                {pending?.receivers?.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No pending verifications</p>
                ) : (
                  pending?.receivers?.map((receiver) => (
                    <div
                      key={receiver._id}
                      className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg flex justify-between items-center"
                    >
                      <div>
                        <p className="font-semibold">
                          {receiver.firstName} {receiver.lastName}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {receiver.email}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Role: Receiver | Registered: {new Date(receiver.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleVerifyReceiver(receiver._id)}
                        className="btn-primary py-2 px-4 text-sm flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
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
              className="card"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Pending Organ Requests</h3>
                <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-sm font-medium">
                  {pending?.organRequests?.length || 0}
                </span>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                {pending?.organRequests?.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No pending requests</p>
                ) : (
                  pending?.organRequests?.map((request) => (
                    <div
                      key={request._id}
                      className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="mb-3 flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-lg">{request.organType}</p>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                            <span>Requester: {request.requesterName}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                              request.requestType === 'hospital' 
                                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                            }`}>
                              {request.requestType}
                            </span>
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs font-black">
                            {request.bloodGroup}
                          </span>
                          <p className="text-xs text-gray-500 mt-2 uppercase font-bold tracking-wider">
                            {request.urgency} Priority
                          </p>
                        </div>
                      </div>
                      
                      {request.notes && (
                        <p className="text-xs text-gray-500 bg-white dark:bg-gray-900 p-2 rounded mb-3 border border-gray-100 dark:border-gray-700">
                          {request.notes}
                        </p>
                      )}

                      <div className="mb-4">
                        <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Link a Donor:</label>
                        <select 
                          className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-sm"
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
                        {(!pending?.eligibleDonors || pending.eligibleDonors.filter(d => 
                          d.organsForDonation.includes(request.organType) && d.bloodGroup === request.bloodGroup
                        ).length === 0) && (
                          <p className="text-[10px] text-red-500 mt-1 italic">No donors found matching {request.bloodGroup} {request.organType}</p>
                        )}
                      </div>

                      <button
                        onClick={() => handleApproveRequest(request._id)}
                        className="w-full btn-primary py-2 text-sm flex justify-center items-center gap-2"
                        disabled={!selectedDonors[request._id]}
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve Match
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>

            {/* Matched Organ Requests */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Matched Organ Requests</h3>
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium">
                  {pending?.matchedRequests?.length || 0}
                </span>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                {pending?.matchedRequests?.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No matched requests pending completion</p>
                ) : (
                  pending?.matchedRequests?.map((request) => (
                    <div
                      key={request._id}
                      className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="mb-3 flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-lg">{request.organType}</p>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                            <span>Requester: {request.requesterName}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                              request.requestType === 'hospital' 
                                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                            }`}>
                              {request.requestType}
                            </span>
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs font-black">
                            {request.bloodGroup}
                          </span>
                          <p className="text-xs text-blue-500 mt-2 uppercase font-bold tracking-wider">
                            {request.urgency} Priority
                          </p>
                        </div>
                      </div>
                      
                      {request.notes && (
                        <p className="text-xs text-gray-500 bg-white dark:bg-gray-900 p-2 rounded mb-3 border border-gray-100 dark:border-gray-700">
                          {request.notes}
                        </p>
                      )}

                      <button
                        onClick={() => handleCompleteRequest(request._id)}
                        className="w-full py-2 px-4 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors flex justify-center items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Mark as Completed
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>

          {/* Recent Activity Log */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card h-full"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <History className="w-5 h-5 text-primary-500" />
                Recent System Activity
              </h3>
            </div>
            <div className="space-y-4 max-h-[800px] overflow-y-auto custom-scrollbar pr-2">
              {analytics?.recentActivity?.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No recent activity</p>
              ) : (
                analytics?.recentActivity?.map((log) => (
                  <div key={log._id} className="relative pl-6 pb-4 border-l-2 border-gray-100 dark:border-gray-800 last:pb-0">
                    <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white dark:bg-gray-900 border-2 border-primary-500"></div>
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-transparent hover:border-primary-500/30 transition-colors">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-black text-primary-600 uppercase tracking-tighter">
                          {log.action?.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[10px] text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        {log.user?.firstName} {log.user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Role: {log.user?.role}
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
