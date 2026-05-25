import { useEffect, useState } from 'react';
import { Activity, Shield, Radar, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/axiosConfig';

const getThreatColor = (level) => {
  switch(level) {
    case 'critical': return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
    case 'high':     return 'bg-[#FF3B30]/10 text-[#FF3B30] border border-[#FF3B30]/20';
    case 'medium':   return 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20';
    default:         return 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20';
  }
};

const getRiskLevel = (threats) => {
  if (!threats || threats.length === 0) return { level: 'LOW', color: 'text-[#10B981]' };
  const levels = threats.map(t => t.threat_level);
  if (levels.includes('critical')) return { level: 'CRITICAL', color: 'text-purple-400' };
  if (levels.includes('high'))     return { level: 'HIGH',     color: 'text-[#FF3B30]' };
  if (levels.includes('medium'))   return { level: 'MEDIUM',   color: 'text-[#F59E0B]' };
  return { level: 'LOW', color: 'text-[#10B981]' };
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_scans: 0,
    total_threats: 0,
    active_scans: 0,
    recent_scans: [],
    recent_threats: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/dashboard/stats');
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      setLoading(false);
    }
  };

  const risk = getRiskLevel(stats.recent_threats);

  return (
    <div className="max-w-[1600px] mx-auto p-6">
      <div className="mb-8">
        <h1 className="font-heading font-bold text-5xl uppercase tracking-wider text-white mb-2">
          TACTICAL <span className="text-[#FF3B30]">COMMAND</span>
        </h1>
        <p className="font-body text-zinc-400 text-sm">Real-time security monitoring and threat intelligence</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { icon: Radar,         label: 'Total Scans',      value: stats.total_scans,    color: 'text-[#FF3B30]', bg: 'bg-[#FF3B30]/10' },
          { icon: Shield,        label: 'Threats Detected', value: stats.total_threats,  color: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/10' },
          { icon: Activity,      label: 'Active Scans',     value: stats.active_scans,   color: 'text-[#10B981]', bg: 'bg-[#10B981]/10' },
          { icon: AlertTriangle, label: 'Risk Level',       value: risk.level,           color: risk.color,       bg: 'bg-zinc-900/20' },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="bg-zinc-950/40 backdrop-blur-xl border border-white/10 p-5 rounded-sm hover:border-[#FF3B30]/30 transition-colors duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-sm ${bg}`}>
                <Icon className={color} size={20} strokeWidth={1.5} />
              </div>
              <span className="font-mono text-xs uppercase text-zinc-500">{label}</span>
            </div>
            <div className={`font-mono text-3xl font-bold ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Scans */}
        <div className="bg-zinc-950/40 backdrop-blur-xl border border-white/10 rounded-sm p-5">
          <h2 className="font-heading font-semibold text-xl uppercase tracking-wide text-white/90 mb-4">Recent Scans</h2>
          <div className="space-y-3">
            {stats.recent_scans.length === 0 ? (
              <p className="text-zinc-500 text-sm font-mono">No scans yet</p>
            ) : stats.recent_scans.map((scan, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-zinc-900/20 border-l-2 border-[#FF3B30] rounded-r-sm">
                <div>
                  <div className="font-mono text-sm text-white">{scan.target}</div>
                  <div className="font-mono text-xs text-zinc-500">{scan.scan_type}</div>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded-sm ${
                  scan.status === 'completed' ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20' :
                  scan.status === 'running'   ? 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20' :
                  'bg-[#FF3B30]/10 text-[#FF3B30] border border-[#FF3B30]/20'
                }`}>
                  {scan.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Threats */}
        <div className="bg-zinc-950/40 backdrop-blur-xl border border-white/10 rounded-sm p-5">
          <h2 className="font-heading font-semibold text-xl uppercase tracking-wide text-white/90 mb-4">Recent Threats</h2>
          <div className="space-y-3">
            {stats.recent_threats.length === 0 ? (
              <p className="text-zinc-500 text-sm font-mono">No threats detected</p>
            ) : stats.recent_threats.map((threat, idx) => (
              <div key={idx} className={`flex items-center justify-between p-3 border-l-2 rounded-r-sm ${
                threat.threat_level === 'critical' ? 'border-purple-500 bg-purple-500/5' :
                threat.threat_level === 'high'     ? 'border-[#FF3B30] bg-zinc-900/20' :
                'border-[#F59E0B] bg-zinc-900/20'
              }`}>
                <div>
                  <div className="font-mono text-sm text-white">{threat.classification}</div>
                  <div className="font-mono text-xs text-zinc-500">Confidence: {(threat.confidence * 100).toFixed(0)}%</div>
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
};

export default Dashboard;
