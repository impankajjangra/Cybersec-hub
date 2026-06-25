import { useEffect, useState } from 'react';
import { Activity, Shield, Radar, AlertTriangle, TrendingUp, Clock } from 'lucide-react';
import { toast } from 'sonner';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area
} from 'recharts';
import api from '@/axiosConfig';

const LEVEL_COLORS = {
  critical: '#a855f7',
  high: '#FF3B30',
  medium: '#F59E0B',
  low: '#10B981',
};

const getThreatBadge = (level) => {
  const map = {
    critical: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    high: 'bg-[#FF3B30]/10 text-[#FF3B30] border border-[#FF3B30]/20',
    medium: 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20',
    low: 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20',
  };
  return map[level] || map.low;
};

const getRisk = (counts) => {
  if (counts?.critical > 0) return { level: 'CRITICAL', color: '#a855f7' };
  if (counts?.high > 0) return { level: 'HIGH', color: '#FF3B30' };
  if (counts?.medium > 0) return { level: 'MEDIUM', color: '#F59E0B' };
  return { level: 'LOW', color: '#10B981' };
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
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
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
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

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
        <p style={{ color: '#FF3B30', fontFamily: 'monospace', fontSize: '13px' }}>Loading dashboard...</p>
      </div>
    );
  }

  const threatCounts = stats?.threat_level_counts || { critical: 0, high: 0, medium: 0, low: 0 };
  const scanCounts = stats?.scan_status_counts || { completed: 0, failed: 0, running: 0 };
  const risk = getRisk(threatCounts);

  // Pie chart — all threat levels including medium
  const pieData = Object.entries(threatCounts)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name: name.toUpperCase(), value, color: LEVEL_COLORS[name] }));

  // Bar chart — scan status
  const barData = [
    { name: 'Completed', value: scanCounts.completed, fill: '#10B981' },
    { name: 'Failed', value: scanCounts.failed, fill: '#FF3B30' },
    { name: 'Running', value: scanCounts.running, fill: '#F59E0B' },
  ];

  // Area chart — scan activity over time (all historical scans)
  const allScans = stats?.all_scans || [];
  const activityData = allScans
    .slice()
    .reverse()
    .slice(-20) // last 20 for readability
    .map((s, i) => ({
      name: `#${i + 1}`,
      Completed: s.status === 'completed' ? 1 : 0,
      Failed: s.status === 'failed' ? 1 : 0,
    }));

  // Cumulative line — total scans over time
  const cumulativeData = allScans
    .slice()
    .reverse()
    .slice(-20)
    .map((s, i) => ({ name: `#${i + 1}`, 'Total Scans': i + 1 }));

  return (
    <div className="inner-page" style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px 16px', position: 'relative' }}>
      <div className="page-orb-red" />
      <div className="page-orb-purple" />

      {/* Header */}
      <div style={{ marginBottom: '18px' }}>
        <h1 style={{ fontSize: 'clamp(20px, 2.5vw, 32px)', fontWeight: 'bold', color: 'white', letterSpacing: '3px', margin: 0 }}>
          TACTICAL <span style={{ color: '#FF3B30' }}>COMMAND</span>
        </h1>
        <p style={{ color: '#71717a', fontSize: '12px', marginTop: '3px' }}>
          Real-time security monitoring and threat intelligence
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginBottom: '16px' }}>
        {[
          { icon: Radar, label: 'Total Scans', value: stats?.total_scans || 0, color: '#FF3B30', bg: 'rgba(255,59,48,0.08)' },
          { icon: Shield, label: 'Threats Found', value: stats?.total_threats || 0, color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
          { icon: Activity, label: 'Active Scans', value: stats?.active_scans || 0, color: '#10B981', bg: 'rgba(16,185,129,0.08)' },
          { icon: AlertTriangle, label: 'Risk Level', value: risk.level, color: risk.color, bg: 'rgba(255,255,255,0.03)' },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="stat-card chart-card glow-on-hover" style={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "6px", padding: "14px",}}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ background: bg, padding: '6px', borderRadius: '4px' }}>
                <Icon size={15} color={color} />
              </div>
              <span style={{ color: '#6b7280', fontSize: '9px', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</span>
            </div>
            <div className="number-pop" style={{ fontSize: 'clamp(18px, 2.5vw, 26px)', fontWeight: 'bold', fontFamily: 'monospace', color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px', marginBottom: '10px' }}>

        {/* Threat Distribution Pie — includes medium */}
        <div className="chart-card glow-on-hover" style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '6px', padding: '14px' }}>
          <h3 style={{ color: 'white', fontSize: '11px', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px', margin: '0 0 10px' }}>
            Threat Distribution
          </h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={170}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={62} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(v) => <span style={{ color: '#9ca3af', fontSize: '10px', fontFamily: 'monospace' }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: '170px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: '#4b5563', fontFamily: 'monospace', fontSize: '11px' }}>Run threat detection to see data</p>
            </div>
          )}
        </div>

        {/* Scan Status Bar */}
        <div className="chart-card glow-on-hover" style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '6px', padding: '14px' }}>
          <h3 style={{ color: 'white', fontSize: '11px', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 10px' }}>
            Scan Status ({allScans.length} total)
          </h3>
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={barData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 9, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 9 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[3, 3, 0, 0]} name="Count">
                {barData.map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Scan Activity Area */}
        <div className="chart-card glow-on-hover" style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '6px', padding: '14px' }}>
          <h3 style={{ color: 'white', fontSize: '11px', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 10px' }}>
            Scan History (last {activityData.length})
          </h3>
          {activityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={170}>
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="gCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gFailed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF3B30" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#FF3B30" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 9, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="Completed" stroke="#10B981" fill="url(#gCompleted)" strokeWidth={2} />
                <Area type="monotone" dataKey="Failed" stroke="#FF3B30" fill="url(#gFailed)" strokeWidth={2} />
                <Legend formatter={(v) => <span style={{ color: '#9ca3af', fontSize: '10px', fontFamily: 'monospace' }}>{v}</span>} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: '170px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: '#4b5563', fontFamily: 'monospace', fontSize: '11px' }}>No scan history yet</p>
            </div>
          )}
        </div>

      </div>

      {/* Recent Lists */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>

        {/* Recent Scans */}
        <div className="chart-card glow-on-hover" style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '6px', padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <Clock size={13} color="#FF3B30" />
            <h3 style={{ color: 'white', fontSize: '11px', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>
              Recent Scans
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {!stats?.recent_scans?.length ? (
              <p style={{ color: '#4b5563', fontFamily: 'monospace', fontSize: '11px' }}>No scans yet</p>
            ) : stats.recent_scans.map((scan, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 10px', background: 'rgba(255,255,255,0.02)',
                borderLeft: '2px solid #FF3B30', borderRadius: '0 3px 3px 0', animationDelay: `${i * 0.07}s`
              }}>
                <div>
                  <div style={{ color: 'white', fontFamily: 'monospace', fontSize: '11px', fontWeight: 'bold' }}>{scan.target}</div>
                  <div style={{ color: '#6b7280', fontFamily: 'monospace', fontSize: '9px' }}>{scan.scan_type}</div>
                </div>
                <span style={{
                  padding: '2px 7px', fontSize: '9px', fontFamily: 'monospace', textTransform: 'uppercase', borderRadius: '2px',
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
        <div className="chart-card glow-on-hover" style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '6px', padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <TrendingUp size={13} color="#F59E0B" />
            <h3 style={{ color: 'white', fontSize: '11px', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>
              Recent Threats
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {!stats?.recent_threats?.length ? (
              <p style={{ color: '#4b5563', fontFamily: 'monospace', fontSize: '11px' }}>No threats detected</p>
            ) : stats.recent_threats.map((t, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 10px', background: 'rgba(255,255,255,0.02)',
                borderLeft: `2px solid ${LEVEL_COLORS[t.threat_level] || '#10B981'}`,
                borderRadius: '0 3px 3px 0'
              }}>
                <div>
                  <div style={{ color: 'white', fontFamily: 'monospace', fontSize: '11px', fontWeight: 'bold' }}>{t.classification}</div>
                  <div style={{ color: '#6b7280', fontFamily: 'monospace', fontSize: '9px' }}>Confidence: {(t.confidence * 100).toFixed(0)}%</div>
                </div>
                <span className={`px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider rounded-sm ${getThreatBadge(t.threat_level)}`}>
                  {t.threat_level}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
