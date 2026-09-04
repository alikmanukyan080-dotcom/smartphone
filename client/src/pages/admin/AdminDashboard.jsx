import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useLanguage } from '../../context/LanguageContext.jsx';

export default function AdminDashboard() {
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/orders/stats/dashboard').then((res) => setStats(res.data));
  }, []);

  const cards = stats
    ? [
        [t('stat_total_products'), stats.totalProducts],
        [t('stat_total_orders'), stats.totalOrders],
        [t('stat_pending_orders'), stats.pendingOrders],
        [t('stat_completed_orders'), stats.completedOrders],
        [t('stat_cancelled_orders'), stats.cancelledOrders],
        [t('stat_total_revenue'), `$${stats.totalRevenue.toFixed(2)}`],
        [t('stat_low_stock'), stats.lowStock],
        [t('stat_todays_orders'), stats.todaysOrders]
      ]
    : [];

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>{t('admin_dashboard')}</h2>
      <div className="stat-grid">
        {stats
          ? cards.map(([label, value]) => (
              <div className="stat-card" key={label}>
                <div className="stat-label">{label}</div>
                <div className="stat-value">{value}</div>
              </div>
            ))
          : Array.from({ length: 8 }).map((_, i) => (
              <div className="skeleton" style={{ height: 84 }} key={i} />
            ))}
      </div>
      <div className="grid grid-2">
        <div>
          <div className="flex-between" style={{ marginBottom: 14 }}>
            <h4>{t('recent_orders')}</h4>
            <Link to="/admin/orders" className="btn btn-ghost btn-sm">{t('view_all')}</Link>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>{t('order_number')}</th><th>{t('th_customer')}</th><th>{t('th_total')}</th><th>{t('th_status')}</th></tr>
              </thead>
              <tbody>
                {stats?.recentOrders.map((o) => (
                  <tr key={o._id}>
                    <td className="mono">{o.orderNumber}</td>
                    <td>{o.customer.name}</td>
                    <td>${o.total.toFixed(2)}</td>
                    <td><span className={`status-pill status-${o.status.toLowerCase()}`}>{o.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <h4 style={{ marginBottom: 14 }}>{t('popular_phones')}</h4>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>{t('th_phone_name')}</th><th>{t('th_sold')}</th><th>{t('th_price')}</th></tr>
              </thead>
              <tbody>
                {stats?.popularPhones.map((p) => (
                  <tr key={p._id}>
                    <td>{p.title}</td>
                    <td>{p.soldCount}</td>
                    <td>${p.price.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
