import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tripAPI } from '../../services/api';

export default function Home() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useState({
    source: '',
    destination: '',
    date: '',
  });

  const handleChange = (e) => {
    setSearchParams({ ...searchParams, [e.target.name]: e.target.value });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await tripAPI.list(searchParams);
      // Filter out completed/cancelled trips if needed, or rely on API
      setTrips(res.data.results || res.data || []);
      setSearched(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <div className="hero-section" style={{ padding: '6rem 2rem', position: 'relative', overflow: 'hidden' }}>
        <div className="hero-glow-1"></div>
        <div className="hero-glow-2"></div>
        
        <div className="hero-content" style={{ position: 'relative', zIndex: 1, animation: 'var(--anim-fade-up)' }}>
          <h1 style={{ fontSize: '4rem', marginBottom: '1rem', letterSpacing: '-1px' }}>
            Where to <span style={{ color: 'var(--accent-primary)', position: 'relative' }}>
              Next?
              <div style={{ position: 'absolute', bottom: '10px', left: 0, width: '100%', height: '8px', background: 'rgba(124, 58, 237, 0.2)', zIndex: -1 }}></div>
            </span>
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '3rem' }}>
            Experience premium travel with India's most trusted bus booking platform.
          </p>
          
          <form className="search-bar glass-search-container" onSubmit={handleSearch} style={{ animation: 'var(--anim-scale-in)', animationDelay: '0.2s' }}>
            <div className="search-group">
              <div className="search-icon-box">📍</div>
              <div className="search-input-wrapper">
                <label>Leaving From</label>
                <input 
                  type="text" 
                  name="source" 
                  placeholder="Chennai" 
                  value={searchParams.source} 
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>
            
            <div className="search-divider-vertical"></div>
            
            <div className="search-group">
              <div className="search-icon-box">🎯</div>
              <div className="search-input-wrapper">
                <label>Going To</label>
                <input 
                  type="text" 
                  name="destination" 
                  placeholder="Bangalore" 
                  value={searchParams.destination} 
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>
            
            <div className="search-divider-vertical"></div>
            
            <div className="search-group">
              <div className="search-icon-box">📅</div>
              <div className="search-input-wrapper">
                <label>Date</label>
                <input 
                  type="date" 
                  name="date" 
                  value={searchParams.date} 
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>
            
            <button type="submit" className="btn btn-primary search-btn" disabled={loading}>
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <div className="spinner-sm"></div> Searching...
                </div>
              ) : 'Find Trips'}
            </button>
          </form>
        </div>
      </div>

      {/* Results Section */}
      <div className="results-section max-w-container">
        {searched && (
          <div className="results-header" style={{ marginBottom: '2.5rem', animation: 'fadeIn 0.5s ease' }}>
            <h2 style={{ fontSize: '2rem' }}>{trips.length} Available Trips</h2>
            {trips.length > 0 && <p className="page-subtitle">Showing results for {searchParams.source} to {searchParams.destination}</p>}
          </div>
        )}

        <div className="trip-list">
          {trips.map((trip, index) => (
            <div className="boarding-pass" key={trip.id} style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="pass-main">
                <div className="pass-route">
                  <div className="pass-city">
                    <span>Departure</span>
                    <h3>{new Date(trip.departure_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</h3>
                    <strong>{trip.source}</strong>
                  </div>
                  
                  <div className="pass-direction">
                    <div className="pass-bus-type badge badge-sm">{trip.bus_type}</div>
                    <div className="pass-line">
                      <div className="dot"></div>
                      <div className="line-dashed"></div>
                      <div className="pass-icon">🚌</div>
                      <div className="line-dashed"></div>
                      <div className="dot"></div>
                    </div>
                    <div className="pass-duration" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Non-stop
                    </div>
                  </div>

                  <div className="pass-city" style={{ textAlign: 'right' }}>
                    <span>Arrival</span>
                    <h3>{new Date(trip.arrival_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</h3>
                    <strong>{trip.destination}</strong>
                  </div>
                </div>

                <div className="pass-footer" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="pass-amenities" style={{ display: 'flex', gap: '1rem', opacity: 0.6, fontSize: '0.9rem' }}>
                    <span>⚡ Charging Point</span>
                    <span>❄️ AC</span>
                    <span>💧 Water</span>
                  </div>
                  <div className="pass-seats-left" style={{ fontWeight: 600, color: trip.available_seats < 5 ? 'var(--status-danger)' : 'var(--status-success)' }}>
                    {trip.available_seats} Seats Remaining
                  </div>
                </div>
              </div>
              
              <div className="pass-stub">
                <div className="pass-price">₹{trip.price}</div>
                <button 
                  className="btn btn-primary btn-full" 
                  onClick={() => navigate(`/trip/${trip.id}`)}
                  disabled={trip.available_seats === 0 || trip.status !== 'SCHEDULED'}
                >
                  {trip.available_seats > 0 ? 'Select Seats' : 'Sold Out'}
                </button>
              </div>
            </div>
          ))}

          {searched && trips.length === 0 && (
            <div className="empty-state" style={{ padding: '5rem 2rem' }}>
              <div className="empty-icon" style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🏜️</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>No Trips Found</h3>
              <p>Try searching for a different date or route.</p>
              <button className="btn btn-secondary mt-4" onClick={() => setSearched(false)}>Reset Search</button>
            </div>
          )}
          
          {!searched && (
            <div className="home-features" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginTop: '4rem' }}>
               <div className="feature-card glass-panel" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🛡️</div>
                  <h4>Safe Travel</h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Verified buses and professional drivers for your safety.</p>
               </div>
               <div className="feature-card glass-panel" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚡</div>
                  <h4>Instant Booking</h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Book your seat in less than 60 seconds with instant confirmation.</p>
               </div>
               <div className="feature-card glass-panel" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>💳</div>
                  <h4>Secure Payments</h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Multiple secure payment options for a hassle-free experience.</p>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
