import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Star, TrendingUp, User, DollarSign, Info } from "lucide-react";
import { useState, useEffect } from "react";
import teamLogo from "@/assets/team-logo.svg";

export const Header = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully",
    });
    navigate("/auth");
  };

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <img
              src={teamLogo}
              alt="Team Zip Ties"
              className="h-16 w-auto cursor-pointer"
              onClick={() => navigate("/")}
            />
            <nav className="hidden md:flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/")}
                className="gap-2"
              >
                <TrendingUp className="h-4 w-4" />
                Dashboard
              </Button>
              {user && (
                <Button
                  variant="ghost"
                  onClick={() => navigate("/trading")}
                  className="gap-2"
                >
                  <DollarSign className="h-4 w-4" />
                  Trading
                </Button>
              )}
              <Button
                variant="ghost"
                onClick={() => navigate("/watchlists")}
                className="gap-2"
              >
                <Star className="h-4 w-4" />
                Watchlists
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate("/about")}
                className="gap-2"
              >
                <Info className="h-4 w-4" />
                About
              </Button>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10">
                  <User className="h-4 w-4 text-primary" />
                  <span className="text-sm text-foreground">{user.email}</span>
                </div>
                <Button variant="outline" onClick={handleSignOut} className="gap-2">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </>
            ) : (
              <Button onClick={() => navigate("/auth")} className="gap-2">
                <User className="h-4 w-4" />
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};