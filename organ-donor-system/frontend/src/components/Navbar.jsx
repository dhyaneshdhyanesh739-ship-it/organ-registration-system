import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Layout, 
  LogOut, 
  FileText, 
  Heart, 
  UserPlus, 
  Building2, 
  Activity, 
  Sun, 
  Moon, 
  X, 
  Menu 
} from 'lucide-react';
import NotificationCenter from './NotificationCenter';
import AdminDataViewModal from './AdminDataViewModal';
import DonorHistoryCart from './DonorHistoryCart';
import ReceiverHistoryCart from './ReceiverHistoryCart';
import { adminService } from '../services';
import { useToast } from '../context/ToastContext';
import Modal from './ui/Modal';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  // Admin Modal States
  const [isDonorModalOpen, setIsDonorModalOpen] = useState(false);
  const [isHospitalModalOpen, setIsHospitalModalOpen] = useState(false);
  const [isReceiverModalOpen, setIsReceiverModalOpen] = useState(false);
  const [isPatientDonorModalOpen, setIsPatientDonorModalOpen] = useState(false);
  const [donors, setDonors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [receivers, setReceivers] = useState([]);
  const [patientDonors, setPatientDonors] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAdminData = async (type) => {
    setLoading(true);
    try {
      if (type === 'donor') {
        const data = await adminService.getDonors();
        setDonors(data.donors);
        setIsDonorModalOpen(true);
      } else if (type === 'hospital') {
        const data = await adminService.getHospitals();
        setHospitals(data.hospitals);
        setIsHospitalModalOpen(true);
      } else if (type === 'receiver') {
        const data = await adminService.getReceivers();
        setReceivers(data.receivers);
        setIsReceiverModalOpen(true);
      } else if (type === 'patient-donor') {
        const data = await adminService.getPatientDonors();
        setPatientDonors(data.patientDonors);
        setIsPatientDonorModalOpen(true);
      }
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'donor':
        return '/donor/dashboard';
      case 'hospital':
        return '/hospital/dashboard';
      case 'receiver':
        return '/receiver/dashboard';
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/';
    }
  };

  return (
    <nav className="sticky top-0 z-40 glass-card border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <img 
              src="/logo.jpg" 
              alt="OrganDonor Logo" 
              className="w-12 h-12 object-cover border-2 border-primary-500 group-hover:scale-110 transition-transform rounded-full cursor-zoom-in bg-white shadow-sm" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsLogoModalOpen(true);
              }}
            />
            <span className="text-xl font-bold gradient-text">OrganDonor</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/organs" className="btn-ghost">
              Organs Info
            </Link>
            {!isAuthenticated ? (
              <>
                <Link to="/register" className="btn-primary">
                  Register Now
                </Link>
                <Link to="/login" className="btn-ghost">
                  Login
                </Link>
              </>
            ) : (
              <>
                <Link to={getDashboardLink()} className="btn-ghost flex items-center gap-2">
                  <Layout className="w-4 h-4" />
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="btn-ghost flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-100 dark:bg-primary-900/30 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">{user?.firstName || 'User'}</span>
                </div>
                
                {/* Notification Center */}
                <NotificationCenter />
              </>
            )}
            
            {/* Download Registration Form - Only for Hospitals */}
            {user?.role === 'hospital' && (
              <a
                href="/hospital-registration-form.png"
                download="hospital-registration-form.png"
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group relative"
                title="Download Registration Form"
              >
                <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-primary-600 transition-colors" />
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Download Form
                </span>
              </a>
            )}

            {/* Theme Toggle */}
            <div className="flex items-center gap-2">
              {user?.role === 'admin' && (
                <div className="flex items-center gap-1 border-r border-gray-200 dark:border-gray-700 pr-2 mr-1">
                  <button
                    onClick={() => fetchAdminData('donor')}
                    disabled={loading}
                    className="px-3 py-1.5 text-xs font-bold bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Heart className="w-3 h-3" />
                    Donors
                  </button>
                  <button
                    onClick={() => fetchAdminData('receiver')}
                    disabled={loading}
                    className="px-3 py-1.5 text-xs font-bold bg-[#A855F7] hover:bg-[#9333EA] text-white rounded-lg transition-colors flex items-center gap-1"
                  >
                    <UserPlus className="w-3 h-3" />
                    Receivers
                  </button>
                  <button
                    onClick={() => fetchAdminData('hospital')}
                    disabled={loading}
                    className="px-3 py-1.5 text-xs font-bold bg-[#D38EF3] hover:bg-[#C084FC] text-white rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Building2 className="w-3 h-3" />
                    Hospitals
                  </button>
                  <button
                    onClick={() => fetchAdminData('patient-donor')}
                    disabled={loading}
                    className="px-3 py-1.5 text-xs font-bold bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Activity className="w-3 h-3" />
                    Patients
                  </button>
                </div>
              )}
              
              {/* Donor History Cart */}
              {user?.role === 'donor' && (
                <DonorHistoryCart />
              )}
              
              {/* Receiver History Cart */}
              {user?.role === 'receiver' && (
                <ReceiverHistoryCart />
              )}

              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            {user?.role === 'hospital' && (
              <a
                href="/hospital-registration-form.png"
                download="hospital-registration-form.png"
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                title="Download Registration Form"
              >
                <FileText className="w-5 h-5" />
              </a>
            )}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
          >
            <div className="px-4 py-4 space-y-2">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/register"
                    className="block px-4 py-2 bg-primary-600 text-white rounded-lg text-center font-bold"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Register Now
                  </Link>
                  <Link
                    to="/login"
                    className="block px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to={getDashboardLink()}
                    className="block px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AdminDataViewModal
        isOpen={isDonorModalOpen}
        onClose={() => setIsDonorModalOpen(false)}
        title="Registered Donors"
        data={donors}
        type="donor"
      />
      <AdminDataViewModal
        isOpen={isReceiverModalOpen}
        onClose={() => setIsReceiverModalOpen(false)}
        title="Registered Receivers"
        data={receivers}
        type="receiver"
      />
      <AdminDataViewModal
        isOpen={isHospitalModalOpen}
        onClose={() => setIsHospitalModalOpen(false)}
        title="Registered Hospitals"
        data={hospitals}
        type="hospital"
      />
      <AdminDataViewModal
        isOpen={isPatientDonorModalOpen}
        onClose={() => setIsPatientDonorModalOpen(false)}
        title="Hospital Patient Donors"
        data={patientDonors}
        type="patient-donor"
      />

      {/* Logo Preview Modal - WhatsApp Style */}
      <Modal 
        isOpen={isLogoModalOpen} 
        onClose={() => setIsLogoModalOpen(false)}
        size="none"
        className="!bg-transparent p-0 border-none shadow-none"
      >
        <div className="relative flex flex-col items-center justify-end h-screen w-screen pb-12 md:pb-24" onClick={() => setIsLogoModalOpen(false)}>
          <img 
            src="/logo.jpg" 
            alt="Full Logo View" 
            className="max-w-[90vw] max-h-[85vh] object-contain shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </Modal>
    </nav>
  );
};

export default Navbar;
