import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { bookingAPI, paymentAPI } from '../../services/api';

export default function Checkout() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  const trip = state?.trip;
  const seats = state?.selectedSeats || [];
  const total = state?.total || 0;

  const [formData, setFormData] = useState({
    passenger_name: '',
    passenger_phone: '',
    payment_method: 'UPI'
  });

  if (!trip || seats.length === 0) {
    return (
      <div className="empty-state">
        <p>No seats selected. Please go back and select your seats.</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>Return Home</button>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleInitiatePayment = (e) => {
    e.preventDefault();
    setShowPaymentModal(true);
  };

  const processPayment = async () => {
    setLoading(true);
    setError('');
    setShowPaymentModal(false);

    try {
      // 1. Create the booking
      const seatIds = seats.map(s => s.id);
      const bookingData = {
        trip: trip.id,
        seat_ids: seatIds,
        passenger_name: formData.passenger_name,
        passenger_phone: formData.passenger_phone,
      };

      const bookingRes = await bookingAPI.create(bookingData);
      const newBooking = bookingRes.data;

      // 2. Process Mock Payment
      const paymentData = {
        booking: newBooking.id,
        amount: total,
        payment_method: formData.payment_method,
      };

      await paymentAPI.create(paymentData);

      // Successfully processed
      alert("Booking & Payment Successful!");
      navigate('/my-bookings');
    } catch (err) {
      console.error(err);
      const errData = err.response?.data;
      let errMsg = "Booking failed! The seats might have been just taken.";
      if (errData) {
        if (typeof errData === 'object' && !errData.detail) {
           errMsg = Object.values(errData).flat().join(', ');
        } else if (errData.detail) {
           errMsg = errData.detail;
        }
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page max-w-container" style={{ animation: 'fadeInUp 0.6s ease' }}>
      <div className="page-header" style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Finalize Booking</h1>
        <p style={{ opacity: 0.6 }}>Review your trip and complete the payment securely</p>
      </div>

      <div className="checkout-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '3rem', alignItems: 'start' }}>
        <div className="checkout-form glass-panel" style={{ padding: '3rem' }}>
          <h3 style={{ marginBottom: '2rem' }}>Passenger Information</h3>
          {error && <div className="alert alert-error">{error}</div>}
          
          <form onSubmit={handleInitiatePayment}>
            <div className="form-group">
              <label>Full Name</label>
              <input 
                name="passenger_name" 
                value={formData.passenger_name} 
                onChange={handleChange} 
                className="input-premium"
                required 
                placeholder="as per ID card"
                style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px' }}
              />
            </div>
            
            <div className="form-group" style={{ marginTop: '1.5rem' }}>
              <label>Phone Number</label>
              <input 
                name="passenger_phone" 
                value={formData.passenger_phone} 
                onChange={handleChange} 
                className="input-premium"
                required 
                placeholder="+91 XXXXX XXXXX"
                style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px' }}
              />
            </div>

            <h3 className="mt-5" style={{ marginBottom: '1.5rem' }}>Payment Gateway</h3>
            <div className="form-group">
              <select 
                name="payment_method" 
                value={formData.payment_method} 
                onChange={handleChange}
                style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: 'white', width: '100%' }}
              >
                <option value="UPI">UPI (GPay, PhonePe, etc.)</option>
                <option value="CARD">Credit / Debit Card</option>
                <option value="NETBANKING">Net Banking</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary btn-full mt-5" disabled={loading} style={{ padding: '1.2rem', fontSize: '1.1rem', borderRadius: '16px' }}>
              {loading ? 'Processing...' : `Pay ₹${total.toFixed(2)} Securely`}
            </button>
          </form>
        </div>

        <div className="checkout-summary-section">
          <div className="checkout-boarding-pass">
             <div className="pass-top">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                   <div>
                      <p style={{ textTransform: 'uppercase', fontSize: '0.7rem', opacity: 0.6, letterSpacing: '1px' }}>Transit Pass</p>
                      <h3 style={{ fontSize: '1.5rem', margin: 0 }}>BunnyRido Express</h3>
                   </div>
                   <div style={{ textAlign: 'right' }}>
                      <span className="badge" style={{ background: 'var(--accent-primary)', color: 'white' }}>CONFIRMATION PENDING</span>
                   </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <div>
                      <h2 style={{ fontSize: '2rem', margin: 0 }}>{trip.route_detail?.source?.substring(0, 3).toUpperCase()}</h2>
                      <p style={{ opacity: 0.6, margin: 0 }}>{trip.route_detail?.source}</p>
                   </div>
                   <div style={{ textAlign: 'center', opacity: 0.4 }}>
                      <span>✈️</span>
                      <div style={{ width: 60, height: 1, borderTop: '2px dashed rgba(255,255,255,0.2)', margin: '5px auto' }}></div>
                   </div>
                   <div style={{ textAlign: 'right' }}>
                      <h2 style={{ fontSize: '2rem', margin: 0 }}>{trip.route_detail?.destination?.substring(0, 3).toUpperCase()}</h2>
                      <p style={{ opacity: 0.6, margin: 0 }}>{trip.route_detail?.destination}</p>
                   </div>
                </div>
             </div>

             <div className="ticket-divider"></div>

             <div className="pass-bottom" style={{ color: '#1a1a1a' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                   <div>
                      <p style={{ fontSize: '0.75rem', color: '#666', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Departure</p>
                      <strong style={{ fontSize: '1rem' }}>{new Date(trip.departure_time).toLocaleDateString()}</strong>
                   </div>
                   <div>
                      <p style={{ fontSize: '0.75rem', color: '#666', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Bus No.</p>
                      <strong style={{ fontSize: '1rem' }}>BR-{trip.id}</strong>
                   </div>
                   <div>
                      <p style={{ fontSize: '0.75rem', color: '#666', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Seats</p>
                      <strong style={{ fontSize: '1rem' }}>{seats.map(s => s.seat_number).join(', ')}</strong>
                   </div>
                   <div>
                      <p style={{ fontSize: '0.75rem', color: '#666', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Bus Type</p>
                      <strong style={{ fontSize: '1rem' }}>{trip.bus_detail?.bus_type}</strong>
                   </div>
                </div>

                <div style={{ background: '#f8f8f8', padding: '1.5rem', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <div>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#888' }}>Grand Total</p>
                      <h2 style={{ margin: 0, color: 'var(--accent-primary)', fontSize: '1.8rem' }}>₹{total.toFixed(2)}</h2>
                   </div>
                   <div style={{ opacity: 0.2 }}>
                      <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor">
                         <path d="M4,17H20V19H4V17M4,13H20V15H4V13M4,9H20V11H4V9M4,5H20V7H4V5Z" />
                      </svg>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Payment Simulation Modal */}
      {showPaymentModal && (
        <div className="modal-overlay">
          <div className="modal modal-sm" style={{ textAlign: 'center' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>Simulate Payment</h3>
              <button className="modal-close" onClick={() => setShowPaymentModal(false)}>✕</button>
            </div>
            
            <div className="modal-body" style={{ padding: '1rem 0' }}>
              <h2 style={{ color: 'var(--accent-primary)', marginBottom: '1.5rem' }}>₹{total.toFixed(2)}</h2>
              
              {formData.payment_method === 'UPI' && (
                <div className="mock-upi-flow">
                  <div style={{ background: 'white', padding: '1rem', display: 'inline-block', borderRadius: '8px', marginBottom: '1rem' }}>
                    {/* Fake QR code using SVG */}
                    <svg width="150" height="150" viewBox="0 0 100 100">
                      <rect width="100" height="100" fill="white"/>
                      <rect x="10" y="10" width="20" height="20" fill="black"/>
                      <rect x="70" y="10" width="20" height="20" fill="black"/>
                      <rect x="10" y="70" width="20" height="20" fill="black"/>
                      <rect x="40" y="40" width="20" height="20" fill="black"/>
                      <rect x="15" y="45" width="10" height="10" fill="black"/>
                      <rect x="75" y="75" width="10" height="10" fill="black"/>
                      <rect x="45" y="75" width="10" height="10" fill="black"/>
                      <rect x="75" y="45" width="10" height="10" fill="black"/>
                    </svg>
                  </div>
                  <p className="text-secondary" style={{ fontSize: '0.9rem' }}>Scan this QR code with any UPI app</p>
                </div>
              )}

              {formData.payment_method === 'CARD' && (
                <div className="mock-card-flow" style={{ textAlign: 'left', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                  <div className="form-group">
                    <label>Card Number</label>
                    <input type="text" placeholder="XXXX XXXX XXXX XXXX" defaultValue="4111 1111 1111 1111" disabled />
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>Expiry</label>
                      <input type="text" placeholder="MM/YY" defaultValue="12/26" disabled />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>CVV</label>
                      <input type="password" placeholder="***" defaultValue="123" disabled />
                    </div>
                  </div>
                </div>
              )}

              {formData.payment_method === 'NETBANKING' && (
                <div className="mock-netbanking-flow" style={{ textAlign: 'left' }}>
                  <p className="text-secondary mb-3">You will be redirected to your bank's secure portal.</p>
                  <select disabled className="mb-4">
                    <option>HDFC Bank - Simulated</option>
                  </select>
                </div>
              )}
            </div>

            <div className="modal-actions" style={{ justifyContent: 'center', marginTop: '1rem', borderTop: 'none', paddingTop: 0 }}>
              <button className="btn btn-secondary" onClick={() => setShowPaymentModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={processPayment}>
                ✅ Complete Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
