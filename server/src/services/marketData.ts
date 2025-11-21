import WebSocket from 'ws';
import { Server } from 'http';

interface Ticker {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  region: 'US' | 'IN';
  currency: 'USD' | 'INR';
}

// Initial mock data
const INITIAL_ASSETS = [
  // US Market
  { symbol: 'AAPL', price: 150.00, region: 'US', currency: 'USD' },
  { symbol: 'TSLA', price: 200.00, region: 'US', currency: 'USD' },
  { symbol: 'GOOGL', price: 2800.00, region: 'US', currency: 'USD' },
  { symbol: 'AMZN', price: 3400.00, region: 'US', currency: 'USD' },
  { symbol: 'MSFT', price: 300.00, region: 'US', currency: 'USD' },
  { symbol: 'BTC', price: 45000.00, region: 'US', currency: 'USD' },
  { symbol: 'ETH', price: 3000.00, region: 'US', currency: 'USD' },
  
  // Indian Market
  { symbol: 'RELIANCE', price: 2400.00, region: 'IN', currency: 'INR' },
  { symbol: 'TCS', price: 3500.00, region: 'IN', currency: 'INR' },
  { symbol: 'HDFCBANK', price: 1600.00, region: 'IN', currency: 'INR' },
  { symbol: 'INFY', price: 1500.00, region: 'IN', currency: 'INR' },
  { symbol: 'ICICIBANK', price: 950.00, region: 'IN', currency: 'INR' },
  { symbol: 'TATAMOTORS', price: 600.00, region: 'IN', currency: 'INR' },
  { symbol: 'SBIN', price: 580.00, region: 'IN', currency: 'INR' },
];

export class MarketDataService {
  private wss: WebSocket.Server;
  private tickers: Map<string, Ticker> = new Map();
  private interval: NodeJS.Timeout | null = null;

  constructor(server: Server) {
    this.wss = new WebSocket.Server({ server });
    this.initializeTickers();
    this.startSimulation();
    this.setupConnection();
  }

  private initializeTickers() {
    INITIAL_ASSETS.forEach(asset => {
      this.tickers.set(asset.symbol, {
        symbol: asset.symbol,
        price: asset.price,
        change: 0,
        changePercent: 0,
        volume: 1000000,
        high: asset.price * 1.01,
        low: asset.price * 0.99,
        region: asset.region as 'US' | 'IN',
        currency: asset.currency as 'USD' | 'INR',
      });
    });
  }

  private startSimulation() {
    this.interval = setInterval(() => {
      this.updatePrices();
      this.broadcastUpdates();
    }, 1000); // Update every second
  }

  private updatePrices() {
    this.tickers.forEach((ticker, symbol) => {
      // Geometric Brownian Motion-ish random walk
      const volatility = 0.002; // 0.2% volatility per tick
      const change = ticker.price * (Math.random() - 0.5) * volatility;
      let newPrice = ticker.price + change;
      newPrice = Math.max(0.01, newPrice); // Ensure positive price

      ticker.price = newPrice;
      ticker.change = change;
      ticker.changePercent = (change / (newPrice - change)) * 100;
      ticker.volume += Math.floor(Math.random() * 100);
      
      if (newPrice > ticker.high) ticker.high = newPrice;
      if (newPrice < ticker.low) ticker.low = newPrice;
    });
  }

  private broadcastUpdates() {
    const data = JSON.stringify({
      type: 'MARKET_UPDATE',
      data: Array.from(this.tickers.values())
    });

    this.wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }

  private setupConnection() {
    this.wss.on('connection', (ws) => {
      console.log('Client connected to Market Data Stream');
      
      // Send initial state
      ws.send(JSON.stringify({
        type: 'MARKET_SNAPSHOT',
        data: Array.from(this.tickers.values())
      }));

      ws.on('close', () => console.log('Client disconnected'));
    });
  }

  public getCurrentPrice(symbol: string): number | undefined {
    return this.tickers.get(symbol)?.price;
  }

  public getHistoricalData(symbol: string, days: number = 30): any[] {
    const ticker = this.tickers.get(symbol);
    if (!ticker) return [];

    const data = [];
    let price = ticker.price * 0.9; // Start slightly lower to simulate a trend
    const now = new Date();

    for (let i = days; i > 0; i--) {
      const time = new Date(now.getTime() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const volatility = price * 0.02;
      const open = price + (Math.random() - 0.5) * volatility;
      const close = price + (Math.random() - 0.5) * volatility;
      const high = Math.max(open, close) + Math.random() * volatility;
      const low = Math.min(open, close) - Math.random() * volatility;

      data.push({ time, open, high, low, close });
      price = close;
    }

    return data;
  }

  public getNews(symbol: string): any[] {
    const sentiments = ['POSITIVE', 'NEGATIVE', 'NEUTRAL'];
    const headlines = [
      `Analysts upgrade ${symbol} after strong earnings`,
      `${symbol} faces regulatory scrutiny in new market`,
      `Market rally boosts ${symbol} to new highs`,
      `${symbol} announces strategic partnership`,
      `Investors cautious ahead of ${symbol} report`
    ];

    return Array.from({ length: 5 }).map((_, i) => {
      const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
      return {
        id: i,
        headline: headlines[Math.floor(Math.random() * headlines.length)],
        source: 'Financial Times',
        time: new Date(Date.now() - i * 3600000).toISOString(),
        sentiment,
        score: sentiment === 'POSITIVE' ? 0.8 : sentiment === 'NEGATIVE' ? -0.6 : 0.1
      };
    });
  }
}
