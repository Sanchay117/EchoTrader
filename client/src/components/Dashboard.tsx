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

  // Calculate Metrics with 1:1 Currency Logic
  let investedAmount = 0;
  let totalPnL = 0;

  portfolio.positions.forEach((pos: any) => {
    const ticker = tickers.get(pos.symbol);
    const currentPrice = ticker?.price || pos.avgPrice;
    // 1:1 Logic: We treat the numerical value as equivalent regardless of currency
    const value = pos.quantity * currentPrice;
    investedAmount += value;
    totalPnL += (currentPrice - pos.avgPrice) * pos.quantity;
  });

  const liquidCash = portfolio.cash;
  const totalEquity = liquidCash + investedAmount;

  const formatCurrency = (val: number) => {
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
        {/* Liquid Cash */}
        <div className="card">
          <div className="flex items-center gap-sm text-secondary" style={{ marginBottom: '0.5rem' }}>
            <DollarSign size={16} />
            <span>Liquid Cash</span>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', letterSpacing: '-1px', color: 'var(--text-primary)' }}>
            {formatCurrency(liquidCash)}
          </div>
          <div className="text-secondary" style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Available to trade
          </div>
        </div>

        {/* Invested Assets */}
        <div className="card">
          <div className="flex items-center gap-sm text-secondary" style={{ marginBottom: '0.5rem' }}>
            <TrendingUp size={16} />
            <span>Invested Assets</span>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', letterSpacing: '-1px', color: 'var(--accent-primary)' }}>
            {formatCurrency(investedAmount)}
          </div>
          <div className={totalPnL >= 0 ? 'text-success' : 'text-danger'} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem', fontWeight: '500' }}>
            {totalPnL >= 0 ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
            <span>{formatCurrency(Math.abs(totalPnL))}</span>
          </div>
        </div>

        {/* Total Net Worth */}
        <div className="card" style={{ background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.8))', border: '1px solid var(--accent-glow)' }}>
          <div className="flex items-center gap-sm text-secondary" style={{ marginBottom: '0.5rem' }}>
            <TrendingUp size={16} color="var(--accent-primary)" />
            <span style={{ color: 'var(--accent-primary)' }}>Total Net Worth</span>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', letterSpacing: '-1px' }}>
            {formatCurrency(totalEquity)}
          </div>
          <div className="text-secondary" style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Cash + Investments
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Your Positions</h2>
      <div className="card" style={{ overflowX: 'auto', padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr>
              <th style={{ padding: '1.5rem' }}>Asset</th>
              <th style={{ padding: '1.5rem' }}>Shares</th>
              <th style={{ padding: '1.5rem' }}>Avg Price</th>
              <th style={{ padding: '1.5rem' }}>Current</th>
              <th style={{ padding: '1.5rem' }}>P&L</th>
            </tr>
          </thead>
          <tbody>
            {portfolio.positions
              .filter((pos: any) => {
                const ticker = tickers.get(pos.symbol);
                return ticker?.region === selectedMarket;
              })
              .map((pos: any) => {
              const ticker = tickers.get(pos.symbol);
              const currentPrice = ticker?.price || pos.avgPrice;
              const pnl = (currentPrice - pos.avgPrice) * pos.quantity;
              const pnlPercent = ((currentPrice - pos.avgPrice) / pos.avgPrice) * 100;
              const currency = ticker?.currency || 'USD';

              return (
                <tr key={pos.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1.5rem', fontWeight: '600' }}>
                    <div className="flex items-center gap-sm">
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: ticker?.region === 'IN' ? '#ff9933' : '#3b82f6' }}></span>
                      {pos.symbol}
                    </div>
                  </td>
                  <td style={{ padding: '1.5rem', fontWeight: '500' }}>{pos.quantity}</td>
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
