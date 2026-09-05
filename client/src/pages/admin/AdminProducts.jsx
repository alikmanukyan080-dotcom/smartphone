import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';

export default function AdminProducts() {
  const { t } = useLanguage();
  const [products, setProducts] = useState(null);
  const [search, setSearch] = useState('');
  const { showToast } = useToast();

  function load() {
    api.get('/products', { params: { all: true, search: search || undefined, limit: 60 } }).then((res) => setProducts(res.data.items));
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  async function toggleVisibility(id) {
    await api.patch(`/products/${id}/visibility`);
    showToast(t('toast_product_visibility_updated'));
    load();
  }
  async function duplicate(id) {
    await api.post(`/products/${id}/duplicate`);
    showToast(t('toast_product_duplicated'));
    load();
  }
  async function remove(id) {
    if (!window.confirm(t('confirm_delete_product'))) return;
    await api.delete(`/products/${id}`);
    showToast(t('toast_product_deleted'));
    load();
  }

  return (
    <div>
      <div className="admin-toolbar">
        <h2>{t('products_title')}</h2>
        <div className="flex gap-12">
          <input
            placeholder={t('search_products_placeholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: 10, border: '1px solid var(--border-light)', borderRadius: 6 }}
          />
          <Link to="/admin/products/new" className="btn btn-primary">{t('btn_add_product')}</Link>
        </div>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>{t('th_product')}</th><th>{t('th_brand')}</th><th>{t('th_price')}</th><th>{t('th_stock')}</th><th>{t('th_status')}</th><th>{t('th_actions')}</th>
            </tr>
          </thead>
          <tbody>
            {products?.map((p) => (
              <tr key={p._id}>
                <td>
                  <div className="flex gap-12" style={{ alignItems: 'center' }}>
                    <img src={p.images?.[0] || p.colors?.[0]?.images?.[0]} alt="" style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }} />
                    {p.title}
                  </div>
                </td>
                <td>{p.brand?.name}</td>
                <td>${p.price?.toFixed(2)}</td>
                <td>{p.stock}</td>
                <td>
                  <span className={`status-pill ${p.isActive ? 'status-confirmed' : 'status-cancelled'}`}>
                    {p.isActive ? t('status_visible') : t('status_hidden')}
                  </span>
                </td>
                <td>
                  <div className="flex gap-8">
                    <Link to={`/admin/products/${p._id}/edit`} className="btn btn-outline btn-sm">{t('btn_edit')}</Link>
                    <button className="btn btn-ghost btn-sm" onClick={() => toggleVisibility(p._id)}>
                      {p.isActive ? t('btn_hide') : t('btn_show')}
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => duplicate(p._id)}>{t('btn_duplicate')}</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => remove(p._id)} style={{ color: 'var(--signal)' }}>{t('btn_delete')}</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {products?.length === 0 && <div className="empty-state"><h3>{t('no_products_yet')}</h3><p>{t('no_products_body')}</p></div>}
    </div>
  );
}
