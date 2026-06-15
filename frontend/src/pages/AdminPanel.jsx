import { useState, useEffect } from 'react';
import {
  Users, Radar, Shield, ShieldAlert, UserCheck, UserPlus,
  Search, ChevronLeft, ChevronRight, X, Mail, Globe, Clock,
  Crown, Trash2, Eye, MapPin, Activity as ActivityIcon
} from 'lucide-react';
import { toast } from 'sonner';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import api from '@/axiosConfig';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 12px', borderRadius: '4px' }}>
      <p style={{ color: '#9ca3af', fontSize: '11px', marginBottom: '4px' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontSize: '12px', margin: '2px 0' }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color, bg }) => (
  <div className="hover-lift" style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '6px', padding: '14px' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
      <div style={{ background: bg, padding: '6px', borderRadius: '4px' }}>
        <Icon size={15} color={color} />
      </div>
      <span style={{ color: '#6b7280', fontSize: '9px', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</span>
    </div>
    <div className="number-pop" style={{ fontSize: 'clamp(18px, 2.5vw, 26px)', fontWeight: 'bold', fontFamily: 'monospace', color }}>{value}</div>
  </div>
);

// ─── User Detail Drawer ────────────────────────────────────────────────────
const UserDetailDrawer = ({ email, onClose, onUpdate }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/api/admin/users/${encodeURIComponent(email)}`)
      .then(res => setData(res.data))
      .catch(() => toast.error('Failed to load user details'))
      .finally(() => setLoading(false));
  }, [email]);

  const updateRole = async (newRole) => {
    try {
      await api.patch(`/api/admin/users/${encodeURIComponent(email)}/role`, { role: newRole });
      toast.success(`Role updated to ${newRole}`);
      setData(d => ({ ...d, user: { ...d.user, role: newRole } }));
      onUpdate?.();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update role');
    }
  };

  const updatePlan = async (newPlan) => {
    try {
      await api.patch(`/api/admin/users/${encodeURIComponent(email)}/plan`, { plan: newPlan });
      toast.success(`Plan updated to ${newPlan}`);
      setData(d => ({ ...d, user: { ...d.user, plan: newPlan } }));
      onUpdate?.();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update plan');
    }
  };

  const deleteUser = async () => {
    if (!window.confirm(`Permanently delete ${email} and all their data? This cannot be undone.`)) return;
    try {
      await api.delete(`/api/admin/users/${encodeURIComponent(email)}`);
      toast.success('User deleted');
      onUpdate?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to delete user');
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', justifyContent: 'flex-end',
    }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)' }} />
      <div className="page-enter" style={{
        position: 'relative', width: 'min(480px, 100%)', height: '100%',
        background: '#0a0a0a', borderLeft: '1px solid rgba(255,255,255,0.1)',
        overflowY: 'auto', padding: '20px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ color: 'white', fontFamily: 'monospace', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>
            User Details
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {loading && <p style={{ color: '#71717a', fontFamily: 'monospace', fontSize: '12px' }}>Loading...</p>}

        {data && !loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {/* Identity */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #FF3B30, #7c3aed)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px', fontWeight: 'bold', color: 'white', flexShrink: 0,
              }}>
                {data.user.email?.[0]?.toUpperCase()}
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ color: 'white', fontWeight: 'bold', fontSize: '13px', margin: 0, textTransform: 'capitalize' }}>
                  {data.user.name || data.user.email.split('@')[0]}
                </p>
                <p style={{ color: '#6b7280', fontFamily: 'monospace', fontSize: '11px', margin: '2px 0 0', wordBreak: 'break-all' }}>
                  {data.user.email}
                </p>
              </div>
            </div>

            {/* Role + Plan controls */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '4px', padding: '10px' }}>
                <p style={{ color: '#6b7280', fontFamily: 'monospace', fontSize: '9px', textTransform: 'uppercase', margin: '0 0 6px' }}>Role</p>
                <select value={data.user.role || 'user'} onChange={e => updateRole(e.target.value)} style={selectStyle}>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '4px', padding: '10px' }}>
                <p style={{ color: '#6b7280', fontFamily: 'monospace', fontSize: '9px', textTransform: 'uppercase', margin: '0 0 6px' }}>Plan</p>
                <select value={data.user.plan || 'free'} onChange={e => updatePlan(e.target.value)} style={selectStyle}>
                  <option value="free">Free</option>
                  <option value="pro">Pro</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {[
                { label: 'Scans', value: data.stats.total_scans },
                { label: 'Threats', value: data.stats.total_threats },
                { label: 'Leak Searches', value: data.stats.total_leak_searches },
              ].map(({ label, value }) => (
                <div key={label} style={{ textAlign: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '4px', padding: '10px' }}>
                  <p style={{ color: 'white', fontFamily: 'monospace', fontSize: '18px', fontWeight: 'bold', margin: 0 }}>{value}</p>
                  <p style={{ color: '#6b7280', fontFamily: 'monospace', fontSize: '9px', textTransform: 'uppercase', margin: '4px 0 0' }}>{label}</p>
                </div>
              ))}
            </div>

            {/* Account info */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '4px', padding: '12px' }}>
              <p style={{ color: '#6b7280', fontFamily: 'monospace', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 8px' }}>Account Info</p>
              {[
                { icon: Mail, label: 'Verified', value: data.user.verified ? 'Yes ✓' : 'No' },
                { icon: Clock, label: 'Joined', value: data.user.created_at ? new Date(data.user.created_at).toLocaleString() : 'Unknown' },
                { icon: ActivityIcon, label: 'Last Login', value: data.user.last_login ? new Date(data.user.last_login).toLocaleString() : 'Never' },
                { icon: Globe, label: 'Last IP', value: data.user.last_login_ip || 'N/A' },
                { icon: Globe, label: 'Signup IP', value: data.user.signup_ip || 'N/A' },
                { icon: UserCheck, label: 'Total Logins', value: data.user.login_count || 0 },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Icon size={12} color="#71717a" style={{ flexShrink: 0 }} />
                  <span style={{ color: '#71717a', fontFamily: 'monospace', fontSize: '10px', width: '90px', flexShrink: 0 }}>{label}</span>
                  <span style={{ color: 'white', fontFamily: 'monospace', fontSize: '11px', wordBreak: 'break-all' }}>{value}</span>
                </div>
              ))}
            </div>

            {/* Geo location */}
            {data.geo && (
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '4px', padding: '12px' }}>
                <p style={{ color: '#6b7280', fontFamily: 'monospace', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={11} /> Last Login Location
                </p>
                <p style={{ color: 'white', fontFamily: 'monospace', fontSize: '12px', margin: 0 }}>
                  {[data.geo.city, data.geo.region, data.geo.country].filter(Boolean).join(', ')}
                </p>
                {data.geo.org && <p style={{ color: '#71717a', fontFamily: 'monospace', fontSize: '10px', margin: '4px 0 0' }}>{data.geo.org}</p>}
              </div>
            )}

            {/* Recent scans */}
            <div>
              <p style={{ color: '#6b7280', fontFamily: 'monospace', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 8px' }}>Recent Scans</p>
              {data.scans.length === 0 ? (
                <p style={{ color: '#3f3f46', fontFamily: 'monospace', fontSize: '11px' }}>No scans yet</p>
              ) : data.scans.slice(0, 5).map((s, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ color: 'white', fontFamily: 'monospace', fontSize: '11px' }}>{s.target}</span>
                  <span style={{ color: '#6b7280', fontFamily: 'monospace', fontSize: '10px' }}>{s.scan_type} · {s.status}</span>
                </div>
              ))}
            </div>

            {/* Recent logins */}
            <div>
              <p style={{ color: '#6b7280', fontFamily: 'monospace', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 8px' }}>Recent Logins</p>
              {data.recent_logins.length === 0 ? (
                <p style={{ color: '#3f3f46', fontFamily: 'monospace', fontSize: '11px' }}>No login history</p>
              ) : data.recent_logins.slice(0, 5).map((l, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ color: 'white', fontFamily: 'monospace', fontSize: '11px' }}>{l.ip}</span>
                  <span style={{ color: '#6b7280', fontFamily: 'monospace', fontSize: '10px' }}>
                    {new Date(l.timestamp).toLocaleString()} · {l.method}
                  </span>
                </div>
              ))}
            </div>

            {/* Danger zone */}
            <div style={{ borderTop: '1px solid rgba(255,59,48,0.15)', paddingTop: '14px', marginTop: '6px' }}>
              <button onClick={deleteUser} style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 14px', background: 'rgba(255,59,48,0.08)',
                border: '1px solid rgba(255,59,48,0.25)', borderRadius: '4px',
                color: '#FF3B30', fontFamily: 'monospace', fontSize: '11px',
                textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer', width: '100%',
              }}>
                <Trash2 size={13} /> Delete User &amp; All Data
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const selectStyle = {
  width: '100%', padding: '6px 8px', background: '#000',
  border: '1px solid #374151', color: 'white', fontFamily: 'monospace',
  fontSize: '12px', borderRadius: '4px', outline: 'none', cursor: 'pointer',
};

// ─── Main Admin Panel ───────────────────────────────────────────────────────
export default function AdminPanel() {
  const [overview, setOverview] = useState(null);
  const [growth, setGrowth] = useState([]);
  const [users, setUsers] = useState([]);
  const [activity, setActivity] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [tab, setTab] = useState('overview'); // overview | users | activity

  const fetchAll = async () => {
    try {
      const [ov, gr, ac] = await Promise.all([
        api.get('/api/admin/overview'),
        api.get('/api/admin/user-growth?days=30'),
        api.get('/api/admin/activity?limit=30'),
      ]);
      setOverview(ov.data);
      setGrowth(gr.data.data);
      setActivity(ac.data.activity);
    } catch {
      toast.error('Failed to load admin data — admin access required');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get(`/api/admin/users?search=${encodeURIComponent(search)}&page=${page}&limit=10`);
      setUsers(res.data.users);
      setPages(res.data.pages);
    } catch {
      toast.error('Failed to load users');
    }
  };

  useEffect(() => { fetchAll(); }, []);
  useEffect(() => { fetchUsers(); }, [page, search]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
        <p style={{ color: '#FF3B30', fontFamily: 'monospace', fontSize: '13px' }}>Loading admin panel...</p>
      </div>
    );
  }

  if (!overview) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh', textAlign: 'center' }}>
        <div>
          <ShieldAlert size={40} color="#FF3B30" style={{ margin: '0 auto 12px' }} />
          <p style={{ color: '#FF3B30', fontFamily: 'monospace', fontSize: '13px' }}>Access Denied — Admin Only</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter" style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px 16px' }}>

      {/* Header */}
      <div style={{ marginBottom: '18px' }}>
        <h1 style={{ fontSize: 'clamp(20px, 2.5vw, 32px)', fontWeight: 'bold', color: 'white', letterSpacing: '3px', margin: 0 }}>
          ADMIN <span style={{ color: '#FF3B30' }}>PANEL</span>
        </h1>
        <p style={{ color: '#71717a', fontSize: '12px', marginTop: '3px' }}>
          System overview, user management and activity monitoring
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'users', label: 'Users' },
          { id: 'activity', label: 'Activity Log' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '8px 16px', borderRadius: '4px',
            border: `1px solid ${tab === t.id ? '#FF3B30' : 'rgba(255,255,255,0.08)'}`,
            background: tab === t.id ? 'rgba(255,59,48,0.08)' : 'transparent',
            color: tab === t.id ? '#FF3B30' : '#71717a',
            fontFamily: 'monospace', fontSize: '11px', textTransform: 'uppercase',
            letterSpacing: '1px', cursor: 'pointer',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ───────────────────────────────────────── */}
      {tab === 'overview' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginBottom: '16px' }}>
            <StatCard icon={Users} label="Total Users" value={overview.total_users} color="#FF3B30" bg="rgba(255,59,48,0.08)" />
            <StatCard icon={UserPlus} label="New Today" value={overview.new_users_today} color="#10B981" bg="rgba(16,185,129,0.08)" />
            <StatCard icon={UserCheck} label="Active 24h" value={overview.active_24h} color="#0ea5e9" bg="rgba(14,165,233,0.08)" />
            <StatCard icon={ActivityIcon} label="Active 7d" value={overview.active_7d} color="#F59E0B" bg="rgba(245,158,11,0.08)" />
            <StatCard icon={Radar} label="Total Scans" value={overview.total_scans} color="#a855f7" bg="rgba(168,85,247,0.08)" />
            <StatCard icon={Shield} label="Total Threats" value={overview.total_threats} color="#ec4899" bg="rgba(236,72,153,0.08)" />
          </div>

          {/* Growth chart */}
          <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '6px', padding: '16px', marginBottom: '16px' }}>
            <h3 style={{ color: 'white', fontSize: '11px', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 14px' }}>
              User Growth — Last 30 Days
            </h3>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={growth}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 9, fontFamily: 'monospace' }} axisLine={false} tickLine={false} interval={Math.floor(growth.length / 6)} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(v) => <span style={{ color: '#9ca3af', fontSize: '10px', fontFamily: 'monospace' }}>{v}</span>} />
                <Line type="monotone" dataKey="signups" stroke="#FF3B30" strokeWidth={2} dot={false} name="Daily Signups" />
                <Line type="monotone" dataKey="total" stroke="#10B981" strokeWidth={2} dot={false} name="Total Users" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Plan distribution */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '6px', padding: '14px' }}>
              <p style={{ color: '#6b7280', fontFamily: 'monospace', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 10px' }}>Plan Distribution</p>
              {Object.entries(overview.plan_counts || {}).map(([plan, count]) => (
                <div key={plan} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                  <span style={{ color: 'white', fontFamily: 'monospace', fontSize: '12px', textTransform: 'capitalize' }}>{plan}</span>
                  <span style={{ color: '#FF3B30', fontFamily: 'monospace', fontSize: '12px', fontWeight: 'bold' }}>{count}</span>
                </div>
              ))}
            </div>
            <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '6px', padding: '14px' }}>
              <p style={{ color: '#6b7280', fontFamily: 'monospace', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 10px' }}>Account Status</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span style={{ color: 'white', fontFamily: 'monospace', fontSize: '12px' }}>Verified</span>
                <span style={{ color: '#10B981', fontFamily: 'monospace', fontSize: '12px', fontWeight: 'bold' }}>{overview.verified_count}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span style={{ color: 'white', fontFamily: 'monospace', fontSize: '12px' }}>Admins</span>
                <span style={{ color: '#a855f7', fontFamily: 'monospace', fontSize: '12px', fontWeight: 'bold' }}>{overview.admin_count}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span style={{ color: 'white', fontFamily: 'monospace', fontSize: '12px' }}>Leak Searches</span>
                <span style={{ color: '#F59E0B', fontFamily: 'monospace', fontSize: '12px', fontWeight: 'bold' }}>{overview.total_leak_searches}</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── USERS TAB ──────────────────────────────────────────── */}
      {tab === 'users' && (
        <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '6px', padding: '16px' }}>

          {/* Search */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={14} color="#6b7280" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                placeholder="Search by name or email..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                style={{
                  width: '100%', padding: '9px 12px 9px 32px', background: '#000',
                  border: '1px solid #374151', color: 'white', fontFamily: 'monospace',
                  fontSize: '12px', borderRadius: '4px', outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  {['User', 'Role', 'Plan', 'Scans', 'Last Login', 'IP', ''].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px', color: '#6b7280', fontFamily: 'monospace', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.email} className="scan-row" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '10px 8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '28px', height: '28px', borderRadius: '50%',
                          background: 'linear-gradient(135deg, #FF3B30, #7c3aed)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '11px', fontWeight: 'bold', color: 'white', flexShrink: 0,
                        }}>
                          {u.email[0].toUpperCase()}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ color: 'white', fontFamily: 'monospace', fontSize: '11px', margin: 0, textTransform: 'capitalize' }}>{u.name || u.email.split('@')[0]}</p>
                          <p style={{ color: '#6b7280', fontFamily: 'monospace', fontSize: '10px', margin: 0, wordBreak: 'break-all' }}>{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '10px 8px' }}>
                      <span style={{
                        padding: '2px 8px', fontSize: '10px', fontFamily: 'monospace', textTransform: 'uppercase', borderRadius: '2px',
                        background: u.role === 'admin' ? 'rgba(168,85,247,0.1)' : 'rgba(255,255,255,0.04)',
                        color: u.role === 'admin' ? '#a855f7' : '#71717a',
                        border: `1px solid ${u.role === 'admin' ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.06)'}`,
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                      }}>
                        {u.role === 'admin' && <Crown size={9} />}
                        {u.role || 'user'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 8px' }}>
                      <span style={{ color: '#9ca3af', fontFamily: 'monospace', fontSize: '11px', textTransform: 'capitalize' }}>{u.plan || 'free'}</span>
                    </td>
                    <td style={{ padding: '10px 8px' }}>
                      <span style={{ color: 'white', fontFamily: 'monospace', fontSize: '11px' }}>{u.scan_count}</span>
                    </td>
                    <td style={{ padding: '10px 8px' }}>
                      <span style={{ color: '#9ca3af', fontFamily: 'monospace', fontSize: '10px' }}>
                        {u.last_login ? new Date(u.last_login).toLocaleDateString() : 'Never'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 8px' }}>
                      <span style={{ color: '#6b7280', fontFamily: 'monospace', fontSize: '10px' }}>{u.last_login_ip || '—'}</span>
                    </td>
                    <td style={{ padding: '10px 8px' }}>
                      <button onClick={() => setSelectedEmail(u.email)} style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        padding: '5px 10px', background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px',
                        color: '#9ca3af', fontFamily: 'monospace', fontSize: '10px', cursor: 'pointer',
                      }}>
                        <Eye size={11} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '14px' }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={pageBtnStyle(page === 1)}>
              <ChevronLeft size={14} />
            </button>
            <span style={{ color: '#9ca3af', fontFamily: 'monospace', fontSize: '11px' }}>Page {page} of {pages}</span>
            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} style={pageBtnStyle(page === pages)}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ── ACTIVITY TAB ───────────────────────────────────────── */}
      {tab === 'activity' && (
        <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '6px', padding: '16px' }}>
          <h3 style={{ color: 'white', fontSize: '11px', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 14px' }}>
            Recent Login Activity
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {activity.length === 0 ? (
              <p style={{ color: '#3f3f46', fontFamily: 'monospace', fontSize: '12px' }}>No activity yet</p>
            ) : activity.map((a, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 12px', background: 'rgba(255,255,255,0.02)',
                borderLeft: '2px solid #0ea5e9', borderRadius: '0 4px 4px 0',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                  <Globe size={13} color="#0ea5e9" style={{ flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <p style={{ color: 'white', fontFamily: 'monospace', fontSize: '12px', margin: 0, wordBreak: 'break-all' }}>{a.email}</p>
                    <p style={{ color: '#6b7280', fontFamily: 'monospace', fontSize: '10px', margin: 0 }}>{a.ip} · {a.method}</p>
                  </div>
                </div>
                <span style={{ color: '#71717a', fontFamily: 'monospace', fontSize: '10px', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                  {new Date(a.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User detail drawer */}
      {selectedEmail && (
        <UserDetailDrawer
          email={selectedEmail}
          onClose={() => setSelectedEmail(null)}
          onUpdate={() => { fetchUsers(); fetchAll(); }}
        />
      )}
    </div>
  );
}

const pageBtnStyle = (disabled) => ({
  padding: '6px 10px', background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px',
  color: disabled ? '#3f3f46' : '#9ca3af', cursor: disabled ? 'default' : 'pointer',
  display: 'flex', alignItems: 'center',
});
