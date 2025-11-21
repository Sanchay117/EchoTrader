import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMarket } from '../context/MarketContext';
import { ArrowUp, ArrowDown, TrendingUp, DollarSign } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { tickers, selectedMarket, setSelectedMarket } = useMarket();
  const [portfolio, setPortfolio] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetch(`http://localhost:3000/api/portfolio/${user.id}`)
        .then(res => res.json())
        .then(setPortfolio);
    }
  }, [user]);

  if (!portfolio) return <div className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>Loading...</div>;

  // Calculate Total Equity
  let equity = portfolio.cash;
  let totalPnL = 0;

  portfolio.positions.forEach((pos: any) => {
    const currentPrice = tickers.get(pos.symbol)?.price || pos.avgPrice;
    const value = pos.quantity * currentPrice;
    equity += value;
    totalPnL += (currentPrice - pos.avgPrice) * pos.quantity;
  });

  const formatCurrency = (val: number) => {
    // Simple heuristic: if > 10000 and selectedMarket is IN, assume INR formatting could be different, 
    // but for now standard locale string is fine.
    const currency = selectedMarket === 'US' ? 'USD' : 'INR';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(val);
  };

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <header className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Welcome back, {user?.name}
          </h1>
          <p className="text-secondary">Here's how your portfolio is performing today.</p>
        </div>
        
        <div className="card" style={{ padding: '0.5rem', display: 'flex', gap: '0.5rem' }}>
          <button 
            className={`btn ${selectedMarket === 'US' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setSelectedMarket('US')}
            style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
          >
            🇺🇸 US Market
          </button>
          <button 
            className={`btn ${selectedMarket === 'IN' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setSelectedMarket('IN')}
            style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
          >
            🇮🇳 Indian Market
          </button>
        </div>
      </header>

      <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card">
          <div className="flex items-center gap-sm text-secondary" style={{ marginBottom: '0.5rem' }}>
            <DollarSign size={16} />
            <span>Total Equity</span>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', letterSpacing: '-1px' }}>
            {formatCurrency(equity)}
          </div>
          <div className={totalPnL >= 0 ? 'text-success' : 'text-danger'} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem', fontWeight: '500' }}>
            {totalPnL >= 0 ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
            <span>{formatCurrency(Math.abs(totalPnL))}</span>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-sm text-secondary" style={{ marginBottom: '0.5rem' }}>
            <TrendingUp size={16} />
            <span>Buying Power</span>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', letterSpacing: '-1px' }}>
            {formatCurrency(portfolio.cash)}
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Your Positions</h2>
      <div className="card" style={{ overflowX: 'auto', padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr>
              <th style={{ padding: '1.5rem' }}>Asset</th>
              <th style={{ padding: '1.5rem' }}>Qty</th>
              <th style={{ padding: '1.5rem' }}>Avg Price</th>
              <th style={{ padding: '1.5rem' }}>Current</th>
              <th style={{ padding: '1.5rem' }}>P&L</th>
            </tr>
          </thead>
          <tbody>
            {portfolio.positions
              .filter((pos: any) => {
                const ticker = tickers.get(pos.symbol);
                // If ticker not found (e.g. disconnected), default to showing it if we can't determine region, 
                // OR better: only show if we know it belongs to the current market.
                // Given we have a fixed list, we should find it. 
                // If not found, maybe it's an old position? Let's show it only if region matches or if we default to 'US' for unknown.
                return ticker?.region === selectedMarket;
              })
              .map((pos: any) => {
              const ticker = tickers.get(pos.symbol);
              const currentPrice = ticker?.price || pos.avgPrice;
              const pnl = (currentPrice - pos.avgPrice) * pos.quantity;
              const pnlPercent = ((currentPrice - pos.avgPrice) / pos.avgPrice) * 100;
              const currency = ticker?.currency || 'USD';

              return (
                <tr key={pos.id}>
                  <td style={{ padding: '1.5rem', fontWeight: '600' }}>
                    <div className="flex items-center gap-sm">
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: ticker?.region === 'IN' ? '#ff9933' : '#3b82f6' }}></span>
                      {pos.symbol}
                    </div>
                  </td>
                  <td style={{ padding: '1.5rem' }}>{pos.quantity}</td>
                  <td style={{ padding: '1.5rem' }}>{new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(pos.avgPrice)}</td>
                  <td style={{ padding: '1.5rem' }}>{new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(currentPrice)}</td>
                  <td style={{ padding: '1.5rem' }} className={pnl >= 0 ? 'text-success' : 'text-danger'}>
                    {pnl >= 0 ? '+' : '-'}{new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(Math.abs(pnl))} ({pnlPercent.toFixed(2)}%)
                  </td>
                </tr>
              );
            })}
            {portfolio.positions.filter((pos: any) => tickers.get(pos.symbol)?.region === selectedMarket).length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No open positions in {selectedMarket === 'US' ? 'US' : 'Indian'} Market.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
