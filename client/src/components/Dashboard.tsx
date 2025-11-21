import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMarket } from '../context/MarketContext';
import { ArrowUp, ArrowDown, TrendingUp, DollarSign } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { tickers } = useMarket();
  const [portfolio, setPortfolio] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetch(`http://localhost:3000/api/portfolio/${user.id}`)
        .then(res => res.json())
        .then(setPortfolio);
    }
  }, [user]);

  if (!portfolio) return <div>Loading...</div>;

  // Calculate Total Equity
  let equity = portfolio.cash;
  let totalPnL = 0;

  portfolio.positions.forEach((pos: any) => {
    const currentPrice = tickers.get(pos.symbol)?.price || pos.avgPrice;
    const value = pos.quantity * currentPrice;
    equity += value;
    totalPnL += (currentPrice - pos.avgPrice) * pos.quantity;
  });

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Welcome back, {user?.name}</h1>
        <p className="text-muted">Here's how your portfolio is performing today.</p>
      </header>

      <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card">
          <div className="flex items-center gap-sm text-muted" style={{ marginBottom: '0.5rem' }}>
            <DollarSign size={16} />
            <span>Total Equity</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
            ${equity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className={totalPnL >= 0 ? 'text-success' : 'text-danger'} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem' }}>
            {totalPnL >= 0 ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
            <span>${Math.abs(totalPnL).toFixed(2)}</span>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-sm text-muted" style={{ marginBottom: '0.5rem' }}>
            <TrendingUp size={16} />
            <span>Buying Power</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
            ${portfolio.cash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Your Positions</h2>
      <div className="card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '1rem' }}>Asset</th>
              <th style={{ padding: '1rem' }}>Qty</th>
              <th style={{ padding: '1rem' }}>Avg Price</th>
              <th style={{ padding: '1rem' }}>Current</th>
              <th style={{ padding: '1rem' }}>P&L</th>
            </tr>
          </thead>
          <tbody>
            {portfolio.positions.map((pos: any) => {
              const ticker = tickers.get(pos.symbol);
              const currentPrice = ticker?.price || pos.avgPrice;
              const pnl = (currentPrice - pos.avgPrice) * pos.quantity;
              const pnlPercent = ((currentPrice - pos.avgPrice) / pos.avgPrice) * 100;

              return (
                <tr key={pos.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem', fontWeight: 'bold' }}>{pos.symbol}</td>
                  <td style={{ padding: '1rem' }}>{pos.quantity}</td>
                  <td style={{ padding: '1rem' }}>${pos.avgPrice.toFixed(2)}</td>
                  <td style={{ padding: '1rem' }}>${currentPrice.toFixed(2)}</td>
                  <td style={{ padding: '1rem' }} className={pnl >= 0 ? 'text-success' : 'text-danger'}>
                    {pnl >= 0 ? '+' : '-'}${Math.abs(pnl).toFixed(2)} ({pnlPercent.toFixed(2)}%)
                  </td>
                </tr>
              );
            })}
            {portfolio.positions.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No open positions. Start trading!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
