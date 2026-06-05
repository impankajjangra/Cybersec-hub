import { useState } from 'react';
import { Radar, Play, Loader2, Info, Monitor, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import api from '@/axiosConfig';

const PORT_RISK = {
  21: 'high', 22: 'medium', 23: 'critical', 25: 'medium',
  53: 'low', 80: 'low', 110: 'medium', 143: 'medium',
  443: 'low', 445: 'critical', 993: 'low', 995: 'low',
  1433: 'critical', 3306: 'critical', 3389: 'critical',
  5432: 'critical', 5900: 'high', 6379: 'critical',
  8080: 'low', 8443: 'low', 27017: 'critical'
};

const RISK_COLORS = {
  critical: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  high:     'bg-[#FF3B30]/10 text-[#FF3B30] border-[#FF3B30]/30',
  medium:   'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30',
  low:      'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30',
};

const PortRow = ({ port, portInfo }) => {
  const risk = PORT_RISK[parseInt(port)] || 'low';
  const riskColor = RISK_COLORS[risk];

  return (
    <div className="flex items-center justify-between p-2 bg-zinc-950/50 rounded-sm hover:bg-zinc-900/50 transition">
      <div className="flex items-center gap-3">
        <span className="font-mono text-sm text-white font-bold w-12">{port}</span>
        <span className="font-mono text-xs text-zinc-400 w-20">{portInfo.name || 'unknown'}</span>
        {portInfo.product && (
          <span className="font-mono text-xs text-zinc-300">
            {portInfo.product} {portInfo.version}
          </span>
        )}
        {portInfo.extrainfo && (
          <span className="font-mono text-xs text-zinc-500">({portInfo.extrainfo})</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {portInfo.cpe && (
          <span className="font-mono text-[10px] text-zinc-600 hidden md:block truncate max-w-32">{portInfo.cpe}</span>
        )}
        <span className={`px-2 py-0.5 text-[10px] font-mono uppercase rounded-sm border ${riskColor}`}>
          {risk}
        </span>
        <span className="px-2 py-0.5 text-[10px] font-mono uppercase rounded-sm bg-[#10B981]/10 text-[#10B981]">
          {portInfo.state}
        </span>
      </div>
    </div>
  );
};

const HostCard = ({ host, hostData }) => {
  const [showPorts, setShowPorts] = useState(true);
  const allPorts = Object.entries(hostData.protocols?.tcp || {});
  const portCount = allPorts.length;

  return (
    <div className="border border-white/10 rounded-sm overflow-hidden">

      {/* Host Header */}
      <div className="p-4 bg-zinc-900/30 border-b border-white/10">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="font-mono text-lg text-[#FF3B30] font-bold">{host}</h3>
            {hostData.hostname && hostData.hostname !== host && (
              <p className="font-mono text-xs text-zinc-500">{hostData.hostname}</p>
            )}
            {hostData.hostnames?.length > 1 && (
              <p className="font-mono text-xs text-zinc-600">
                Also: {hostData.hostnames.slice(1).join(', ')}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 rounded-sm">
              {hostData.state}
            </span>
            <span className="px-2 py-0.5 text-[10px] font-mono bg-zinc-800 text-zinc-400 rounded-sm">
              {portCount} open ports
            </span>
          </div>
        </div>

        {/* OS Detection */}
        {hostData.os && hostData.os.length > 0 && (
          <div className="mt-3 p-3 bg-zinc-950/50 rounded-sm border border-blue-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Monitor size={14} className="text-blue-400" />
              <span className="font-mono text-xs text-blue-400 uppercase tracking-wider">OS Detection</span>
            </div>
            <div className="space-y-1">
              {hostData.os.map((os, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="font-mono text-xs text-white">{os.name}</span>
                  <div className="flex items-center gap-2">
                    {os.cpe && <span className="font-mono text-[10px] text-zinc-600 hidden md:block">{os.cpe}</span>}
                    <span className="font-mono text-xs text-blue-400">{os.accuracy}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {hostData.tags?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {hostData.tags.map(t => (
              <span key={t} className="px-2 py-0.5 text-[10px] font-mono bg-zinc-800 text-zinc-400 rounded-sm">{t}</span>
            ))}
          </div>
        )}

        {/* CVEs */}
        {hostData.vulns?.length > 0 && (
          <div className="mt-3 p-3 bg-[#FF3B30]/10 border border-[#FF3B30]/20 rounded-sm">
            <div className="flex items-center gap-2 mb-2">
              <Shield size={14} className="text-[#FF3B30]" />
              <span className="font-mono text-xs text-[#FF3B30] uppercase tracking-wider">
                {hostData.vulns.length} Known CVE Vulnerabilities
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {hostData.vulns.slice(0, 15).map(v => (
                <a key={v}
                  href={`https://nvd.nist.gov/vuln/detail/${v}`}
                  target="_blank" rel="noreferrer"
                  className="px-2 py-0.5 text-[10px] font-mono bg-red-900/30 text-red-300 rounded-sm hover:bg-red-900/50 transition">
                  {v}
                </a>
              ))}
              {hostData.vulns.length > 15 && (
                <span className="px-2 py-0.5 text-[10px] font-mono bg-zinc-800 text-zinc-400 rounded-sm">
                  +{hostData.vulns.length - 15} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Ports Section */}
      {portCount > 0 && (
        <div>
          <button
            onClick={() => setShowPorts(!showPorts)}
            className="w-full flex items-center justify-between p-3 bg-zinc-900/20 hover:bg-zinc-900/40 transition border-b border-white/5"
          >
            <span className="font-mono text-xs uppercase text-zinc-500 tracking-wider">
              TCP Ports ({portCount})
            </span>
            {showPorts ? <ChevronUp size={14} className="text-zinc-500" /> : <ChevronDown size={14} className="text-zinc-500" />}
          </button>

          {showPorts && (
            <div className="p-3 space-y-1">
              {/* Legend */}
              <div className="flex gap-3 mb-3 flex-wrap">
                {Object.entries(RISK_COLORS).map(([level, color]) => (
                  <span key={level} className={`px-2 py-0.5 text-[10px] font-mono uppercase rounded-sm border ${color}`}>
                    {level}
                  </span>
                ))}
              </div>
              {allPorts.map(([port, portInfo]) => (
                <PortRow key={port} port={port} portInfo={portInfo} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const NetworkScanner = () => {
  const [target, setTarget] = useState('');
  const [scanType, setScanType] = useState('quick');
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState(null);
  const [scanEngine, setScanEngine] = useState('');

  const startScan = async () => {
    if (!target) { toast.error('Please enter a target IP or domain'); return; }
    setScanning(true); setResults(null); setScanEngine('');
    try {
      const response = await api.post('/api/scan/network', { target, scan_type: scanType });
      toast.success('Scan started');
      pollScanStatus(response.data.scan_id);
    } catch (error) {
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
          setScanEngine(response.data.results?.scan_stats?.engine || '');
          setScanning(false);
          clearInterval(interval);
          const hostCount = Object.keys(response.data.results?.hosts || {}).length;
          if (hostCount > 0) toast.success('Scan completed');
          else toast.info('Scan completed — no results found');
        } else if (response.data.status === 'failed') {
          setScanning(false); clearInterval(interval);
          toast.error('Scan failed');
        }
      } catch (error) { console.error('Poll error:', error); }
    }, 2000);
    setTimeout(() => clearInterval(interval), 120000); // 2 min timeout for full scan
  };

  const hasResults = results?.results?.hosts && Object.keys(results.results.hosts).length > 0;
  const noData = results && !hasResults;

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-6">
      <div className="mb-6">
        <h1 className="font-heading font-bold text-3xl md:text-5xl uppercase tracking-wider text-white mb-2">
          NETWORK <span className="text-[#FF3B30]">SCANNER</span>
        </h1>
        <p className="font-body text-zinc-400 text-sm">Advanced port scanning, OS detection and vulnerability analysis</p>
      </div>

      {/* Notice */}
      <div className="mb-4 flex items-start gap-2 bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-sm p-3">
        <Info size={16} className="text-[#F59E0B] mt-0.5 shrink-0" />
        <p className="text-[#F59E0B] font-mono text-xs">
          ⚠ Works with <strong>public IP addresses</strong> and domains only. Private IPs (192.168.x.x, 10.x.x.x) are not supported.
          Try: <span className="text-white">scanme.nmap.org</span> or <span className="text-white">8.8.8.8</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Config Panel */}
        <div className="lg:col-span-1">
          <div className="bg-zinc-950/40 backdrop-blur-xl border border-white/10 rounded-sm p-5">
            <h2 className="font-heading font-semibold text-xl uppercase tracking-wide text-white/90 mb-4">
              Scan Configuration
            </h2>
            <div className="space-y-4">
              <div>
                <label className="font-mono text-xs uppercase tracking-widest text-zinc-500 mb-2 block">Target</label>
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
                <label className="font-mono text-xs uppercase tracking-widest text-zinc-500 mb-2 block">Scan Type</label>
                <Select value={scanType} onValueChange={setScanType}>
                  <SelectTrigger className="bg-zinc-950/50 border-white/10 text-white font-mono">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-950 border-white/10">
                    <SelectItem value="quick" className="text-white font-mono">Quick Scan (Top 100 ports)</SelectItem>
                    <SelectItem value="full" className="text-white font-mono">Full Scan (Top 1000 + OS detection)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={startScan} disabled={scanning}
                className="w-full bg-[#FF3B30] hover:bg-[#FF3B30]/90 text-white font-mono uppercase tracking-wider text-xs"
              >
                {scanning ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Scanning...</>
                  : <><Play className="mr-2 h-4 w-4" />Start Scan</>}
              </Button>
            </div>

            {/* Scan info */}
            <div className="mt-4 p-3 bg-zinc-900/20 border-l-2 border-zinc-700 rounded-r-sm">
              <h3 className="font-mono text-xs uppercase text-zinc-500 mb-2">Scan Details</h3>
              <div className="space-y-1 text-xs font-mono text-zinc-400">
                {scanType === 'quick' ? (
                  <>
                    <p>• Top 100 common ports</p>
                    <p>• Fast scan (-T4)</p>
                    <p>• Skip ping (-Pn)</p>
                    <p>• OS guess</p>
                    <p>• ~10-30 seconds</p>
                  </>
                ) : (
                  <>
                    <p>• Top 1000 ports</p>
                    <p>• Service version detection</p>
                    <p>• OS detection</p>
                    <p>• CPE identification</p>
                    <p>• ~60-120 seconds</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2">
          <div className="bg-zinc-950/40 backdrop-blur-xl border border-white/10 rounded-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-semibold text-xl uppercase tracking-wide text-white/90">
                Scan Results
              </h2>
              {scanEngine && (
                <span className="font-mono text-[10px] text-zinc-500 uppercase">
                  Engine: {scanEngine === 'nmap' ? '⚡ Nmap' : '🌐 Shodan InternetDB'}
                </span>
              )}
            </div>

            {!results && !scanning && (
              <div className="text-center py-12">
                <Radar className="mx-auto mb-4 text-zinc-600" size={48} strokeWidth={1.5} />
                <p className="text-zinc-500 font-mono text-sm">Configure and start a scan to see results</p>
              </div>
            )}

            {scanning && (
              <div className="text-center py-12">
                <Loader2 className="mx-auto mb-4 text-[#FF3B30] animate-spin" size={48} />
                <p className="text-zinc-400 font-mono text-sm mb-2">Scanning in progress...</p>
                <p className="text-zinc-600 font-mono text-xs">
                  {scanType === 'full' ? 'Full scan may take 60-120 seconds' : 'Quick scan takes ~10-30 seconds'}
                </p>
              </div>
            )}

            {noData && !scanning && (
              <div className="text-center py-12">
                <Radar className="mx-auto mb-4 text-zinc-600" size={48} strokeWidth={1.5} />
                <p className="text-zinc-400 font-mono text-sm mb-2">No open ports found for this target.</p>
                <p className="text-zinc-600 font-mono text-xs">
                  Try <span className="text-zinc-400">scanme.nmap.org</span> to test the scanner.
                </p>
              </div>
            )}

            {hasResults && (
              <div className="space-y-4">
                {/* Stats Bar */}
                <div className="flex gap-4 p-3 bg-zinc-900/20 rounded-sm flex-wrap">
                  <div className="font-mono text-xs text-zinc-400">
                    <span className="text-white font-bold">{Object.keys(results.results.hosts).length}</span> host{Object.keys(results.results.hosts).length !== 1 ? 's' : ''} up
                  </div>
                  <div className="font-mono text-xs text-zinc-400">
                    <span className="text-white font-bold">
                      {Object.values(results.results.hosts).reduce((acc, h) =>
                        acc + Object.keys(h.protocols?.tcp || {}).length, 0)}
                    </span> open ports
                  </div>
                  {results.results.scan_stats?.elapsed && (
                    <div className="font-mono text-xs text-zinc-400">
                      <span className="text-white font-bold">{results.results.scan_stats.elapsed}s</span> elapsed
                    </div>
                  )}
                </div>

                {Object.entries(results.results.hosts).map(([host, hostData]) => (
                  <HostCard key={host} host={host} hostData={hostData} />
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
