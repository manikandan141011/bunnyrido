import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function CustomerLayout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className="customer-layout">
      {/* Top Navbar */}
      <header className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
        <div className="navbar-container">
          <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <span className="logo-icon" style={{ animation: 'float 3s ease-in-out infinite', display: 'inline-block', fontSize: '1.5rem' }}>🐰</span>
            <span className="logo-text" style={{ fontSize: '1.4rem', letterSpacing: '-0.5px' }}>BunnyRido</span>
          </div>

          <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
            <nav className="nav-links">
              <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end onClick={() => setIsMenuOpen(false)}>
                Search
              </NavLink>
              <NavLink to="/my-bookings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}>
                My Bookings
              </NavLink>
              {isAdmin && (
                <NavLink to="/admin" className="nav-link admin-nav-badge" onClick={() => setIsMenuOpen(false)}>
                  Admin
                </NavLink>
              )}
            </nav>

            <div className="nav-actions">
              <div className="nav-icon-actions">
                 <button className="nav-icon-btn" title="Notifications">
                    🔔
                    <span className="notification-dot"></span>
                 </button>
              </div>

              <div 
                className="user-profile-dropdown-container"
                onMouseEnter={() => setShowProfileDropdown(true)}
                onMouseLeave={() => setShowProfileDropdown(false)}
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              >
                <div className="user-profile-mini">
                  <div className="avatar avatar-sm" style={{ border: '2px solid rgba(124, 58, 237, 0.3)' }}>{user?.username?.[0]?.toUpperCase()}</div>
                  <div className="user-details mobile-hide">
                    <span className="user-name">{user?.username}</span>
                  </div>
                  <span className="dropdown-arrow">▾</span>
                </div>

                {showProfileDropdown && (
                  <div className="profile-dropdown-menu">
                    <div className="dropdown-header">
                       <strong>{user?.username}</strong>
                       <p>{user?.email || 'Premium Member'}</p>
                    </div>
                    <div className="dropdown-divider"></div>
                    <button className="dropdown-item" onClick={() => navigate('/my-bookings')}>
                      <span>🎫</span> My Bookings
                    </button>
                    <button className="dropdown-item">
                      <span>⚙️</span> Settings
                    </button>
                    <div className="dropdown-divider"></div>
                    <button className="dropdown-item logout-item" onClick={handleLogout}>
                      <span>↪️</span> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <button className="mobile-menu-toggle" onClick={toggleMenu} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', marginLeft: '10px' }}>
            {isMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </header>

      {/* Main Content Render */}
      <main className="customer-main" style={{ animation: 'fadeIn 0.8s ease' }}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="footer" style={{ borderTop: '1px solid var(--border-color)', marginTop: '4rem' }}>
        <div className="max-w-container" style={{ textAlign: 'center', opacity: 0.6 }}>
          <p>&copy; {new Date().getFullYear()} BunnyRido • Premium Bus Travel</p>
        </div>
      </footer>
    </div>
  );
}
