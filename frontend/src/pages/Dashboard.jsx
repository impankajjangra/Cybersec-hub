import { useEffect, useState } from 'react';
import { Activity, Shield, Radar, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/axiosConfig';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_scans: 0,
    total_threats: 0,
    active_scans: 0,
    recent_scans: [],
    recent_threats: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/dashboard/stats');
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load dashboard data');
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-zinc-950/40 backdrop-blur-xl border border-white/10 p-5 rounded-sm hover:border-[#FF3B30]/30 transition-colors duration-300" data-testid={`stat-${label.toLowerCase().replace(' ', '-')}`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-sm bg-${color}-500/10`}>
          <Icon className={`text-${color}-500`} size={20} strokeWidth={1.5} />
        </div>
        <span className="font-mono text-xs uppercase text-zinc-500">{label}</span>
      </div>
      <div className="font-mono text-3xl font-bold text-white">{value}</div>
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto p-6" data-testid="dashboard-page">
      <div className="mb-8">
        <h1 className="font-heading font-bold text-5xl uppercase tracking-wider text-white mb-2" data-testid="dashboard-title">
          TACTICAL <span className="text-[#FF3B30]">COMMAND</span>
        </h1>
        <p className="font-body text-zinc-400 text-sm">Real-time security monitoring and threat intelligence</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard icon={Radar} label="Total Scans" value={stats.total_scans} color="[#FF3B30]" />
        <StatCard icon={Shield} label="Threats Detected" value={stats.total_threats} color="[#F59E0B]" />
        <StatCard icon={Activity} label="Active Scans" value={stats.active_scans} color="[#10B981]" />
        <StatCard icon={AlertTriangle} label="Risk Level" value="LOW" color="[#10B981]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-zinc-950/40 backdrop-blur-xl border border-white/10 rounded-sm p-5" data-testid="recent-scans-card">
          <h2 className="font-heading font-semibold text-xl uppercase tracking-wide text-white/90 mb-4">
            Recent Scans
          </h2>
          <div className="space-y-3">
            {stats.recent_scans.length === 0 ? (
              <p className="text-zinc-500 text-sm font-mono">No scans yet</p>
            ) : (
              stats.recent_scans.map((scan, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-zinc-900/20 border-l-2 border-[#FF3B30] rounded-r-sm"
                  data-testid={`scan-item-${idx}`}
                >
                  <div>
                    <div className="font-mono text-sm text-white">{scan.target}</div>
                    <div className="font-mono text-xs text-zinc-500">{scan.scan_type}</div>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded-sm ${
                      scan.status === 'completed'
                        ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20'
                        : scan.status === 'running'
                        ? 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20'
                        : 'bg-[#FF3B30]/10 text-[#FF3B30] border border-[#FF3B30]/20'
                    }`}
                  >
                    {scan.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-zinc-950/40 backdrop-blur-xl border border-white/10 rounded-sm p-5" data-testid="recent-threats-card">
          <h2 className="font-heading font-semibold text-xl uppercase tracking-wide text-white/90 mb-4">
            Recent Threats
          </h2>
          <div className="space-y-3">
            {stats.recent_threats.length === 0 ? (
              <p className="text-zinc-500 text-sm font-mono">No threats detected</p>
            ) : (
              stats.recent_threats.map((threat, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-zinc-900/20 border-l-2 border-[#FF3B30] rounded-r-sm"
                  data-testid={`threat-item-${idx}`}
                >
                  <div>
                    <div className="font-mono text-sm text-white">{threat.classification}</div>
                    <div className="font-mono text-xs text-zinc-500">Confidence: {(threat.confidence * 100).toFixed(0)}%</div>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded-sm ${
                      threat.threat_level === 'high'
                        ? 'bg-[#FF3B30]/10 text-[#FF3B30] border border-[#FF3B30]/20'
                        : 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20'
                    }`}
                  >
                    {threat.threat_level}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
