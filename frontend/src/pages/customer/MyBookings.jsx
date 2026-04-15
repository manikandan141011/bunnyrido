import { useState, useEffect } from 'react';
import { bookingAPI } from '../../services/api';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await bookingAPI.list();
      setBookings(res.data.results || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (id) => {
    if(!window.confirm("Are you sure you want to cancel this booking?")) return;
    
    try {
      await bookingAPI.cancel(id);
      alert("Booking cancelled successfully.");
      fetchBookings(); // Refresh data
    } catch (err) {
      alert("Failed to cancel booking.");
    }
  };

  if (loading) return <div className="page-loading"><div className="spinner"></div></div>;

  return (
    <div className="my-bookings-page max-w-container">
      <div className="page-header" style={{ marginBottom: '3rem' }}>
        <div>
          <h2 style={{ fontSize: '2.5rem' }}>My Tickets</h2>
          <p className="page-subtitle">View and manage your upcoming journeys</p>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="empty-state" style={{ padding: '6rem 2rem' }}>
          <div className="empty-icon" style={{ fontSize: '5rem', marginBottom: '1.5rem', opacity: 0.3 }}>🎟️</div>
          <h3>No Active Tickets</h3>
          <p>Ready for a new adventure? Search for your next trip today!</p>
          <button className="btn btn-primary mt-4" onClick={() => window.location.href = '/'}>Book a Trip</button>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map((booking, index) => (
            <div 
              className={`boarding-pass ${booking.status === 'CONFIRMED' ? 'ticket-confirmed' : ''}`} 
              key={booking.id}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="pass-main">
                <div className="pass-header-info" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className={`status-badge status-${booking.status.toLowerCase()}`} style={{ boxShadow: booking.status === 'CONFIRMED' ? '0 0 15px rgba(16, 185, 129, 0.2)' : 'none' }}>
                        {booking.status}
                      </span>
                      <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>#BR-{booking.id.toString().padStart(4, '0')}</span>
                   </div>
                   <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Booked on {new Date(booking.created_at || Date.now()).toLocaleDateString()}
                   </div>
                </div>

                <div className="pass-route">
                  <div className="pass-city">
                    <span>From</span>
                    <h3>{booking.trip_detail?.route_detail?.source}</h3>
                    <strong>{new Date(booking.trip_detail?.departure_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</strong>
                  </div>
                  
                  <div className="pass-direction">
                    <div className="pass-line">
                      <div className="dot"></div>
                      <div className="line-dashed"></div>
                      <div className="pass-icon">✈️</div>
                      <div className="line-dashed"></div>
                      <div className="dot"></div>
                    </div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{booking.trip_detail?.bus_detail?.name}</div>
                  </div>

                  <div className="pass-city" style={{ textAlign: 'right' }}>
                    <span>To</span>
                    <h3>{booking.trip_detail?.route_detail?.destination}</h3>
                    <strong>{new Date(booking.trip_detail?.arrival_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</strong>
                  </div>
                </div>

                <div className="pass-footer" style={{ marginTop: '1.5rem', display: 'flex', gap: '2.5rem' }}>
                  <div className="detail">
                    <small style={{ textTransform: 'uppercase', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Seats</small>
                    <div className="seat-tags" style={{ marginTop: '0.3rem' }}>
                      {booking.seat_details?.map(s => (
                        <span className="seat-tag" key={s.id} style={{ background: 'var(--accent-primary)', color: 'white' }}>{s.seat_number}</span>
                      ))}
                    </div>
                  </div>
                  <div className="detail">
                     <small style={{ textTransform: 'uppercase', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Travel Date</small>
                     <strong style={{ display: 'block', marginTop: '0.3rem' }}>{new Date(booking.trip_detail?.departure_time).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}</strong>
                  </div>
                </div>
              </div>
              
              <div className="pass-stub" style={{ background: booking.status === 'CONFIRMED' ? 'rgba(124, 58, 237, 0.05)' : 'rgba(0,0,0,0.1)' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '0.2rem' }}>Total Paid</div>
                  <div className="pass-price" style={{ color: 'var(--accent-primary)', marginBottom: '1.5rem' }}>₹{booking.total_price}</div>
                </div>
                
                {booking.status === 'CONFIRMED' ? (
                  <button className="btn btn-secondary btn-full btn-sm logout-btn-minimal" onClick={() => cancelBooking(booking.id)} style={{ padding: '0.8rem' }}>
                    Cancel Ticket
                  </button>
                ) : (
                  <div style={{ opacity: 0.5, fontSize: '0.85rem' }}>No further actions</div>
                )}
                
                <div className="stub-barcode" style={{ marginTop: '1.5rem', height: '40px', width: '100%', borderLeft: '1px solid currentColor', borderRight: '1px solid currentColor', display: 'flex', gap: '2px', opacity: 0.2 }}>
                   {Array.from({length: 20}).map((_, i) => <div key={i} style={{ flex: 1, background: 'currentColor', height: i % 3 === 0 ? '100%' : '70%' }}></div>)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
