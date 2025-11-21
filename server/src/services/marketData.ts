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
}

// Initial mock data
const INITIAL_ASSETS = [
  { symbol: 'AAPL', price: 150.00 },
  { symbol: 'TSLA', price: 200.00 },
  { symbol: 'GOOGL', price: 2800.00 },
  { symbol: 'AMZN', price: 3400.00 },
  { symbol: 'MSFT', price: 300.00 },
  { symbol: 'BTC', price: 45000.00 },
  { symbol: 'ETH', price: 3000.00 },
  { symbol: 'SPY', price: 440.00 },
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
}
