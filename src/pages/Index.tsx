import { useState } from "react";
import { Hero } from "@/components/Hero";
import { Dashboard } from "@/components/Dashboard";
import { Watchlist } from "@/components/Watchlist";
import { StockSearch } from "@/components/StockSearch";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const Index = () => {
  const [selectedSymbol, setSelectedSymbol] = useState<string>("AAPL");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <Hero />
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="mb-8">
          <StockSearch onSelectStock={setSelectedSymbol} />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Watchlist onSelectSymbol={setSelectedSymbol} selectedSymbol={selectedSymbol} />
          </div>
          <div className="lg:col-span-3">
            <Dashboard symbol={selectedSymbol} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
