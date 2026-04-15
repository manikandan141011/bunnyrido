import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tripAPI } from '../../services/api';

export default function TripDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [tripRes, seatsRes] = await Promise.all([
        tripAPI.get(id),
        tripAPI.seats(id)
      ]);
      setTrip(tripRes.data);
      setSeats(seatsRes.data.results || seatsRes.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSeatClick = (seat) => {
    if (seat.is_booked) return;

    if (selectedSeats.find(s => s.id === seat.id)) {
      setSelectedSeats(selectedSeats.filter(s => s.id !== seat.id));
    } else {
      if (selectedSeats.length >= 6) {
        alert("You can only select up to 6 seats per booking.");
        return;
      }
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const currentTotal = selectedSeats.length * (trip?.price || 0);

  const handleContinue = () => {
    if (selectedSeats.length === 0) return;
    navigate('/checkout', { state: { trip, selectedSeats, total: currentTotal } });
  };

  if (loading) {
    return <div className="page-loading"><div className="spinner"></div><p>Loading your trip...</p></div>;
  }

  if (!trip) {
    return <div className="alert alert-error" style={{ margin: '2rem auto', maxWidth: 600 }}>Trip not found!</div>;
  }

  return (
    <div className="trip-details-page max-w-container" style={{ animation: 'fadeInUp 0.6s ease' }}>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button className="btn btn-secondary" onClick={() => navigate(-1)} style={{ borderRadius: '16px', width: '48px', height: '48px' }}>
            ←
          </button>
          <div>
            <h1 style={{ marginBottom: '0.2rem', fontSize: '2.5rem', fontWeight: 800 }}>Choose Seats</h1>
            <p style={{ opacity: 0.6, fontSize: '1rem' }}>Secure your preferred spot for the journey to {trip.route_detail?.destination}</p>
          </div>
        </div>
      </div>

      <div className="trip-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '3rem', alignItems: 'start' }}>
        {/* Left: Bus Map */}
        <div className="seat-map-section">
          <div className="bus-layout">
            <div className="cockpit-divider">
               <div style={{ marginRight: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.5 }}>
                  <span>Front of Bus</span>
                  <div style={{ width: 40, height: 2, background: 'rgba(255,255,255,0.1)' }}></div>
               </div>
               <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.6 }}>
                  <circle cx="12" cy="12" r="10"></circle>
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M12 2v4M12 18v4M2 12h4m12 0h4"></path>
               </svg>
            </div>

            <div className="seats-grid">
              {seats.map(seat => {
                const isSelected = !!selectedSeats.find(s => s.id === seat.id);
                return (
                  <button
                    key={seat.id}
                    disabled={seat.is_booked}
                    onClick={() => handleSeatClick(seat)}
                    className={`seat ${seat.is_booked ? 'seat-booked' : isSelected ? 'seat-selected' : ''}`}
                    title={`Seat ${seat.seat_number}`}
                  >
                    {seat.seat_number}
                  </button>
                );
              })}
            </div>
            
            <div style={{ marginTop: '3rem', textAlign: 'center', opacity: 0.3, fontSize: '0.8rem', letterSpacing: '2px', textTransform: 'uppercase' }}>
              Back of Bus
            </div>
          </div>

          <div className="seat-legend" style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '2rem' }}>
             <div className="legend-item"><div className="seat" style={{ width: 14, height: 14, marginRight: 8, background: 'rgba(255,255,255,0.05)' }}></div> Available</div>
             <div className="legend-item"><div className="seat seat-selected" style={{ width: 14, height: 14, marginRight: 8 }}></div> Selected</div>
             <div className="legend-item"><div className="seat seat-booked" style={{ width: 14, height: 14, marginRight: 8 }}></div> Occupied</div>
          </div>
        </div>

        {/* Right: Floating Summary Card */}
        <div className="booking-summary-panel">
          <h3 style={{ fontSize: '1.4rem', marginBottom: '1.5rem' }}>Trip Summary</h3>
          <div className="trip-preview" style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ opacity: 0.6 }}>Route</span>
                <strong>{trip.route_detail?.source} ➔ {trip.route_detail?.destination}</strong>
             </div>
             <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ opacity: 0.6 }}>Bus</span>
                <span>{trip.bus_detail?.name}</span>
             </div>
          </div>

          <div className="digital-ticket-row">
            <span>Selected Seats</span>
            <div>
              {selectedSeats.length > 0 ? selectedSeats.map(s => (
                <span key={s.id} className="seat-pill">{s.seat_number}</span>
              )) : <span style={{ opacity: 0.4 }}>Select seats to proceed</span>}
            </div>
          </div>

          <div className="digital-ticket-row">
            <span>Fare per Seat</span>
            <strong>₹{trip.price}</strong>
          </div>

          <div className="total-section" style={{ marginTop: '2rem', textAlign: 'center' }}>
            <p style={{ opacity: 0.6, marginBottom: '0.5rem' }}>Total Payable</p>
            <h2 style={{ fontSize: '2.5rem', color: 'var(--accent-primary)', marginBottom: '1.5rem' }}>₹{currentTotal.toFixed(2)}</h2>
            
            <button 
              className="btn btn-primary btn-full" 
              style={{ padding: '1.2rem', fontSize: '1.1rem', borderRadius: '16px' }}
              disabled={selectedSeats.length === 0}
              onClick={handleContinue}
            >
              Continue to Checkout ➔
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
