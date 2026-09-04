import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function AdminLayout() {
  const { admin, logout } = useAdminAuth();
  const { t, language, setLanguage, languages } = useLanguage();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const LINKS = [
    { to: '/admin/dashboard', label: t('admin_dashboard') },
    { to: '/admin/products', label: t('admin_products') },
    { to: '/admin/orders', label: t('admin_orders') },
    { to: '/admin/brands', label: t('admin_brands') },
    { to: '/admin/categories', label: t('admin_categories') },
    { to: '/admin/chatbot', label: t('admin_chatbot') }
  ];

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

        <div className="lang-switcher" style={{ marginTop: 'auto', marginBottom: 12 }}>
          {languages.map((l) => (
            <button
              key={l.code}
              className={`lang-btn ${language === l.code ? 'active' : ''}`}
              onClick={() => setLanguage(l.code)}
            >
              {l.label}
            </button>
          ))}
        </div>

        <button
          className="btn btn-outline-light btn-sm btn-block"
          onClick={() => {
            logout();
            navigate('/admin/login');
          }}
        >
          {t('admin_logout')}
        </button>
      </aside>
      <div className="admin-main">
        <div className="admin-topbar">
          <button className="icon-btn mobile-only" onClick={() => setSidebarOpen((v) => !v)}>
            ☰
          </button>
          <div className="text-muted">
            {t('admin_signed_in_as')} <strong style={{ color: 'var(--ink)' }}>{admin?.name}</strong>
          </div>
        </div>
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
