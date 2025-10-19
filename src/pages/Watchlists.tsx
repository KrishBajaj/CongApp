import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { StockSearch } from "@/components/StockSearch";
import { WatchlistManager } from "@/components/WatchlistManager";
import { RecommendedStocks } from "@/components/RecommendedStocks";
import { TrendingUp, Star } from "lucide-react";

export default function Watchlists() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleAddStock = async (symbol: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("watchlists")
      .insert({ user_id: user.id, symbol });

    if (error) {
      if (error.code === "23505") {
        toast({
          title: "Already in watchlist",
          description: `${symbol} is already in your watchlist`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to add stock to watchlist",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Success",
        description: `${symbol} added to your watchlist`,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold flex items-center gap-3">
                <Star className="h-8 w-8 text-accent" />
                My Watchlists
              </h1>
              <p className="text-muted-foreground mt-2">
                Track and manage your favorite stocks
              </p>
            </div>
            <Button onClick={() => navigate("/")} variant="outline">
              <TrendingUp className="h-4 w-4 mr-2" />
              View Dashboard
            </Button>
          </div>

          <Card className="p-6 border-border bg-card">
            <h2 className="text-xl font-semibold mb-4">Search & Add Stocks</h2>
            <StockSearch onSelectStock={handleAddStock} />
          </Card>

          <RecommendedStocks onAddStock={handleAddStock} />

          <WatchlistManager userId={user?.id} />
        </div>
      </main>
      <Footer />
    </div>
  );
}