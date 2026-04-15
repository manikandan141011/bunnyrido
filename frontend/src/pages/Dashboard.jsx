import { useState, useEffect } from 'react';
import { busAPI, tripAPI, bookingAPI, paymentAPI } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    buses: 0,
    trips: 0,
    bookings: 0,
    payments: 0,
    revenue: 0,
    pendingBookings: 0,
    activeTrips: 0,
    failedPayments: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [busRes, tripRes, bookingRes, paymentRes] = await Promise.all([
        busAPI.list(),
        tripAPI.list(),
        bookingAPI.list(),
        paymentAPI.list(),
      ]);

      const buses = busRes.data.results || busRes.data || [];
      const trips = tripRes.data.results || tripRes.data || [];
      const bookings = bookingRes.data.results || bookingRes.data || [];
      const payments = paymentRes.data.results || paymentRes.data || [];

      const revenue = payments
        .filter((p) => p.status === 'SUCCESS')
        .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

      setStats({
        buses: Array.isArray(buses) ? buses.length : 0,
        trips: Array.isArray(trips) ? trips.length : 0,
        bookings: Array.isArray(bookings) ? bookings.length : 0,
        payments: Array.isArray(payments) ? payments.length : 0,
        revenue,
        pendingBookings: Array.isArray(bookings)
          ? bookings.filter((b) => b.status === 'PENDING').length
          : 0,
        activeTrips: Array.isArray(trips)
          ? trips.filter((t) => t.status === 'SCHEDULED').length
          : 0,
        failedPayments: Array.isArray(payments)
          ? payments.filter((p) => p.status === 'FAILED').length
          : 0,
      });

      setRecentBookings(Array.isArray(bookings) ? bookings.slice(0, 5) : []);
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Buses', value: stats.buses, icon: '🚌', color: 'blue' },
    { label: 'Active Trips', value: stats.activeTrips, icon: '🛣️', color: 'green' },
    { label: 'Total Bookings', value: stats.bookings, icon: '🎫', color: 'purple' },
    { label: 'Revenue (₹)', value: `₹${stats.revenue.toLocaleString()}`, icon: '💰', color: 'gold' },
    { label: 'Pending Bookings', value: stats.pendingBookings, icon: '⏳', color: 'orange' },
    { label: 'All Trips', value: stats.trips, icon: '📋', color: 'teal' },
    { label: 'Payments', value: stats.payments, icon: '💳', color: 'indigo' },
    { label: 'Failed Payments', value: stats.failedPayments, icon: '⚠️', color: 'red' },
  ];

  return (
    <div className="dashboard-page" style={{ animation: 'fadeInUp 0.6s ease' }}>
      <div className="page-header" style={{ marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.2rem' }}>Dashboard</h1>
          <p className="page-subtitle" style={{ fontSize: '1.1rem' }}>Overview of your system performance</p>
        </div>
        <button className="btn btn-secondary" onClick={fetchDashboardData} style={{ borderRadius: '12px' }}>
          🔄 Refresh
        </button>
      </div>

      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem', marginBottom: '4rem' }}>
        {statCards.map((card) => (
          <div key={card.label} className={`admin-stat-card admin-stat-${card.color}`}>
            <div className="admin-stat-icon">{card.icon}</div>
            <div className="admin-stat-info">
              <span className="admin-stat-label">{card.label}</span>
              <span className="admin-stat-value">{card.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700 }}>Recent Bookings</h2>
          <button className="btn btn-link" onClick={() => navigate('/admin/bookings')}>View All →</button>
        </div>

        {recentBookings.length === 0 ? (
          <div className="empty-state" style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '24px' }}>
            <span className="empty-icon">📭</span>
            <p>No activity detected yet.</p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Customer</th>
                  <th>Trip Route</th>
                  <th>Total Amount</th>
                  <th>Payment Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((booking) => {
                  const statusClass = booking.status === 'CONFIRMED' ? 'success' : booking.status === 'PENDING' ? 'warning' : 'danger';
                  return (
                    <tr key={booking.id}>
                      <td style={{ fontWeight: 'bold', color: 'var(--accent-primary)' }}>#{booking.id}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{booking.username}</div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.5 }}>{booking.passenger_phone}</div>
                      </td>
                      <td>
                        {booking.trip_detail?.source} ➔ {booking.trip_detail?.destination}
                      </td>
                      <td style={{ fontWeight: 700 }}>₹{booking.total_amount}</td>
                      <td>
                        <span className={`status-glow status-${statusClass}-glow`}>
                          {booking.status}
                        </span>
                      </td>
                      <td>{new Date(booking.booked_at).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
