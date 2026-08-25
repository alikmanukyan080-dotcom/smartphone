import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext.jsx';

export default function AdminProducts() {
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
    showToast('Product visibility updated');
    load();
  }

  async function duplicate(id) {
    await api.post(`/products/${id}/duplicate`);
    showToast('Product duplicated');
    load();
  }

  async function remove(id) {
    if (!window.confirm('Delete this product permanently?')) return;
    await api.delete(`/products/${id}`);
    showToast('Product deleted');
    load();
  }

  return (
    <div>
      <div className="admin-toolbar">
        <h2>Products</h2>
        <div className="flex gap-12">
          <input
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: 10, border: '1px solid var(--border-light)', borderRadius: 6 }}
          />
          <Link to="/admin/products/new" className="btn btn-primary">+ Add Product</Link>
        </div>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product</th><th>Brand</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products?.map((p) => (
              <tr key={p._id}>
                <td className="flex gap-12" style={{ alignItems: 'center' }}>
                  <img src={p.images?.[0] || p.colors?.[0]?.images?.[0]} alt="" style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }} />
                  {p.title}
                </td>
                <td>{p.brand?.name}</td>
                <td>${p.price?.toFixed(2)}</td>
                <td>{p.stock}</td>
                <td>
                  <span className={`status-pill ${p.isActive ? 'status-confirmed' : 'status-cancelled'}`}>
                    {p.isActive ? 'Visible' : 'Hidden'}
                  </span>
                </td>
                <td>
                  <div className="flex gap-8">
                    <Link to={`/admin/products/${p._id}/edit`} className="btn btn-outline btn-sm">Edit</Link>
                    <button className="btn btn-ghost btn-sm" onClick={() => toggleVisibility(p._id)}>
                      {p.isActive ? 'Hide' : 'Show'}
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => duplicate(p._id)}>Duplicate</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => remove(p._id)} style={{ color: 'var(--signal)' }}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {products?.length === 0 && <div className="empty-state"><h3>No products yet</h3><p>Add your first phone to get started.</p></div>}
    </div>
  );
}
