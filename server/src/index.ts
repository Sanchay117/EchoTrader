import express from 'express';
import http from 'http';
import cors from 'cors';
import { MarketDataService } from './services/marketData';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = http.createServer(app);
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Initialize Services
const marketDataService = new MarketDataService(server);

// Basic Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Auth Routes (Simplified for speed)
app.post('/api/register', async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const user = await prisma.user.create({
      data: {
        email,
        password, // In prod, hash this!
        name,
        portfolio: {
          create: {
            cash: 100000
          }
        }
      },
      include: { portfolio: true }
    });
    res.json(user);
  } catch (e) {
    res.status(400).json({ error: 'User already exists' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({
    where: { email },
    include: { portfolio: true }
  });
  
  if (user && user.password === password) {
    res.json(user);
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Portfolio Routes
app.get('/api/portfolio/:userId', async (req, res) => {
  const { userId } = req.params;
  const portfolio = await prisma.portfolio.findUnique({
    where: { userId },
    include: { positions: true, trades: { orderBy: { timestamp: 'desc' }, take: 50 } }
  });
  res.json(portfolio);
});

app.get('/api/history/:symbol', (req, res) => {
  const { symbol } = req.params;
  const data = marketDataService.getHistoricalData(symbol);
  res.json(data);
});



app.get('/api/news/:symbol', (req, res) => {
  const { symbol } = req.params;
  const news = marketDataService.getNews(symbol);
  res.json(news);
});

app.get('/api/options/:symbol', (req, res) => {
  const { symbol } = req.params;
  const chain = marketDataService.getOptionsChain(symbol);
  res.json(chain);
});

// Trading Routes
app.post('/api/order', async (req, res) => {
  const { userId, symbol, side, quantity, type } = req.body;
  
  // 1. Get current price
  const currentPrice = marketDataService.getCurrentPrice(symbol);
  if (!currentPrice) return res.status(400).json({ error: 'Invalid symbol' });

  try {
    // 2. Transaction
    const result = await prisma.$transaction(async (tx) => {
      const portfolio = await tx.portfolio.findUnique({ where: { userId } });
      if (!portfolio) throw new Error('Portfolio not found');

      const cost = currentPrice * quantity;

      if (side === 'BUY') {
        if (portfolio.cash < cost) throw new Error('Insufficient funds');
        
        // Deduct cash
        await tx.portfolio.update({
          where: { id: portfolio.id },
          data: { cash: portfolio.cash - cost }
        });

        // Update/Create Position
        const existingPosition = await tx.position.findUnique({
          where: { portfolioId_symbol: { portfolioId: portfolio.id, symbol } }
        });

        if (existingPosition) {
          const newQty = existingPosition.quantity + quantity;
          const newAvg = ((existingPosition.avgPrice * existingPosition.quantity) + cost) / newQty;
          await tx.position.update({
            where: { id: existingPosition.id },
            data: { quantity: newQty, avgPrice: newAvg }
          });
        } else {
          await tx.position.create({
            data: {
              portfolioId: portfolio.id,
              symbol,
              quantity,
              avgPrice: currentPrice
            }
          });
        }
      } else { // SELL
        const position = await tx.position.findUnique({
          where: { portfolioId_symbol: { portfolioId: portfolio.id, symbol } }
        });
        
        if (!position || position.quantity < quantity) throw new Error('Insufficient position');

        // Add cash
        await tx.portfolio.update({
          where: { id: portfolio.id },
          data: { cash: portfolio.cash + cost }
        });

        // Update Position
        if (position.quantity === quantity) {
          await tx.position.delete({ where: { id: position.id } });
        } else {
          await tx.position.update({
            where: { id: position.id },
            data: { quantity: position.quantity - quantity }
          });
        }
      }

      // Record Trade
      await tx.trade.create({
        data: {
          portfolioId: portfolio.id,
          symbol,
          side,
          quantity,
          price: currentPrice
        }
      });

      return { status: 'FILLED', price: currentPrice };
    });

    res.json(result);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
