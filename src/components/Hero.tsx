import { TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import teamLogo from "@/assets/team-logo.svg";

export const Hero = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="flex justify-center mb-6">
            <img src={teamLogo} alt="Team Zip Ties" className="h-40 w-auto" />
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded bg-primary/10 border border-primary/20 backdrop-blur-sm">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Professional Stock Analysis</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground">
            Smart Stock Market Analysis
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Make informed investment decisions with advanced analytics and real-time market data
          </p>
          {!user && (
            <div className="flex gap-4 justify-center">
              <Button size="lg" onClick={() => navigate("/watchlists")} className="gap-2">
                <TrendingUp className="h-5 w-5" />
                Get Started
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/auth")}>
                Sign In
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
