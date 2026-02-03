import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DonorDashboard from './pages/DonorDashboard';
import HospitalDashboard from './pages/HospitalDashboard';
import AdminDashboard from './pages/AdminDashboard';
import DonorProfileForm from './components/DonorForm';
import ProtectedRoute from './components/ProtectedRoute';
import OrgansPage from './pages/OrgansPage';
import VoiceAssistant from './components/VoiceAssistant';
import ChatList from './components/ChatList';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        {/* Skip to Content for Accessibility */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] bg-primary-600 text-white px-4 py-2 rounded-lg shadow-xl font-bold transition-all"
        >
          Skip to Main Content
        </a>

        <Navbar />
        <main id="main-content" className="flex-1 outline-none" tabIndex="-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/organs" element={<OrgansPage />} />
            
            {/* Protected Routes */}
            <Route
              path="/donor/dashboard"
              element={
                <ProtectedRoute allowedRoles={['donor']}>
                  <DonorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/donor/profile/create"
              element={
                <ProtectedRoute allowedRoles={['donor']}>
                  <DonorProfileForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/donor/profile/edit"
              element={
                <ProtectedRoute allowedRoles={['donor']}>
                  <DonorProfileForm isEdit={true} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hospital/dashboard"
              element={
                <ProtectedRoute allowedRoles={['hospital']}>
                  <HospitalDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
        <VoiceAssistant />
        <ChatList />
      </div>
    </BrowserRouter>
  );
}

export default App;
