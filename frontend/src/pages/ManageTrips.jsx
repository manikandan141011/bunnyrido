import { useState, useEffect } from 'react';
import { tripAPI, busAPI, routeAPI } from '../services/api';

export default function ManageTrips() {
  const [trips, setTrips] = useState([]);
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [formData, setFormData] = useState({
    bus: '', route: '', departure_time: '', arrival_time: '', price: '', status: 'SCHEDULED',
  });
  const [routeForm, setRouteForm] = useState({
    source: '', destination: '', distance_km: '', duration_hours: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [tripRes, busRes, routeRes] = await Promise.all([
        tripAPI.list(), busAPI.list(), routeAPI.list(),
      ]);
      setTrips(tripRes.data.results || tripRes.data || []);
      setBuses(busRes.data.results || busRes.data || []);
      setRoutes(routeRes.data.results || routeRes.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleTripSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await tripAPI.create(formData);
      setSuccess('Trip created! Seats auto-generated 🎉');
      setShowModal(false);
      fetchAll();
    } catch (err) {
      setError(err.response?.data ? JSON.stringify(err.response.data) : 'Error creating trip');
    }
  };

  const handleRouteSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await routeAPI.create(routeForm);
      setSuccess('Route added!');
      setShowRouteModal(false);
      setRouteForm({ source: '', destination: '', distance_km: '', duration_hours: '' });
      fetchAll();
    } catch (err) {
      setError(err.response?.data ? Object.values(err.response.data).flat().join(', ') : 'Error creating route');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this trip? All seats will be removed.')) return;
    try {
      await tripAPI.delete(id);
      setSuccess('Trip deleted');
      fetchAll();
    } catch (err) { setError('Failed to delete trip'); }
  };

  if (loading) {
    return <div className="page-loading"><div className="spinner"></div><p>Loading trips...</p></div>;
  }

  return (
    <div className="manage-page" style={{ animation: 'fadeInUp 0.6s ease' }}>
      <div className="page-header" style={{ marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Trip Orchestration</h1>
          <p className="page-subtitle" style={{ fontSize: '1.1rem' }}>Manage routes and schedule active fleet operations</p>
        </div>
        <div className="header-actions" style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-secondary" onClick={() => setShowRouteModal(true)} style={{ borderRadius: '12px' }}>📍 Add Route</button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ padding: '1rem 2rem', borderRadius: '16px', fontWeight: 'bold' }}>✨ Create New Trip</button>
        </div>
      </div>

      {success && <div className="alert alert-success" style={{ marginBottom: '2rem' }}>{success}</div>}
      {error && <div className="alert alert-error" style={{ marginBottom: '2rem' }}>{error}</div>}

      {/* Routes list - Refined labels */}
      {routes.length > 0 && (
        <div className="section-card" style={{ background: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: '24px', marginBottom: '3rem', border: '1px solid rgba(255,255,255,0.05)' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', opacity: 0.7 }}>Available Service Routes</h3>
          <div className="route-tags" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {routes.map(r => (
              <span key={r.id} className="route-pill" style={{ background: 'rgba(124, 58, 237, 0.1)', color: '#a78bfa', padding: '0.6rem 1.2rem', borderRadius: '50px', border: '1px solid rgba(124, 58, 237, 0.2)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <strong>{r.source}</strong>
                <span style={{ opacity: 0.4 }}>➔</span>
                <strong>{r.destination}</strong>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Trips table */}
      {trips.length === 0 ? (
        <div className="empty-state" style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '24px' }}>
          <span className="empty-icon">🛣️</span>
          <p>No active trips found. Start by adding a route and creating a trip schedule.</p>
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Trip ID</th>
                <th>Route Details</th>
                <th>Assigned Fleet</th>
                <th>Timing (DEP/ARR)</th>
                <th>Fare</th>
                <th>Occupancy</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {trips.map(trip => {
                const statusClass = trip.status === 'COMPLETED' ? 'success' : trip.status === 'CANCELLED' ? 'danger' : 'warning';
                return (
                  <tr key={trip.id}>
                    <td style={{ fontWeight: 'bold', color: 'var(--accent-primary)' }}>#{trip.id}</td>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{trip.source} ➔ {trip.destination}</div>
                      <div style={{ fontSize: '0.8rem', opacity: 0.5 }}>Inter-city Transit</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{trip.bus_name}</div>
                      <span className={`status-glow status-success-glow`} style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem' }}>{trip.bus_type}</span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.9rem' }}>
                         <div><span style={{ opacity: 0.5 }}>D:</span> {new Date(trip.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                         <div><span style={{ opacity: 0.5 }}>A:</span> {new Date(trip.arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                    </td>
                    <td style={{ fontWeight: 700 }}>₹{trip.price}</td>
                    <td>
                      <div style={{ width: '80px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden', marginBottom: '4px' }}>
                        <div style={{ width: `${(trip.available_seats/trip.total_seats)*100}%`, height: '100%', background: 'var(--accent-gradient)' }}></div>
                      </div>
                      <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>{trip.available_seats}/{trip.total_seats} Left</span>
                    </td>
                    <td>
                      <span className={`status-glow status-${statusClass}-glow`}>
                        {trip.status}
                      </span>
                    </td>
                    <td>
                       <button className="btn btn-sm btn-danger" onClick={() => handleDelete(trip.id)} style={{ padding: '0.5rem', borderRadius: '8px' }}>🗑️</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Trip Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Trip</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            {buses.length === 0 || routes.length === 0 ? (
              <div className="alert alert-error">You need at least one bus and one route to create a trip.</div>
            ) : (
              <form onSubmit={handleTripSubmit} className="modal-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Bus</label>
                    <select value={formData.bus} onChange={e => setFormData({...formData, bus: e.target.value})} required>
                      <option value="">Select Bus</option>
                      {buses.map(b => <option key={b.id} value={b.id}>{b.name} ({b.bus_type}, {b.total_seats} seats)</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Route</label>
                    <select value={formData.route} onChange={e => setFormData({...formData, route: e.target.value})} required>
                      <option value="">Select Route</option>
                      {routes.map(r => <option key={r.id} value={r.id}>{r.source} → {r.destination}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Departure Time</label>
                    <input type="datetime-local" value={formData.departure_time} onChange={e => setFormData({...formData, departure_time: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Arrival Time</label>
                    <input type="datetime-local" value={formData.arrival_time} onChange={e => setFormData({...formData, arrival_time: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Price (₹)</label>
                    <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="1200" min="1" step="0.01" required />
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                      <option value="SCHEDULED">Scheduled</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                </div>
                <p className="form-note">💺 Seats will be auto-generated based on the bus capacity.</p>
                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Create Trip</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Add Route Modal */}
      {showRouteModal && (
        <div className="modal-overlay" onClick={() => setShowRouteModal(false)}>
          <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Route</h3>
              <button className="modal-close" onClick={() => setShowRouteModal(false)}>×</button>
            </div>
            <form onSubmit={handleRouteSubmit} className="modal-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Source City</label>
                  <input type="text" value={routeForm.source} onChange={e => setRouteForm({...routeForm, source: e.target.value})} placeholder="e.g., Chennai" required />
                </div>
                <div className="form-group">
                  <label>Destination City</label>
                  <input type="text" value={routeForm.destination} onChange={e => setRouteForm({...routeForm, destination: e.target.value})} placeholder="e.g., Bangalore" required />
                </div>
                <div className="form-group">
                  <label>Distance (km)</label>
                  <input type="number" value={routeForm.distance_km} onChange={e => setRouteForm({...routeForm, distance_km: e.target.value})} placeholder="350" />
                </div>
                <div className="form-group">
                  <label>Duration (hours)</label>
                  <input type="number" step="0.5" value={routeForm.duration_hours} onChange={e => setRouteForm({...routeForm, duration_hours: e.target.value})} placeholder="6.5" />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowRouteModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Route</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
