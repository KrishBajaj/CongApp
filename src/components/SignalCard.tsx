import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Loader2 } from "lucide-react";
import { mockPredictions } from "@/lib/mockData";
import { getStockQuote } from "@/lib/stockApi";

interface SignalCardProps {
  symbol: string;
}

export const SignalCard = ({ symbol }: SignalCardProps) => {
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
    const interval = setInterval(fetchLiveData, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, [symbol]);

  const currentPrice = livePrice || prediction.currentPrice;
  
  const SignalIcon = prediction.signal === "buy" 
    ? TrendingUp 
    : prediction.signal === "sell" 
    ? TrendingDown 
    : Minus;

  const signalColor = prediction.signal === "buy"
    ? "success"
    : prediction.signal === "sell"
    ? "destructive"
    : "secondary";

  return (
    <Card className="p-6 border-border bg-card">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
            Signal
            {isLoading && <Loader2 className="w-3 h-3 animate-spin" />}
          </p>
          <div className="flex items-center gap-2">
            <SignalIcon className={`w-6 h-6 text-${signalColor}`} />
            <span className="text-2xl font-bold capitalize">{prediction.signal}</span>
          </div>
        </div>
        <Badge variant={signalColor as any} className="capitalize">
          {prediction.signal}
        </Badge>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Confidence</span>
          <span className="text-sm font-semibold">{(prediction.confidence * 100).toFixed(1)}%</span>
        </div>
        <div className="w-full bg-secondary rounded-full h-2">
          <div 
            className={`bg-${signalColor} h-2 rounded-full transition-all`}
            style={{ width: `${prediction.confidence * 100}%` }}
          />
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Expected Return</span>
          <span className={`text-sm font-semibold ${prediction.expectedReturn > 0 ? 'text-success' : 'text-destructive'}`}>
            {prediction.expectedReturn > 0 ? '+' : ''}{prediction.expectedReturn.toFixed(2)}%
          </span>
        </div>
      </div>
    </Card>
  );
};
