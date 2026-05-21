import { useEffect, useState } from 'react';
import { History, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/axiosConfig';  // FIX 1: uses auth-aware axios

const API_PATH = '/api';

const ScanHistory = () => {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      // FIX 1: token auto-attached; backend returns only THIS user's scans
      const response = await api.get(`${API_PATH}/history`);
      setScans(response.data.scans);
      setLoading(false);
    } catch (error) {
      console.error('History error:', error);
      toast.error('Failed to load scan history');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto p-6" data-testid="scan-history-page">
      <div className="mb-8">
        <h1 className="font-heading font-bold text-5xl uppercase tracking-wider text-white mb-2">
          SCAN <span className="text-[#FF3B30]">HISTORY</span>
        </h1>
        <p className="font-body text-zinc-400 text-sm">View and analyze past network scans</p>
      </div>

      <div className="bg-zinc-950/40 backdrop-blur-xl border border-white/10 rounded-sm p-5" data-testid="history-panel">
        <h2 className="font-heading font-semibold text-xl uppercase tracking-wide text-white/90 mb-4">
          Recent Scans
        </h2>

        {loading && (
          <div className="text-center py-12">
            <Loader2 className="mx-auto mb-4 text-[#FF3B30] animate-spin" size={48} />
            <p className="text-zinc-400 font-mono text-sm">Loading history...</p>
          </div>
        )}

        {!loading && scans.length === 0 && (
          <div className="text-center py-12">
            <History className="mx-auto mb-4 text-zinc-600" size={48} strokeWidth={1.5} />
            <p className="text-zinc-500 font-mono text-sm">No scans in history</p>
          </div>
        )}

        {!loading && scans.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="history-table">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-3 font-mono text-xs uppercase text-zinc-500">Scan ID</th>
                  <th className="text-left p-3 font-mono text-xs uppercase text-zinc-500">Target</th>
                  <th className="text-left p-3 font-mono text-xs uppercase text-zinc-500">Type</th>
                  <th className="text-left p-3 font-mono text-xs uppercase text-zinc-500">Status</th>
                  <th className="text-left p-3 font-mono text-xs uppercase text-zinc-500">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {scans.map((scan, idx) => (
                  <tr
                    key={scan.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    data-testid={`history-row-${idx}`}
                  >
                    <td className="p-3 font-mono text-sm text-zinc-400">{scan.id.substring(0, 8)}...</td>
                    <td className="p-3 font-mono text-sm text-white">{scan.target}</td>
                    <td className="p-3 font-mono text-sm text-zinc-400">{scan.scan_type}</td>
                    <td className="p-3">
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
                    </td>
                    <td className="p-3 font-mono text-sm text-zinc-400">
                      {new Date(scan.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScanHistory;
