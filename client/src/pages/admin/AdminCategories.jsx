import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext.jsx';

const EMPTY = { name: '', description: '' };

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const { showToast } = useToast();

  function load() {
    api.get('/categories', { params: { all: true } }).then((res) => setCategories(res.data));
  }
  useEffect(load, []);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, form);
        showToast('Category updated');
      } else {
        await api.post('/categories', form);
        showToast('Category added');
      }
      setForm(EMPTY);
      setEditingId(null);
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not save category', 'error');
    }
  }

  async function remove(id) {
    if (!window.confirm('Delete this category?')) return;
    await api.delete(`/categories/${id}`);
    showToast('Category deleted');
    load();
  }

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>Categories</h2>
      <div className="grid grid-2" style={{ alignItems: 'flex-start' }}>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Name</th><th></th></tr></thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c._id}>
                  <td>{c.name}</td>
                  <td>
                    <div className="flex gap-8">
                      <button className="btn btn-outline btn-sm" onClick={() => { setEditingId(c._id); setForm({ name: c.name, description: c.description || '' }); }}>Edit</button>
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--signal)' }} onClick={() => remove(c._id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <form onSubmit={handleSubmit} className="admin-form-section" style={{ margin: 0 }}>
          <h4>{editingId ? 'Edit Category' : 'Add Category'}</h4>
          <div className="field">
            <label>Name</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="field">
            <label>Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="flex gap-8">
            <button type="submit" className="btn btn-primary">{editingId ? 'Save Changes' : 'Add Category'}</button>
            {editingId && (
              <button type="button" className="btn btn-ghost" onClick={() => { setEditingId(null); setForm(EMPTY); }}>Cancel</button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
