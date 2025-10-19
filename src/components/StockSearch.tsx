import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, TrendingUp, Loader2 } from "lucide-react";
import { searchStocks, StockSearchResult, getStockQuote, StockQuote } from "@/lib/stockApi";

interface StockSearchProps {
  onSelectStock: (symbol: string) => void;
}

export const StockSearch = ({ onSelectStock }: StockSearchProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<StockSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [quotes, setQuotes] = useState<Record<string, StockQuote | null>>({});
  const [loadingQuotes, setLoadingQuotes] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsSearching(true);
    setLoadingQuotes(true);

    const stocks = await searchStocks(query);
    const top = stocks.slice(0, 10);
    setResults(top);

    // Fetch quotes in parallel for visible results
    const entries = await Promise.all(
      top.map(async (s) => {
        const q = await getStockQuote(s.symbol);
        return [s.symbol, q] as const;
      })
    );
    const map: Record<string, StockQuote | null> = {};
    for (const [sym, q] of entries) map[sym] = q;
    setQuotes(map);

    setLoadingQuotes(false);
    setIsSearching(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Search stocks by symbol or name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1"
        />
        <Button onClick={handleSearch} disabled={isSearching}>
          <Search className="w-4 h-4 mr-2" />
          {isSearching ? 'Searching...' : 'Search'}
        </Button>
      </div>

      {results.length > 0 && (
        <Card className="p-4 space-y-2 max-h-[400px] overflow-y-auto bg-secondary/80">
          {results.map((stock) => {
            const quote = quotes[stock.symbol];
            const hasQuote = !!quote && typeof quote.c === 'number';
            const change = hasQuote ? quote!.dp : undefined;

            return (
              <button
                key={stock.symbol}
                onClick={() => {
                  onSelectStock(stock.symbol);
                  setResults([]);
                  setQuery("");
                }}
                className="w-full text-left p-3 rounded-lg hover:bg-secondary transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold flex items-center gap-2">
                    {stock.displaySymbol}
                    <span className="text-xs text-muted-foreground">{stock.type}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">{stock.description}</div>
                  <div className="mt-1 text-sm flex items-center gap-2">
                    {loadingQuotes && !hasQuote ? (
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <Loader2 className="w-3 h-3 animate-spin" /> Loading price...
                      </span>
                    ) : hasQuote ? (
                      <>
                        <span>${quote!.c.toFixed(2)}</span>
                        {typeof change === 'number' && (
                          <span className={`font-medium ${change >= 0 ? 'text-success' : 'text-destructive'}`}>
                            {change >= 0 ? '+' : ''}{change.toFixed(2)}%
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-muted-foreground">No price available</span>
                    )}
                  </div>
                </div>
                <TrendingUp className="w-4 h-4 text-primary" />
              </button>
            );
          })}
        </Card>
      )}
    </div>
  );
};
