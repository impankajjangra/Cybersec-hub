import { useState } from 'react';
import { Radar, Play, Loader2, Info, Monitor, Shield, ChevronDown, ChevronUp, Terminal, AlertTriangle, AlertOctagon, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import api from '@/axiosConfig';

// ─── Tool definitions ─────────────────────────────────────────────────────────
const TOOLS = [
  {
    id: 'nmap',
    name: 'Nmap',
    icon: '📡',
    color: '#FF3B30',
    badge: 'Port Scanner',
    description: 'Network port scanner with OS detection and service fingerprinting',
    purpose: 'Discovers open ports, running services, service versions and operating system on any target.',
    useCases: ['Find open ports', 'Identify service versions', 'OS fingerprinting', 'SSL certificate info', 'HTTP enumeration'],
    scanTypes: true, // has quick/full option
  },
  {
    id: 'nuclei',
    name: 'Nuclei',
    icon: '⚡',
    color: '#a855f7',
    badge: 'Vuln Scanner',
    description: 'Template-based vulnerability scanner for CVEs and misconfigurations',
    purpose: 'Scans for known CVEs, exposed admin panels, default credentials, misconfigs and security issues using 9000+ community templates.',
    useCases: ['CVE detection', 'Exposed admin panels', 'Default credentials', 'Misconfiguration checks', 'DNS issues'],
    scanTypes: false,
  },
  {
    id: 'nikto',
    name: 'Nikto',
    icon: '🕵️',
    color: '#F59E0B',
    badge: 'Web Scanner',
    description: 'Web server vulnerability scanner for dangerous files and configs',
    purpose: 'Performs comprehensive tests against web servers for dangerous files, outdated software, insecure HTTP headers and server misconfigurations.',
    useCases: ['Dangerous files/CGIs', 'Outdated server software', 'Insecure HTTP headers', 'Default scripts', 'SSL issues'],
    scanTypes: false,
  },
  {
    id: 'whatweb',
    name: 'WhatWeb',
    icon: '🔍',
    color: '#10B981',
    badge: 'Tech Fingerprint',
    description: 'Web technology fingerprinter — detects CMS, frameworks and more',
    purpose: 'Identifies what technologies a website uses including CMS, frameworks, server software, analytics, JavaScript libraries and CDN providers.',
    useCases: ['CMS detection', 'Framework identification', 'Server software', 'JS libraries', 'CDN & analytics'],
    scanTypes: false,
  },
  {
    id: 'zap',
    name: 'OWASP ZAP',
    icon: '🛡️',
    color: '#0ea5e9',
    badge: 'OWASP Top 10',
    description: 'Full web app scanner — finds SQL injection, XSS, CSRF and more',
    purpose: 'Comprehensive web application security scanner that finds OWASP Top 10 vulnerabilities including SQL injection, XSS, CSRF, broken auth and more.',
    useCases: ['SQL Injection', 'Cross-Site Scripting', 'CSRF', 'Broken auth', 'All OWASP Top 10'],
    scanTypes: false,
  },
];

// ─── Severity helpers ──────────────────────────────────────────────────────────
const SEVERITY_STYLE = {
  critical:      'bg-purple-500/15 text-purple-300 border-purple-500/30',
  high:          'bg-[#FF3B30]/15 text-[#FF3B30] border-[#FF3B30]/30',
  medium:        'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30',
  low:           'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30',
  info:          'bg-zinc-700/40 text-zinc-400 border-zinc-600/30',
  informational: 'bg-zinc-700/40 text-zinc-400 border-zinc-600/30',
};

const SeverityBadge = ({ level }) => {
  const style = SEVERITY_STYLE[level?.toLowerCase()] || SEVERITY_STYLE.info;
  return (
    <span className={`px-2 py-0.5 text-[10px] font-mono uppercase rounded-sm border ${style}`}>
      {level || 'info'}
    </span>
  );
};

const SeverityIcon = ({ level }) => {
  switch (level?.toLowerCase()) {
    case 'critical': return <AlertOctagon size={14} className="text-purple-400 shrink-0" />;
    case 'high':     return <AlertTriangle size={14} className="text-[#FF3B30] shrink-0" />;
    case 'medium':   return <AlertTriangle size={14} className="text-[#F59E0B] shrink-0" />;
    default:         return <CheckCircle size={14} className="text-zinc-500 shrink-0" />;
  }
};

// ─── PORT RISK ────────────────────────────────────────────────────────────────
const PORT_RISK = {
  21:'high',22:'medium',23:'critical',25:'medium',53:'low',80:'low',
  110:'medium',143:'medium',443:'low',445:'critical',993:'low',995:'low',
  1433:'critical',3306:'critical',3389:'critical',5432:'critical',
  5900:'high',6379:'critical',8080:'low',8443:'low',27017:'critical'
};
const RISK_STYLE = {
  critical: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  high:     'bg-[#FF3B30]/10 text-[#FF3B30] border-[#FF3B30]/30',
  medium:   'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30',
  low:      'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30',
};

// ─── Nmap Result Components ───────────────────────────────────────────────────
const PortRow = ({ port, portInfo }) => {
  const [showScripts, setShowScripts] = useState(false);
  const risk = PORT_RISK[parseInt(port)] || 'low';
  const hasScripts = portInfo.scripts && Object.keys(portInfo.scripts).length > 0;
  const stateStyle = portInfo.state === 'open' ? 'text-[#10B981] bg-[#10B981]/10'
    : portInfo.state === 'filtered' ? 'text-[#F59E0B] bg-[#F59E0B]/10'
    : 'text-zinc-500 bg-zinc-800';

  return (
    <div className="border-b border-white/5 last:border-0">
      <div className="flex items-center gap-3 p-2 hover:bg-zinc-900/30 transition">
        <span className="font-mono text-sm font-bold text-white w-14 shrink-0">{port}/tcp</span>
        <span className={`px-2 py-0.5 text-[10px] font-mono uppercase rounded-sm w-16 text-center shrink-0 ${stateStyle}`}>
          {portInfo.state}
        </span>
        <span className="font-mono text-xs text-zinc-300 w-20 shrink-0">{portInfo.name || '?'}</span>
        <span className="font-mono text-xs text-zinc-400 flex-1 truncate">
          {[portInfo.product, portInfo.version, portInfo.extrainfo].filter(Boolean).join(' ')}
        </span>
        {portInfo.cpe && (
          <span className="font-mono text-[10px] text-zinc-600 hidden xl:block truncate max-w-40">{portInfo.cpe}</span>
        )}
        <span className={`px-2 py-0.5 text-[10px] font-mono uppercase rounded-sm border shrink-0 ${RISK_STYLE[risk]}`}>
          {risk}
        </span>
        {hasScripts && (
          <button onClick={() => setShowScripts(!showScripts)}
            className="p-1 text-zinc-500 hover:text-[#FF3B30] transition shrink-0" title="Show script output">
            <Terminal size={13} />
          </button>
        )}
      </div>
      {hasScripts && showScripts && (
        <div className="mx-2 mb-2 bg-zinc-950 rounded-sm border border-white/5">
          {Object.entries(portInfo.scripts).map(([name, output]) => (
            <div key={name} className="border-b border-white/5 last:border-0">
              <div className="px-3 py-1 bg-zinc-900/50">
                <span className="font-mono text-[10px] text-[#FF3B30] uppercase tracking-wider">{name}</span>
              </div>
              <pre className="px-3 py-2 font-mono text-[10px] text-zinc-400 whitespace-pre-wrap break-all max-h-52 overflow-auto">
                {typeof output === 'string' ? output : JSON.stringify(output, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const NmapResults = ({ results }) => {
  const [showPorts, setShowPorts] = useState(true);
  const hosts = results?.hosts || {};
  const stats = results?.scan_stats || {};

  if (Object.keys(hosts).length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-zinc-400 font-mono text-sm">No open ports found — host may be down or ports filtered</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="flex gap-4 p-3 bg-zinc-900/20 rounded-sm flex-wrap">
        <span className="font-mono text-xs text-zinc-400">
          <span className="text-white font-bold">{stats.uphosts || Object.keys(hosts).length}</span> host(s) up
        </span>
        <span className="font-mono text-xs text-zinc-400">
          <span className="text-[#10B981] font-bold">{stats.open_ports || 0}</span> open ports
        </span>
        {stats.elapsed && (
          <span className="font-mono text-xs text-zinc-400">
            <span className="text-white font-bold">{stats.elapsed}s</span> elapsed
          </span>
        )}
        <span className="font-mono text-xs text-zinc-500">Engine: ⚡ Nmap 7.95</span>
      </div>

      {Object.entries(hosts).map(([host, hostData]) => {
        const allPorts = Object.entries(hostData.protocols?.tcp || {});
        const openPorts = allPorts.filter(([, p]) => p.state === 'open');
        return (
          <div key={host} className="border border-white/10 rounded-sm overflow-hidden">
            {/* Host header */}
            <div className="p-4 bg-zinc-900/30 border-b border-white/10">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <h3 className="font-mono text-base text-[#FF3B30] font-bold">{host}</h3>
                  {hostData.hostname && hostData.hostname !== host && (
                    <p className="font-mono text-xs text-zinc-500">{hostData.hostname}</p>
                  )}
                </div>
                <div className="flex gap-2 flex-wrap">
                  <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 rounded-sm">
                    {hostData.state}
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-mono bg-zinc-800 text-zinc-400 rounded-sm">
                    {openPorts.length} open / {allPorts.length} total
                  </span>
                </div>
              </div>

              {/* OS */}
              {hostData.os?.length > 0 && (
                <div className="mt-2 p-3 bg-blue-500/5 border border-blue-500/15 rounded-sm">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Monitor size={12} className="text-blue-400" />
                    <span className="font-mono text-[10px] text-blue-400 uppercase tracking-wider">OS Detection</span>
                  </div>
                  {hostData.os.slice(0, 3).map((os, i) => (
                    <div key={i} className="flex flex-wrap gap-2 mb-1">
                      <span className="font-mono text-xs text-white">{os.name}</span>
                      <span className="font-mono text-[10px] text-blue-400">{os.accuracy}% accuracy</span>
                      {os.type && <span className="font-mono text-[10px] text-zinc-500">· {os.type}</span>}
                      {os.vendor && <span className="font-mono text-[10px] text-zinc-500">· {os.vendor}</span>}
                      {os.osfamily && <span className="font-mono text-[10px] text-zinc-500">· {os.osfamily}</span>}
                    </div>
                  ))}
                </div>
              )}

              {/* CVEs */}
              {hostData.vulns?.length > 0 && (
                <div className="mt-2 p-3 bg-[#FF3B30]/8 border border-[#FF3B30]/20 rounded-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield size={12} className="text-[#FF3B30]" />
                    <span className="font-mono text-[10px] text-[#FF3B30] uppercase">{hostData.vulns.length} CVEs</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {hostData.vulns.slice(0, 15).map(v => (
                      <a key={v} href={`https://nvd.nist.gov/vuln/detail/${v}`} target="_blank" rel="noreferrer"
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

              {/* Tags */}
              {hostData.tags?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {hostData.tags.map(t => (
                    <span key={t} className="px-2 py-0.5 text-[10px] font-mono bg-zinc-800 text-zinc-400 rounded-sm">{t}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Ports */}
            {allPorts.length > 0 && (
              <div>
                <button onClick={() => setShowPorts(!showPorts)}
                  className="w-full flex items-center justify-between p-3 bg-zinc-900/20 hover:bg-zinc-900/40 transition border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] uppercase text-zinc-500 tracking-wider">TCP Ports</span>
                    <span className="font-mono text-[10px] text-[#10B981]">{openPorts.length} open</span>
                    {allPorts.length - openPorts.length > 0 && (
                      <span className="font-mono text-[10px] text-zinc-600">{allPorts.length - openPorts.length} filtered/closed</span>
                    )}
                  </div>
                  {showPorts ? <ChevronUp size={13} className="text-zinc-500" /> : <ChevronDown size={13} className="text-zinc-500" />}
                </button>
                {showPorts && (
                  <div>
                    <div className="px-3 py-2 bg-zinc-950/50 border-b border-white/5">
                      <div className="flex gap-2 flex-wrap mb-1">
                        {Object.entries(RISK_STYLE).map(([level, style]) => (
                          <span key={level} className={`px-2 py-0.5 text-[9px] font-mono uppercase rounded-sm border ${style}`}>{level}</span>
                        ))}
                      </div>
                      <div className="flex gap-6 text-[9px] font-mono text-zinc-600 uppercase tracking-wide">
                        <span className="w-14">Port</span>
                        <span className="w-16">State</span>
                        <span className="w-20">Service</span>
                        <span>Version / Product</span>
                      </div>
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
      })}
    </div>
  );
};

// ─── Generic Tool Results ─────────────────────────────────────────────────────
const ToolResults = ({ tool, results }) => {
  const [showRaw, setShowRaw] = useState(false);
  const summary = results?.summary || {};
  const findings = results?.findings || [];
  const output = results?.output || [];

  // Not installed case
  if (summary.status === 'not_installed') {
    const toolDef = TOOLS.find(t => t.id === tool);
    return (
      <div className="space-y-4">
        <div className="p-4 bg-[#F59E0B]/8 border border-[#F59E0B]/25 rounded-sm">
          <div className="flex items-start gap-3">
            <span className="text-2xl">{toolDef?.icon}</span>
            <div>
              <h3 className="font-mono text-sm text-[#F59E0B] font-bold mb-1">{summary.message}</h3>
              <p className="font-mono text-xs text-zinc-400 mb-3">{summary.description}</p>
              <div className="bg-zinc-950 rounded-sm p-3 border border-white/5">
                <p className="font-mono text-[10px] text-zinc-500 mb-1 uppercase tracking-wider">Install command:</p>
                <code className="font-mono text-xs text-[#10B981]">{summary.install}</code>
              </div>
            </div>
          </div>
        </div>

        {/* Show what the tool CAN do */}
        <div className="p-4 bg-zinc-900/20 border border-white/8 rounded-sm">
          <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider mb-3">Tool Capabilities</p>
          <div className="space-y-1">
            {output.map((line, i) => (
              <p key={i} className={`font-mono text-xs ${
                line.startsWith('  -') ? 'text-zinc-300 pl-2' :
                line === '' ? 'h-2' :
                line.includes('Install') || line.includes('download') ? 'text-[#10B981]' :
                'text-zinc-500'
              }`}>
                {line}
              </p>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Has results
  return (
    <div className="space-y-4">
      {/* Summary cards */}
      {Object.keys(summary).length > 0 && (
        <div className="flex flex-wrap gap-3 p-3 bg-zinc-900/20 rounded-sm">
          {Object.entries(summary).filter(([k]) => !['tool_version','status','message','install','description','url','error'].includes(k)).map(([key, val]) => (
            <div key={key} style={{ minWidth: '80px' }}>
              <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider mb-1">{key.replace(/_/g,' ')}</p>
              <p className={`font-mono text-lg font-bold ${
                key === 'critical' ? 'text-purple-400' :
                key === 'high' ? 'text-[#FF3B30]' :
                key === 'medium' ? 'text-[#F59E0B]' :
                key === 'low' ? 'text-[#10B981]' : 'text-white'
              }`}>{val}</p>
            </div>
          ))}
          {summary.tool_version && (
            <div className="ml-auto self-center">
              <span className="font-mono text-[10px] text-zinc-600">{summary.tool_version}</span>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {summary.error && (
        <div className="p-3 bg-[#FF3B30]/8 border border-[#FF3B30]/20 rounded-sm">
          <p className="font-mono text-xs text-[#FF3B30]">⚠ {summary.error}</p>
        </div>
      )}

      {/* Findings */}
      {findings.length > 0 && (
        <div className="border border-white/8 rounded-sm overflow-hidden">
          <div className="p-3 bg-zinc-900/30 border-b border-white/8">
            <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">
              {findings.length} Finding{findings.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="divide-y divide-white/5">
            {findings.map((f, i) => (
              <div key={i} className="p-3 hover:bg-zinc-900/20 transition">
                <div className="flex items-start gap-3">
                  <SeverityIcon level={f.severity} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-mono text-xs text-white font-semibold">
                        {f.name || f.template || f.technology || f.message || f.port || 'Finding'}
                      </span>
                      <SeverityBadge level={f.severity} />
                      {f.template && (
                        <span className="font-mono text-[10px] text-zinc-600">[{f.template}]</span>
                      )}
                    </div>
                    {f.version && (
                      <p className="font-mono text-xs text-zinc-400 mb-1">Version: {f.version}</p>
                    )}
                    {(f.service || f.protocol) && (
                      <p className="font-mono text-xs text-zinc-400 mb-1">
                        {f.port && `Port ${f.port} · `}{f.protocol} · {f.service}
                        {f.version && ` · ${f.version}`}
                      </p>
                    )}
                    {f.description && (
                      <p className="font-mono text-xs text-zinc-500 mb-1 line-clamp-2">{f.description}</p>
                    )}
                    {f.url && f.url !== 'undefined' && (
                      <p className="font-mono text-[10px] text-zinc-600 truncate">{f.url}</p>
                    )}
                    {f.solution && (
                      <div className="mt-1 p-2 bg-[#10B981]/5 border border-[#10B981]/15 rounded-sm">
                        <p className="font-mono text-[10px] text-[#10B981] font-bold mb-0.5">Solution:</p>
                        <p className="font-mono text-[10px] text-zinc-400">{f.solution}</p>
                      </div>
                    )}
                    {f.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {f.tags.map(tag => (
                          <span key={tag} className="px-1.5 py-0.5 text-[9px] font-mono bg-zinc-800 text-zinc-500 rounded-sm">{tag}</span>
                        ))}
                      </div>
                    )}
                    {f.reference?.length > 0 && (
                      <div className="mt-1">
                        {(Array.isArray(f.reference) ? f.reference : [f.reference]).slice(0, 2).map((ref, ri) => (
                          <a key={ri} href={ref} target="_blank" rel="noreferrer"
                            className="font-mono text-[10px] text-blue-500 hover:text-blue-400 mr-3 block truncate">
                            {ref}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Raw output toggle */}
      {output.length > 0 && (
        <div className="border border-white/8 rounded-sm overflow-hidden">
          <button onClick={() => setShowRaw(!showRaw)}
            className="w-full flex items-center justify-between p-3 bg-zinc-900/20 hover:bg-zinc-900/40 transition">
            <span className="font-mono text-[10px] uppercase text-zinc-500 tracking-wider">
              Raw Output ({output.length} lines)
            </span>
            {showRaw ? <ChevronUp size={13} className="text-zinc-500" /> : <ChevronDown size={13} className="text-zinc-500" />}
          </button>
          {showRaw && (
            <pre className="p-4 font-mono text-[11px] text-zinc-400 whitespace-pre-wrap break-all bg-zinc-950/70 max-h-80 overflow-auto">
              {output.join('\n')}
            </pre>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Main Scanner Component ───────────────────────────────────────────────────
const NetworkScanner = () => {
  const [target, setTarget] = useState('');
  const [activeTool, setActiveTool] = useState('nmap');
  const [scanType, setScanType] = useState('quick');
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState(null);
  const [scanEngine, setScanEngine] = useState('');

  const currentTool = TOOLS.find(t => t.id === activeTool);

  const startScan = async () => {
    if (!target.trim()) { toast.error('Please enter a target'); return; }
    setScanning(true); setResults(null); setScanEngine('');

    try {
      let response;
      if (activeTool === 'nmap') {
        response = await api.post('/api/scan/network', { target: target.trim(), scan_type: scanType });
      } else {
        response = await api.post('/api/scan/tool', { target: target.trim(), tool: activeTool });
      }
      toast.success(`${currentTool?.name} scan started`);
      pollScanStatus(response.data.scan_id, activeTool);
    } catch (err) {
      toast.error('Failed to start scan');
      setScanning(false);
    }
  };

  const pollScanStatus = async (id, tool) => {
    const timeout = tool === 'zap' ? 360000 : tool === 'nmap' ? 180000 : 120000;
    const interval = setInterval(async () => {
      try {
        const response = await api.get(`/api/scan/${id}`);
        if (response.data.status === 'completed') {
          setResults(response.data);
          setScanEngine(response.data.results?.scan_stats?.engine || tool);
          setScanning(false);
          clearInterval(interval);
          toast.success(`${currentTool?.name} scan completed`);
        } else if (response.data.status === 'failed') {
          setScanning(false); clearInterval(interval);
          toast.error('Scan failed — check backend logs');
        }
      } catch {}
    }, 2500);
    setTimeout(() => { clearInterval(interval); setScanning(false); }, timeout);
  };

  const hasNmapResults = results?.results?.hosts && Object.keys(results.results.hosts).length > 0;
  const toolResults = results?.results;

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-6">

      {/* Header */}
      <div className="mb-5">
        <h1 className="font-heading font-bold text-3xl md:text-4xl uppercase tracking-wider text-white mb-1">
          NETWORK <span className="text-[#FF3B30]">SCANNER</span>
        </h1>
        <p className="text-zinc-400 text-sm">Multi-tool security scanner — Nmap · Nuclei · Nikto · WhatWeb · OWASP ZAP</p>
      </div>

      {/* Notice */}
      <div className="mb-4 flex items-start gap-2 bg-[#F59E0B]/8 border border-[#F59E0B]/25 rounded-sm p-3">
        <Info size={14} className="text-[#F59E0B] mt-0.5 shrink-0" />
        <p className="text-[#F59E0B] font-mono text-xs">
          ⚠ Public IPs and domains only. Private IPs (192.168.x.x, 10.x.x.x) cannot be reached from the cloud server.
          Test with: <span className="text-white">scanme.nmap.org</span> · <span className="text-white">8.8.8.8</span> · <span className="text-white">example.com</span>
        </p>
      </div>

      {/* Tool selector */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {TOOLS.map(tool => (
          <button
            key={tool.id}
            onClick={() => { setActiveTool(tool.id); setResults(null); }}
            style={{ borderColor: activeTool === tool.id ? tool.color : 'rgba(255,255,255,0.1)' }}
            className={`flex items-center gap-2 px-3 py-2 rounded-sm border transition-all font-mono text-xs uppercase tracking-wider ${
              activeTool === tool.id ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <span>{tool.icon}</span>
            <span>{tool.name}</span>
            {activeTool === tool.id && (
              <span style={{ background: tool.color }}
                className="px-1.5 py-0.5 text-[9px] text-white rounded-sm">
                {tool.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Left: Config */}
        <div className="lg:col-span-1 space-y-4">

          {/* Tool info card */}
          <div style={{ borderColor: `${currentTool?.color}33` }}
            className="border rounded-sm p-4 bg-zinc-950/40">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{currentTool?.icon}</span>
              <div>
                <h3 className="font-mono text-sm text-white font-bold">{currentTool?.name}</h3>
                <p style={{ color: currentTool?.color }} className="font-mono text-[10px] uppercase tracking-wider">
                  {currentTool?.badge}
                </p>
              </div>
            </div>
            <p className="font-mono text-xs text-zinc-400 mb-3 leading-relaxed">{currentTool?.purpose}</p>
            <div>
              <p className="font-mono text-[9px] text-zinc-600 uppercase tracking-wider mb-1.5">Use Cases</p>
              <div className="flex flex-wrap gap-1">
                {currentTool?.useCases.map(uc => (
                  <span key={uc} style={{ borderColor: `${currentTool?.color}33`, color: currentTool?.color }}
                    className="px-2 py-0.5 text-[10px] font-mono border rounded-sm bg-transparent">
                    {uc}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Scan config */}
          <div className="bg-zinc-950/40 border border-white/10 rounded-sm p-4">
            <h2 className="font-heading font-semibold text-sm uppercase tracking-wide text-white/90 mb-4">
              Scan Configuration
            </h2>
            <div className="space-y-3">
              <div>
                <label className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-2 block">
                  Target {['nikto','whatweb','zap','nuclei'].includes(activeTool) ? '(URL or domain)' : '(IP or domain)'}
                </label>
                <Input
                  type="text"
                  placeholder={['nikto','whatweb','zap','nuclei'].includes(activeTool) ? 'https://example.com' : 'scanme.nmap.org or 8.8.8.8'}
                  value={target}
                  onChange={e => setTarget(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && startScan()}
                  className="bg-zinc-950/50 border-white/10 focus:border-[#FF3B30] text-white font-mono text-sm"
                />
              </div>

              {/* Scan type — only for nmap */}
              {activeTool === 'nmap' && (
                <div>
                  <label className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-2 block">Scan Type</label>
                  <Select value={scanType} onValueChange={setScanType}>
                    <SelectTrigger className="bg-zinc-950/50 border-white/10 text-white font-mono">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 border-white/10">
                      <SelectItem value="quick" className="text-white font-mono">Quick Scan (Top 100 ports)</SelectItem>
                      <SelectItem value="full" className="text-white font-mono">Full Scan (1000 ports + OS + Scripts)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button
                onClick={startScan}
                disabled={scanning}
                style={{ backgroundColor: scanning ? '#374151' : currentTool?.color }}
                className="w-full text-white font-mono uppercase tracking-wider text-xs hover:opacity-90 transition"
              >
                {scanning
                  ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Scanning with {currentTool?.name}...</>
                  : <><Play className="mr-2 h-4 w-4" />Start {currentTool?.name} Scan</>
                }
              </Button>
            </div>

            {/* Scan details */}
            <div className="mt-4 p-3 bg-zinc-900/20 border-l-2 border-zinc-700 rounded-r-sm">
              <p className="font-mono text-[9px] uppercase text-zinc-500 mb-2 tracking-widest">
                {currentTool?.name} Details
              </p>
              <div className="space-y-1 text-[11px] font-mono text-zinc-400">
                {activeTool === 'nmap' && scanType === 'quick' && <>
                  <p>• Top 100 common ports</p>
                  <p>• Service version detection</p>
                  <p>• Skip ping (-Pn)</p>
                  <p>• Fast timing (-T4)</p>
                  <p>• ~15–30 seconds</p>
                </>}
                {activeTool === 'nmap' && scanType === 'full' && <>
                  <p>• Top 1000 ports</p>
                  <p>• Full service versions</p>
                  <p>• NSE scripts (-sC)</p>
                  <p>• OS detection (-O)</p>
                  <p>• SSL cert analysis</p>
                  <p>• HTTP enumeration</p>
                  <p>• ~60–120 seconds</p>
                </>}
                {activeTool === 'nuclei' && <>
                  <p>• 9000+ vulnerability templates</p>
                  <p>• CVE detection</p>
                  <p>• Critical + High + Medium</p>
                  <p>• ~60–180 seconds</p>
                </>}
                {activeTool === 'nikto' && <>
                  <p>• 6700+ dangerous files</p>
                  <p>• HTTP header analysis</p>
                  <p>• Server version checks</p>
                  <p>• ~60–120 seconds</p>
                </>}
                {activeTool === 'whatweb' && <>
                  <p>• 1800+ web technologies</p>
                  <p>• CMS detection</p>
                  <p>• Framework fingerprinting</p>
                  <p>• ~10–20 seconds</p>
                </>}
                {activeTool === 'zap' && <>
                  <p>• OWASP Top 10 checks</p>
                  <p>• SQL injection detection</p>
                  <p>• XSS vulnerability scan</p>
                  <p>• Authentication testing</p>
                  <p>• ~120–300 seconds</p>
                </>}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Results */}
        <div className="lg:col-span-2">
          <div className="bg-zinc-950/40 border border-white/10 rounded-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-semibold text-lg uppercase tracking-wide text-white/90">
                {currentTool?.name} Results
              </h2>
              {scanEngine && !scanning && (
                <span className="font-mono text-[10px] text-zinc-500 uppercase">
                  {scanEngine === 'nmap' ? '⚡ Nmap 7.95'
                    : scanEngine === 'shodan-internetdb' ? '🌐 Shodan InternetDB'
                    : scanEngine === 'blocked' ? '🚫 Blocked'
                    : `🔧 ${scanEngine}`}
                </span>
              )}
            </div>

            {/* Idle */}
            {!results && !scanning && (
              <div className="text-center py-14">
                <span className="text-5xl mb-4 block">{currentTool?.icon}</span>
                <p className="text-zinc-400 font-mono text-sm mb-2">Ready to scan with {currentTool?.name}</p>
                <p className="text-zinc-600 font-mono text-xs">{currentTool?.description}</p>
              </div>
            )}

            {/* Scanning */}
            {scanning && (
              <div className="text-center py-14">
                <Loader2 className="mx-auto mb-4 animate-spin" size={40} style={{ color: currentTool?.color }} />
                <p className="text-zinc-400 font-mono text-sm mb-1">{currentTool?.name} scanning {target}...</p>
                <p className="text-zinc-600 font-mono text-xs">
                  {activeTool === 'nmap' && scanType === 'full' ? 'Full scan — 60–120 seconds'
                    : activeTool === 'zap' ? 'ZAP deep scan — up to 5 minutes'
                    : activeTool === 'nuclei' ? 'Template scanning — 1–3 minutes'
                    : 'Please wait...'}
                </p>
              </div>
            )}

            {/* Nmap results */}
            {!scanning && results && activeTool === 'nmap' && (
              <NmapResults results={results.results} />
            )}

            {/* Other tool results */}
            {!scanning && results && activeTool !== 'nmap' && (
              <ToolResults tool={activeTool} results={toolResults} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkScanner;
