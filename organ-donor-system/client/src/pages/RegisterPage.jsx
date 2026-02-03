import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Heart, Mail, Lock, User, Phone, Loader } from 'lucide-react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'donor',
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpData, setOtpData] = useState({ emailOTP: '', phoneOTP: '' });
  const [verifying, setVerifying] = useState(false);
  
  const { register, sendOTP, verifyOTP } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOTPChange = (e) => {
    setOtpData({ ...otpData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      await sendOTP(formData.email, formData.phone);
      toast.success('OTP sent to your email and phone!');
      setShowOTPModal(true);
    } catch (error) {
      console.error('OTP Send Error:', error);
      const isDev = window.location.hostname === 'localhost';
      
      if (isDev) {
        toast.info('Development Mode: Showing OTP box despite error.');
        setShowOTPModal(true);
      } else {
        toast.error(error.response?.data?.message || 'Failed to send OTP. Please check your network.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setVerifying(true);

    try {
      // 1. Verify OTP
      await verifyOTP(formData.email, otpData.emailOTP, otpData.phoneOTP);
      
      // 2. Register if OTP valid
      const { confirmPassword, ...registerData } = formData;
      const data = await register(registerData);
      toast.success('Registration successful!');

      // Redirect based on role
      switch (data.user.role) {
        case 'donor':
          navigate('/donor/dashboard');
          break;
        case 'hospital':
          navigate('/hospital/dashboard');
          break;
        case 'admin':
          navigate('/admin/dashboard');
          break;
        default:
          navigate('/');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="glass-card p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-pink-500 rounded-full mb-4">
              <Heart className="w-8 h-8 text-white" fill="white" />
            </div>
            <h2 className="text-3xl font-bold gradient-text">Create Account</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Join us in saving lives</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">I am a</label>
              <div className="grid grid-cols-3 gap-4">
                {['donor', 'hospital', 'admin'].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setFormData({ ...formData, role })}
                    className={`px-4 py-3 rounded-lg border-2 font-medium capitalize transition-all ${
                      formData.role === role
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                        : 'border-gray-300 dark:border-gray-600 hover:border-primary-300'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {/* Name Fields */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">First Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="input-field pl-10"
                    placeholder="John"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Last Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="input-field pl-10"
                    placeholder="Doe"
                  />
                </div>
              </div>
            </div>

            {/* Contact Fields */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="input-field pl-10"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    pattern="[0-9]{10}"
                    className="input-field pl-10"
                    placeholder="1234567890"
                  />
                </div>
              </div>
            </div>

            {/* Password Fields */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={8}
                    className="input-field pl-10"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="input-field pl-10"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-sm">
            <p className="text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </motion.div>

      {/* OTP Verification Modal */}
      <AnimatePresence>
        {showOTPModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowOTPModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700"
            >
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full mb-4">
                  <Mail className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-2xl font-bold">Verify Your Identity</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  We've sent verification codes to your email and phone
                </p>
              </div>

              <form onSubmit={handleVerifyAndRegister} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Email OTP</label>
                  <input
                    type="text"
                    name="emailOTP"
                    value={otpData.emailOTP}
                    onChange={handleOTPChange}
                    required
                    className="input-field text-center text-2xl tracking-[10px] font-bold"
                    placeholder="000000"
                    maxLength={6}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Phone OTP</label>
                  <input
                    type="text"
                    name="phoneOTP"
                    value={otpData.phoneOTP}
                    onChange={handleOTPChange}
                    required
                    className="input-field text-center text-2xl tracking-[10px] font-bold"
                    placeholder="000000"
                    maxLength={6}
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    type="submit"
                    disabled={verifying}
                    className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-2"
                  >
                    {verifying ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify & Register'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowOTPModal(false)}
                    className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium"
                  >
                    Cancel and Edit Details
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RegisterPage;
