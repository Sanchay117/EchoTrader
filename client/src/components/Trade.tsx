import React, { useState } from 'react';
import { useMarket } from '../context/MarketContext';
import { useAuth } from '../context/AuthContext';

export const Trade: React.FC = () => {
  const { tickers, getTickersByMarket, selectedMarket } = useMarket();
  const { user } = useAuth();
  const [selectedSymbol, setSelectedSymbol] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [status, setStatus] = useState<string>('');

  const marketTickers = getTickersByMarket();
  
  // Select first ticker if none selected or if selected is not in current market
  if ((!selectedSymbol || !tickers.get(selectedSymbol) || tickers.get(selectedSymbol)?.region !== selectedMarket) && marketTickers.length > 0) {
    setSelectedSymbol(marketTickers[0].symbol);
  }

  const ticker = tickers.get(selectedSymbol);

  const handleOrder = async () => {
    if (!user || !ticker) return;
    
    setStatus('Submitting...');
    try {
      const res = await fetch('http://localhost:3000/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          symbol: selectedSymbol,
          side,
          quantity: Number(quantity),
          type: 'MARKET'
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        setStatus(`Order Filled! Executed at ${new Intl.NumberFormat('en-US', { style: 'currency', currency: ticker.currency }).format(data.price)}`);
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (e) {
      setStatus('Failed to place order');
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 0', display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
      {/* Market List */}
      <div className="card" style={{ flex: 1, padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '1.25rem' }}>{selectedMarket === 'US' ? '🇺🇸 US Market' : '🇮🇳 Indian Market'}</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '600px', overflowY: 'auto' }}>
          {marketTickers.map((t) => (
            <div 
              key={t.symbol}
              onClick={() => setSelectedSymbol(t.symbol)}
              style={{ 
                padding: '1rem 1.5rem', 
                backgroundColor: selectedSymbol === t.symbol ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                borderLeft: selectedSymbol === t.symbol ? '3px solid var(--accent-primary)' : '3px solid transparent',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'all 0.2s'
              }}
            >
              <div>
                <div style={{ fontWeight: 'bold', color: selectedSymbol === t.symbol ? 'var(--accent-primary)' : 'var(--text-primary)' }}>{t.symbol}</div>
                <div className="text-secondary" style={{ fontSize: '0.8rem' }}>Vol: {t.volume.toLocaleString()}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: '500' }}>{new Intl.NumberFormat('en-US', { style: 'currency', currency: t.currency }).format(t.price)}</div>
                <div className={t.change >= 0 ? 'text-success' : 'text-danger'} style={{ fontSize: '0.8rem' }}>
                  {t.change >= 0 ? '+' : ''}{t.changePercent.toFixed(2)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Entry */}
      <div className="card" style={{ flex: 1, position: 'sticky', top: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Place Order</h2>
        
        {ticker ? (
          <>
            <div style={{ marginBottom: '2rem', textAlign: 'center', padding: '2rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)' }}>
              <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: ticker.currency }).format(ticker.price)}
              </h1>
              <div className={ticker.change >= 0 ? 'text-success' : 'text-danger'} style={{ fontSize: '1.2rem', fontWeight: '500' }}>
                {ticker.change >= 0 ? '+' : ''}{ticker.change.toFixed(2)} ({ticker.changePercent.toFixed(2)}%)
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <button 
                className={`btn ${side === 'BUY' ? 'btn-success' : 'btn-ghost'}`}
                style={{ flex: 1, border: side === 'BUY' ? 'none' : '1px solid var(--border-color)' }}
                onClick={() => setSide('BUY')}
              >
                BUY
              </button>
              <button 
                className={`btn ${side === 'SELL' ? 'btn-danger' : 'btn-ghost'}`}
                style={{ flex: 1, border: side === 'SELL' ? 'none' : '1px solid var(--border-color)' }}
                onClick={() => setSide('SELL')}
              >
                SELL
              </button>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Quantity</label>
              <input 
                type="number" 
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                style={{ fontSize: '1.2rem', fontWeight: 'bold' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', padding: '1rem', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)' }}>
              <span className="text-secondary">Estimated Total</span>
              <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: ticker.currency }).format(ticker.price * quantity)}
              </span>
            </div>

            <button className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }} onClick={handleOrder}>
              {side} {selectedSymbol}
            </button>

            {status && (
              <div style={{ marginTop: '1.5rem', textAlign: 'center', padding: '1rem', backgroundColor: status.includes('Error') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-sm)', color: status.includes('Error') ? '#fca5a5' : '#6ee7b7' }}>
                {status}
              </div>
            )}
          </>
        ) : (
          <div className="text-secondary" style={{ textAlign: 'center', padding: '2rem' }}>Select an asset to trade</div>
        )}
      </div>
    </div>
  );
};
