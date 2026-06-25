import { useState } from 'react';
import { Search, Loader2, Database, ShieldAlert, AlertTriangle, AlertOctagon, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/axiosConfig';

const SEVERITY_CONFIG = {
  critical: { color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30', bar: 'border-purple-500', icon: AlertOctagon },
  high:     { color: 'text-[#FF3B30]',  bg: 'bg-[#FF3B30]/10',  border: 'border-[#FF3B30]/30',  bar: 'border-[#FF3B30]',  icon: AlertTriangle },
  medium:   { color: 'text-[#F59E0B]',  bg: 'bg-[#F59E0B]/10',  border: 'border-[#F59E0B]/30',  bar: 'border-[#F59E0B]',  icon: ShieldAlert },
  low:      { color: 'text-[#10B981]',  bg: 'bg-[#10B981]/10',  border: 'border-[#10B981]/30',  bar: 'border-[#10B981]',  icon: Database },
};

const SeverityBadge = ({ level }) => {
  const c = SEVERITY_CONFIG[level] || SEVERITY_CONFIG.medium;
  return (
    <span className={`px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded-sm ${c.bg} ${c.color} border ${c.border}`}>
      {level}
    </span>
  );
};

const RecordCard = ({ record, idx }) => {
  const [expanded, setExpanded] = useState(idx === 0);
  const entries = Object.entries(record).filter(([, v]) => v !== null && v !== '' && v !== '0');
  const SENSITIVE = ['password', 'pass', 'hash', 'email', 'phone', 'mobile', 'ip', 'address', 'dob', 'birth'];
  const isSensitive = (key) => SENSITIVE.some(s => key.toLowerCase().includes(s));

  return (
    <div className="border border-white/10 rounded-sm overflow-hidden mb-2">
      <button onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 bg-zinc-900/30 hover:bg-zinc-900/50 transition text-left">
        <span className="font-mono text-xs text-zinc-400">Record #{idx + 1}</span>
        {expanded ? <ChevronUp size={14} className="text-zinc-500" /> : <ChevronDown size={14} className="text-zinc-500" />}
      </button>
      {expanded && (
        <div className="p-3 grid grid-cols-1 gap-1">
          {entries.map(([key, value]) => (
            <div key={key} className="flex gap-2 items-start">
              <span className={`font-mono text-[11px] shrink-0 w-28 ${isSensitive(key) ? 'text-[#FF3B30]' : 'text-zinc-500'}`}>{key}:</span>
              <span className={`font-mono text-[11px] break-all ${isSensitive(key) ? 'text-white font-semibold' : 'text-zinc-300'}`}>
                {String(value).substring(0, 200)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const SourceCard = ({ source }) => {
  const [showData, setShowData] = useState(false);
  const c = SEVERITY_CONFIG[source.severity] || SEVERITY_CONFIG.medium;
  const Icon = c.icon;

  return (
    <div className={`border rounded-sm overflow-hidden ${c.border}`}>
      <div className={`p-4 ${c.bg} border-b ${c.border}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon size={18} className={c.color} />
            <div>
              <h3 className="font-mono text-sm text-white font-bold">{source.source}</h3>
              <p className="font-mono text-xs text-zinc-400 mt-0.5">
                {source.records_found} record{source.records_found !== 1 ? 's' : ''} found
              </p>
            </div>
          </div>
          <SeverityBadge level={source.severity} />
        </div>
      </div>
      {source.sample_data?.length > 0 && (
        <div className="bg-zinc-950/50">
          <button onClick={() => setShowData(!showData)}
            className="w-full flex items-center justify-between p-3 hover:bg-zinc-900/30 transition">
            <span className="font-mono text-xs text-zinc-400">
              {showData ? 'Hide' : 'Show'} sample data ({source.sample_data.length} records)
            </span>
            {showData ? <ChevronUp size={14} className="text-zinc-500" /> : <ChevronDown size={14} className="text-zinc-500" />}
          </button>
          {showData && (
            <div className="p-3 pt-0">
              {source.sample_data.map((record, idx) => <RecordCard key={idx} record={record} idx={idx} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const Telegram = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleLookup = async () => {
    if (!query.trim()) { toast.error("Please enter a name, email or phone"); return; }
    setLoading(true); setResults(null);
    try {
      const response = await api.post('/api/telegram/leak_lookup', { query });
      setResults(response.data);
      if (response.data.detail) {
        toast.error(`API Error: ${response.data.detail}`);
      } else if (response.data.total_records > 0) {
        toast.error(`⚠ ${response.data.total_records} leaked records found!`);
      } else {
        toast.success("No leaked records found");
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || "Lookup failed");
    } finally { setLoading(false); }
  };

  const overallSeverity = results?.sources?.length > 0
    ? (results.sources.some(s => s.severity === 'critical') ? 'critical'
      : results.sources.some(s => s.severity === 'high') ? 'high' : 'medium')
    : null;

  return (
    <div className="inner-page max-w-[1600px] mx-auto p-4 md:p-6" style={{ position: 'relative' }}>
      <div className="page-orb-red" />
      <div className="page-orb-purple" />

      <div className="mb-6">
        <h1 className="font-heading font-bold text-3xl md:text-5xl uppercase tracking-wider text-white mb-2">
          LEAKED <span className="text-[#FF3B30]">DATA</span>
        </h1>
        <p className="font-body text-zinc-400 text-sm">Search breached databases by name, email or phone</p>
      </div>

      {/* ⚠ Educational Warning */}
      <div className="mb-4 flex items-start gap-3 bg-red-950/30 border border-red-500/40 rounded-sm p-4">
        <AlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-mono text-xs font-bold text-red-400 uppercase tracking-wider mb-1">
            ⚠ Educational Purpose Only — Do Not Misuse
          </p>
          <p className="font-mono text-xs text-zinc-400 leading-relaxed">
            This tool is provided <strong className="text-white">strictly for educational and personal security awareness</strong> purposes only.
            Searching for other people's information without their consent may be <strong className="text-white">illegal</strong> in your jurisdiction.
            By using this tool, you agree to use it only to check your own data for security awareness.
            Misuse of this tool for unauthorized surveillance, stalking, or data harvesting is strictly prohibited.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Enter Name / Email / Phone / Username"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
          className="flex-1 p-3 bg-zinc-950/50 border border-white/10 focus:border-[#FF3B30] text-white font-mono text-sm rounded-sm outline-none transition"
        />
        <button onClick={handleLookup} disabled={loading}
          className="flex items-center gap-2 px-4 md:px-6 bg-[#FF3B30] hover:bg-[#FF3B30]/90 text-white font-mono uppercase tracking-wider text-xs rounded-sm transition disabled:opacity-50 whitespace-nowrap">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          <span className="hidden sm:inline">{loading ? 'Searching...' : 'Lookup'}</span>
        </button>
      </div>

      {/* Format hints */}
      <div className="mb-6 p-3 bg-zinc-950/40 border border-white/5 rounded-sm">
        <p className="font-mono text-xs text-zinc-500 mb-1 uppercase tracking-widest">Supported formats</p>
        <div className="flex flex-wrap gap-3 font-mono text-xs text-zinc-400">
          <span>📧 email@example.com</span>
          <span>📞 +919876543210</span>
          <span>👤 John Doe</span>
          <span>🔖 username123</span>
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="space-y-4">

          {/* Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className={`rounded-sm p-4 border-l-2 ${overallSeverity ? SEVERITY_CONFIG[overallSeverity]?.bar : 'border-[#10B981]'} bg-zinc-900/20`}>
              <div className="font-mono text-xs uppercase text-zinc-500 mb-1">Total Records</div>
              <div className={`font-mono text-3xl font-bold ${results.total_records > 0 ? 'text-[#FF3B30]' : 'text-[#10B981]'}`}>
                {results.total_records}
              </div>
            </div>
            <div className="bg-zinc-900/20 border-l-2 border-[#F59E0B] rounded-sm p-4">
              <div className="font-mono text-xs uppercase text-zinc-500 mb-1">Sources Breached</div>
              <div className="font-mono text-3xl font-bold text-[#F59E0B]">{results.sources?.length || 0}</div>
            </div>
            <div className="bg-zinc-900/20 border-l-2 border-zinc-600 rounded-sm p-4">
              <div className="font-mono text-xs uppercase text-zinc-500 mb-1">Query</div>
              <div className="font-mono text-sm text-white break-all">{results.query}</div>
            </div>
          </div>

          {/* Alert */}
          {results.total_records > 0 && (
            <div className={`flex items-start gap-3 p-4 rounded-sm border ${overallSeverity === 'critical' ? 'bg-purple-500/10 border-purple-500/30' : 'bg-[#FF3B30]/10 border-[#FF3B30]/30'}`}>
              <AlertTriangle size={20} className={overallSeverity === 'critical' ? 'text-purple-400' : 'text-[#FF3B30]'} />
              <div>
                <p className={`font-mono text-sm font-bold ${overallSeverity === 'critical' ? 'text-purple-300' : 'text-[#FF3B30]'}`}>
                  ⚠ Your data was found in {results.sources?.length} data breach{results.sources?.length !== 1 ? 'es' : ''}
                </p>
                <p className="font-mono text-xs text-zinc-400 mt-1">
                  Change your passwords immediately and enable 2FA on all accounts.
                </p>
              </div>
            </div>
          )}

          {results.total_records === 0 && !results.detail && (
            <div className="flex items-center gap-3 p-4 bg-[#10B981]/10 border border-[#10B981]/30 rounded-sm">
              <Database size={20} className="text-[#10B981]" />
              <p className="font-mono text-sm text-[#10B981]">✓ No leaked records found. Your data appears to be safe.</p>
            </div>
          )}

          {results.detail && (
            <div className="flex items-start gap-3 p-4 bg-[#FF3B30]/10 border border-[#FF3B30]/30 rounded-sm">
              <AlertTriangle size={20} className="text-[#FF3B30] shrink-0 mt-0.5" />
              <div>
                <p className="font-mono text-sm font-bold text-[#FF3B30]">API Error</p>
                <p className="font-mono text-xs text-zinc-400 mt-1">{results.detail}</p>
              </div>
            </div>
          )}

          {results.sources?.map((source, idx) => <SourceCard key={idx} source={source} />)}
        </div>
      )}
    </div>
  );
};

export default Telegram;
