import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext.jsx';

const LINKS = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/brands', label: 'Brands' },
  { to: '/admin/categories', label: 'Categories' },
  { to: '/admin/chatbot', label: 'Chatbot' }
];

export default function AdminLayout() {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="admin-shell">
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-logo">
          NOVA<span>ADMIN</span>
        </div>
        <nav>
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) => (isActive ? 'active' : '')}
              onClick={() => setSidebarOpen(false)}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <button
          className="btn btn-outline-light btn-sm btn-block"
          style={{ marginTop: 'auto' }}
          onClick={() => {
            logout();
            navigate('/admin/login');
          }}
        >
          Log Out
        </button>
      </aside>

      <div className="admin-main">
        <div className="admin-topbar">
          <button className="icon-btn mobile-only" onClick={() => setSidebarOpen((v) => !v)}>
            ☰
          </button>
          <div className="text-muted">Signed in as <strong style={{ color: 'var(--ink)' }}>{admin?.name}</strong></div>
        </div>
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
