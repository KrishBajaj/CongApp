import { Card } from "@/components/ui/card";
import { PredictionChart } from "@/components/PredictionChart";
import { SignalCard } from "@/components/SignalCard";
import { FeatureImportance } from "@/components/FeatureImportance";
import { MetricsPanel } from "@/components/MetricsPanel";

interface DashboardProps {
  symbol: string;
}

export const Dashboard = ({ symbol }: DashboardProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">{symbol}</h2>
          <p className="text-muted-foreground">Real-time analysis and forecasting</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SignalCard symbol={symbol} />
        <MetricsPanel symbol={symbol} />
      </div>

      <Card className="p-6 border-border bg-card">
        <h3 className="text-xl font-semibold mb-4">Price Forecast with Confidence Bands</h3>
        <PredictionChart symbol={symbol} />
      </Card>

      <Card className="p-6 border-border bg-card">
        <h3 className="text-xl font-semibold mb-4">Feature Importance</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Top factors driving the prediction model
        </p>
        <FeatureImportance />
      </Card>
    </div>
  );
};
