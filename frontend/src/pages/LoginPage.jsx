import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(username, password);
      if (data.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(
        err.response?.data?.detail || 'Invalid credentials. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="auth-glow-blob glow-1"></div>
      <div className="auth-glow-blob glow-2"></div>

      <div className="login-container">
        <div className="login-art">
          <div className="art-content">
            <span className="art-icon" style={{ animation: 'float 4s ease-in-out infinite' }}>🐰</span>
            <h1 className="auth-title">BunnyRido</h1>
            <p className="auth-subtitle">Tour with the best network</p>
            
            <div className="art-features" style={{ display: 'grid', gap: '2rem', textAlign: 'left', marginTop: '4rem' }}>
              <div className="feature" style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.2rem' }}>
                <span style={{ background: 'rgba(124, 58, 237, 0.2)', padding: '0.8rem', borderRadius: '12px' }}>🛋️</span>
                Comfortable Journey
              </div>
              <div className="feature" style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.2rem' }}>
                <span style={{ background: 'rgba(236, 72, 153, 0.2)', padding: '0.8rem', borderRadius: '12px' }}>⚡</span>
                Fastest Bookings
              </div>
              <div className="feature" style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.2rem' }}>
                <span style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '0.8rem', borderRadius: '12px' }}>🛡️</span>
                Secure Payments
              </div>
            </div>
          </div>
        </div>

        <div className="login-form-section">
          <div className="login-form-container">
            <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Welcome Back</h2>
            <p className="auth-subtitle">Sign in to continue your journey</p>

            {error && <div className="alert alert-error" style={{ marginBottom: '2rem' }}>{error}</div>}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-premium"
                  placeholder="Enter your username"
                  required
                  autoFocus
                />
              </div>

              <div className="form-group" style={{ marginTop: '1.5rem' }}>
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-premium"
                  placeholder="Enter your password"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full mt-5"
                disabled={loading}
                style={{ padding: '1.2rem', fontSize: '1.1rem', borderRadius: '16px' }}
              >
                {loading ? (
                  <span className="btn-loading">
                    <span className="spinner-sm"></span> Signing in...
                  </span>
                ) : (
                  'Sign In to Account'
                )}
              </button>
            </form>

            <div className="login-footer" style={{ marginTop: '2rem', textAlign: 'center' }}>
              <p style={{ opacity: 0.7 }}>
                Don't have an account? <Link to="/register" style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>Register here</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
