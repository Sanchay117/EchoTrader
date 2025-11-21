import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MarketProvider } from './context/MarketContext';
import { Dashboard } from './components/Dashboard';
import { Trade } from './components/Trade';
import { Layout, Activity, LogOut } from 'lucide-react';

const Login: React.FC = () => {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isRegister) {
        await register(email, password, name);
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ width: '400px' }}>
        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>{isRegister ? 'Create Account' : 'Welcome Back'}</h2>
        {error && (
          <div className="text-danger" style={{ marginBottom: '1rem', textAlign: 'center', padding: '0.5rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-sm)' }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {isRegister && (
            <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />
          )}
          <input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          <button className="btn btn-primary" type="submit">{isRegister ? 'Sign Up' : 'Login'}</button>
        </form>
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <button 
            style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer' }}
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister ? 'Already have an account? Login' : 'Need an account? Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
};

const LayoutComponent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { logout } = useAuth();
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: '250px', borderRight: '1px solid var(--border-color)', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity className="text-success" />
          EchoTrader
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          <Link to="/" className="btn" style={{ textAlign: 'left', backgroundColor: 'var(--bg-tertiary)' }}>Dashboard</Link>
          <Link to="/trade" className="btn" style={{ textAlign: 'left', backgroundColor: 'transparent' }}>Trade</Link>
        </nav>

        <button onClick={logout} className="btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
          <LogOut size={16} /> Logout
        </button>
      </aside>
      <main style={{ flex: 1, overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Login />;
  return <LayoutComponent>{children}</LayoutComponent>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MarketProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/trade" element={<ProtectedRoute><Trade /></ProtectedRoute>} />
          </Routes>
        </BrowserRouter>
      </MarketProvider>
    </AuthProvider>
  );
};

export default App;
