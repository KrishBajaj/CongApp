import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { mockPredictions } from "@/lib/mockData";
import { getStockQuote } from "@/lib/stockApi";
import { Loader2 } from "lucide-react";

interface MetricsPanelProps {
  symbol: string;
}

export const MetricsPanel = ({ symbol }: MetricsPanelProps) => {
  const prediction = mockPredictions[symbol] || mockPredictions["AAPL"];
  const [livePrice, setLivePrice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchLiveData = async () => {
      setIsLoading(true);
      const quote = await getStockQuote(symbol);
      if (quote) {
        setLivePrice(quote.c);
      }
      setIsLoading(false);
    };

    fetchLiveData();
    const interval = setInterval(fetchLiveData, 60000);

    return () => clearInterval(interval);
  }, [symbol]);

  const currentPrice = livePrice || prediction.currentPrice;

  return (
    <>
      <Card className="p-6 border-border bg-card">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
              Current Price (Live)
              {isLoading && <Loader2 className="w-3 h-3 animate-spin" />}
            </p>
            <p className="text-2xl font-bold">${currentPrice.toFixed(2)}</p>
          </div>
          <div className="pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground mb-1">Target Price</p>
            <p className="text-xl font-semibold text-primary">${prediction.targetPrice.toFixed(2)}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 border-border bg-card">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Volatility Forecast</p>
            <p className="text-2xl font-bold">{(prediction.volatility * 100).toFixed(1)}%</p>
          </div>
          <div className="pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground mb-1">Risk Level</p>
            <p className="text-xl font-semibold">
              {prediction.volatility > 0.3 ? "High" : prediction.volatility > 0.15 ? "Medium" : "Low"}
            </p>
          </div>
        </div>
      </Card>
    </>
  );
};
