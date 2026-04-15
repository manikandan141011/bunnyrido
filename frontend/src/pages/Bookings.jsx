import { useState, useEffect } from 'react';
import { bookingAPI } from '../services/api';

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    try {
      const res = await bookingAPI.list();
      setBookings(res.data.results || res.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking? Seats will be released.')) return;
    setError(''); setSuccess('');
    try {
      await bookingAPI.cancel(id);
      setSuccess(`Booking #${id} cancelled. Seats released.`);
      fetchBookings();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to cancel booking');
    }
  };

  if (loading) {
    return <div className="page-loading"><div className="spinner"></div><p>Loading bookings...</p></div>;
  }

  const statusCounts = {
    all: bookings.length,
    confirmed: bookings.filter(b => b.status === 'CONFIRMED').length,
    pending: bookings.filter(b => b.status === 'PENDING').length,
    cancelled: bookings.filter(b => b.status === 'CANCELLED').length,
  };

  return (
    <div className="manage-page" style={{ animation: 'fadeInUp 0.6s ease' }}>
      <div className="page-header" style={{ marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Passenger Bookings</h1>
          <p className="page-subtitle" style={{ fontSize: '1.1rem' }}>
            Managed {statusCounts.all} transits · {statusCounts.confirmed} verified seats
          </p>
        </div>
        <button className="btn btn-secondary" onClick={fetchBookings} style={{ borderRadius: '12px' }}>
          🔄 Refresh
        </button>
      </div>

      {success && <div className="alert alert-success" style={{ marginBottom: '2rem' }}>{success}</div>}
      {error && <div className="alert alert-error" style={{ marginBottom: '2rem' }}>{error}</div>}

      {bookings.length === 0 ? (
        <div className="empty-state" style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '24px' }}>
          <span className="empty-icon">🎫</span>
          <p>No reservations found in the system.</p>
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Purchaser</th>
                <th>Route Segment</th>
                <th>Seat Config</th>
                <th>Revenue</th>
                <th>Passenger Lead</th>
                <th>Status</th>
                <th>Timestamp</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(booking => {
                 const statusClass = booking.status === 'CONFIRMED' ? 'success' : booking.status === 'PENDING' ? 'warning' : 'danger';
                 return (
                  <tr key={booking.id}>
                    <td style={{ fontWeight: 'bold', color: 'var(--accent-primary)' }}>#{booking.id}</td>
                    <td>
                       <div style={{ fontWeight: 600 }}>{booking.username}</div>
                       <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>Account Holder</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{booking.trip_detail?.source} ➔ {booking.trip_detail?.destination}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {booking.seats?.map(s => (
                          <span key={s.id} className="seat-pill" style={{ background: 'var(--accent-primary)', fontSize: '0.7rem', padding: '1px 6px' }}>{s.seat_number}</span>
                        ))}
                      </div>
                    </td>
                    <td style={{ fontWeight: 700 }}>₹{booking.total_amount}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{booking.passenger_name || 'N/A'}</div>
                      <div style={{ fontSize: '0.8rem', opacity: 0.5 }}>{booking.passenger_phone || 'No Phone'}</div>
                    </td>
                    <td>
                      <span className={`status-glow status-${statusClass}-glow`}>
                        {booking.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>
                         <div>{new Date(booking.booked_at).toLocaleDateString()}</div>
                         <div style={{ opacity: 0.5 }}>{new Date(booking.booked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                    </td>
                    <td>
                      {booking.status !== 'CANCELLED' && (
                        <button className="btn btn-sm btn-danger" onClick={() => handleCancel(booking.id)} style={{ padding: '0.5rem 0.8rem', borderRadius: '8px' }}>
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
