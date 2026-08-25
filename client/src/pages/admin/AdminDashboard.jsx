import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/orders/stats/dashboard').then((res) => setStats(res.data));
  }, []);

  const cards = stats
    ? [
        ['Total Products', stats.totalProducts],
        ['Total Orders', stats.totalOrders],
        ['Pending Orders', stats.pendingOrders],
        ['Completed Orders', stats.completedOrders],
        ['Cancelled Orders', stats.cancelledOrders],
        ['Total Revenue', `$${stats.totalRevenue.toFixed(2)}`],
        ['Low Stock', stats.lowStock],
        ["Today's Orders", stats.todaysOrders]
      ]
    : [];

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>Dashboard</h2>

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
            <h4>Recent Orders</h4>
            <Link to="/admin/orders" className="btn btn-ghost btn-sm">View all →</Link>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>Order #</th><th>Customer</th><th>Total</th><th>Status</th></tr>
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
          <h4 style={{ marginBottom: 14 }}>Popular Phones</h4>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>Phone</th><th>Sold</th><th>Price</th></tr>
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
