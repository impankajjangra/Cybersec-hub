import { useState, useEffect } from 'react';
import '@/App.css';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import Dashboard from '@/pages/Dashboard';
import NetworkScanner from '@/pages/NetworkScanner';
import OSINTPage from '@/pages/OSINTPage';
import ThreatDetection from '@/pages/ThreatDetection';
import TelegramIntegration from '@/pages/TelegramIntegration';
import ScanHistory from '@/pages/ScanHistory';

import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import VerifyOTP from '@/pages/VerifyOTP';
import ResetPassword from "@/pages/ResetPassword";
import ResetVerifyOTP from "@/pages/ResetVerifyOTP";

import Sidebar from '@/components/Sidebar';
import Logout from './components/ui/Logout';
import { Toaster } from '@/components/ui/sonner';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.sub) return <Navigate to="/" replace />;
    } catch {}
  }
  return children;
};

function Layout({ sidebarOpen, setSidebarOpen, isMobile, children }) {
  const location = useLocation();

  const hideSidebar =
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname === "/verify" ||
    location.pathname === "/logout" ||
    location.pathname === "/reset-password" ||
    location.pathname === "/reset-verify";

  if (hideSidebar) return <>{children}</>;

  // On mobile: content always full width, sidebar overlays
  // On desktop: content shifts based on sidebar width
  const contentMargin = isMobile ? 0 : sidebarOpen ? 256 : 64;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} isMobile={isMobile} />
      <div style={{
        flex: 1,
        marginLeft: contentMargin,
        transition: 'margin-left 0.3s',
        minWidth: 0,
        paddingTop: isMobile ? '56px' : '0',
      }}>
        {children}
      </div>
    </div>
  );
}

function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="App min-h-screen bg-[#050505] text-white">
      <BrowserRouter>
        <Layout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} isMobile={isMobile}>
          <Routes>
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
            <Route path="/verify" element={<VerifyOTP />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
            <Route path="/reset-verify" element={<ResetVerifyOTP />} />

            <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/scanner" element={<PrivateRoute><NetworkScanner /></PrivateRoute>} />
            <Route path="/osint" element={<PrivateRoute><OSINTPage /></PrivateRoute>} />
            <Route path="/threats" element={<PrivateRoute><ThreatDetection /></PrivateRoute>} />
            <Route path="/leakeddata" element={<PrivateRoute><TelegramIntegration /></PrivateRoute>} />
            <Route path="/history" element={<PrivateRoute><ScanHistory /></PrivateRoute>} />

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;
