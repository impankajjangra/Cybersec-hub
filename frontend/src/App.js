import { useState } from 'react';
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

/* ---------- AUTH GUARD ---------- */

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

/* ---------- BLOCK AUTH PAGES IF LOGGED IN ----------
   FIX: Only redirect away from login if we have OUR app token (JWT with "sub").
   This prevents blocking the Microsoft redirect flow which briefly
   lands on /login before index.js completes the backend token exchange.
*/
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  if (token) {
    // Verify it's our own JWT (has a "sub" field), not some leftover MSAL state
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.sub) {
        return <Navigate to="/" replace />;
      }
    } catch {
      // Not a valid JWT — don't redirect
    }
  }

  return children;
};

/* ---------- LAYOUT WRAPPER ---------- */

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
    <div className="flex">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-16"}`}>
        {children}
      </div>
    </div>
  );
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="App min-h-screen bg-[#050505] text-white">
      <BrowserRouter>
        <Layout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
          <Routes>

            {/* PUBLIC ROUTES */}
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
            <Route path="/verify" element={<VerifyOTP />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
            <Route path="/reset-verify" element={<ResetVerifyOTP />} />

            {/* PROTECTED ROUTES */}
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
