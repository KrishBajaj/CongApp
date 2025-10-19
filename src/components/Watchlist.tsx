import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, TrendingUp, TrendingDown } from "lucide-react";
import { mockPredictions } from "@/lib/mockData";
import { getStockQuote } from "@/lib/stockApi";

interface WatchlistProps {
  onSelectSymbol: (symbol: string) => void;
  selectedSymbol: string;
}

const watchlistSymbols = ["AAPL", "GOOGL", "MSFT", "TSLA", "AMZN"];

export const Watchlist = ({ onSelectSymbol, selectedSymbol }: WatchlistProps) => {
  const [livePrices, setLivePrices] = useState<Record<string, number>>({});
  const [priceChanges, setPriceChanges] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllPrices = async () => {
      setIsLoading(true);
      const prices: Record<string, number> = {};
      const changes: Record<string, number> = {};
      
      for (const symbol of watchlistSymbols) {
        const quote = await getStockQuote(symbol);
        if (quote && quote.c) {
          prices[symbol] = quote.c;
          changes[symbol] = quote.dp; // percent change
        }
      }
      
      setLivePrices(prices);
      setPriceChanges(changes);
      setIsLoading(false);
    };

    fetchAllPrices();
    const interval = setInterval(fetchAllPrices, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);
  return (
    <Card className="p-6 border-border bg-card sticky top-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-warning" />
          <h3 className="text-lg font-semibold">Watchlist</h3>
        </div>
        {isLoading && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            Live
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        {watchlistSymbols.map((symbol) => {
          const prediction = mockPredictions[symbol];
          const isSelected = symbol === selectedSymbol;
          const currentPrice = livePrices[symbol] || prediction.currentPrice;
          const priceChange = priceChanges[symbol];
          const hasLiveData = livePrices[symbol] !== undefined;
          
          return (
            <Button
              key={symbol}
              variant={isSelected ? "default" : "ghost"}
              className="w-full justify-between h-auto py-3"
              onClick={() => onSelectSymbol(symbol)}
            >
              <div className="flex flex-col items-start">
                <span className="font-semibold">{symbol}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    ${currentPrice.toFixed(2)}
                  </span>
                  {hasLiveData && priceChange !== undefined && (
                    <span className={`text-xs font-medium ${
                      priceChange >= 0 ? 'text-success' : 'text-destructive'
                    }`}>
                      {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {prediction.signal === "buy" ? (
                  <TrendingUp className="w-4 h-4 text-success" />
                ) : prediction.signal === "sell" ? (
                  <TrendingDown className="w-4 h-4 text-destructive" />
                ) : null}
              </div>
            </Button>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-secondary rounded-lg">
        <p className="text-xs text-muted-foreground">
          <strong>Live Data:</strong> Prices update every 30 seconds from market feeds.
        </p>
      </div>
    </Card>
  );
};
