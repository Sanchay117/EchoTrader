import React, { useState, useEffect } from 'react';
import { useMarket } from '../context/MarketContext';
import { useAuth } from '../context/AuthContext';
import { Chart } from './Chart';
import { Search } from 'lucide-react';

export const Trade: React.FC = () => {
  const { tickers, getTickersByMarket, selectedMarket } = useMarket();
  const { user } = useAuth();
  const [selectedSymbol, setSelectedSymbol] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [status, setStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [chartData, setChartData] = useState<any[]>([]);

  const marketTickers = getTickersByMarket().filter(t => 
    t.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Select first ticker if none selected or if selected is not in current market
  useEffect(() => {
    if ((!selectedSymbol || !tickers.get(selectedSymbol) || tickers.get(selectedSymbol)?.region !== selectedMarket) && marketTickers.length > 0) {
      setSelectedSymbol(marketTickers[0].symbol);
    }
  }, [selectedMarket, marketTickers, selectedSymbol, tickers]);

  useEffect(() => {
    if (selectedSymbol) {
      fetch(`http://localhost:3000/api/history/${selectedSymbol}`)
        .then(res => res.json())
        .then(setChartData);
    }
  }, [selectedSymbol]);

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
    <div className="container" style={{ padding: '1.5rem 0', display: 'flex', gap: '1.5rem', height: 'calc(100vh - 80px)' }}>
      {/* Left Column: Market List */}
      <div className="card" style={{ width: '300px', padding: 0, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>{selectedMarket === 'US' ? '🇺🇸 US Market' : '🇮🇳 Indian Market'}</h2>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.25rem', paddingRight: '0.5rem', fontSize: '0.9rem', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}
            />
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {marketTickers.map((t) => (
            <div 
              key={t.symbol}
              onClick={() => setSelectedSymbol(t.symbol)}
              style={{ 
                padding: '0.75rem 1rem', 
                backgroundColor: selectedSymbol === t.symbol ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                borderLeft: selectedSymbol === t.symbol ? '3px solid var(--accent-primary)' : '3px solid transparent',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'all 0.1s'
              }}
            >
              <div>
                <div style={{ fontWeight: '600', fontSize: '0.95rem', color: selectedSymbol === t.symbol ? 'var(--accent-primary)' : 'var(--text-primary)' }}>{t.symbol}</div>
                <div className="text-secondary" style={{ fontSize: '0.75rem' }}>Vol: {(t.volume / 1000000).toFixed(1)}M</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: '500', fontSize: '0.95rem' }}>{new Intl.NumberFormat('en-US', { style: 'currency', currency: t.currency }).format(t.price)}</div>
                <div className={t.change >= 0 ? 'text-success' : 'text-danger'} style={{ fontSize: '0.75rem' }}>
                  {t.change >= 0 ? '+' : ''}{t.changePercent.toFixed(2)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Middle Column: Chart */}
      <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1.5rem', overflow: 'hidden' }}>
         {ticker ? (
           <>
             <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
               <div>
                 <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', lineHeight: 1.2 }}>{ticker.symbol}</h1>
                 <div className="text-secondary" style={{ fontSize: '0.9rem' }}>{selectedMarket === 'US' ? 'NASDAQ' : 'NSE'} • {ticker.currency}</div>
               </div>
               <div style={{ textAlign: 'right' }}>
                 <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: ticker.change >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                   {new Intl.NumberFormat('en-US', { style: 'currency', currency: ticker.currency }).format(ticker.price)}
                 </div>
                 <div className={ticker.change >= 0 ? 'text-success' : 'text-danger'} style={{ fontSize: '1rem', fontWeight: '500' }}>
                   {ticker.change >= 0 ? '+' : ''}{ticker.change.toFixed(2)} ({ticker.changePercent.toFixed(2)}%)
                 </div>
               </div>
             </div>
             <div style={{ flex: 1, width: '100%', minHeight: 0 }}>
               {chartData.length > 0 ? <Chart data={chartData} /> : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Loading Chart...</div>}
             </div>
           </>
         ) : (
           <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Select an asset to view chart</div>
         )}
      </div>

      {/* Right Column: Order Entry */}
      <div className="card" style={{ width: '320px', display: 'flex', flexDirection: 'column', padding: '1.5rem' }}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Place Order</h2>
        
        {ticker ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', padding: '0.25rem', borderRadius: 'var(--radius-md)' }}>
              <button 
                className="btn"
                style={{ 
                  flex: 1, 
                  background: side === 'BUY' ? 'var(--success)' : 'transparent',
                  color: side === 'BUY' ? '#fff' : 'var(--text-secondary)',
                  boxShadow: side === 'BUY' ? '0 2px 10px rgba(16, 185, 129, 0.3)' : 'none'
                }}
                onClick={() => setSide('BUY')}
              >
                BUY
              </button>
              <button 
                className="btn"
                style={{ 
                  flex: 1, 
                  background: side === 'SELL' ? 'var(--danger)' : 'transparent',
                  color: side === 'SELL' ? '#fff' : 'var(--text-secondary)',
                  boxShadow: side === 'SELL' ? '0 2px 10px rgba(239, 68, 68, 0.3)' : 'none'
                }}
                onClick={() => setSide('SELL')}
              >
                SELL
              </button>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quantity</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="number" 
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                  style={{ fontSize: '1.1rem', fontWeight: '600', padding: '1rem' }}
                />
              </div>
            </div>

            <div style={{ padding: '1rem', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span className="text-secondary" style={{ fontSize: '0.9rem' }}>Price</span>
                <span style={{ fontWeight: '500' }}>{new Intl.NumberFormat('en-US', { style: 'currency', currency: ticker.currency }).format(ticker.price)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <span className="text-secondary" style={{ fontSize: '0.9rem' }}>Total</span>
                <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: ticker.currency }).format(ticker.price * quantity)}
                </span>
              </div>
            </div>

            <div style={{ marginTop: 'auto' }}>
              <button 
                className="btn" 
                style={{ 
                  width: '100%', 
                  padding: '1rem', 
                  fontSize: '1rem',
                  background: side === 'BUY' ? 'var(--success)' : 'var(--danger)',
                  color: 'white',
                  boxShadow: side === 'BUY' ? '0 4px 12px rgba(16, 185, 129, 0.4)' : '0 4px 12px rgba(239, 68, 68, 0.4)'
                }} 
                onClick={handleOrder}
              >
                {side} {selectedSymbol}
              </button>

              {status && (
                <div style={{ marginTop: '1rem', textAlign: 'center', padding: '0.75rem', backgroundColor: status.includes('Error') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-sm)', color: status.includes('Error') ? '#fca5a5' : '#6ee7b7', fontSize: '0.9rem' }}>
                  {status}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-secondary" style={{ textAlign: 'center', padding: '2rem' }}>Select an asset to trade</div>
        )}
      </div>
    </div>
  );
};
