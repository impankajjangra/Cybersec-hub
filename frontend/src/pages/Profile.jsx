import { useState, useEffect } from 'react';
import { User, Shield, Key, LogOut, Mail, Calendar, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/axiosConfig';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL;

export default function Profile() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('overview');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);

    // Get user info from token + fetch name from backend
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const email = payload.sub;
        const joinedAt = payload.iat ? new Date(payload.iat * 1000).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';
        setUser({ email, joinedAt, name: email.split('@')[0] });
      } catch {}
    }

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) { toast.error('Please fill all fields'); return; }
    if (newPassword !== confirmPassword) { toast.error('New passwords do not match'); return; }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(newPassword)) {
      toast.error('Weak password — need uppercase, lowercase, number & special char'); return;
    }
    try {
      setLoading(true);
      await axios.post(`${API}/auth/login`, { email: user.email, password: oldPassword });
      await axios.post(`${API}/auth/reset-password`, { email: user.email, new_password: newPassword });
      toast.success('Password updated successfully');
      setOldPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed — check your current password');
    } finally { setLoading(false); }
  };

  const handleLogout = () => {
    sessionStorage.clear(); localStorage.clear();
    window.location.href = '/';
  };

  const navItems = [
    { id: 'overview', icon: User, label: 'Overview' },
    { id: 'password', icon: Key, label: 'Change Password' },
  ];

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px 16px' }}>
      <div style={{ marginBottom: '18px' }}>
        <h1 style={{ fontSize: 'clamp(20px, 3vw, 30px)', fontWeight: 'bold', color: 'white', letterSpacing: '3px', margin: 0 }}>
          USER <span style={{ color: '#FF3B30' }}>PROFILE</span>
        </h1>
        <p style={{ color: '#71717a', fontSize: '12px', marginTop: '3px' }}>Manage your account settings</p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '200px 1fr',
        gap: '14px'
      }}>

        {/* Sidebar */}
        <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '14px', height: 'fit-content' }}>

          {/* Avatar + Info */}
          <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'row' : 'column',
            alignItems: isMobile ? 'center' : 'center',
            gap: isMobile ? '14px' : '0',
            padding: '12px 0',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            marginBottom: '10px'
          }}>
            <div style={{
              width: isMobile ? '48px' : '56px',
              height: isMobile ? '48px' : '56px',
              borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #FF3B30, #7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: isMobile ? '18px' : '22px', fontWeight: 'bold', color: 'white',
              marginBottom: isMobile ? '0' : '8px'
            }}>
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div style={{ textAlign: isMobile ? 'left' : 'center' }}>
              <p style={{ color: 'white', fontFamily: 'monospace', fontSize: '12px', fontWeight: 'bold', margin: '0 0 2px', textTransform: 'capitalize' }}>
                {user?.name || 'User'}
              </p>
              <p style={{ color: '#6b7280', fontFamily: 'monospace', fontSize: '10px', margin: '0 0 6px', wordBreak: 'break-all' }}>
                {user?.email}
              </p>
              <span style={{
                padding: '2px 10px', fontSize: '9px', fontFamily: 'monospace',
                background: 'rgba(16,185,129,0.1)', color: '#10B981',
                border: '1px solid rgba(16,185,129,0.2)', borderRadius: '20px'
              }}>
                FREE PLAN
              </span>
            </div>
          </div>

          {/* Nav — horizontal on mobile */}
          <div style={{ display: 'flex', flexDirection: isMobile ? 'row' : 'column', gap: '4px', flexWrap: 'wrap' }}>
            {navItems.map(({ id, icon: Icon, label }) => (
              <button key={id} onClick={() => setTab(id)} style={{
                flex: isMobile ? '1' : 'unset',
                display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'center' : 'flex-start',
                gap: '8px', padding: '9px 10px', borderRadius: '4px',
                border: 'none', cursor: 'pointer',
                background: tab === id ? 'rgba(255,59,48,0.1)' : 'transparent',
                color: tab === id ? '#FF3B30' : '#9ca3af',
                fontFamily: 'monospace', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px'
              }}>
                <Icon size={13} />
                <span style={{ display: isMobile ? 'none' : 'inline' }}>{label}</span>
                <span style={{ display: isMobile ? 'inline' : 'none', fontSize: '10px' }}>{label.split(' ')[0]}</span>
              </button>
            ))}

            <button onClick={handleLogout} style={{
              flex: isMobile ? '1' : 'unset',
              display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'center' : 'flex-start',
              gap: '8px', padding: '9px 10px', borderRadius: '4px',
              border: isMobile ? 'none' : '1px solid rgba(255,59,48,0.2)',
              marginTop: isMobile ? '0' : '8px',
              cursor: 'pointer', background: 'transparent', color: '#FF3B30',
              fontFamily: 'monospace', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px'
            }}>
              <LogOut size={13} />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Main Panel */}
        <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '18px' }}>

          {tab === 'overview' && (
            <div>
              <h2 style={{ color: 'white', fontFamily: 'monospace', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px' }}>
                Account Overview
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { icon: User, label: 'Display Name', value: user?.name || 'N/A' },
                  { icon: Mail, label: 'Email Address', value: user?.email || 'N/A' },
                  { icon: Calendar, label: 'Member Since', value: user?.joinedAt || 'N/A' },
                  { icon: Shield, label: 'Account Type', value: 'Free Plan' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px 14px', background: 'rgba(255,255,255,0.02)',
                    borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)'
                  }}>
                    <div style={{ background: 'rgba(255,59,48,0.08)', padding: '7px', borderRadius: '4px', flexShrink: 0 }}>
                      <Icon size={14} color="#FF3B30" />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ color: '#6b7280', fontFamily: 'monospace', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 2px' }}>{label}</p>
                      <p style={{ color: 'white', fontFamily: 'monospace', fontSize: '12px', margin: 0, wordBreak: 'break-all' }}>{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '16px', padding: '14px', background: 'rgba(255,59,48,0.04)', border: '1px solid rgba(255,59,48,0.12)', borderRadius: '6px' }}>
                <h3 style={{ color: '#FF3B30', fontFamily: 'monospace', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>
                  Current Plan — Free
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '4px' }}>
                  {['✓ Network Port Scanning', '✓ OSINT Intelligence', '✓ AI Threat Detection', '✓ Leaked Data Search', '✓ Scan History', '✓ Dashboard Analytics'].map(f => (
                    <p key={f} style={{ color: '#9ca3af', fontFamily: 'monospace', fontSize: '11px', margin: 0 }}>{f}</p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'password' && (
            <div>
              <h2 style={{ color: 'white', fontFamily: 'monospace', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px' }}>
                Change Password
              </h2>
              <div style={{ maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { placeholder: 'Current Password', value: oldPassword, set: setOldPassword },
                  { placeholder: 'New Password', value: newPassword, set: setNewPassword },
                  { placeholder: 'Confirm New Password', value: confirmPassword, set: setConfirmPassword },
                ].map(({ placeholder, value, set }) => (
                  <input key={placeholder} type="password" placeholder={placeholder} value={value}
                    onChange={e => set(e.target.value)} style={inputStyle} />
                ))}
                <p style={{ color: '#6b7280', fontSize: '10px', fontFamily: 'monospace' }}>
                  Must include uppercase, lowercase, number &amp; special character
                </p>
                <button onClick={handleChangePassword} disabled={loading} style={btnStyle}>
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  padding: '10px 12px', background: '#000', border: '1px solid #374151',
  color: 'white', fontSize: '13px', borderRadius: '4px', outline: 'none',
  fontFamily: 'inherit', width: '100%', boxSizing: 'border-box'
};
const btnStyle = {
  padding: '10px', background: '#FF3B30', color: 'white', border: 'none',
  borderRadius: '4px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '12px',
  textTransform: 'uppercase', letterSpacing: '2px'
};