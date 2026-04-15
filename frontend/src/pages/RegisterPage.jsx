import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
    phone: '',
    role: 'customer',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.password_confirm) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await authAPI.register(formData);
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data
          ? Object.values(err.response.data).flat().join(', ')
          : 'Registration failed. Please try again.'
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
        <div className="login-art mobile-hide" style={{ order: 0 }}>
          <div className="art-content">
            <span className="art-icon" style={{ animation: 'float 5s ease-in-out infinite' }}>✨</span>
            <h1 className="auth-title">Join the Journey</h1>
            <p className="auth-subtitle">Create an account to start booking</p>
            
            <div className="art-features" style={{ display: 'grid', gap: '2rem', textAlign: 'left', marginTop: '4rem' }}>
              <div className="feature" style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.2rem' }}>
                <span style={{ background: 'rgba(124, 58, 237, 0.2)', padding: '0.8rem', borderRadius: '12px' }}>🎁</span>
                Exclusive Offers
              </div>
              <div className="feature" style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.2rem' }}>
                <span style={{ background: 'rgba(236, 72, 153, 0.2)', padding: '0.8rem', borderRadius: '12px' }}>🎫</span>
                Instant E-Tickets
              </div>
              <div className="feature" style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.2rem' }}>
                <span style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '0.8rem', borderRadius: '12px' }}>🌍</span>
                Wide Network
              </div>
            </div>
          </div>
        </div>

        <div className="login-form-section" style={{ order: 1 }}>
          <div className="login-form-container" style={{ maxWidth: '520px' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Create Account</h2>
            <p className="auth-subtitle">Ready to explore with BunnyRido?</p>

            {error && <div className="alert alert-error" style={{ marginBottom: '2rem' }}>{error}</div>}
            {success && <div className="alert alert-success" style={{ marginBottom: '2rem' }}>{success}</div>}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    id="first_name"
                    type="text"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="input-premium"
                    placeholder="John"
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    id="last_name"
                    type="text"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="input-premium"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="form-grid" style={{ marginTop: '1.5rem' }}>
                <div className="form-group">
                  <label>Username *</label>
                  <input
                    id="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    className="input-premium"
                    placeholder="johndoe123"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    id="phone"
                    type="text"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input-premium"
                    placeholder="9876543210"
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '1.5rem' }}>
                <label>Email Address *</label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-premium"
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div className="form-grid" style={{ marginTop: '1.5rem' }}>
                <div className="form-group">
                  <label>Password *</label>
                  <input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="input-premium"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Confirm *</label>
                  <input
                    id="password_confirm"
                    type="password"
                    value={formData.password_confirm}
                    onChange={handleChange}
                    className="input-premium"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '1.5rem' }}>
                <label>Join As</label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="input-premium"
                  required
                  style={{ width: '100%', appearance: 'none' }}
                >
                  <option value="customer">Customer (Traveler)</option>
                  <option value="admin">Admin (Staff)</option>
                </select>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full mt-5"
                disabled={loading}
                style={{ padding: '1.2rem', fontSize: '1.1rem', borderRadius: '16px' }}
              >
                {loading ? (
                  <span className="btn-loading">
                    <span className="spinner-sm"></span> Creating account...
                  </span>
                ) : (
                  'Create Secure Account'
                )}
              </button>
            </form>

            <div className="login-footer" style={{ marginTop: '2rem', textAlign: 'center' }}>
              <p style={{ opacity: 0.7 }}>
                Already have an account? <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>Sign in here</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
