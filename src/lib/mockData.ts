// Mock data generator for demonstration purposes
// In production, this would fetch from real APIs and ML model predictions

export interface StockPrediction {
  currentPrice: number;
  targetPrice: number;
  expectedReturn: number;
  confidence: number;
  signal: "buy" | "sell" | "hold";
  volatility: number;
}

export const mockPredictions: Record<string, StockPrediction> = {
  AAPL: {
    currentPrice: 178.45,
    targetPrice: 192.30,
    expectedReturn: 7.76,
    confidence: 0.78,
    signal: "buy",
    volatility: 0.21,
  },
  GOOGL: {
    currentPrice: 141.23,
    targetPrice: 138.50,
    expectedReturn: -1.93,
    confidence: 0.65,
    signal: "sell",
    volatility: 0.18,
  },
  MSFT: {
    currentPrice: 378.91,
    targetPrice: 395.20,
    expectedReturn: 4.30,
    confidence: 0.82,
    signal: "buy",
    volatility: 0.16,
  },
  TSLA: {
    currentPrice: 242.84,
    targetPrice: 245.10,
    expectedReturn: 0.93,
    confidence: 0.52,
    signal: "hold",
    volatility: 0.38,
  },
  AMZN: {
    currentPrice: 178.35,
    targetPrice: 188.75,
    expectedReturn: 5.83,
    confidence: 0.73,
    signal: "buy",
    volatility: 0.23,
  },
};

export const mockStockData = (symbol: string) => {
  const prediction = mockPredictions[symbol] || mockPredictions["AAPL"];
  const basePrice = prediction.currentPrice;
  const data = [];
  
  // Generate 60 days of historical data for more realistic trends
  for (let i = 60; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    // Create realistic price movements with trends
    const dayOffset = (60 - i) / 60;
    const trendComponent = (prediction.targetPrice - basePrice) * dayOffset * 0.8;
    
    // Add sine wave for realistic market cycles
    const cycleComponent = Math.sin((60 - i) / 5) * basePrice * 0.015;
    
    // Add daily volatility
    const randomComponent = (Math.random() - 0.5) * basePrice * prediction.volatility * 0.05;
    
    const actual = i === 0 
      ? basePrice 
      : basePrice * 0.92 + trendComponent + cycleComponent + randomComponent;
    
    // Predictions start appearing 14 days before current
    const predicted = i <= 14 ? null : actual + (Math.random() - 0.5) * basePrice * 0.01;
    
    // Confidence bands
    const uncertainty = i <= 14 ? 0 : Math.max(0, 14 - i) * basePrice * 0.008;
    const upperBound = predicted ? predicted + uncertainty : null;
    const lowerBound = predicted ? predicted - uncertainty : null;
    
    // Determine buy/sell signals based on technical indicators
    let signal = null;
    if (i <= 60 && i > 0) {
      const priceChange = ((actual - (basePrice * 0.92)) / (basePrice * 0.92)) * 100;
      const momentum = dayOffset * 100;
      
      // Buy signal: price dip with positive momentum
      if (priceChange < -2 && momentum > 30 && prediction.signal === "buy") {
        signal = "buy";
      }
      // Sell signal: price peak with negative outlook
      else if (priceChange > 3 && prediction.signal === "sell") {
        signal = "sell";
      }
    }
    
    data.push({
      date: dateStr,
      actual: parseFloat(actual.toFixed(2)),
      predicted: predicted ? parseFloat(predicted.toFixed(2)) : null,
      upperBound: upperBound ? parseFloat(upperBound.toFixed(2)) : null,
      lowerBound: lowerBound ? parseFloat(lowerBound.toFixed(2)) : null,
      signal,
    });
  }
  
  // Add 14 days of future predictions with realistic progression
  for (let i = 1; i <= 14; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    const dayOffset = i / 14;
    const targetDiff = prediction.targetPrice - basePrice;
    
    // Non-linear progression for realistic forecasts
    const progression = Math.pow(dayOffset, 0.8);
    const predicted = basePrice + (targetDiff * progression);
    
    // Increasing uncertainty over time
    const uncertainty = i * basePrice * 0.012 * (1 + prediction.volatility);
    
    // Add potential buy/sell signals in forecast
    let signal = null;
    if (i === 3 && prediction.signal === "buy") {
      signal = "buy";
    } else if (i === 7 && prediction.signal === "sell") {
      signal = "sell";
    }
    
    data.push({
      date: dateStr,
      actual: null,
      predicted: parseFloat(predicted.toFixed(2)),
      upperBound: parseFloat((predicted + uncertainty).toFixed(2)),
      lowerBound: parseFloat((predicted - uncertainty).toFixed(2)),
      signal,
    });
  }
  
  return data;
};
