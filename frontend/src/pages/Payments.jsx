import { useState, useEffect } from 'react';
import { paymentAPI } from '../services/api';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchPayments(); }, []);

  const fetchPayments = async () => {
    try {
      const res = await paymentAPI.list();
      setPayments(res.data.results || res.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  if (loading) {
    return <div className="page-loading"><div className="spinner"></div><p>Loading payments...</p></div>;
  }

  const totalRevenue = payments
    .filter(p => p.status === 'SUCCESS')
    .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

  const statusCounts = {
    success: payments.filter(p => p.status === 'SUCCESS').length,
    pending: payments.filter(p => p.status === 'PENDING').length,
    failed: payments.filter(p => p.status === 'FAILED').length,
    refunded: payments.filter(p => p.status === 'REFUNDED').length,
  };

  return (
    <div className="manage-page" style={{ animation: 'fadeInUp 0.6s ease' }}>
      <div className="page-header" style={{ marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Financial Ledger</h1>
          <p className="page-subtitle" style={{ fontSize: '1.1rem' }}>Audit and track all system transaction activities</p>
        </div>
        <button className="btn btn-secondary" onClick={fetchPayments} style={{ borderRadius: '12px' }}>
          🔄 Sync Transactions
        </button>
      </div>

      {/* Payment Stats - High fidelity mini cards */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="admin-stat-card admin-stat-gold">
          <div className="admin-stat-icon">💰</div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Total Volume</span>
            <span className="admin-stat-value">₹{totalRevenue.toLocaleString()}</span>
          </div>
        </div>
        <div className="admin-stat-card admin-stat-green">
          <div className="admin-stat-icon">✅</div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Successful</span>
            <span className="admin-stat-value">{statusCounts.success}</span>
          </div>
        </div>
        <div className="admin-stat-card admin-stat-orange">
          <div className="admin-stat-icon">⏳</div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Processing</span>
            <span className="admin-stat-value">{statusCounts.pending}</span>
          </div>
        </div>
        <div className="admin-stat-card admin-stat-red">
          <div className="admin-stat-icon">⚠️</div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Failed/Audit</span>
            <span className="admin-stat-value">{statusCounts.failed}</span>
          </div>
        </div>
      </div>

      {payments.length === 0 ? (
        <div className="empty-state" style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '24px' }}>
          <span className="empty-icon">💳</span>
          <p>No transactions recorded in the current cycle.</p>
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Internal ID</th>
                <th>Network Txn Hash</th>
                <th>Account</th>
                <th>Source Booking</th>
                <th>Settlement</th>
                <th>Gateway</th>
                <th>Status</th>
                <th>Execution Time</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(payment => {
                 const statusClass = payment.status === 'SUCCESS' ? 'success' : payment.status === 'PENDING' ? 'warning' : 'danger';
                 return (
                  <tr key={payment.id}>
                    <td style={{ fontWeight: 'bold' }}>#{payment.id}</td>
                    <td>
                       <code style={{ background: 'rgba(255,255,255,0.05)', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', opacity: 0.8 }}>
                         {payment.transaction_id || 'LOCAL-TXN-PENDING'}
                       </code>
                    </td>
                    <td style={{ fontWeight: 600 }}>{payment.username}</td>
                    <td style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>#{payment.booking}</td>
                    <td style={{ fontWeight: 700 }}>₹{payment.amount}</td>
                    <td>
                      <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.6rem', borderRadius: '20px' }}>
                        {payment.payment_method}
                      </span>
                    </td>
                    <td>
                      <span className={`status-glow status-${statusClass}-glow`}>
                        {payment.status}
                      </span>
                    </td>
                    <td>
                      {payment.paid_at ? (
                        <div style={{ fontSize: '0.85rem' }}>
                           <div>{new Date(payment.paid_at).toLocaleDateString()}</div>
                           <div style={{ opacity: 0.5 }}>{new Date(payment.paid_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                      ) : <span style={{ opacity: 0.3 }}>N/A</span>}
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
