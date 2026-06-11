import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Heart, Mail, Lock, User, Phone, Loader, X } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import FacebookLogin from 'react-facebook-login-lite';
import debounce from 'lodash.debounce';
import { countries } from '../utils/countryData';
import registerHero from '../assets/register_hero.png';

const ADMIN_EMAIL = 'dhyaneshdhyanesh739@gmail.com';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'donor',
    firstName: '',
    lastName: '',
    phone: '',
    countryCode: '+91',
  });
  const [loading, setLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [timer, setTimer] = useState(0);
  const [emailStatus, setEmailStatus] = useState({ state: 'idle', message: '' }); // 'idle', 'checking', 'valid', 'invalid'
  
  // Find country by code and name to handle ambiguities (e.g., +1 for US/Canada)
  const selectedCountry = countries.find(c => c.code === formData.countryCode) || countries.find(c => c.name === 'India') || countries[0];

  const filteredCountries = countries.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.code.includes(searchQuery)
  );

  const { register, googleLogin, facebookLogin } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // Create a debounced function to check email validity
  const checkEmailValidity = useCallback(
    debounce(async (email) => {
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setEmailStatus({ state: 'invalid', message: 'Your Mail ID is Not Valid!!!Please Enter The Correct Mail ID' });
        return;
      }
      
      setEmailStatus({ state: 'checking', message: 'Verifying email address...' });
      
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/validate-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        
        const data = await response.json();
        
        if (data.valid) {
          setEmailStatus({ state: 'valid', message: 'Your Mail ID is Valid' });
        } else {
          setEmailStatus({ state: 'invalid', message: 'Your Mail ID is Not Valid!!!Please Enter The Correct Mail ID' });
        }
      } catch (error) {
        console.error('Email validation error:', error);
        // Fallback to basic regex if API fails
        setEmailStatus({ state: 'valid', message: 'Your Mail ID is Valid' });
      }
    }, 800),
    []
  );

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleSendOtp = async () => {
    if (formData.phone.length !== selectedCountry.length) {
      toast.error(`Please enter a valid ${selectedCountry.length}-digit phone number`);
      return;
    }
    if (!formData.email) {
      toast.error('Please enter your email first');
      return;
    }

    setIsSendingOtp(true);
    try {
      // In a real app, you'd use your api instance, but here we'll assume axios is available or use fetch
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          phone: `${selectedCountry.code}${formData.phone}`
        })
      });
      const data = await response.json();
      if (data.success) {
        setShowOtpInput(true);
        setTimer(60);
        toast.success(data.message || 'Verification code sent to your phone');
        if (data._dev_otp) console.log('DEBUG: OTP is', data._dev_otp);
      } else {
        if (data.message.includes('not configured')) {
          toast.error('SMS Service not configured. Please add your FAST2SMS_API_KEY to the .env file.');
        } else {
          toast.error(data.message || 'Failed to send OTP');
        }
      }
    } catch (error) {
      toast.error('Server error. Please try again.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    // Ensure email is provided
    if (!formData.email) {
      toast.error('Email is required for verification');
      return;
    }
    // Validate OTP length
    if (otp.length !== 6) {
      toast.error('Please enter the 6-digit code');
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email.trim(),
          phone: `${selectedCountry.code}${formData.phone}`,
          phoneOTP: otp,
        }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setIsPhoneVerified(true);
        setShowOtpInput(false);
        toast.success('Phone number verified successfully');
      } else {
        // Show precise error from server if available
        toast.error(data.message || 'Verification failed. Please try again.');
      }
    } catch (error) {
      toast.error(error.message || 'Verification failed. Please try again.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleSocialSuccess = (data) => {
    toast.success('Registration successful!');
    if (data?.user?.role) {
      navigate(`/${data.user.role}/dashboard`);
    } else {
      navigate('/');
    }
  };

  const signInWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const data = await googleLogin(tokenResponse.access_token, formData.role, true);
        handleSocialSuccess(data);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Google Registration failed');
      } finally {
        setLoading(false);
      }
    },
    onError: () => toast.error('Google Registration Failed'),
    flow: 'implicit'
  });

  const onFacebookSuccess = async (response) => {
    setLoading(true);
    try {
      const data = await facebookLogin(response.authResponse.accessToken, formData.role);
      handleSocialSuccess(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Facebook Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newFormData = { ...formData, [name]: value };

    if (name === 'email' && value.trim().toLowerCase() !== ADMIN_EMAIL.toLowerCase() && formData.role === 'admin') {
      newFormData.role = 'donor';
    }

    setFormData(newFormData);
    
    if (name === 'email') {
      checkEmailValidity(value);
    }
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

    if (formData.phone.length !== selectedCountry.length) {
      toast.error(`Phone number for ${selectedCountry.name} must be ${selectedCountry.length} digits`);
      return;
    }

    if (!isPhoneVerified) {
      toast.error('Please verify your phone number first');
      return;
    }

    setLoading(true);

    // Admin Credentials Restriction
    const ADMIN_PHONE = '7550317811';
    const ADMIN_FIRST_NAME = 'DHYANESH';

    if (formData.role === 'admin') {
      const normalizedEmail = formData.email.trim().toLowerCase();
      const trimmedPhone = formData.phone.trim();
      const normalizedFirstName = formData.firstName.trim().toUpperCase();

      if (
        normalizedEmail !== ADMIN_EMAIL.toLowerCase() ||
        trimmedPhone !== ADMIN_PHONE ||
        normalizedFirstName !== ADMIN_FIRST_NAME
      ) {
        toast.error('Only authorized admin credentials can be used for this role');
        setLoading(false);
        return;
      }
    }

    try {
      const { confirmPassword, ...rawRegisterData } = formData;
      const fullName = rawRegisterData.firstName.trim();
      const nameParts = fullName.split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || firstName;

      const registerData = {
        ...rawRegisterData,
        email: rawRegisterData.email.trim(),
        phone: rawRegisterData.phone.trim(),
        firstName: firstName,
        lastName: lastName,
      };
      
      const data = await register(registerData);
      toast.success('Registration successful!');

      if (data?.user?.role) {
        navigate(`/${data.user.role}/dashboard`);
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Registration Error:', error);
      const errData = error?.response?.data;
      const field = errData?.field;
      const message = errData?.message || errData?.error || 'Registration failed. Please try again.';
      if (field) {
        toast.error(`${field}: ${message}`);
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-4 font-['Inter']">
      <div className="w-full max-w-6xl flex flex-col md:flex-row bg-[#1e293b]/40 backdrop-blur-2xl rounded-[32px] overflow-hidden border border-white/10 shadow-2xl relative">
        <Link to="/" className="absolute top-6 right-6 z-50 text-white/50 hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </Link>

        {/* Left Side - Cinematic Hero */}
        <div className="hidden md:block md:w-1/2 relative min-h-[700px]">
          <img 
            src={registerHero} 
            alt="Life saving" 
            className="absolute inset-0 w-full h-full object-cover grayscale-[20%] brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#1e293b]/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/60 to-transparent" />
          
          <div className="absolute bottom-12 left-12 right-12 text-white z-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-red-500/20 backdrop-blur-lg rounded-xl border border-red-500/30">
                  <Heart className="w-6 h-6 text-red-500" fill="#ef4444" />
                </div>
                <span className="text-red-400 font-semibold tracking-wider uppercase text-xs">A Noble Cause</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-4">
                Be the reason for <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-500">someone's smile.</span>
              </h1>
              <p className="text-white/60 text-lg max-w-md">
                Your decision to register as a donor can spark a miracle in someone's life. Join our global community of life-savers today.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-[#1e293b]/20">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
            <p className="text-white/50">Join us in saving lives</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-white/70">I am a</label>
              <div className="flex gap-4">
                {['donor', 'receiver', 'hospital'].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setFormData({ ...formData, role })}
                    className={`flex-1 py-2.5 rounded-xl border-2 font-semibold capitalize transition-all duration-300 text-sm ${
                      formData.role === role
                        ? 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/20'
                        : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {/* Name Input */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-red-400 transition-colors">
                <User className="w-5 h-5" />
              </div>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:bg-white/10 transition-all"
                placeholder="Full Name"
              />
            </div>

            {/* Email Input */}
            <div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-red-400 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:bg-white/10 transition-all"
                  placeholder="Email Address"
                />
              </div>
              {formData.email && (
                <div className={`text-sm mt-2 pl-2 font-medium flex items-center gap-2 ${
                  emailStatus.state === 'valid' ? 'text-green-500' : 
                  emailStatus.state === 'invalid' ? 'text-red-500' : 
                  'text-yellow-500'
                }`}>
                  {emailStatus.state === 'checking' && <Loader className="w-3 h-3 animate-spin" />}
                  {emailStatus.message || (
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
                      ? 'Your Mail ID is Valid'
                      : 'Your Mail ID is Not Valid!!!Please Enter The Correct Mail ID'
                  )}
                </div>
              )}
            </div>

            {/* Phone Input with Searchable Country Selector */}
            <div className="flex gap-2">
              <div className="relative w-32">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full h-full bg-white/5 border border-white/10 rounded-2xl py-4 px-3 text-white flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:bg-white/10 transition-all text-sm"
                >
                  <div className="flex items-center gap-2 truncate">
                    <img 
                      src={`https://flagcdn.com/w20/${selectedCountry.iso.toLowerCase()}.png`}
                      alt={selectedCountry.name}
                      className="w-5 h-auto rounded-sm opacity-90 shadow-sm"
                    />
                    <span>{selectedCountry.code}</span>
                  </div>
                  <svg className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div className="country-dropdown-container">
                    <input
                      type="text"
                      autoFocus
                      placeholder="Search country..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="country-search-input"
                    />
                    <div className="country-list">
                      {filteredCountries.map((c) => (
                        <button
                          key={`${c.name}-${c.code}`}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, countryCode: c.code });
                            setIsDropdownOpen(false);
                            setSearchQuery('');
                          }}
                          className={`country-item ${formData.countryCode === c.code ? 'active' : ''}`}
                        >
                          <img 
                            src={`https://flagcdn.com/w20/${c.iso.toLowerCase()}.png`}
                            alt={c.name}
                            className="w-5 h-auto rounded-sm"
                          />
                          <span className="flex-1 truncate">{c.name}</span>
                          <span className="text-white/40">{c.code}</span>
                        </button>
                      ))}
                      {filteredCountries.length === 0 && (
                        <div className="px-4 py-3 text-white/40 text-sm italic">No countries found</div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Close dropdown on click outside */}
                {isDropdownOpen && (
                  <div 
                    className="fixed inset-0 z-[90]" 
                    onClick={() => setIsDropdownOpen(false)}
                  />
                )}
              </div>

              <div className="relative group flex-1">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-red-400 transition-colors">
                  <Phone className="w-5 h-5" />
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, selectedCountry.length);
                    setFormData({ ...formData, phone: value });
                  }}
                  required
                  disabled={isPhoneVerified}
                  className={`w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:bg-white/10 transition-all font-mono ${isPhoneVerified ? 'opacity-50 cursor-not-allowed border-green-500/50' : ''}`}
                  placeholder={`Phone Number (${selectedCountry.length} digits)`}
                />
                {isPhoneVerified && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>

              {!isPhoneVerified && (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isSendingOtp || formData.phone.length !== selectedCountry.length}
                  className="px-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium whitespace-nowrap"
                >
                  {isSendingOtp ? <Loader className="w-4 h-4 animate-spin mx-auto" /> : 'Verify'}
                </button>
              )}
            </div>

            {/* OTP Input Field */}
            {showOtpInput && !isPhoneVerified && (
              <div className="space-y-3 transition-all duration-300">
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-red-400 transition-colors">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit OTP"
                    className="w-full bg-white/5 border border-red-500/30 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:bg-white/10 transition-all font-mono tracking-[0.5em] text-center"
                  />
                </div>
                <div className="flex items-center justify-between px-2">
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={isVerifyingOtp || otp.length !== 6}
                    className="flex-1 bg-red-500 text-white rounded-xl py-3 text-sm font-semibold hover:bg-red-600 disabled:opacity-50 transition-all shadow-lg shadow-red-500/20"
                  >
                    {isVerifyingOtp ? <Loader className="w-4 h-4 animate-spin mx-auto" /> : 'Confirm OTP'}
                  </button>
                  <div className="mx-4 text-sm text-white/40">
                    {timer > 0 ? (
                      <span>Resend in {timer}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="text-red-400 hover:underline"
                      >
                        Resend Code
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Password Input */}
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-red-400 transition-colors">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:bg-white/10 transition-all"
                placeholder="Password"
              />
            </div>

            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-red-400 transition-colors">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:bg-white/10 transition-all"
                placeholder="Confirm Password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold py-4 rounded-2xl shadow-lg shadow-red-500/30 transition-all duration-300 transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader className="w-5 h-5 animate-spin" /> : 'Register'}
            </button>
          </form>

          {/* Social Logins */}
          <div className="mt-8 flex flex-col gap-4">
            <button
              type="button"
              onClick={() => signInWithGoogle()}
              disabled={loading}
              className="flex items-center justify-center gap-3 w-full bg-white hover:bg-gray-100 text-gray-800 font-semibold py-3.5 px-4 rounded-xl border border-gray-200 transition-all shadow-sm disabled:opacity-50"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="text-sm">Sign up with Google</span>
            </button>
            <FacebookLogin
              appId={import.meta.env.VITE_FACEBOOK_APP_ID || "917323987700289"}
              scope="public_profile,email"
              onSuccess={onFacebookSuccess}
              onFailure={() => toast.error('Facebook Registration Failed')}
              btnText="Continue with Facebook"
            />
          </div>

          <div className="mt-8 text-center text-sm">
            <span className="text-white/40">Already have an account? </span>
            <Link to="/login" className="text-emerald-400 font-bold hover:text-emerald-300 transition-colors">
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
