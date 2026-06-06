import { useEffect, useState } from 'react';
import { Activity, Shield, Radar, AlertTriangle, TrendingUp, Clock } from 'lucide-react';
import { toast } from 'sonner';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  LineChart, Line, AreaChart, Area
} from 'recharts';
import api from '@/axiosConfig';

const COLORS = {
  critical: '#a855f7',
  high: '#FF3B30',
  medium: '#F59E0B',
  low: '#10B981',
  primary: '#FF3B30',
};

const getThreatColor = (level) => {
  switch (level) {
    case 'critical': return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
    case 'high': return 'bg-[#FF3B30]/10 text-[#FF3B30] border border-[#FF3B30]/20';
    case 'medium': return 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20';
    default: return 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20';
  }
};

const getRiskLevel = (threats) => {
  if (!threats || threats.length === 0) return { level: 'LOW', color: 'text-[#10B981]' };
  const levels = threats.map(t => t.threat_level);
  if (levels.includes('critical')) return { level: 'CRITICAL', color: 'text-purple-400' };
  if (levels.includes('high')) return { level: 'HIGH', color: 'text-[#FF3B30]' };
  if (levels.includes('medium')) return { level: 'MEDIUM', color: 'text-[#F59E0B]' };
  return { level: 'LOW', color: 'text-[#10B981]' };
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 12px', borderRadius: '4px' }}>
        {label && <p style={{ color: '#9ca3af', fontSize: '11px', marginBottom: '4px' }}>{label}</p>}
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color || '#fff', fontSize: '12px', margin: '2px 0' }}>
            {p.name}: <strong>{p.value}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [stats, setStats] = useState({
    total_scans: 0, total_threats: 0,
    active_scans: 0, recent_scans: [], recent_threats: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/api/dashboard/stats');
      setStats(res.data);
    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const risk = getRiskLevel(stats.recent_threats);

  // Build threat level pie data
  const threatLevelCounts = { critical: 0, high: 0, medium: 0, low: 0 };
  stats.recent_threats.forEach(t => {
    if (threatLevelCounts[t.threat_level] !== undefined) threatLevelCounts[t.threat_level]++;
    else threatLevelCounts.low++;
  });
  const pieData = Object.entries(threatLevelCounts)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name: name.toUpperCase(), value }));

  // Build scan status bar data
  const statusCounts = { completed: 0, failed: 0, running: 0 };
  stats.recent_scans.forEach(s => { if (statusCounts[s.status] !== undefined) statusCounts[s.status]++; });
  const barData = [
    { name: 'Completed', value: statusCounts.completed, fill: '#10B981' },
    { name: 'Failed', value: statusCounts.failed, fill: '#FF3B30' },
    { name: 'Running', value: statusCounts.running, fill: '#F59E0B' },
  ];

  // Build scan activity line data (last 5 scans by timestamp)
  const activityData = stats.recent_scans.slice().reverse().map((s, i) => ({
    name: `Scan ${i + 1}`,
    target: s.target?.substring(0, 10),
    value: s.status === 'completed' ? 1 : 0,
  }));

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div style={{ color: '#FF3B30', fontFamily: 'monospace', fontSize: '14px' }}>Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px 16px' }}>

      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: 'clamp(22px, 3vw, 36px)', fontWeight: 'bold', color: 'white', letterSpacing: '3px', margin: 0 }}>
          TACTICAL <span style={{ color: '#FF3B30' }}>COMMAND</span>
        </h1>
        <p style={{ color: '#71717a', fontSize: '13px', marginTop: '4px' }}>
          Real-time security monitoring and threat intelligence
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        {[
          { icon: Radar, label: 'Total Scans', value: stats.total_scans, color: '#FF3B30', bg: 'rgba(255,59,48,0.1)' },
          { icon: Shield, label: 'Threats Found', value: stats.total_threats, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
          { icon: Activity, label: 'Active Scans', value: stats.active_scans, color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
          { icon: AlertTriangle, label: 'Risk Level', value: risk.level, color: risk.color.replace('text-', '').replace('[', '').replace(']', ''), bg: 'rgba(255,255,255,0.05)' },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} style={{
            background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '6px', padding: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ background: bg, padding: '6px', borderRadius: '4px' }}>
                <Icon size={16} color={color.startsWith('#') ? color : '#fff'} />
              </div>
              <span style={{ color: '#6b7280', fontSize: '10px', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {label}
              </span>
            </div>
            <div style={{ fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 'bold', fontFamily: 'monospace', color: color.startsWith('#') ? color : '#fff' }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', marginBottom: '20px' }}>

        {/* Threat Level Pie */}
        <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '16px' }}>
          <h3 style={{ color: 'white', fontSize: '13px', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px' }}>
            Threat Distribution
          </h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                  paddingAngle={3} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[entry.name.toLowerCase()] || '#6b7280'} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={(value) => <span style={{ color: '#9ca3af', fontSize: '11px', fontFamily: 'monospace' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: '#4b5563', fontFamily: 'monospace', fontSize: '12px' }}>No threat data yet</p>
            </div>
          )}
        </div>

        {/* Scan Status Bar Chart */}
        <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '16px' }}>
          <h3 style={{ color: 'white', fontSize: '13px', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px' }}>
            Scan Status
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={barData} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                {barData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Scan Activity Area Chart */}
        <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '16px' }}>
          <h3 style={{ color: 'white', fontSize: '13px', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px' }}>
            Scan Activity
          </h3>
          {activityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="colorScan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF3B30" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#FF3B30" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="value" stroke="#FF3B30" fill="url(#colorScan)" strokeWidth={2} name="Success" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: '#4b5563', fontFamily: 'monospace', fontSize: '12px' }}>No scan activity yet</p>
            </div>
          )}
        </div>

      </div>

      {/* Recent Scans + Threats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>

        {/* Recent Scans */}
        <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Clock size={14} color="#FF3B30" />
            <h3 style={{ color: 'white', fontSize: '13px', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>
              Recent Scans
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {stats.recent_scans.length === 0 ? (
              <p style={{ color: '#4b5563', fontFamily: 'monospace', fontSize: '12px' }}>No scans yet</p>
            ) : stats.recent_scans.map((scan, idx) => (
              <div key={idx} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 12px', background: 'rgba(255,255,255,0.02)',
                borderLeft: '2px solid #FF3B30', borderRadius: '0 4px 4px 0'
              }}>
                <div>
                  <div style={{ color: 'white', fontFamily: 'monospace', fontSize: '12px', fontWeight: 'bold' }}>{scan.target}</div>
                  <div style={{ color: '#6b7280', fontFamily: 'monospace', fontSize: '10px' }}>{scan.scan_type}</div>
                </div>
                <span style={{
                  padding: '2px 8px', fontSize: '10px', fontFamily: 'monospace',
                  textTransform: 'uppercase', borderRadius: '2px',
                  background: scan.status === 'completed' ? 'rgba(16,185,129,0.1)' : 'rgba(255,59,48,0.1)',
                  color: scan.status === 'completed' ? '#10B981' : '#FF3B30',
                  border: `1px solid ${scan.status === 'completed' ? 'rgba(16,185,129,0.2)' : 'rgba(255,59,48,0.2)'}`,
                }}>
                  {scan.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Threats */}
        <div style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <TrendingUp size={14} color="#F59E0B" />
            <h3 style={{ color: 'white', fontSize: '13px', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>
              Recent Threats
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {stats.recent_threats.length === 0 ? (
              <p style={{ color: '#4b5563', fontFamily: 'monospace', fontSize: '12px' }}>No threats detected</p>
            ) : stats.recent_threats.map((threat, idx) => (
              <div key={idx} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 12px', background: 'rgba(255,255,255,0.02)',
                borderLeft: `2px solid ${threat.threat_level === 'critical' ? '#a855f7' : threat.threat_level === 'high' ? '#FF3B30' : '#F59E0B'}`,
                borderRadius: '0 4px 4px 0'
              }}>
                <div>
                  <div style={{ color: 'white', fontFamily: 'monospace', fontSize: '12px', fontWeight: 'bold' }}>{threat.classification}</div>
                  <div style={{ color: '#6b7280', fontFamily: 'monospace', fontSize: '10px' }}>
                    Confidence: {(threat.confidence * 100).toFixed(0)}%
                  </div>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded-sm ${getThreatColor(threat.threat_level)}`}>
                  {threat.threat_level}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
