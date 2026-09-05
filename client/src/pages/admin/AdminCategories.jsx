import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';

const EMPTY = { name: '', description: '' };

export default function AdminCategories() {
  const { t } = useLanguage();
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
        showToast(t('toast_category_updated'));
      } else {
        await api.post('/categories', form);
        showToast(t('toast_category_added'));
      }
      setForm(EMPTY);
      setEditingId(null);
      load();
    } catch (err) {
      showToast(err.response?.data?.message || t('toast_category_save_error'), 'error');
    }
  }

  async function remove(id) {
    if (!window.confirm(t('confirm_delete_category'))) return;
    await api.delete(`/categories/${id}`);
    showToast(t('toast_category_deleted'));
    load();
  }

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>{t('categories_title')}</h2>
      <div className="grid grid-2" style={{ alignItems: 'flex-start' }}>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>{t('th_name')}</th><th></th></tr></thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c._id}>
                  <td>{c.name}</td>
                  <td>
                    <div className="flex gap-8">
                      <button className="btn btn-outline btn-sm" onClick={() => { setEditingId(c._id); setForm({ name: c.name, description: c.description || '' }); }}>{t('btn_edit')}</button>
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--signal)' }} onClick={() => remove(c._id)}>{t('btn_delete')}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <form onSubmit={handleSubmit} className="admin-form-section" style={{ margin: 0 }}>
          <h4>{editingId ? t('edit_category') : t('add_category')}</h4>
          <div className="field">
            <label>{t('field_name')}</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="field">
            <label>{t('field_description')}</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="flex gap-8">
            <button type="submit" className="btn btn-primary">{editingId ? t('btn_save_changes') : t('add_category')}</button>
            {editingId && (
              <button type="button" className="btn btn-ghost" onClick={() => { setEditingId(null); setForm(EMPTY); }}>{t('btn_cancel')}</button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
