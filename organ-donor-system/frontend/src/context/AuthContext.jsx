import { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is logged in on mount
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

    const login = async (credentials) => {
    const data = await authService.login(credentials);
    setUser(data.user);
    setIsAuthenticated(true);
    return data;
  };

  const googleLogin = async (token, role, isAccessToken = false) => {
    const data = await authService.googleLogin(token, role, isAccessToken);
    setUser(data.user);
    setIsAuthenticated(true);
    return data;
  };

  const facebookLogin = async (accessToken, role) => {
    const data = await authService.facebookLogin(accessToken, role);
    setUser(data.user);
    setIsAuthenticated(true);
    return data;
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    setUser(data.user);
    setIsAuthenticated(true);
    return data;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
    }
  };

  const sendOTP = async (email, phone) => {
    return await authService.sendOTP(email, phone);
  };

  const verifyOTP = async (email, phoneOTP) => {
    return await authService.verifyOTP(email, phoneOTP);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    googleLogin,
    facebookLogin,
    register,
    logout,
    sendOTP,
    verifyOTP,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;
