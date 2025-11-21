import React from 'react';

interface NewsItem {
  id: number;
  headline: string;
  source: string;
  time: string;
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  score: number;
}

interface NewsFeedProps {
  news: NewsItem[];
}

export const NewsFeed: React.FC<NewsFeedProps> = ({ news }) => {
  return (
    <div className="card" style={{ padding: '1.5rem' }}>
      <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        📰 Market News & AI Sentiment
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {news.map(item => (
          <div key={item.id} style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.source} • {new Date(item.time).toLocaleTimeString()}</span>
              <span 
                style={{ 
                  fontSize: '0.7rem', 
                  padding: '0.1rem 0.5rem', 
                  borderRadius: '1rem', 
                  background: item.sentiment === 'POSITIVE' ? 'rgba(16, 185, 129, 0.2)' : item.sentiment === 'NEGATIVE' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(148, 163, 184, 0.2)',
                  color: item.sentiment === 'POSITIVE' ? '#34d399' : item.sentiment === 'NEGATIVE' ? '#f87171' : '#94a3b8',
                  fontWeight: 'bold'
                }}
              >
                {item.sentiment} ({(item.score * 100).toFixed(0)}%)
              </span>
            </div>
            <div style={{ fontWeight: '500' }}>{item.headline}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
