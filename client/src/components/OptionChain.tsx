import React from 'react';

interface OptionData {
  price: number;
  volume: number;
  oi: number;
  iv: number;
}

interface StrikeRow {
  strike: number;
  call: OptionData;
  put: OptionData;
}

interface OptionChainProps {
  chain: StrikeRow[];
  symbol: string;
}

export const OptionChain: React.FC<OptionChainProps> = ({ chain, symbol }) => {
  return (
    <div className="card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
        <h3 style={{ margin: 0 }}>Option Chain: {symbol}</h3>
      </div>
      <div style={{ flex: 1, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 10 }}>
            <tr>
              <th colSpan={3} style={{ textAlign: 'center', borderBottom: '1px solid var(--border-color)', color: 'var(--success)' }}>CALLS</th>
              <th style={{ textAlign: 'center', borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.05)' }}>STRIKE</th>
              <th colSpan={3} style={{ textAlign: 'center', borderBottom: '1px solid var(--border-color)', color: 'var(--danger)' }}>PUTS</th>
            </tr>
            <tr>
              <th style={{ textAlign: 'right', color: 'var(--text-secondary)', fontWeight: 'normal' }}>Price</th>
              <th style={{ textAlign: 'right', color: 'var(--text-secondary)', fontWeight: 'normal' }}>Vol</th>
              <th style={{ textAlign: 'right', color: 'var(--text-secondary)', fontWeight: 'normal' }}>OI</th>
              <th style={{ width: '80px' }}></th>
              <th style={{ textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 'normal' }}>Price</th>
              <th style={{ textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 'normal' }}>Vol</th>
              <th style={{ textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 'normal' }}>OI</th>
            </tr>
          </thead>
          <tbody>
            {chain.map((row) => (
              <tr key={row.strike} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                {/* CALLS */}
                <td style={{ textAlign: 'right', color: 'var(--success)', fontWeight: '500' }}>{row.call.price.toFixed(2)}</td>
                <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>{row.call.volume}</td>
                <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>{row.call.oi}</td>
                
                {/* STRIKE */}
                <td style={{ textAlign: 'center', fontWeight: 'bold', background: 'rgba(255,255,255,0.05)' }}>{row.strike}</td>
                
                {/* PUTS */}
                <td style={{ textAlign: 'left', color: 'var(--danger)', fontWeight: '500' }}>{row.put.price.toFixed(2)}</td>
                <td style={{ textAlign: 'left', color: 'var(--text-muted)' }}>{row.put.volume}</td>
                <td style={{ textAlign: 'left', color: 'var(--text-muted)' }}>{row.put.oi}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
