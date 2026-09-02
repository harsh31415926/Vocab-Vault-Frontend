import React, { useRef, useState } from 'react';
import { api } from '../services/api';
import { BookOpen, LoaderCircle, ShieldAlert } from 'lucide-react';

export default function AuthScreen({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const submittingRef = useRef(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const data = await api.login(email, password);
        onAuthSuccess(data.user);
      } else {
        const data = await api.register(email, password);
        onAuthSuccess(data.user);
      }
    } catch (err) {
      setError(err?.message || 'We could not sign you in. Check your details and try again.');
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  };

  const switchMode = () => {
    if (loading) return;
    setIsLogin((current) => !current);
    setError('');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="sidebar-logo" style={{ justifyContent: 'center', fontSize: '24px', paddingLeft: 0 }}>
            <BookOpen className="sidebar-logo-icon" size={28} />
            <span>VocabVault</span>
          </div>
          <span className="auth-subtitle">
            {isLogin ? 'Enter your credentials to access your vault' : 'Create a private vault to build your lifelong vocabulary'}
          </span>
        </div>

        {error && <div className="auth-error" role="alert"><ShieldAlert size={16} /><span>{error}</span></div>}

        <form className="auth-form" onSubmit={handleSubmit} aria-busy={loading}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input className="form-input" id="email" type="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required disabled={loading} autoComplete="email" />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input className="form-input" id="password" type="password" placeholder="••••••••" value={password} onChange={(event) => setPassword(event.target.value)} required disabled={loading} minLength={6} autoComplete={isLogin ? 'current-password' : 'new-password'} />
          </div>
          <button className={`auth-button ${loading ? 'is-loading' : ''}`} type="submit" disabled={loading} aria-disabled={loading}>
            {loading ? <><LoaderCircle className="auth-spinner" size={16} aria-hidden="true" /><span>{isLogin ? 'Logging in...' : 'Creating vault...'}</span></> : <span>{isLogin ? 'Sign In' : 'Create Vault'}</span>}
          </button>
          {loading && <p className="auth-loading-note" role="status">Connecting securely. This can take a moment on a sleeping server.</p>}
        </form>

        <div className="auth-footer">
          <span>{isLogin ? "Don't have an account? " : 'Already have a vault? '}</span>
          <button type="button" className="auth-link" onClick={switchMode} disabled={loading}>{isLogin ? 'Sign Up' : 'Sign In'}</button>
        </div>
      </div>
    </div>
  );
}
