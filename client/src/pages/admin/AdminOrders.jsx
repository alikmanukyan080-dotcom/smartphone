import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const STATUSES = ['NEW', 'CONFIRMED', 'PROCESSING', 'READY', 'DELIVERED', 'CANCELLED'];

export default function AdminOrders() {
  const [orders, setOrders] = useState(null);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/orders', { params: { status: status || undefined, search: search || undefined, limit: 60 } })
      .then((res) => setOrders(res.data.items));
  }, [status, search]);

  return (
    <div>
      <div className="admin-toolbar">
        <h2>Orders</h2>
        <div className="flex gap-12">
          <input
            placeholder="Search orders…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: 10, border: '1px solid var(--border-light)', borderRadius: 6 }}
          />
          <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ padding: 10, border: '1px solid var(--border-light)', borderRadius: 6 }}>
            <option value="">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr><th>Order #</th><th>Customer</th><th>Phone</th><th>Date</th><th>Total</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {orders?.map((o) => (
              <tr key={o._id}>
                <td className="mono">{o.orderNumber}</td>
                <td>{o.customer.name}</td>
                <td>{o.customer.phone}</td>
                <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                <td>${o.total.toFixed(2)}</td>
                <td><span className={`status-pill status-${o.status.toLowerCase()}`}>{o.status}</span></td>
                <td><Link to={`/admin/orders/${o._id}`} className="btn btn-outline btn-sm">View</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {orders?.length === 0 && <div className="empty-state"><h3>No orders yet</h3></div>}
    </div>
  );
}
