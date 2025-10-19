import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { mockStockData } from "@/lib/mockData";
import { TrendingUp, TrendingDown } from "lucide-react";

interface PredictionChartProps {
  symbol: string;
}

const CustomDot = (props: any) => {
  const { cx, cy, payload } = props;
  if (!payload.signal) return null;

  const isBuy = payload.signal === "buy";
  const color = isBuy ? "hsl(142 76% 36%)" : "hsl(0 72% 51%)";

  // Use SVG path instead of React components for better compatibility
  const arrowPath = isBuy
    ? "M 0 6 L 4 2 L 8 6 M 4 2 L 4 10" // Up arrow
    : "M 0 2 L 4 6 L 8 2 M 4 6 L 4 -2"; // Down arrow

  return (
    <g>
      <circle cx={cx} cy={cy} r={10} fill={color} opacity={0.95} />
      <path
        d={arrowPath}
        transform={`translate(${cx - 4}, ${cy - 4})`}
        stroke="white"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  );
};

export const PredictionChart = ({ symbol }: PredictionChartProps) => {
  const data = useMemo(() => mockStockData(symbol), [symbol]);

  return (
    <div className="h-[500px] w-full flex flex-col">
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="confidenceBand" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" />
            <XAxis 
              dataKey="date" 
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '12px' }}
              interval="preserveStartEnd"
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '12px' }}
              domain={['dataMin - 5', 'dataMax + 5']}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--foreground))'
              }}
              formatter={(value: any, name: string) => {
                if (name === "signal") return null;
                return [value ? `$${value}` : "N/A", name === "actual" ? "Actual" : name === "predicted" ? "Predicted" : name];
              }}
            />
            <Area
              type="monotone"
              dataKey="upperBound"
              stroke="none"
              fill="url(#confidenceBand)"
            />
            <Area
              type="monotone"
              dataKey="lowerBound"
              stroke="none"
              fill="url(#confidenceBand)"
            />
            <Line 
              type="monotone" 
              dataKey="actual" 
              stroke="hsl(var(--foreground))" 
              strokeWidth={2}
              dot={<CustomDot />}
            />
            <Line 
              type="monotone" 
              dataKey="predicted" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={<CustomDot />}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-center flex-wrap gap-6 pt-4 text-sm border-t border-border mt-2">
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-foreground" />
          <span className="text-muted-foreground">Actual Price</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-primary" style={{ borderTop: '2px dashed' }} />
          <span className="text-muted-foreground">Predicted Price</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-primary opacity-30 rounded" />
          <span className="text-muted-foreground">95% Confidence Band</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-success rounded-full flex items-center justify-center">
            <TrendingUp className="w-3 h-3 text-white" />
          </div>
          <span className="text-muted-foreground">Buy Signal</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-destructive rounded-full flex items-center justify-center">
            <TrendingDown className="w-3 h-3 text-white" />
          </div>
          <span className="text-muted-foreground">Sell Signal</span>
        </div>
      </div>
    </div>
  );
};
