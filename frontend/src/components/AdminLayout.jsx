import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="admin-layout" style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <aside className="admin-sidebar" style={{ width: '280px', backdropFilter: 'blur(20px)', background: 'rgba(255, 255, 255, 0.03)', borderRight: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', flexDirection: 'column' }}>
        <div className="sidebar-header" style={{ padding: '2.5rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <span style={{ fontSize: '1.8rem', filter: 'drop-shadow(0 0 10px var(--accent-primary))' }}>🐰</span>
            <span className="logo-text" style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.5px' }}>Bunny<span style={{ color: 'var(--accent-primary)' }}>Rido</span></span>
          </div>
        </div>

        <nav className="sidebar-nav" style={{ flex: 1, padding: '2rem 0' }}>
          <NavLink to="/admin" end className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <span>📊</span> Dashboard
          </NavLink>
          <NavLink to="/admin/buses" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <span>🚍</span> Manage Buses
          </NavLink>
          <NavLink to="/admin/trips" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <span>🛣️</span> Manage Trips
          </NavLink>
          <NavLink to="/admin/bookings" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <span>🎫</span> All Bookings
          </NavLink>
          <NavLink to="/admin/payments" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <span>💳</span> Payments
          </NavLink>
        </nav>

        <div className="sidebar-footer" style={{ padding: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="user-profile" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="avatar" style={{ width: 42, height: 42, borderRadius: '12px', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {user?.username?.[0].toUpperCase()}
            </div>
            <div className="user-meta">
              <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>{user?.username}</p>
              <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.5 }}>Administrator</p>
            </div>
          </div>
          <button className="logout-btn" onClick={logout} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', padding: '0.8rem', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.05)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.2)', cursor: 'pointer' }}>
             <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content" style={{ flex: 1, padding: '3rem 4rem', overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
}
