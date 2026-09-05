import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';

const STATUSES = ['NEW', 'CONFIRMED', 'PROCESSING', 'READY', 'DELIVERED', 'CANCELLED'];

export default function AdminOrderDetails() {
  const { id } = useParams();
  const { t } = useLanguage();
  const navigate = useNavigate();
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
    showToast(t('order_marked_as', { status }));
    load();
  }

  async function handleDelete() {
    if (!window.confirm(t('confirm_delete_order'))) return;
    try {
      await api.delete(`/orders/${id}`);
      showToast(t('toast_order_deleted'));
      navigate('/admin/orders');
    } catch (err) {
      showToast(err.response?.data?.message || t('toast_order_delete_error'), 'error');
    }
  }

  if (!order) return <div>{t('loading_text')}</div>;

  return (
    <div>
      <div className="admin-toolbar">
        <h2 className="mono">{order.orderNumber}</h2>
        <div className="flex gap-12" style={{ alignItems: 'center' }}>
          <span className={`status-pill status-${order.status.toLowerCase()}`}>{order.status}</span>
          <button className="btn btn-outline btn-sm" style={{ color: 'var(--signal)', borderColor: 'var(--signal)' }} onClick={handleDelete}>
            {t('btn_delete')}
          </button>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginBottom: 24 }}>
        <div className="card" style={{ padding: 20 }}>
          <h4 style={{ marginBottom: 12 }}>{t('section_customer')}</h4>
          <p>{order.customer.name}</p>
          <p>{order.customer.phone}</p>
          <p>{order.customer.email}</p>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <h4 style={{ marginBottom: 12 }}>{t('section_delivery')}</h4>
          <p>{order.delivery.address}, {order.delivery.city}</p>
          <p>{order.delivery.date || t('no_date_specified')} {order.delivery.time || ''}</p>
          {order.comment && <p className="text-muted" style={{ marginTop: 8 }}>"{order.comment}"</p>}
        </div>
      </div>

      <div className="card" style={{ padding: 20, marginBottom: 24 }}>
        <h4 style={{ marginBottom: 12 }}>{t('section_items')}</h4>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>{t('th_phone_name')}</th><th>{t('th_color')}</th><th>{t('th_storage')}</th><th>{t('th_qty')}</th><th>{t('th_price')}</th></tr></thead>
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
          <div className="summary-row"><span>{t('subtotal')}</span><span>${order.subtotal.toFixed(2)}</span></div>
          <div className="summary-row"><span>{t('delivery')}</span><span>${order.deliveryFee.toFixed(2)}</span></div>
          <div className="summary-row total"><span>{t('total')}</span><span>${order.total.toFixed(2)}</span></div>
        </div>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <h4 style={{ marginBottom: 12 }}>{t('update_status')}</h4>
        <label className="checkbox-row" style={{ marginBottom: 14 }}>
          <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} /> {t('notify_customer_email')}
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

        <h5 style={{ marginTop: 20, marginBottom: 10 }}>{t('history_label')}</h5>
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
