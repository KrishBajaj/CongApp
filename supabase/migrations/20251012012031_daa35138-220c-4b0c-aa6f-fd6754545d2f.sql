-- Create watchlists table for user stock tracking
CREATE TABLE IF NOT EXISTS public.watchlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  symbol TEXT NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, symbol)
);

-- Create recommended_stocks table
CREATE TABLE IF NOT EXISTS public.recommended_stocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  reason TEXT,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommended_stocks ENABLE ROW LEVEL SECURITY;

-- Watchlist policies - users can only see and manage their own watchlists
CREATE POLICY "Users can view their own watchlists"
ON public.watchlists
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own watchlists"
ON public.watchlists
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own watchlists"
ON public.watchlists
FOR DELETE
USING (auth.uid() = user_id);

-- Recommended stocks are viewable by everyone
CREATE POLICY "Recommended stocks are viewable by everyone"
ON public.recommended_stocks
FOR SELECT
USING (true);

-- Insert some initial recommended stocks
INSERT INTO public.recommended_stocks (symbol, name, reason, priority) VALUES
('NVDA', 'NVIDIA Corporation', 'Leading AI chip manufacturer with strong growth trajectory', 1),
('MSFT', 'Microsoft Corporation', 'Diversified tech giant with cloud computing dominance', 2),
('GOOGL', 'Alphabet Inc.', 'Search and advertising leader expanding into AI', 3),
('AAPL', 'Apple Inc.', 'Premium consumer electronics with loyal customer base', 4),
('TSLA', 'Tesla Inc.', 'Electric vehicle pioneer with energy solutions', 5)
ON CONFLICT (symbol) DO NOTHING;