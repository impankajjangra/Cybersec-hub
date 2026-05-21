import { useState, useEffect } from 'react';
import { Shield, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from '@/axiosConfig';

const ThreatDetection = () => {
  const [scans, setScans] = useState([]);
  const [selectedScan, setSelectedScan] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    const fetchScans = async () => {
      try {
        const response = await api.get('/api/history');
        setScans(response.data.scans || []);
      } catch (error) {
        console.error('Failed to fetch scans:', error);
        toast.error('Failed to load scan history');
      }
    };

    fetchScans();
  }, []);

  const detectThreats = async () => {
    if (!selectedScan) {
      toast.error('Please select a completed scan');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/api/threats/detect', {
        scan_id: selectedScan,
      });

      setResults(response.data);
      toast.success('Threat analysis completed');
    } catch (error) {
      console.error('Threat detection error:', error);
      toast.error(error.response?.data?.detail || 'Failed to detect threats');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto p-6">
      <div className="mb-8">
        <h1 className="font-heading font-bold text-5xl uppercase tracking-wider text-white mb-2">
          THREAT <span className="text-[#FF3B30]">DETECTION</span>
        </h1>
        <p className="font-body text-zinc-400 text-sm">
          Hybrid AI + Rule-Based Threat Analysis
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT PANEL */}
        <div className="lg:col-span-1">
          <div className="bg-zinc-950/40 backdrop-blur-xl border border-white/10 rounded-sm p-5">
            <h2 className="font-heading font-semibold text-xl uppercase tracking-wide text-white/90 mb-4">
              Select Scan
            </h2>

            <div className="space-y-4">
              <div>
                <label className="font-mono text-xs uppercase tracking-widest text-zinc-500 mb-2 block">
                  Completed Scans
                </label>

                <Select
                  value={selectedScan}
                  onValueChange={(value) => setSelectedScan(value)}
                >
                  <SelectTrigger className="bg-zinc-950/50 border border-white/10 text-white font-mono text-sm">
                    <SelectValue placeholder="Select Completed Scan" />
                  </SelectTrigger>

                  <SelectContent className="bg-zinc-950 border border-white/10 text-white font-mono text-xs">
                    {scans
                      .filter(scan => scan.status === "completed")
                      .map(scan => (
                        <SelectItem key={scan.id} value={scan.id}>
                          {scan.target} | {scan.scan_type} | {new Date(scan.timestamp).toLocaleString()}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={detectThreats}
                disabled={loading}
                className="w-full bg-[#FF3B30] hover:bg-[#FF3B30]/90 text-white font-mono uppercase tracking-wider text-xs"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Detect Threats
                  </>
                )}
              </Button>
            </div>

            <div className="mt-6 p-4 bg-zinc-900/20 border-l-2 border-[#F59E0B] rounded-r-sm">
              <h3 className="font-mono text-xs uppercase text-zinc-500 mb-2">Detection Engine</h3>
              <div className="space-y-1">
                <p className="text-xs text-zinc-400 font-mono">Hybrid Model</p>
                <p className="text-xs text-zinc-400 font-mono">Rule-Based Risk Scoring</p>
                <p className="text-xs text-zinc-400 font-mono">Random Forest ML Boost</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="lg:col-span-2">
          <div className="bg-zinc-950/40 backdrop-blur-xl border border-white/10 rounded-sm p-5">
            <h2 className="font-heading font-semibold text-xl uppercase tracking-wide text-white/90 mb-4">
              Threat Analysis Results
            </h2>

            {!results && !loading && (
              <div className="text-center py-12">
                <Shield className="mx-auto mb-4 text-zinc-600" size={48} strokeWidth={1.5} />
                <p className="text-zinc-500 font-mono text-sm">
                  Select a completed scan to begin analysis
                </p>
              </div>
            )}

            {loading && (
              <div className="text-center py-12">
                <Loader2 className="mx-auto mb-4 text-[#FF3B30] animate-spin" size={48} />
                <p className="text-zinc-400 font-mono text-sm">
                  Running hybrid threat analysis...
                </p>
              </div>
            )}

            {results && (
              <div className="space-y-6">

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                  <div className={`rounded-r-sm p-4 border-l-2 ${
                    results.threat_level === "high"
                      ? "border-[#FF3B30]"
                      : results.threat_level === "medium"
                      ? "border-[#F59E0B]"
                      : "border-[#10B981]"
                  } bg-zinc-900/20`}>
                    <div className="font-mono text-xs uppercase text-zinc-500 mb-1">
                      Threat Level
                    </div>
                    <div className="font-mono text-2xl font-bold uppercase">
                      {results.threat_level}
                    </div>
                  </div>

                  <div className="bg-zinc-900/20 border-l-2 border-[#10B981] rounded-r-sm p-4">
                    <div className="font-mono text-xs uppercase text-zinc-500 mb-1">
                      Confidence
                    </div>
                    <div className="font-mono text-2xl font-bold">
                      {(results.confidence * 100).toFixed(0)}%
                    </div>
                  </div>

                  <div className="bg-zinc-900/20 border-l-2 border-[#F59E0B] rounded-r-sm p-4">
                    <div className="font-mono text-xs uppercase text-zinc-500 mb-1">
                      Total Threats
                    </div>
                    <div className="font-mono text-2xl font-bold">
                      {results.details.total_threats}
                    </div>
                  </div>

                </div>

                {/* Threat List */}
                {results.details.threats?.length > 0 && (
                  <div className="border border-white/10 rounded-sm p-4 bg-zinc-900/20">
                    <h3 className="font-mono text-sm uppercase text-white mb-3">
                      Detected Threats
                    </h3>

                    <div className="space-y-3">
                      {results.details.threats.map((threat, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-zinc-950/50 border border-white/10 rounded-sm"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="text-[#FF3B30]" size={16} />
                              <span className="font-mono text-sm text-white font-bold">
                                {threat.host}:{threat.port}
                              </span>
                            </div>
                            <span className={`px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded-sm ${
                              threat.threat_level === 'high'
                                ? 'bg-[#FF3B30]/10 text-[#FF3B30]'
                                : threat.threat_level === 'medium'
                                ? 'bg-[#F59E0B]/10 text-[#F59E0B]'
                                : 'bg-[#10B981]/10 text-[#10B981]'
                            }`}>
                              {threat.threat_level}
                            </span>
                          </div>

                          <div className="font-mono text-xs text-zinc-400">
                            Service: {threat.service}
                          </div>
                          <div className="font-mono text-xs text-zinc-400">
                            Classification: {threat.classification}
                          </div>
                          <div className="font-mono text-xs text-zinc-400">
                            Risk Score: {threat.risk_score}
                          </div>
                          <div className="font-mono text-xs text-zinc-400">
                            Confidence: {(threat.confidence * 100).toFixed(0)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ThreatDetection;
