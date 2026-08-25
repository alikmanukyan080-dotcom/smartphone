import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext.jsx';

const STATUSES = ['NEW', 'CONFIRMED', 'PROCESSING', 'READY', 'DELIVERED', 'CANCELLED'];

export default function AdminOrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [notify, setNotify] = useState(true);
  const { showToast } = useToast();

  function load() {
    api.get(`/orders/${id}`).then((res) => setOrder(res.data));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function updateStatus(status) {
    await api.put(`/orders/${id}/status`, { status, notifyCustomer: notify });
    showToast(`Order marked as ${status}`);
    load();
  }

  if (!order) return <div>Loading…</div>;

  return (
    <div>
      <div className="admin-toolbar">
        <h2 className="mono">{order.orderNumber}</h2>
        <span className={`status-pill status-${order.status.toLowerCase()}`}>{order.status}</span>
      </div>

      <div className="grid grid-2" style={{ marginBottom: 24 }}>
        <div className="card" style={{ padding: 20 }}>
          <h4 style={{ marginBottom: 12 }}>Customer</h4>
          <p>{order.customer.name}</p>
          <p>{order.customer.phone}</p>
          <p>{order.customer.email}</p>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <h4 style={{ marginBottom: 12 }}>Delivery</h4>
          <p>{order.delivery.address}, {order.delivery.city}</p>
          <p>{order.delivery.date || 'No date specified'} {order.delivery.time || ''}</p>
          {order.comment && <p className="text-muted" style={{ marginTop: 8 }}>"{order.comment}"</p>}
        </div>
      </div>

      <div className="card" style={{ padding: 20, marginBottom: 24 }}>
        <h4 style={{ marginBottom: 12 }}>Items</h4>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Phone</th><th>Color</th><th>Storage</th><th>Qty</th><th>Price</th></tr></thead>
            <tbody>
              {order.items.map((it, idx) => (
                <tr key={idx}>
                  <td>{it.title}</td>
                  <td>{it.color || '-'}</td>
                  <td>{it.storage || '-'}</td>
                  <td>{it.quantity}</td>
                  <td>${it.price.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 16, maxWidth: 260, marginLeft: 'auto' }}>
          <div className="summary-row"><span>Subtotal</span><span>${order.subtotal.toFixed(2)}</span></div>
          <div className="summary-row"><span>Delivery</span><span>${order.deliveryFee.toFixed(2)}</span></div>
          <div className="summary-row total"><span>Total</span><span>${order.total.toFixed(2)}</span></div>
        </div>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <h4 style={{ marginBottom: 12 }}>Update Status</h4>
        <label className="checkbox-row" style={{ marginBottom: 14 }}>
          <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} /> Notify customer by email
        </label>
        <div className="flex gap-8" style={{ flexWrap: 'wrap' }}>
          {STATUSES.map((s) => (
            <button
              key={s}
              className={`btn btn-sm ${order.status === s ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => updateStatus(s)}
              disabled={order.status === s}
            >
              {s}
            </button>
          ))}
        </div>

        <h5 style={{ marginTop: 20, marginBottom: 10 }}>History</h5>
        <ul>
          {order.statusHistory.map((h, idx) => (
            <li key={idx} className="text-muted" style={{ fontSize: 13, marginBottom: 4 }}>
              {h.status} — {new Date(h.changedAt).toLocaleString()}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
