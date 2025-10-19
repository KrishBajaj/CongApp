import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles } from "lucide-react";
import { getStockQuote, StockQuote } from "@/lib/stockApi";

interface RecommendedStocksProps {
  onAddStock: (symbol: string) => void;
}

export const RecommendedStocks = ({ onAddStock }: RecommendedStocksProps) => {
  const [recommended, setRecommended] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<Record<string, StockQuote>>({});

  useEffect(() => {
    const fetchRecommended = async () => {
      const { data } = await supabase
        .from("recommended_stocks")
        .select("*")
        .order("priority", { ascending: true });

      if (data) {
        setRecommended(data);
        // Fetch quotes
        const quotePromises = data.map(async (stock) => {
          const quote = await getStockQuote(stock.symbol);
          return { symbol: stock.symbol, quote };
        });
        const results = await Promise.all(quotePromises);
        const quotesMap: Record<string, StockQuote> = {};
        results.forEach(({ symbol, quote }) => {
          if (quote) quotesMap[symbol] = quote;
        });
        setQuotes(quotesMap);
      }
    };

    fetchRecommended();
  }, []);

  return (
    <Card className="p-6 border-border bg-gradient-to-br from-card to-primary/5">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-accent" />
        <h2 className="text-xl font-semibold">Recommended Stocks</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommended.map((stock) => {
          const quote = quotes[stock.symbol];
          return (
            <Card
              key={stock.id}
              className="p-4 border-border bg-background hover:border-accent/50 transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{stock.symbol}</h3>
                  <p className="text-sm text-muted-foreground">{stock.name}</p>
                  {quote && (
                    <p className="text-xl font-semibold text-foreground mt-1">
                      ${quote.c.toFixed(2)}
                    </p>
                  )}
                </div>
                <Button
                  size="sm"
                  onClick={() => onAddStock(stock.symbol)}
                  className="gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">{stock.reason}</p>
            </Card>
          );
        })}
      </div>
    </Card>
  );
};