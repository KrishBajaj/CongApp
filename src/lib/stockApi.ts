import { supabase } from "@/integrations/supabase/client";

export interface StockSearchResult {
  description: string;
  displaySymbol: string;
  symbol: string;
  type: string;
}

export interface StockQuote {
  c: number; // Current price
  d: number; // Change
  dp: number; // Percent change
  h: number; // High
  l: number; // Low
  o: number; // Open
  pc: number; // Previous close
  t: number; // Timestamp
}

export interface StockProfile {
  name: string;
  ticker: string;
  exchange: string;
  marketCapitalization: number;
  shareOutstanding: number;
  logo: string;
}

export const searchStocks = async (query: string): Promise<StockSearchResult[]> => {
  try {
    const url = `https://pqrfrnllrstmncvfcndd.supabase.co/functions/v1/stock-data?action=search&query=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    const result = await response.json();
    
    return result.result || [];
  } catch (error) {
    console.error('Error searching stocks:', error);
    return [];
  }
};

export const getStockQuote = async (symbol: string): Promise<StockQuote | null> => {
  try {
    const url = `https://pqrfrnllrstmncvfcndd.supabase.co/functions/v1/stock-data?action=quote&symbol=${encodeURIComponent(symbol)}`;
    const response = await fetch(url);
    const data = await response.json();

    // Validate Finnhub response shape and handle errors
    if (!data || typeof data.c !== 'number' || Number.isNaN(data.c) || data.error) {
      console.warn('Invalid quote data for symbol', symbol, data);
      return null;
    }

    return data as StockQuote;
  } catch (error) {
    console.error('Error fetching stock quote:', error);
    return null;
  }
};

export const getStockProfile = async (symbol: string): Promise<StockProfile | null> => {
  try {
    const url = `https://pqrfrnllrstmncvfcndd.supabase.co/functions/v1/stock-data?action=profile&symbol=${symbol}`;
    const response = await fetch(url);
    const data = await response.json();
    
    return data;
  } catch (error) {
    console.error('Error fetching stock profile:', error);
    return null;
  }
};
