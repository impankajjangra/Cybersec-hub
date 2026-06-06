import { useState, useEffect } from 'react';
import { User, Shield, Key, LogOut, ChevronRight, Mail, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/axiosConfig';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL;

export default function Profile() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('overview'); // overview | password
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Decode JWT to get email
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ email: payload.sub, joinedAt: new Date(payload.iat * 1000).toLocaleDateString() });
      } catch {}
    }
  }, []);

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill all fields'); return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match'); return;
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(newPassword)) {
      toast.error('Password must have uppercase, lowercase, number & special char'); return;
    }

    try {
      setLoading(true);
      // Verify old password by attempting login
      await axios.post(`${API}/auth/login`, { email: user.email, password: oldPassword });
      // If login succeeds, update password
      await axios.post(`${API}/auth/reset-password`, { email: user.email, new_password: newPassword });
      toast.success('Password updated successfully');
      setOldPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/login';
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px 16px' }}>

      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 'bold', color: 'white', letterSpacing: '3px', margin: 0 }}>
          USER <span style={{ color: '#FF3B30' }}>PROFILE</span>
        </h1>
        <p style={{ color: '#71717a', fontSize: '13px', marginTop: '4px' }}>Manage your account settings</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '16px' }}>

        {/* Sidebar */}
        <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '12px', height: 'fit-content' }}>

          {/* Avatar */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '8px' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #FF3B30, #7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '8px'
            }}>
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <p style={{ color: 'white', fontFamily: 'monospace', fontSize: '12px', textAlign: 'center', wordBreak: 'break-all' }}>
              {user?.email}
            </p>
            <span style={{
              marginTop: '6px', padding: '2px 10px', fontSize: '10px',
              fontFamily: 'monospace', background: 'rgba(16,185,129,0.1)',
              color: '#10B981', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '20px'
            }}>
              FREE PLAN
            </span>
          </div>

          {/* Nav */}
          {[
            { id: 'overview', icon: User, label: 'Overview' },
            { id: 'password', icon: Key, label: 'Change Password' },
          ].map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => setTab(id)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 12px', borderRadius: '4px', border: 'none', cursor: 'pointer',
              background: tab === id ? 'rgba(255,59,48,0.1)' : 'transparent',
              color: tab === id ? '#FF3B30' : '#9ca3af',
              fontFamily: 'monospace', fontSize: '12px', textTransform: 'uppercase',
              letterSpacing: '1px', marginBottom: '2px'
            }}>
              <Icon size={14} />
              {label}
              {tab === id && <ChevronRight size={12} style={{ marginLeft: 'auto' }} />}
            </button>
          ))}

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '8px', paddingTop: '8px' }}>
            <button onClick={handleLogout} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 12px', borderRadius: '4px', border: 'none', cursor: 'pointer',
              background: 'transparent', color: '#FF3B30',
              fontFamily: 'monospace', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px'
            }}>
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '20px' }}>

          {tab === 'overview' && (
            <div>
              <h2 style={{ color: 'white', fontFamily: 'monospace', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '20px' }}>
                Account Overview
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { icon: Mail, label: 'Email Address', value: user?.email },
                  { icon: Calendar, label: 'Member Since', value: user?.joinedAt || 'N/A' },
                  { icon: Shield, label: 'Account Type', value: 'Free Plan' },
                  { icon: User, label: 'Account Status', value: 'Active ✓' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} style={{
                    display: 'flex', alignItems: 'center', gap: '16px',
                    padding: '14px 16px', background: 'rgba(255,255,255,0.02)',
                    borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)'
                  }}>
                    <div style={{ background: 'rgba(255,59,48,0.1)', padding: '8px', borderRadius: '4px' }}>
                      <Icon size={16} color="#FF3B30" />
                    </div>
                    <div>
                      <p style={{ color: '#6b7280', fontFamily: 'monospace', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 2px' }}>
                        {label}
                      </p>
                      <p style={{ color: 'white', fontFamily: 'monospace', fontSize: '13px', margin: 0 }}>
                        {value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Plan info */}
              <div style={{
                marginTop: '20px', padding: '16px',
                background: 'linear-gradient(135deg, rgba(255,59,48,0.05), rgba(124,58,237,0.05))',
                border: '1px solid rgba(255,59,48,0.15)', borderRadius: '6px'
              }}>
                <h3 style={{ color: '#FF3B30', fontFamily: 'monospace', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>
                  Current Plan — Free
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {['✓ Network Port Scanning', '✓ OSINT Intelligence', '✓ Threat Detection (AI)', '✓ Leaked Data Search', '✓ Scan History'].map(f => (
                    <p key={f} style={{ color: '#9ca3af', fontFamily: 'monospace', fontSize: '12px', margin: 0 }}>{f}</p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'password' && (
            <div>
              <h2 style={{ color: 'white', fontFamily: 'monospace', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '20px' }}>
                Change Password
              </h2>

              <div style={{ maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { placeholder: 'Current Password', value: oldPassword, onChange: setOldPassword },
                  { placeholder: 'New Password', value: newPassword, onChange: setNewPassword },
                  { placeholder: 'Confirm New Password', value: confirmPassword, onChange: setConfirmPassword },
                ].map(({ placeholder, value, onChange }) => (
                  <input key={placeholder} type="password" placeholder={placeholder}
                    value={value} onChange={e => onChange(e.target.value)}
                    style={{
                      padding: '10px 12px', background: '#000',
                      border: '1px solid #374151', color: 'white',
                      fontSize: '13px', borderRadius: '4px', outline: 'none',
                      fontFamily: 'inherit', width: '100%', boxSizing: 'border-box'
                    }}
                  />
                ))}

                <p style={{ color: '#6b7280', fontSize: '11px', fontFamily: 'monospace' }}>
                  Must include uppercase, lowercase, number &amp; special character
                </p>

                <button onClick={handleChangePassword} disabled={loading} style={{
                  padding: '11px', background: '#FF3B30', color: 'white',
                  border: 'none', borderRadius: '4px', cursor: 'pointer',
                  fontFamily: 'monospace', fontSize: '13px', textTransform: 'uppercase',
                  letterSpacing: '2px', opacity: loading ? 0.6 : 1
                }}>
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
