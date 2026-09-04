import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';

const EMPTY = { name: '', logo: '', description: '', isFeatured: false };

export default function AdminBrands() {
  const { t } = useLanguage();
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
        showToast(t('toast_brand_updated'));
      } else {
        await api.post('/brands', form);
        showToast(t('toast_brand_added'));
      }
      setForm(EMPTY);
      setEditingId(null);
      load();
    } catch (err) {
      showToast(err.response?.data?.message || t('toast_brand_save_error'), 'error');
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
    if (!window.confirm(t('confirm_delete_brand'))) return;
    try {
      await api.delete(`/brands/${id}`);
      showToast(t('toast_brand_deleted'));
      load();
    } catch (err) {
      showToast(err.response?.data?.message || t('toast_brand_delete_error'), 'error');
    }
  }

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>{t('brands_title')}</h2>
      <div className="grid grid-2" style={{ alignItems: 'flex-start' }}>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>{t('th_name')}</th><th>{t('th_status_col')}</th><th>{t('th_featured')}</th><th></th></tr></thead>
            <tbody>
              {brands.map((b) => (
                <tr key={b._id}>
                  <td>{b.name}</td>
                  <td>
                    <button className={`status-pill ${b.isActive ? 'status-confirmed' : 'status-cancelled'}`} style={{ border: 'none' }} onClick={() => toggleActive(b)}>
                      {b.isActive ? t('status_active') : t('status_hidden')}
                    </button>
                  </td>
                  <td>{b.isFeatured ? 'Yes' : '—'}</td>
                  <td>
                    <div className="flex gap-8">
                      <button className="btn btn-outline btn-sm" onClick={() => editBrand(b)}>{t('btn_edit')}</button>
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--signal)' }} onClick={() => remove(b._id)}>{t('btn_delete')}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <form onSubmit={handleSubmit} className="admin-form-section" style={{ margin: 0 }}>
          <h4>{editingId ? t('edit_brand') : t('add_brand')}</h4>
          <div className="field">
            <label>{t('field_name')}</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="field">
            <label>{t('field_logo_url')}</label>
            <input value={form.logo} onChange={(e) => setForm({ ...form, logo: e.target.value })} />
          </div>
          <div className="field">
            <label>{t('field_description')}</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <label className="checkbox-row" style={{ marginBottom: 16 }}>
            <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} /> {t('featured_homepage')}
          </label>
          <div className="flex gap-8">
            <button type="submit" className="btn btn-primary">{editingId ? t('btn_save_changes') : t('add_brand')}</button>
            {editingId && (
              <button type="button" className="btn btn-ghost" onClick={() => { setEditingId(null); setForm(EMPTY); }}>{t('btn_cancel')}</button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
