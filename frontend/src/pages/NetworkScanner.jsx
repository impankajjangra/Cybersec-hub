import { useState } from 'react';
import { Radar, Play, Loader2, Info } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import api from '@/axiosConfig';

const NetworkScanner = () => {
  const [target, setTarget] = useState('');
  const [scanType, setScanType] = useState('quick');
  const [scanning, setScanning] = useState(false);
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

  const hasResults = results &&
    results.results &&
    results.results.hosts &&
    Object.keys(results.results.hosts).length > 0;

  const noData = results &&
    results.results &&
    Object.keys(results.results.hosts || {}).length === 0;

  return (
    <div className="max-w-[1600px] mx-auto p-6">
      <div className="mb-8">
        <h1 className="font-heading font-bold text-5xl uppercase tracking-wider text-white mb-2">
          NETWORK <span className="text-[#FF3B30]">SCANNER</span>
        </h1>
        <p className="font-body text-zinc-400 text-sm">Advanced port scanning and network reconnaissance</p>
      </div>

      {/* Public IP Notice */}
      <div className="mb-4 flex items-start gap-2 bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-sm p-3">
        <Info size={16} className="text-[#F59E0B] mt-0.5 shrink-0" />
        <p className="text-[#F59E0B] font-mono text-xs">
          ⚠ This scanner only works with <strong>public IP addresses</strong> or domains.
          Private IPs (192.168.x.x, 10.x.x.x, 172.x.x.x) are not supported.
          Try: <span className="text-white">scanme.nmap.org</span>, <span className="text-white">8.8.8.8</span>, or any public domain.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-zinc-950/40 backdrop-blur-xl border border-white/10 rounded-sm p-5">
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
                  placeholder="e.g. scanme.nmap.org or 8.8.8.8"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && startScan()}
                  className="bg-zinc-950/50 border-white/10 focus:border-[#FF3B30] text-white font-mono text-sm"
                />
              </div>

              <div>
                <label className="font-mono text-xs uppercase tracking-widest text-zinc-500 mb-2 block">
                  Scan Type
                </label>
                <Select value={scanType} onValueChange={setScanType}>
                  <SelectTrigger className="bg-zinc-950/50 border-white/10 text-white font-mono">
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
              >
                {scanning ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Scanning...</>
                ) : (
                  <><Play className="mr-2 h-4 w-4" />Start Scan</>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-zinc-950/40 backdrop-blur-xl border border-white/10 rounded-sm p-5">
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

            {/* No data found */}
            {noData && !scanning && (
              <div className="text-center py-12">
                <Radar className="mx-auto mb-4 text-zinc-600" size={48} strokeWidth={1.5} />
                <p className="text-zinc-400 font-mono text-sm mb-2">No open ports found for this target.</p>
                <p className="text-zinc-600 font-mono text-xs">
                  This IP may not be indexed in our database or has no publicly visible ports.
                  Try <span className="text-zinc-400">scanme.nmap.org</span> to test.
                </p>
              </div>
            )}

            {/* Results */}
            {hasResults && (
              <div className="space-y-4">
                {Object.entries(results.results.hosts).map(([host, hostData]) => (
                  <div key={host} className="border border-white/10 rounded-sm p-4 bg-zinc-900/20">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-mono text-lg text-[#FF3B30]">{host}</h3>
                        {hostData.hostname && hostData.hostname !== host && (
                          <p className="font-mono text-xs text-zinc-500">{hostData.hostname}</p>
                        )}
                      </div>
                      <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 rounded-sm">
                        {hostData.state}
                      </span>
                    </div>

                    {/* Vulnerabilities */}
                    {hostData.vulns && hostData.vulns.length > 0 && (
                      <div className="mb-3 p-2 bg-[#FF3B30]/10 border border-[#FF3B30]/20 rounded-sm">
                        <p className="font-mono text-xs text-[#FF3B30] mb-1">⚠ Known Vulnerabilities:</p>
                        <div className="flex flex-wrap gap-1">
                          {hostData.vulns.map(v => (
                            <span key={v} className="px-2 py-0.5 text-[10px] font-mono bg-[#FF3B30]/20 text-[#FF3B30] rounded-sm">{v}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    {hostData.tags && hostData.tags.length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-1">
                        {hostData.tags.map(t => (
                          <span key={t} className="px-2 py-0.5 text-[10px] font-mono bg-zinc-800 text-zinc-400 rounded-sm">{t}</span>
                        ))}
                      </div>
                    )}

                    {/* Ports */}
                    {Object.entries(hostData.protocols || {}).map(([proto, ports]) => (
                      <div key={proto} className="mt-3">
                        <h4 className="font-mono text-xs uppercase text-zinc-500 mb-2">{proto} Ports</h4>
                        <div className="space-y-2">
                          {Object.entries(ports).map(([port, portInfo]) => (
                            <div key={port} className="flex items-center justify-between p-2 bg-zinc-950/50 rounded-sm">
                              <div>
                                <span className="font-mono text-sm text-white font-bold">{port}</span>
                                <span className="font-mono text-xs text-zinc-500 ml-2">{portInfo.name}</span>
                              </div>
                              <span className="px-2 py-0.5 text-[10px] font-mono uppercase rounded-sm bg-[#10B981]/10 text-[#10B981]">
                                {portInfo.state}
                              </span>
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
