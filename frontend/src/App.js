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

function Layout({ sidebarOpen, setSidebarOpen, children }) {
  const location = useLocation();

  const hideSidebar =
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname === "/verify" ||
    location.pathname === "/logout" ||
    location.pathname === "/reset-password" ||
    location.pathname === "/reset-verify";

  if (hideSidebar) return <>{children}</>;

  return (
    <div className="flex min-h-screen">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main content — on mobile takes full width, on desktop shifts right */}
      <div
        className={`
          flex-1 min-w-0 transition-all duration-300
          pt-16 lg:pt-0
          lg:${sidebarOpen ? 'ml-64' : 'ml-16'}
        `}
      >
        {children}
      </div>
    </div>
  );
}

function App() {
  // Start sidebar closed on mobile, open on desktop
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="App min-h-screen bg-[#050505] text-white">
      <BrowserRouter>
        <Layout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
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
