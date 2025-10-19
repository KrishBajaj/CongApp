import { Card } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export const Disclaimer = () => {
  return (
    <Card className="mt-8 p-6 border-warning bg-warning/5">
      <div className="flex items-start gap-4">
        <AlertTriangle className="w-6 h-6 text-warning flex-shrink-0 mt-1" />
        <div className="space-y-2">
          <h4 className="font-semibold text-warning">Risk Disclosure & Limitations</h4>
          <div className="text-sm text-foreground space-y-2">
            <p>
              <strong>No Guarantees:</strong> All predictions are probabilistic and based on historical patterns. 
              Past performance does not guarantee future results. Markets are non-stationary and subject to unpredictable events.
            </p>
            <p>
              <strong>Not Financial Advice:</strong> This platform provides educational analysis tools only. 
              Consult a licensed financial advisor before making investment decisions. We are not responsible for any trading losses.
            </p>
            <p>
              <strong>Model Limitations:</strong> Predictions cannot account for black-swan events, regulatory changes, 
              or sudden market shocks. Always use proper risk management including stop losses and position sizing.
            </p>
            <p>
              <strong>Data Accuracy:</strong> While we strive for accuracy, data delays and quality issues may affect predictions. 
              Verify all information independently before acting on it.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};
