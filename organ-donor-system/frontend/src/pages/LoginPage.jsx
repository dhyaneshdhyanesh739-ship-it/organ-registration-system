import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Heart, Mail, Lock, Loader, Eye, EyeOff } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import FacebookLogin from 'react-facebook-login-lite';
import debounce from 'lodash.debounce';
import authBg from '../assets/auth_bg.png';
import loginHero from '../assets/login_hero.png';


const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [pendingGoogleToken, setPendingGoogleToken] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [pendingFacebookToken, setPendingFacebookToken] = useState(null);
  const [emailStatus, setEmailStatus] = useState({ state: 'idle', message: '' }); // 'idle', 'checking', 'valid', 'invalid'
  const { login, googleLogin, facebookLogin } = useAuth();
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
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001/api'}/auth/validate-email`, {
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

  const handleSocialSuccess = (data) => {
    toast.success('Login successful!');
    if (data?.user?.role) {
      switch (data.user.role) {
        case 'donor': navigate('/donor/dashboard'); break;
        case 'hospital': navigate('/hospital/dashboard'); break;
        case 'admin': navigate('/admin/dashboard'); break;
        case 'receiver': navigate('/receiver/dashboard'); break;
        default: navigate('/');
      }
    } else {
      navigate('/');
    }
  };

  const signInWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const data = await googleLogin(tokenResponse.access_token, undefined, true);
        handleSocialSuccess(data);
      } catch (error) {
        const msg = error.response?.data?.message || error.message || 'Unknown error';
        if (msg.toLowerCase().includes('role')) {
          setPendingGoogleToken(tokenResponse.access_token);
          setShowRoleModal(true);
        } else {
          toast.error(`Google Login failed: ${msg}`);
        }
      } finally {
        setLoading(false);
      }
    },
    onError: (err) => {
      console.error('Google useGoogleLogin onError:', err);
      toast.error('Google sign-in failed. Please try again.');
    },
    flow: 'implicit',
  });

  const handleRoleSelect = async (role) => {
    setShowRoleModal(false);
    setLoading(true);
    try {
      if (pendingGoogleToken) {
        const data = await googleLogin(pendingGoogleToken, role, true);
        handleSocialSuccess(data);
      } else if (pendingFacebookToken) {
        const data = await facebookLogin(pendingFacebookToken, role);
        handleSocialSuccess(data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Social Login failed. Please try again.');
    } finally {
      setLoading(false);
      setPendingGoogleToken(null);
      setPendingFacebookToken(null);
    }
  };

  const onFacebookSuccess = async (response) => {
    setLoading(true);
    try {
      const data = await facebookLogin(response.authResponse.accessToken);
      handleSocialSuccess(data);
    } catch (error) {
      const msg = error.response?.data?.message || '';
      if (msg.toLowerCase().includes('role')) {
        setPendingFacebookToken(response.authResponse.accessToken);
        setShowRoleModal(true);
      } else {
        toast.error(error.response?.data?.message || 'Facebook Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (name === 'email') {
      checkEmailValidity(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Attempting login with:', formData.email);
      const data = await login(formData);
      console.log('Login success data:', data);
      toast.success('Login successful!');
      
      // Redirect based on role
      if (data?.user?.role) {
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
      } else {
        console.warn('No user role found in response, redirecting to home');
        navigate('/');
      }
    } catch (error) {
      console.error('Login detailed error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Login failed - Check your connection';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
      {/* Background with Ambient Glow */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl bg-[#1a1c2e] rounded-[2rem] overflow-hidden shadow-2xl flex flex-col md:flex-row relative z-10 border border-white/5"
      >
        {/* Left Side: Hero Image */}
        <div className="md:w-1/2 relative h-64 md:h-auto overflow-hidden">
          <img 
            src={loginHero} 
            alt="Life-giving Donation Illustration" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
          
          {/* Subtle Floating Elements Effect */}
          <div className="absolute inset-0 pointer-events-none opacity-40">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white rounded-full blur-sm"
                animate={{
                  y: [-20, 20, -20],
                  opacity: [0.2, 0.5, 0.2],
                  scale: [1, 1.5, 1]
                }}
                transition={{
                  duration: 4 + i,
                  repeat: Infinity,
                  delay: i * 0.5
                }}
                style={{
                  top: `${20 + (i * 15)}%`,
                  left: `${10 + (i * 12)}%`
                }}
              />
            ))}
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center text-white relative">
          {/* Close Button Placeholder */}
          <Link to="/" className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Link>

          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-extrabold mb-2 text-white">Organ Donor Registration</h1>
            <p className="text-gray-400 text-lg font-medium">Give the Gift of Life, Save Lives</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-white transition-colors" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#2a2d45] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all font-medium"
                  placeholder="Email Address"
                />
              </div>
              {formData.email && (
                <div className={`text-sm pl-2 font-medium flex items-center gap-2 ${
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

            <div className="space-y-2">
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-white transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#2a2d45] border border-white/10 rounded-xl py-4 pl-12 pr-12 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all font-medium"
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-white/10 bg-[#2a2d45] text-green-500 focus:ring-0 focus:ring-offset-0 transition-all" />
                <span className="text-gray-400 group-hover:text-white transition-colors">Remember Me</span>
              </label>
              <Link to="/forgot-password" size="sm" className="text-gray-400 hover:text-white transition-colors">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-900/40 transform hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#1a1c2e] px-4 text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <button
                type="button"
                onClick={() => signInWithGoogle()}
                disabled={loading}
                className="flex items-center justify-center gap-3 w-full bg-white hover:bg-gray-100 text-gray-800 font-semibold py-3 px-4 rounded-xl border border-gray-200 transition-all shadow-sm disabled:opacity-50"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                {loading ? 'Signing in...' : 'Continue with Google'}
              </button>
              <FacebookLogin
                appId={import.meta.env.VITE_FACEBOOK_APP_ID || "917323987700289"}
                scope="public_profile,email"
                onSuccess={onFacebookSuccess}
                onFailure={() => toast.error('Facebook Login Failed')}
                btnText="Continue with Facebook"
              />
            </div>
          </form>

          <p className="mt-10 text-center text-gray-400">
            New to Organ Donation?{' '}
            <Link to="/register" className="text-green-500 hover:text-green-400 font-bold ml-1 transition-colors">
              Register Now
            </Link>
          </p>
        </div>
      </motion.div>

      {/* Role Selection Modal for new Google users */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1a1c2e] border border-white/10 rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl"
          >
            <h2 className="text-2xl font-bold text-white mb-2">Welcome!</h2>
            <p className="text-gray-400 mb-6">This is your first time signing in with Google. Please select your role to continue:</p>
            <div className="grid grid-cols-1 gap-3">
              {[
                { value: 'donor', label: '🫀 Organ Donor', desc: 'Register to donate organs' },
                { value: 'receiver', label: '🏥 Organ Receiver', desc: 'Request an organ transplant' },
                { value: 'hospital', label: '🏨 Hospital', desc: 'Manage donations & requests' },
              ].map((r) => (
                <button
                  key={r.value}
                  onClick={() => handleRoleSelect(r.value)}
                  className="flex flex-col items-start p-4 rounded-xl bg-[#2a2d45] border border-white/5 hover:border-green-500/50 hover:bg-[#2a2d55] transition-all text-left"
                >
                  <span className="text-white font-semibold">{r.label}</span>
                  <span className="text-gray-400 text-sm">{r.desc}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => { setShowRoleModal(false); setPendingGoogleToken(null); }}
              className="mt-4 w-full text-gray-500 hover:text-white text-sm transition-colors"
            >
              Cancel
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
