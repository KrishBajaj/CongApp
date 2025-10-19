import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const featureData = [
  { name: "RSI (14)", importance: 0.23 },
  { name: "MACD Signal", importance: 0.19 },
  { name: "Volume MA", importance: 0.16 },
  { name: "Sentiment Score", importance: 0.14 },
  { name: "Price Momentum", importance: 0.12 },
  { name: "Bollinger Band", importance: 0.09 },
  { name: "ATR", importance: 0.07 },
];

export const FeatureImportance = () => {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={featureData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" />
          <XAxis 
            type="number"
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            type="category"
            dataKey="name"
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
            width={120}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              color: 'hsl(var(--foreground))'
            }}
            formatter={(value: number) => `${(value * 100).toFixed(1)}%`}
          />
          <Bar dataKey="importance" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
