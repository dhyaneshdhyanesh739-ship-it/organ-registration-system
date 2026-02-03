import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { adminService } from '../services';
import { Users, Heart, Building2, Activity, CheckCircle, Loader } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [analytics, setAnalytics] = useState(null);
  const [pending, setPending] = useState(null);
  const [loading, setLoading] = useState(true);

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
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {[
            {
              label: 'Total Donors',
              value: analytics?.overview?.totalDonors || 0,
              icon: Users,
              color: 'text-blue-500',
            },
            {
              label: 'Active Donors',
              value: analytics?.overview?.activeDonors || 0,
              icon: Heart,
              color: 'text-green-500',
            },
            {
              label: 'Hospitals',
              value: analytics?.overview?.totalHospitals || 0,
              icon: Building2,
              color: 'text-purple-500',
            },
            {
              label: 'Total Requests',
              value: analytics?.overview?.totalRequests || 0,
              icon: Activity,
              color: 'text-orange-500',
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                </div>
                <stat.icon className={`w-12 h-12 ${stat.color}`} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pending Verifications */}
        <div className="grid md:grid-cols-2 gap-6">
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
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
