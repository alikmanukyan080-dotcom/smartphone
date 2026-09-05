import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';

const STATUSES = ['NEW', 'CONFIRMED', 'PROCESSING', 'READY', 'DELIVERED', 'CANCELLED'];

export default function AdminOrders() {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [orders, setOrders] = useState(null);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');

  function load() {
    api.get('/orders', { params: { status: status || undefined, search: search || undefined, limit: 60 } })
      .then((res) => setOrders(res.data.items));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, search]);

  async function remove(id) {
    if (!window.confirm(t('confirm_delete_order'))) return;
    try {
      await api.delete(`/orders/${id}`);
      showToast(t('toast_order_deleted'));
      load();
    } catch (err) {
      showToast(err.response?.data?.message || t('toast_order_delete_error'), 'error');
    }
  }

  return (
    <div>
      <div className="admin-toolbar">
        <h2>{t('orders_title')}</h2>
        <div className="flex gap-12">
          <input
            placeholder={t('orders_search_placeholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: 10, border: '1px solid var(--border-light)', borderRadius: 6 }}
          />
          <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ padding: 10, border: '1px solid var(--border-light)', borderRadius: 6 }}>
            <option value="">{t('orders_all_statuses')}</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr><th>{t('order_number')}</th><th>{t('th_customer')}</th><th>{t('th_phone')}</th><th>{t('th_date')}</th><th>{t('th_total')}</th><th>{t('th_status')}</th><th></th></tr>
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
                <td>
                  <div className="flex gap-8">
                    <Link to={`/admin/orders/${o._id}`} className="btn btn-outline btn-sm">{t('btn_view')}</Link>
                    <button className="btn btn-ghost btn-sm" style={{ color: 'var(--signal)' }} onClick={() => remove(o._id)}>{t('btn_delete')}</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {orders?.length === 0 && <div className="empty-state"><h3>{t('no_orders_yet')}</h3></div>}
    </div>
  );
}
