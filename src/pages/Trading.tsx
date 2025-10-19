import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, TrendingDown, DollarSign, History } from "lucide-react";
import { getStockQuote } from "@/lib/stockApi";
import { format } from "date-fns";

interface Portfolio {
  cash_balance: number;
}

interface PortfolioStock {
  symbol: string;
  quantity: number;
  average_price: number;
}

interface Transaction {
  id: string;
  symbol: string;
  type: string;
  quantity: number;
  price: number;
  total_amount: number;
  created_at: string;
}

const Trading = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [stocks, setStocks] = useState<PortfolioStock[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [symbol, setSymbol] = useState("");
  const [quantity, setQuantity] = useState("");
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);

  useEffect(() => {
    checkAuth();
    fetchPortfolioData();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const fetchPortfolioData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch or create portfolio
    let { data: portfolioData, error: portfolioError } = await supabase
      .from("portfolios")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (portfolioError && portfolioError.code === "PGRST116") {
      // Portfolio doesn't exist, create it
      const { data: newPortfolio, error: createError } = await supabase
        .from("portfolios")
        .insert({ user_id: user.id, cash_balance: 150.00 })
        .select()
        .single();

      if (createError) {
        toast({
          title: "Error",
          description: "Failed to create portfolio",
          variant: "destructive",
        });
        return;
      }
      portfolioData = newPortfolio;
    }

    setPortfolio(portfolioData);

    // Fetch stocks
    const { data: stocksData } = await supabase
      .from("portfolio_stocks")
      .select("*")
      .eq("user_id", user.id);

    setStocks(stocksData || []);

    // Fetch transactions
    const { data: transactionsData } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    setTransactions(transactionsData || []);
  };

  const fetchPrice = async () => {
    if (!symbol) return;
    
    setLoading(true);
    const quote = await getStockQuote(symbol.toUpperCase());
    setLoading(false);

    if (quote && quote.c > 0) {
      setCurrentPrice(quote.c);
    } else {
      toast({
        title: "Error",
        description: "Unable to fetch stock price. Please check the symbol.",
        variant: "destructive",
      });
      setCurrentPrice(null);
    }
  };

  const handleBuy = async () => {
    if (!portfolio || !currentPrice || !quantity || !symbol) return;

    const qty = parseInt(quantity);
    const total = currentPrice * qty;

    if (total > portfolio.cash_balance) {
      toast({
        title: "Insufficient Funds",
        description: `You need $${total.toFixed(2)} but only have $${portfolio.cash_balance.toFixed(2)}`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Update cash balance
    const { error: updateError } = await supabase
      .from("portfolios")
      .update({ cash_balance: portfolio.cash_balance - total })
      .eq("user_id", user.id);

    if (updateError) {
      toast({ title: "Error", description: "Failed to update balance", variant: "destructive" });
      setLoading(false);
      return;
    }

    // Check if stock exists
    const existingStock = stocks.find(s => s.symbol === symbol.toUpperCase());

    if (existingStock) {
      // Update existing stock
      const newQuantity = existingStock.quantity + qty;
      const newAvgPrice = ((existingStock.average_price * existingStock.quantity) + (currentPrice * qty)) / newQuantity;

      await supabase
        .from("portfolio_stocks")
        .update({ quantity: newQuantity, average_price: newAvgPrice })
        .eq("user_id", user.id)
        .eq("symbol", symbol.toUpperCase());
    } else {
      // Insert new stock
      await supabase
        .from("portfolio_stocks")
        .insert({
          user_id: user.id,
          symbol: symbol.toUpperCase(),
          quantity: qty,
          average_price: currentPrice,
        });
    }

    // Record transaction
    await supabase
      .from("transactions")
      .insert({
        user_id: user.id,
        symbol: symbol.toUpperCase(),
        type: "buy",
        quantity: qty,
        price: currentPrice,
        total_amount: total,
      });

    toast({ title: "Success", description: `Bought ${qty} shares of ${symbol.toUpperCase()}` });
    
    setSymbol("");
    setQuantity("");
    setCurrentPrice(null);
    setLoading(false);
    fetchPortfolioData();
  };

  const handleSell = async () => {
    if (!portfolio || !currentPrice || !quantity || !symbol) return;

    const qty = parseInt(quantity);
    const existingStock = stocks.find(s => s.symbol === symbol.toUpperCase());

    if (!existingStock || existingStock.quantity < qty) {
      toast({
        title: "Insufficient Shares",
        description: `You only own ${existingStock?.quantity || 0} shares`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const total = currentPrice * qty;

    // Update cash balance
    await supabase
      .from("portfolios")
      .update({ cash_balance: portfolio.cash_balance + total })
      .eq("user_id", user.id);

    // Update or delete stock
    if (existingStock.quantity === qty) {
      await supabase
        .from("portfolio_stocks")
        .delete()
        .eq("user_id", user.id)
        .eq("symbol", symbol.toUpperCase());
    } else {
      await supabase
        .from("portfolio_stocks")
        .update({ quantity: existingStock.quantity - qty })
        .eq("user_id", user.id)
        .eq("symbol", symbol.toUpperCase());
    }

    // Record transaction
    await supabase
      .from("transactions")
      .insert({
        user_id: user.id,
        symbol: symbol.toUpperCase(),
        type: "sell",
        quantity: qty,
        price: currentPrice,
        total_amount: total,
      });

    toast({ title: "Success", description: `Sold ${qty} shares of ${symbol.toUpperCase()}` });
    
    setSymbol("");
    setQuantity("");
    setCurrentPrice(null);
    setLoading(false);
    fetchPortfolioData();
  };

  const totalValue = stocks.reduce((acc, stock) => acc + (stock.quantity * stock.average_price), 0) + (portfolio?.cash_balance || 0);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Trading Simulator</h1>
          <p className="text-muted-foreground">Practice trading with a virtual portfolio</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cash Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${portfolio?.cash_balance.toFixed(2) || "0.00"}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Stocks</CardTitle>
              <History className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stocks.length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="trade" className="space-y-4">
          <TabsList>
            <TabsTrigger value="trade">Trade</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="trade">
            <Card>
              <CardHeader>
                <CardTitle>Buy/Sell Stocks</CardTitle>
                <CardDescription>Enter a stock symbol to get the current price</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="symbol">Stock Symbol</Label>
                  <div className="flex gap-2">
                    <Input
                      id="symbol"
                      placeholder="e.g., AAPL"
                      value={symbol}
                      onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                    />
                    <Button onClick={fetchPrice} disabled={loading || !symbol}>
                      Get Price
                    </Button>
                  </div>
                </div>

                {currentPrice && (
                  <>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Current Price</p>
                      <p className="text-2xl font-bold">${currentPrice.toFixed(2)}</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        placeholder="Number of shares"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                      />
                    </div>

                    {quantity && parseInt(quantity) > 0 && (
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Total Cost</p>
                        <p className="text-xl font-bold">${(currentPrice * parseInt(quantity)).toFixed(2)}</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button onClick={handleBuy} disabled={loading || !quantity} className="flex-1">
                        <TrendingUp className="mr-2 h-4 w-4" />
                        Buy
                      </Button>
                      <Button onClick={handleSell} disabled={loading || !quantity} variant="destructive" className="flex-1">
                        <TrendingDown className="mr-2 h-4 w-4" />
                        Sell
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="portfolio">
            <Card>
              <CardHeader>
                <CardTitle>Your Holdings</CardTitle>
                <CardDescription>Stocks you currently own</CardDescription>
              </CardHeader>
              <CardContent>
                {stocks.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No stocks in portfolio yet. Start trading!</p>
                ) : (
                  <div className="space-y-4">
                    {stocks.map((stock) => (
                      <div key={stock.symbol} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-semibold">{stock.symbol}</p>
                          <p className="text-sm text-muted-foreground">{stock.quantity} shares @ ${stock.average_price.toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${(stock.quantity * stock.average_price).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>Your recent trades</CardDescription>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No transactions yet</p>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {tx.type === "buy" ? (
                            <TrendingUp className="h-5 w-5 text-green-500" />
                          ) : (
                            <TrendingDown className="h-5 w-5 text-red-500" />
                          )}
                          <div>
                            <p className="font-semibold">{tx.symbol}</p>
                            <p className="text-sm text-muted-foreground">
                              {tx.type.toUpperCase()} {tx.quantity} @ ${tx.price.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${tx.total_amount.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(tx.created_at), "MMM d, h:mm a")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default Trading;
