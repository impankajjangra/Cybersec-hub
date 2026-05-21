import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import api from '@/axiosConfig';

const OSINTPage = () => {
  const [query, setQuery] = useState('');
  const [queryType, setQueryType] = useState('ip');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const performLookup = async () => {
    if (!query) {
      toast.error('Please enter a query');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/api/osint/lookup', {
        query,
        query_type: queryType,
      });

      setResults(response.data);
      toast.success('OSINT lookup completed');
      setLoading(false);
    } catch (error) {
      console.error('OSINT error:', error);
      toast.error('Failed to perform lookup');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto p-6" data-testid="osint-page">
      <div className="mb-8">
        <h1 className="font-heading font-bold text-5xl uppercase tracking-wider text-white mb-2">
          OSINT <span className="text-[#FF3B30]">INTELLIGENCE</span>
        </h1>
        <p className="font-body text-zinc-400 text-sm">Open-source intelligence gathering and analysis</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-zinc-950/40 backdrop-blur-xl border border-white/10 rounded-sm p-5" data-testid="osint-config-panel">
            <h2 className="font-heading font-semibold text-xl uppercase tracking-wide text-white/90 mb-4">
              Search Configuration
            </h2>

            <div className="space-y-4">
              <div>
                <label className="font-mono text-xs uppercase tracking-widest text-zinc-500 mb-2 block">
                  Query Type
                </label>
                <Select value={queryType} onValueChange={setQueryType}>
                  <SelectTrigger className="bg-zinc-950/50 border-white/10 text-white font-mono" data-testid="query-type-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-950 border-white/10">
                    <SelectItem value="ip" className="text-white font-mono">IP Address</SelectItem>
                    <SelectItem value="domain" className="text-white font-mono">Domain</SelectItem>
                    <SelectItem value="email" className="text-white font-mono">Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="font-mono text-xs uppercase tracking-widest text-zinc-500 mb-2 block">
                  Query
                </label>
                <Input
                  type="text"
                  placeholder="Enter IP, domain, or email"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="bg-zinc-950/50 border-white/10 focus:border-[#FF3B30] text-white font-mono text-sm"
                  data-testid="query-input"
                />
              </div>

              <Button
                onClick={performLookup}
                disabled={loading}
                className="w-full bg-[#FF3B30] hover:bg-[#FF3B30]/90 text-white font-mono uppercase tracking-wider text-xs"
                data-testid="lookup-button"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Perform Lookup
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-zinc-950/40 backdrop-blur-xl border border-white/10 rounded-sm p-5" data-testid="osint-results-panel">
            <h2 className="font-heading font-semibold text-xl uppercase tracking-wide text-white/90 mb-4">
              Intelligence Results
            </h2>

            {!results && !loading && (
              <div className="text-center py-12">
                <Search className="mx-auto mb-4 text-zinc-600" size={48} strokeWidth={1.5} />
                <p className="text-zinc-500 font-mono text-sm">Enter a query to gather OSINT data</p>
              </div>
            )}

            {loading && (
              <div className="text-center py-12">
                <Loader2 className="mx-auto mb-4 text-[#FF3B30] animate-spin" size={48} />
                <p className="text-zinc-400 font-mono text-sm">Gathering intelligence...</p>
              </div>
            )}

            {results?.results && (
              <Tabs
                defaultValue={Object.keys(results.results)[0]}
                className="w-full"
                data-testid="osint-results-tabs"
              >
                <TabsList className="bg-zinc-900/50 border border-white/10">
                  {Object.keys(results.results).map((key) => (
                    <TabsTrigger
                      key={key}
                      value={key}
                      className="font-mono text-xs"
                    >
                      {key.toUpperCase()}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {Object.keys(results.results).map((key) => (
                  <TabsContent key={key} value={key} className="mt-4">
                    <div className="border border-white/10 rounded-sm p-4 bg-zinc-900/20">
                      <pre className="font-mono text-xs text-zinc-300 overflow-auto">
                        {JSON.stringify(results.results[key], null, 2)}
                      </pre>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OSINTPage;
