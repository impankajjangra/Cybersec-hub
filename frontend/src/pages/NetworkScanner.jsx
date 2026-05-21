import { useState } from 'react';
import { Radar, Play, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import api from '@/axiosConfig';

const NetworkScanner = () => {
  const [target, setTarget] = useState('');
  const [scanType, setScanType] = useState('quick');
  const [scanning, setScanning] = useState(false);
  const [scanId, setScanId] = useState(null);
  const [results, setResults] = useState(null);

  const startScan = async () => {
    if (!target) {
      toast.error('Please enter a target IP or domain');
      return;
    }

    setScanning(true);
    setResults(null);

    try {
      const response = await api.post('/api/scan/network', {
        target,
        scan_type: scanType,
      });

      setScanId(response.data.scan_id);
      toast.success('Scan started successfully');

      pollScanStatus(response.data.scan_id);
    } catch (error) {
      console.error('Scan error:', error);
      toast.error('Failed to start scan');
      setScanning(false);
    }
  };

  const pollScanStatus = async (id) => {
    const interval = setInterval(async () => {
      try {
        const response = await api.get(`/api/scan/${id}`);

        if (response.data.status === 'completed') {
          setResults(response.data);
          setScanning(false);
          clearInterval(interval);
          toast.success('Scan completed');
        } else if (response.data.status === 'failed') {
          setScanning(false);
          clearInterval(interval);
          toast.error('Scan failed');
        }
      } catch (error) {
        console.error('Poll error:', error);
      }
    }, 2000);

    setTimeout(() => clearInterval(interval), 60000);
  };

  return (
    <div className="max-w-[1600px] mx-auto p-6" data-testid="network-scanner-page">
      <div className="mb-8">
        <h1 className="font-heading font-bold text-5xl uppercase tracking-wider text-white mb-2">
          NETWORK <span className="text-[#FF3B30]">SCANNER</span>
        </h1>
        <p className="font-body text-zinc-400 text-sm">Advanced port scanning and network reconnaissance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-zinc-950/40 backdrop-blur-xl border border-white/10 rounded-sm p-5" data-testid="scan-config-panel">
            <h2 className="font-heading font-semibold text-xl uppercase tracking-wide text-white/90 mb-4">
              Scan Configuration
            </h2>

            <div className="space-y-4">
              <div>
                <label className="font-mono text-xs uppercase tracking-widest text-zinc-500 mb-2 block">
                  Target
                </label>
                <Input
                  type="text"
                  placeholder="192.168.1.1 or example.com"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="bg-zinc-950/50 border-white/10 focus:border-[#FF3B30] text-white font-mono text-sm"
                  data-testid="target-input"
                />
              </div>

              <div>
                <label className="font-mono text-xs uppercase tracking-widest text-zinc-500 mb-2 block">
                  Scan Type
                </label>
                <Select value={scanType} onValueChange={setScanType}>
                  <SelectTrigger className="bg-zinc-950/50 border-white/10 text-white font-mono" data-testid="scan-type-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-950 border-white/10">
                    <SelectItem value="quick" className="text-white font-mono">Quick Scan</SelectItem>
                    <SelectItem value="full" className="text-white font-mono">Full Scan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={startScan}
                disabled={scanning}
                className="w-full bg-[#FF3B30] hover:bg-[#FF3B30]/90 text-white font-mono uppercase tracking-wider text-xs"
                data-testid="start-scan-button"
              >
                {scanning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Start Scan
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-zinc-950/40 backdrop-blur-xl border border-white/10 rounded-sm p-5" data-testid="scan-results-panel">
            <h2 className="font-heading font-semibold text-xl uppercase tracking-wide text-white/90 mb-4">
              Scan Results
            </h2>

            {!results && !scanning && (
              <div className="text-center py-12">
                <Radar className="mx-auto mb-4 text-zinc-600" size={48} strokeWidth={1.5} />
                <p className="text-zinc-500 font-mono text-sm">Configure and start a scan to see results</p>
              </div>
            )}

            {scanning && (
              <div className="text-center py-12">
                <Loader2 className="mx-auto mb-4 text-[#FF3B30] animate-spin" size={48} />
                <p className="text-zinc-400 font-mono text-sm">Scanning in progress...</p>
              </div>
            )}

            {results && results.results && (
              <div className="space-y-4" data-testid="scan-results">
                {Object.entries(results.results.hosts || {}).map(([host, hostData]) => (
                  <div key={host} className="border border-white/10 rounded-sm p-4 bg-zinc-900/20">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-mono text-lg text-[#FF3B30]">{host}</h3>
                      <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 rounded-sm">
                        {hostData.state}
                      </span>
                    </div>

                    {Object.entries(hostData.protocols || {}).map(([proto, ports]) => (
                      <div key={proto} className="mt-3">
                        <h4 className="font-mono text-xs uppercase text-zinc-500 mb-2">{proto} Ports</h4>
                        <div className="space-y-2">
                          {Object.entries(ports).map(([port, portInfo]) => (
                            <div
                              key={port}
                              className="flex items-center justify-between p-2 bg-zinc-950/50 rounded-sm"
                              data-testid={`port-${port}`}
                            >
                              <div>
                                <span className="font-mono text-sm text-white font-bold">{port}</span>
                                <span className="font-mono text-xs text-zinc-500 ml-2">{portInfo.name}</span>
                              </div>
                              <div className="text-right">
                                <div className="font-mono text-xs text-zinc-400">{portInfo.product} {portInfo.version}</div>
                                <span
                                  className={`px-2 py-0.5 text-[10px] font-mono uppercase rounded-sm ${
                                    portInfo.state === 'open'
                                      ? 'bg-[#10B981]/10 text-[#10B981]'
                                      : 'bg-zinc-800 text-zinc-400'
                                  }`}
                                >
                                  {portInfo.state}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkScanner;
