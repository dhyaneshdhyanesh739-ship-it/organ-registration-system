import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Phone, ArrowLeft, Loader, ShieldCheck, Lock } from 'lucide-react';
import resetHero from '../assets/reset_hero.png';
import { useToast } from '../context/ToastContext';
import axios from 'axios';

const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1); // 1: Send OTP, 2: Reset Password
  const [method, setMethod] = useState('email'); // 'email' | 'phone'
  const [inputValue, setInputValue] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = { email: inputValue };
      // Note: Backend endpoint is /api/auth/forgot-password for reset flow
      const response = await axios.post('/api/auth/forgot-password', payload);
      
      if (response.data.success) {
        toast.success('Verification code sent to your email!');
        
        // If developer OTP is returned, show it for easy testing
        if (response.data._dev_otp) {
          toast.info(`DEBUG MODE: Your code is ${response.data._dev_otp}`, { duration: 10000 });
        }
        
        setStep(2);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset code. Make sure your email is correct.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = { 
        email: inputValue, 
        otp, 
        newPassword 
      };
      const response = await axios.post('/api/auth/reset-password', payload);
      
      if (response.data.success) {
        toast.success('Password reset successful! You can now login.');
        navigate('/login');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid code or reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-5xl bg-[#1a1c2e] rounded-[2rem] overflow-hidden shadow-2xl flex flex-col md:flex-row relative z-10 border border-white/5"
      >
        <div className="md:w-1/2 relative h-48 md:h-auto overflow-hidden">
          <img src={resetHero} alt="Reset Password Hero" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
        </div>

        <div className="md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center text-white relative">
          <Link to="/login" className="absolute top-6 left-6 flex items-center gap-2 text-gray-400 hover:text-white transition-all group">
            <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            <span>Back to Login</span>
          </Link>

          <div className="mb-10 mt-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500/10 rounded-xl mb-4 text-green-500">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-extrabold mb-2">
              {step === 1 ? 'Reset Password' : 'Verifying Account'}
            </h1>
            <p className="text-gray-400 font-medium text-lg leading-snug">
              {step === 1 
                ? 'Choose how you want to receive your verification code.' 
                : 'Enter the 6-digit code sent to your email and your new password.'}
            </p>
          </div>

          {step === 1 ? (
            <>
              <div className="flex p-1 bg-[#2a2d45] rounded-xl mb-8">
                <button
                  onClick={() => { setMethod('email'); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-all ${method === 'email' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                  <Mail className="w-4 h-4" />
                  Email
                </button>
                <button
                  type="button"
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-all text-gray-500 cursor-not-allowed opacity-50"
                  disabled
                >
                  <Phone className="w-4 h-4" />
                  SMS
                </button>
              </div>

              <form onSubmit={handleSendOTP} className="space-y-6">
                <div className="space-y-2">
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-white transition-colors" />
                    <input
                      type="email"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      required
                      className="w-full bg-[#2a2d45] border border-white/10 rounded-xl py-5 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all font-medium text-lg"
                      placeholder="Email Address"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !inputValue}
                  className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-900/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Sending code...
                    </>
                  ) : (
                    'Send Verification Code'
                  )}
                </button>
              </form>
            </>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="space-y-4">
                <div className="relative group">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-white transition-colors" />
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    className="w-full bg-[#2a2d45] border border-white/10 rounded-xl py-5 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all font-bold tracking-[0.5em] text-center text-xl"
                    placeholder="000000"
                  />
                </div>

                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-white transition-colors" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full bg-[#2a2d45] border border-white/10 rounded-xl py-5 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all font-medium text-lg"
                    placeholder="New Password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length < 6 || newPassword.length < 8}
                className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-900/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  'Confirm & Update Password'
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-center text-gray-400 hover:text-white transition-colors text-sm font-medium"
              >
                Use a different email address
              </button>
            </form>
          )}

          <p className="mt-8 text-center text-sm text-gray-500">
            Check your inbox after sending. Verification codes are valid for 10 minutes.
            <br />
            Found your password? <Link to="/login" className="text-green-500 hover:underline">Login here</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
