import { useState, useEffect } from 'react';
import { busAPI } from '../services/api';

export default function ManageBuses() {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBus, setEditingBus] = useState(null);
  const [formData, setFormData] = useState({
    name: '', bus_type: 'AC', total_seats: 40,
    registration_number: '', amenities: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchBuses();
  }, []);

  const fetchBuses = async () => {
    try {
      const res = await busAPI.list();
      setBuses(res.data.results || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (bus = null) => {
    setError('');
    setSuccess('');
    if (bus) {
      setEditingBus(bus);
      setFormData({
        name: bus.name,
        bus_type: bus.bus_type,
        total_seats: bus.total_seats,
        registration_number: bus.registration_number,
        amenities: bus.amenities || '',
      });
    } else {
      setEditingBus(null);
      setFormData({
        name: '', bus_type: 'AC', total_seats: 40,
        registration_number: '', amenities: '',
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingBus) {
        await busAPI.update(editingBus.id, formData);
        setSuccess('Bus updated successfully!');
      } else {
        await busAPI.create(formData);
        setSuccess('Bus added successfully!');
      }
      setShowModal(false);
      fetchBuses();
    } catch (err) {
      setError(
        err.response?.data
          ? Object.values(err.response.data).flat().join(', ')
          : 'An error occurred'
      );
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this bus?')) return;
    try {
      await busAPI.delete(id);
      setSuccess('Bus deleted successfully!');
      fetchBuses();
    } catch (err) {
      setError('Failed to delete bus');
    }
  };

  if (loading) {
    return <div className="page-loading"><div className="spinner"></div><p>Loading buses...</p></div>;
  }

  return (
    <div className="manage-page" style={{ animation: 'fadeInUp 0.6s ease' }}>
      <div className="page-header" style={{ marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Fleet Management</h1>
          <p className="page-subtitle" style={{ fontSize: '1.1rem' }}>Manage your high-speed transport fleet</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()} style={{ padding: '1rem 2rem', borderRadius: '16px', fontWeight: 'bold' }}>
          ✨ Add New Bus
        </button>
      </div>

      {success && <div className="alert alert-success" style={{ marginBottom: '2rem' }}>{success}</div>}
      {error && <div className="alert alert-error" style={{ marginBottom: '2rem' }}>{error}</div>}

      {buses.length === 0 ? (
        <div className="empty-state" style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '24px' }}>
          <span className="empty-icon">🚌</span>
          <p>No active buses found in the fleet.</p>
          <button className="btn btn-primary" onClick={() => openModal()}>Launch First Bus</button>
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Fleet ID</th>
                <th>Bus Details</th>
                <th>Service Type</th>
                <th>Capacitance</th>
                <th>Registration</th>
                <th>Amenities & Features</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {buses.map((bus) => (
                <tr key={bus.id}>
                  <td style={{ fontWeight: 'bold', color: 'var(--accent-primary)' }}>#{bus.id}</td>
                  <td>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{bus.name}</div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.5 }}>Transit Unit</div>
                  </td>
                  <td>
                    <span className={`status-glow status-${bus.bus_type?.includes('AC') ? 'success' : 'warning'}-glow`}>
                      {bus.bus_type}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{bus.total_seats} Seats</td>
                  <td>
                    <code style={{ background: 'rgba(255,255,255,0.05)', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.85rem' }}>
                      {bus.registration_number}
                    </code>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {bus.amenities?.split(',').map((item, index) => (
                        <span key={index} style={{ fontSize: '0.75rem', background: 'rgba(124, 58, 237, 0.1)', color: '#a78bfa', padding: '0.2rem 0.6rem', borderRadius: '20px' }}>
                          {item.trim()}
                        </span>
                      ))}
                      {!bus.amenities && <span style={{ opacity: 0.3 }}>Standard Package</span>}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.8rem' }}>
                      <button className="btn btn-sm btn-secondary" onClick={() => openModal(bus)} style={{ borderRadius: '8px' }}>✏️ Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(bus.id)} style={{ borderRadius: '8px' }}>🗑️ Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingBus ? 'Edit Bus' : 'Add New Bus'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Bus Name</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g., Express Deluxe" required />
                </div>
                <div className="form-group">
                  <label>Bus Type</label>
                  <select value={formData.bus_type} onChange={(e) => setFormData({...formData, bus_type: e.target.value})}>
                    <option value="AC">AC</option>
                    <option value="NON_AC">Non-AC</option>
                    <option value="SLEEPER">Sleeper</option>
                    <option value="SEMI_SLEEPER">Semi-Sleeper</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Total Seats</label>
                  <input type="number" value={formData.total_seats} onChange={(e) => setFormData({...formData, total_seats: parseInt(e.target.value)})} min="1" max="100" required />
                </div>
                <div className="form-group">
                  <label>Registration Number</label>
                  <input type="text" value={formData.registration_number} onChange={(e) => setFormData({...formData, registration_number: e.target.value})} placeholder="e.g., TN01AB1234" required />
                </div>
              </div>
              <div className="form-group">
                <label>Amenities</label>
                <input type="text" value={formData.amenities} onChange={(e) => setFormData({...formData, amenities: e.target.value})} placeholder="WiFi, Charging Point, Blanket" />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingBus ? 'Update Bus' : 'Add Bus'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
