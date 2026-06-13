import { useState, useEffect } from 'react';
import '@/App.css';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import Dashboard from '@/pages/Dashboard';
import NetworkScanner from '@/pages/NetworkScanner';
import OSINTPage from '@/pages/OSINTPage';
import ThreatDetection from '@/pages/ThreatDetection';
import TelegramIntegration from '@/pages/TelegramIntegration';
import ScanHistory from '@/pages/ScanHistory';
import Profile from '@/pages/Profile';
import AboutUs from '@/pages/AboutUs';

import Landing from '@/pages/Landing';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import VerifyOTP from '@/pages/VerifyOTP';
import ResetPassword from '@/pages/ResetPassword';
import ResetVerifyOTP from '@/pages/ResetVerifyOTP';

import Sidebar from '@/components/Sidebar';
import Logout from './components/ui/Logout';
import { Toaster } from '@/components/ui/sonner';

const PrivateRoute = ({ children }) => {
  const token = sessionStorage.getItem('token') || localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

// Root route — shows Landing page for guests, Dashboard for logged-in users
const HomeRoute = ({ children }) => {
  const token = sessionStorage.getItem('token') || localStorage.getItem('token');
  if (!token) return <Navigate to="/landing" replace />;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (!payload.sub) return <Navigate to="/landing" replace />;
  } catch {
    return <Navigate to="/landing" replace />;
  }
  return children;
};

const PublicRoute = ({ children }) => {
  const token = sessionStorage.getItem('token') || localStorage.getItem('token');
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.sub) return <Navigate to="/" replace />;
    } catch {}
  }
  return children;
};

const PUBLIC_PATHS = ['/landing', '/login', '/signup', '/verify', '/logout', '/reset-password', '/reset-verify'];

function Layout({ sidebarOpen, setSidebarOpen, isMobile, children }) {
  const location = useLocation();
  const hideSidebar = PUBLIC_PATHS.includes(location.pathname);

  if (hideSidebar) return <>{children}</>;

  const contentMargin = isMobile ? 0 : sidebarOpen ? 240 : 60;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} isMobile={isMobile} />
      <div style={{
        flex: 1, marginLeft: contentMargin,
        transition: 'margin-left 0.3s',
        minWidth: 0,
        paddingTop: isMobile ? '52px' : '0',
      }}>
        {children}
      </div>
    </div>
  );
}

export default function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handle = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };
    window.addEventListener('resize', handle);
    return () => window.removeEventListener('resize', handle);
  }, []);

  return (
    <div className="App min-h-screen bg-[#050505] text-white">
      <BrowserRouter>
        <Layout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} isMobile={isMobile}>
          <Routes>
            {/* Public */}
            <Route path="/login"          element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/signup"         element={<PublicRoute><Signup /></PublicRoute>} />
            <Route path="/verify"         element={<VerifyOTP />} />
            <Route path="/logout"         element={<Logout />} />
            <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
            <Route path="/reset-verify"   element={<ResetVerifyOTP />} />

            <Route path="/landing"     element={<Landing />} />

            {/* Protected */}
            <Route path="/"           element={<HomeRoute><Dashboard /></HomeRoute>} />
            <Route path="/scanner"    element={<PrivateRoute><NetworkScanner /></PrivateRoute>} />
            <Route path="/osint"      element={<PrivateRoute><OSINTPage /></PrivateRoute>} />
            <Route path="/threats"    element={<PrivateRoute><ThreatDetection /></PrivateRoute>} />
            <Route path="/leakeddata" element={<PrivateRoute><TelegramIntegration /></PrivateRoute>} />
            <Route path="/history"    element={<PrivateRoute><ScanHistory /></PrivateRoute>} />
            <Route path="/profile"    element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/about"      element={<PrivateRoute><AboutUs /></PrivateRoute>} />

            <Route path="*" element={<Navigate to="/landing" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
      <Toaster position="top-right" />
    </div>
  );
}