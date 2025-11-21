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
    <div className="container" style={{ padding: '2rem 0', display: 'flex', gap: '2rem', alignItems: 'flex-start', height: 'calc(100vh - 100px)' }}>
      {/* Market List */}
      <div className="card" style={{ width: '350px', padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>{selectedMarket === 'US' ? '🇺🇸 US Market' : '🇮🇳 Indian Market'}</h2>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              placeholder="Search assets..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
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

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem', height: '100%', overflowY: 'auto' }}>
        {/* Chart Section */}
        <div className="card" style={{ minHeight: '450px', display: 'flex', flexDirection: 'column' }}>
           {ticker && (
             <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div>
                 <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>{ticker.symbol}</h1>
                 <div className={ticker.change >= 0 ? 'text-success' : 'text-danger'} style={{ fontSize: '1.2rem', fontWeight: '500' }}>
                   {new Intl.NumberFormat('en-US', { style: 'currency', currency: ticker.currency }).format(ticker.price)} 
                   <span style={{ marginLeft: '0.5rem', fontSize: '1rem' }}>
                     {ticker.change >= 0 ? '+' : ''}{ticker.change.toFixed(2)} ({ticker.changePercent.toFixed(2)}%)
                   </span>
                 </div>
               </div>
             </div>
           )}
           <div style={{ flex: 1 }}>
             {chartData.length > 0 ? <Chart data={chartData} /> : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Loading Chart...</div>}
           </div>
        </div>

        {/* Order Entry */}
        <div className="card">
          <h2 style={{ marginBottom: '1.5rem' }}>Place Order</h2>
          
          {ticker ? (
            <>
              <div style={{ display: 'flex', gap: '2rem' }}>
                <div style={{ flex: 1 }}>
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
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', padding: '1.5rem', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)' }}>
                    <span className="text-secondary">Estimated Total</span>
                    <span style={{ fontWeight: 'bold', fontSize: '1.5rem' }}>
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
                </div>
              </div>
            </>
          ) : (
            <div className="text-secondary" style={{ textAlign: 'center', padding: '2rem' }}>Select an asset to trade</div>
          )}
        </div>
      </div>
    </div>
  );
};
