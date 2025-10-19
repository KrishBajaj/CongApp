import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Trash2, TrendingUp, TrendingDown } from "lucide-react";
import { getStockQuote, StockQuote } from "@/lib/stockApi";

interface WatchlistManagerProps {
  userId: string;
}

export const WatchlistManager = ({ userId }: WatchlistManagerProps) => {
  const { toast } = useToast();
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<Record<string, StockQuote>>({});
  const [loading, setLoading] = useState(true);

  const fetchWatchlist = async () => {
    const { data, error } = await supabase
      .from("watchlists")
      .select("*")
      .eq("user_id", userId)
      .order("added_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load watchlist",
        variant: "destructive",
      });
    } else {
      setWatchlist(data || []);
      // Fetch quotes for all symbols
      if (data) {
        const quotePromises = data.map(async (item) => {
          const quote = await getStockQuote(item.symbol);
          return { symbol: item.symbol, quote };
        });
        const results = await Promise.all(quotePromises);
        const quotesMap: Record<string, StockQuote> = {};
        results.forEach(({ symbol, quote }) => {
          if (quote) quotesMap[symbol] = quote;
        });
        setQuotes(quotesMap);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWatchlist();
    const interval = setInterval(fetchWatchlist, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [userId]);

  const handleRemove = async (id: string) => {
    const { error } = await supabase.from("watchlists").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to remove stock",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Removed",
        description: "Stock removed from watchlist",
      });
      fetchWatchlist();
    }
  };

  if (loading) {
    return (
      <Card className="p-6 border-border bg-card">
        <div className="text-center text-muted-foreground">Loading watchlist...</div>
      </Card>
    );
  }

  if (watchlist.length === 0) {
    return (
      <Card className="p-6 border-border bg-card">
        <div className="text-center text-muted-foreground">
          Your watchlist is empty. Search for stocks to add them.
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 border-border bg-card">
      <h2 className="text-xl font-semibold mb-4">Your Stocks</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {watchlist.map((item) => {
          const quote = quotes[item.symbol];
          const priceChange = quote?.dp || 0;
          const isPositive = priceChange >= 0;

          return (
            <Card
              key={item.id}
              className="p-4 border-border bg-background hover:border-primary/50 transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-bold text-lg">{item.symbol}</h3>
                  {quote && (
                    <p className="text-2xl font-semibold text-foreground">
                      ${quote.c.toFixed(2)}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(item.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              {quote && (
                <div
                  className={`flex items-center gap-1 text-sm ${
                    isPositive ? "text-success" : "text-destructive"
                  }`}
                >
                  {isPositive ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  <span className="font-medium">
                    {isPositive ? "+" : ""}
                    {priceChange.toFixed(2)}%
                  </span>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                Added {new Date(item.added_at).toLocaleDateString()}
              </p>
            </Card>
          );
        })}
      </div>
    </Card>
  );
};