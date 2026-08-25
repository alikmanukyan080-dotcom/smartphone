import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext.jsx';

const EMPTY = { name: '', logo: '', description: '', isFeatured: false };

export default function AdminBrands() {
  const [brands, setBrands] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const { showToast } = useToast();

  function load() {
    api.get('/brands', { params: { all: true } }).then((res) => setBrands(res.data));
  }
  useEffect(load, []);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/brands/${editingId}`, form);
        showToast('Brand updated');
      } else {
        await api.post('/brands', form);
        showToast('Brand added');
      }
      setForm(EMPTY);
      setEditingId(null);
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not save brand', 'error');
    }
  }

  function editBrand(b) {
    setEditingId(b._id);
    setForm({ name: b.name, logo: b.logo || '', description: b.description || '', isFeatured: b.isFeatured });
  }

  async function toggleActive(b) {
    await api.put(`/brands/${b._id}`, { isActive: !b.isActive });
    load();
  }

  async function remove(id) {
    if (!window.confirm('Delete this brand? Only possible if no products use it.')) return;
    try {
      await api.delete(`/brands/${id}`);
      showToast('Brand deleted');
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not delete brand', 'error');
    }
  }

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>Brands</h2>
      <div className="grid grid-2" style={{ alignItems: 'flex-start' }}>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Name</th><th>Status</th><th>Featured</th><th></th></tr></thead>
            <tbody>
              {brands.map((b) => (
                <tr key={b._id}>
                  <td>{b.name}</td>
                  <td>
                    <button className={`status-pill ${b.isActive ? 'status-confirmed' : 'status-cancelled'}`} style={{ border: 'none' }} onClick={() => toggleActive(b)}>
                      {b.isActive ? 'Active' : 'Hidden'}
                    </button>
                  </td>
                  <td>{b.isFeatured ? 'Yes' : '—'}</td>
                  <td>
                    <div className="flex gap-8">
                      <button className="btn btn-outline btn-sm" onClick={() => editBrand(b)}>Edit</button>
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--signal)' }} onClick={() => remove(b._id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <form onSubmit={handleSubmit} className="admin-form-section" style={{ margin: 0 }}>
          <h4>{editingId ? 'Edit Brand' : 'Add Brand'}</h4>
          <div className="field">
            <label>Name</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="field">
            <label>Logo URL</label>
            <input value={form.logo} onChange={(e) => setForm({ ...form, logo: e.target.value })} />
          </div>
          <div className="field">
            <label>Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <label className="checkbox-row" style={{ marginBottom: 16 }}>
            <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} /> Featured on homepage
          </label>
          <div className="flex gap-8">
            <button type="submit" className="btn btn-primary">{editingId ? 'Save Changes' : 'Add Brand'}</button>
            {editingId && (
              <button type="button" className="btn btn-ghost" onClick={() => { setEditingId(null); setForm(EMPTY); }}>Cancel</button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
