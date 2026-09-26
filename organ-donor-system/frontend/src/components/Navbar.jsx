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
  Menu,
  Sparkles
} from 'lucide-react';
import NotificationCenter from './NotificationCenter';
import AdminDataViewModal from './AdminDataViewModal';
import DonorHistoryCart from './DonorHistoryCart';
import ReceiverHistoryCart from './ReceiverHistoryCart';
import AIDonorHistoryModal from './AIDonorHistoryModal';
import { adminService } from '../services';
import { useToast } from '../context/ToastContext';
import Modal from './ui/Modal';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [isAIScannerOpen, setIsAIScannerOpen] = useState(false);
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
    <nav className="sticky top-0 z-40 bg-[#070918]/95 backdrop-blur-2xl border-b-4 border-amber-400 shadow-[0_8px_30px_rgba(0,0,0,0.8)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3.5 group">
            <div className="relative">
              <img 
                src="/logo.jpg" 
                alt="KIDDO Organ System Logo" 
                className="w-12 h-12 object-contain border-2 border-amber-400 group-hover:scale-105 transition-all rounded-xl cursor-zoom-in bg-white p-0.5 shadow-[4px_4px_0px_0px_#E5C158] shrink-0" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsLogoModalOpen(true);
                }}
              />
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-400 border border-black"></span>
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black royal-title tracking-wider">LifePulse</span>
              <span className="text-[10px] font-black text-amber-300 uppercase tracking-widest -mt-1 font-mono flex items-center gap-1">
                <span>👑 ROYAL ORGAN NETWORK</span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-5">
            <Link to="/organs" className="btn-ghost flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400" />
              <span>Organs Registry</span>
            </Link>
            {!isAuthenticated ? (
              <>
                <Link to="/register" className="btn-primary">
                  <span>Register Hero</span>
                </Link>
                <Link to="/login" className="btn-secondary">
                  <span>Royal Sign In</span>
                </Link>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsAIScannerOpen(true)}
                  className="btn-primary text-xs !py-2.5 flex items-center gap-2 cursor-pointer"
                  title="AI Multimodal OCR & Donor History Calculator"
                >
                  <Sparkles className="w-4 h-4 text-slate-950 animate-spin" />
                  <span>AI OCR Scanner</span>
                </button>

                <Link to={getDashboardLink()} className="btn-secondary flex items-center gap-2 !py-2.5">
                  <Layout className="w-4 h-4 text-amber-400" />
                  <span>Dashboard</span>
                </Link>
                <button onClick={handleLogout} className="btn-ghost flex items-center gap-2 text-rose-400 hover:text-rose-300">
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
                <div className="flex items-center gap-2 px-4 py-1.5 bg-[#0e122d] border-2 border-amber-400/60 rounded-full shadow-[3px_3px_0px_0px_#E5C158]">
                  <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_#10B981]"></div>
                  <span className="text-xs font-black text-amber-300 uppercase tracking-wide">{user?.firstName || 'User'}</span>
                  <span className="text-[10px] px-2 py-0.5 bg-amber-400 text-slate-950 font-black rounded-md uppercase tracking-wider">{user?.role}</span>
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

            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            {user?.role === 'hospital' && (
              <a
                href="/hospital-registration-form.png"
                download="hospital-registration-form.png"
                className="p-2 rounded-xl border border-amber-400/30 bg-amber-400/10 text-amber-300"
                title="Download Registration Form"
              >
                <FileText className="w-5 h-5" />
              </a>
            )}
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

      {/* AI Multimodal OCR & Donor History Modal */}
      <AIDonorHistoryModal
        isOpen={isAIScannerOpen}
        onClose={() => setIsAIScannerOpen(false)}
      />
    </nav>
  );
};

export default Navbar;
