import React, { createContext, useContext, useEffect, useState } from 'react';

interface Ticker {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  region: 'US' | 'IN';
  currency: 'USD' | 'INR';
  volume: number;
}

interface MarketContextType {
  tickers: Map<string, Ticker>;
  isConnected: boolean;
  selectedMarket: 'US' | 'IN';
  setSelectedMarket: (market: 'US' | 'IN') => void;
  getTickersByMarket: () => Ticker[];
}

const MarketContext = createContext<MarketContextType | null>(null);

export const MarketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tickers, setTickers] = useState<Map<string, Ticker>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState<'US' | 'IN'>('US');

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3000');

    ws.onopen = () => setIsConnected(true);
    ws.onclose = () => setIsConnected(false);

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'MARKET_UPDATE' || message.type === 'MARKET_SNAPSHOT') {
        setTickers(prev => {
          const next = new Map(prev);
          message.data.forEach((t: Ticker) => next.set(t.symbol, t));
          return next;
        });
      }
    };

    return () => ws.close();
  }, []);

  const getTickersByMarket = () => {
    return Array.from(tickers.values()).filter(t => t.region === selectedMarket);
  };

  return (
    <MarketContext.Provider value={{ tickers, isConnected, selectedMarket, setSelectedMarket, getTickersByMarket }}>
      {children}
    </MarketContext.Provider>
  );
};

export const useMarket = () => {
  const context = useContext(MarketContext);
  if (!context) throw new Error('useMarket must be used within MarketProvider');
  return context;
};
