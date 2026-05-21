import { useState } from 'react';
import { Search, Loader2, Database } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/axiosConfig';

const Telegram = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleLookup = async () => {
    if (!query) {
      toast.error("Please enter name, phone, or email");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/api/telegram/leak_lookup', {
        query: query
      });

      setResults(response.data);
      toast.success("Lookup completed");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.detail || "Lookup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto p-6">

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading font-bold text-5xl uppercase tracking-wider text-white mb-2">
          LEAK <span className="text-[#FF3B30]">INTELLIGENCE</span>
        </h1>
        <p className="font-body text-zinc-400 text-sm">
          Search breached databases by name, phone, or email
        </p>
      </div>

      <div className="bg-zinc-950/40 backdrop-blur-xl border border-white/10 rounded-sm p-6">

        {/* Search Section */}
        <div className="flex gap-4 mb-6">
          <Input
            type="text"
            placeholder="Enter Name / Phone / Email"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-zinc-950/50 border-white/10 focus:border-[#FF3B30] text-white font-mono"
          />

          <Button
            onClick={handleLookup}
            disabled={loading}
            className="bg-[#FF3B30] hover:bg-[#FF3B30]/90 text-white font-mono uppercase tracking-wider text-xs"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Lookup
              </>
            )}
          </Button>
        </div>

        <div className="mt-4 p-4 bg-zinc-900/20 border-l-2 border-[#F59E0B] rounded-r-sm">
          <h3 className="font-mono text-xs uppercase text-zinc-500 mb-2">
            Supported Query Formats
          </h3>
          <div className="space-y-1 text-xs font-mono text-zinc-400">
            <p>• Full Name → John Doe</p>
            <p>• Email → example@gmail.com</p>
            <p>• Phone → +919876543210</p>
            <p>• Username → johndoe123</p>
          </div>
          <div className="mt-2 text-[10px] text-zinc-500 font-mono">
            Note: Avoid long multi-word inputs to reduce API cost.
          </div>
        </div>

        {/* Results */}
        {results && (
          <div className="space-y-6 mt-6">

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              <div className="bg-zinc-900/20 border-l-2 border-[#FF3B30] p-4 rounded-sm">
                <div className="font-mono text-xs uppercase text-zinc-500 mb-1">
                  Total Records
                </div>
                <div className="font-mono text-2xl font-bold text-[#FF3B30]">
                  {results.total_records}
                </div>
              </div>

              <div className="bg-zinc-900/20 border-l-2 border-[#10B981] p-4 rounded-sm">
                <div className="font-mono text-xs uppercase text-zinc-500 mb-1">
                  Sources Found
                </div>
                <div className="font-mono text-2xl font-bold text-[#10B981]">
                  {results.sources?.length || 0}
                </div>
              </div>

              <div className="bg-zinc-900/20 border-l-2 border-[#F59E0B] p-4 rounded-sm">
                <div className="font-mono text-xs uppercase text-zinc-500 mb-1">
                  Query
                </div>
                <div className="font-mono text-sm text-[#F59E0B] break-all">
                  {results.query}
                </div>
              </div>
            </div>

            {/* Source Results */}
            {results.sources?.map((source, idx) => (
              <div
                key={idx}
                className="border border-white/10 rounded-sm p-4 bg-zinc-900/20"
              >
                {/* Header */}
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <Database size={16} className="text-[#FF3B30]" />
                    <span className="font-mono text-sm text-white font-bold">
                      {source.source}
                    </span>
                  </div>

                  <span
                    className={`px-2 py-1 text-xs font-mono uppercase tracking-wider rounded-sm ${
                      source.severity === "high"
                        ? "bg-[#FF3B30]/10 text-[#FF3B30] border border-[#FF3B30]/30"
                        : source.severity === "medium"
                        ? "bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30"
                        : "bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30"
                    }`}
                  >
                    {source.severity}
                  </span>
                </div>

                {/* Records Count */}
                <div className="font-mono text-xs text-zinc-400 mb-3">
                  Records Found: {source.records_found}
                </div>

                {/* Sample Data */}
                <div className="bg-zinc-950/50 p-3 rounded-sm overflow-auto max-h-[250px]">
                  <pre className="font-mono text-xs text-zinc-300">
                    {JSON.stringify(source.sample_data, null, 2)}
                  </pre>
                </div>

              </div>
            ))}

          </div>
        )}

      </div>
    </div>
  );
};

export default Telegram;
