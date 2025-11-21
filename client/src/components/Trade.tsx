import React, { useState } from 'react';
import { useMarket } from '../context/MarketContext';
import { useAuth } from '../context/AuthContext';

export const Trade: React.FC = () => {
  const { tickers } = useMarket();
  const { user } = useAuth();
  const [selectedSymbol, setSelectedSymbol] = useState<string>('AAPL');
  const [quantity, setQuantity] = useState<number>(1);
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [status, setStatus] = useState<string>('');

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
        setStatus(`Order Filled! Executed at $${data.price.toFixed(2)}`);
        // Ideally refresh portfolio here
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (e) {
      setStatus('Failed to place order');
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 0', display: 'flex', gap: '2rem' }}>
      {/* Market List */}
      <div className="card" style={{ flex: 1 }}>
        <h2 style={{ marginBottom: '1rem' }}>Market</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {Array.from(tickers.values()).map((t) => (
            <div 
              key={t.symbol}
              onClick={() => setSelectedSymbol(t.symbol)}
              style={{ 
                padding: '1rem', 
                backgroundColor: selectedSymbol === t.symbol ? 'var(--bg-tertiary)' : 'transparent',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{ fontWeight: 'bold' }}>{t.symbol}</div>
                <div className="text-muted" style={{ fontSize: '0.8rem' }}>Vol: {t.volume.toLocaleString()}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div>${t.price.toFixed(2)}</div>
                <div className={t.change >= 0 ? 'text-success' : 'text-danger'} style={{ fontSize: '0.8rem' }}>
                  {t.change >= 0 ? '+' : ''}{t.changePercent.toFixed(2)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Entry */}
      <div className="card" style={{ flex: 1, height: 'fit-content' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Place Order</h2>
        
        {ticker ? (
          <>
            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
              <h1 style={{ fontSize: '3rem' }}>${ticker.price.toFixed(2)}</h1>
              <div className={ticker.change >= 0 ? 'text-success' : 'text-danger'}>
                {ticker.change >= 0 ? '+' : ''}{ticker.change.toFixed(2)} ({ticker.changePercent.toFixed(2)}%)
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <button 
                className={`btn ${side === 'BUY' ? 'btn-success' : ''}`}
                style={{ flex: 1, backgroundColor: side === 'BUY' ? undefined : 'var(--bg-tertiary)' }}
                onClick={() => setSide('BUY')}
              >
                BUY
              </button>
              <button 
                className={`btn ${side === 'SELL' ? 'btn-danger' : ''}`}
                style={{ flex: 1, backgroundColor: side === 'SELL' ? undefined : 'var(--bg-tertiary)' }}
                onClick={() => setSide('SELL')}
              >
                SELL
              </button>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Quantity</label>
              <input 
                type="number" 
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
              <span>Estimated Total</span>
              <span style={{ fontWeight: 'bold' }}>${(ticker.price * quantity).toFixed(2)}</span>
            </div>

            <button className="btn btn-primary" style={{ width: '100%', padding: '1rem' }} onClick={handleOrder}>
              {side} {selectedSymbol}
            </button>

            {status && (
              <div style={{ marginTop: '1rem', textAlign: 'center', padding: '0.5rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
                {status}
              </div>
            )}
          </>
        ) : (
          <div>Select an asset to trade</div>
        )}
      </div>
    </div>
  );
};
