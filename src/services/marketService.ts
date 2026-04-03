import type React from "react";

const FINNHUB_API_KEY = import.meta.env.VITE_FINNHUB_API_KEY;

export interface StockData {
  id: number;
  name: string;
  symbol: string;
  price: number;
  change: number;
  icon?: React.ReactNode;
  high?: number;
  low?: number;
  open?: number;
  volume?: number;
}

/**
 * Fetch detailed crypto data from Binance (24hr ticker)
 */
async function fetchCryptoDetails(symbol: string): Promise<Partial<StockData> | null> {
  try {
    const binanceSymbol = `${symbol}USDT`;
    const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${binanceSymbol}`);
    const data = await response.json();
    if (data.lastPrice) {
      return {
        price: parseFloat(data.lastPrice),
        change: parseFloat(data.priceChangePercent),
        high: parseFloat(data.highPrice),
        low: parseFloat(data.lowPrice),
        open: parseFloat(data.openPrice),
        volume: parseFloat(data.quoteVolume)
      };
    }
    return null;
  } catch (error) {
    console.error(`Error fetching crypto details for ${symbol}:`, error);
    return null;
  }
}

/**
 * Fetch stock price and details from Finnhub
 */
async function fetchStockPrice(symbol: string): Promise<Partial<StockData> | null> {
  if (!FINNHUB_API_KEY) return null;
  try {
    const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`);
    
    if (response.status === 401) {
      console.warn(`Finnhub API Key is unauthorized (401). Please check your VITE_FINNHUB_API_KEY in .env. Falling back to current/mock data.`);
      return null;
    }

    const data = await response.json();
    if (data.c) {
      return {
        price: data.c,
        change: data.dp || 0,
        high: data.h,
        low: data.l,
        open: data.o
      };
    }
    return null;
  } catch (error) {
    console.error(`Error fetching stock price for ${symbol}:`, error);
    return null;
  }
}

/**
 * Fetch gold price (XAU/USD) from a CORS-friendly API
 */
async function fetchGoldPrice(): Promise<number | null> {
  try {
    const response = await fetch(`https://api.gold-api.com/price/XAU`);
    const data = await response.json();
    return data.price || null;
  } catch (error) {
    console.error("Error fetching gold price:", error);
    return null;
  }
}

export const marketService = {
  async fetchSymbolPrice(symbol: string): Promise<Partial<StockData> | null> {
    const cryptoSymbols = ["BTC", "ETH", "USDT", "BNB", "SOL", "DOGE"];

    // Handle Crypto
    if (cryptoSymbols.includes(symbol)) {
      if (symbol === "USDT") return { price: 1.0, change: 0, high: 1.0, low: 1.0 };
      return await fetchCryptoDetails(symbol);
    }

    // Handle Gold
    if (symbol === "GOLD") {
      const price = await fetchGoldPrice();
      if (price) return { price, change: 0, high: price, low: price };
    }

    // Handle Stocks
    return await fetchStockPrice(symbol);
  },

  async updateStocks(currentStocks: StockData[]): Promise<StockData[]> {
    const cryptoSymbols = ["BTC", "ETH", "USDT", "BNB", "SOL", "DOGE"];
    const goldPrice = await fetchGoldPrice();

    const updatedStocks = await Promise.all(
      currentStocks.map(async (stock) => {
        // Handle Crypto
        if (cryptoSymbols.includes(stock.symbol)) {
          if (stock.symbol === "USDT") return { ...stock, price: 1.0, change: 0 };
          const details = await fetchCryptoDetails(stock.symbol);
          if (details) return { ...stock, ...details } as StockData;
        }

        // Handle Gold
        if (stock.symbol === "GOLD" && goldPrice) {
          return { ...stock, price: goldPrice };
        }

        // Handle Stocks (using Finnhub)
        if (!cryptoSymbols.includes(stock.symbol) && stock.symbol !== "GOLD") {
          const details = await fetchStockPrice(stock.symbol);
          if (details) return { ...stock, ...details } as StockData;
        }

        return stock; // Fallback to current
      })
    );

    return updatedStocks;
  }
};
