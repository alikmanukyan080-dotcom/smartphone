import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';

const BADGES = ['NEW', 'SALE', 'POPULAR', 'BEST_SELLER', 'LIMITED', 'FEATURED'];
const EMPTY_COLOR = { name: '', hex: '#111111', images: [''], stock: 0, sku: '' };
const EMPTY_STORAGE = { capacity: '', price: '', oldPrice: '', stock: 0, sku: '' };

const EMPTY_PRODUCT = {
  brand: '', category: '', model: '', title: '', description: '',
  images: [''], colors: [], storageOptions: [],
  ram: '', processor: '', display: '', camera: '', battery: '', os: '',
  is5G: false, simType: 'Dual SIM', warranty: '1 Year', dimensions: '', weight: '',
  sku: '', tags: '', badges: [], isFeatured: false
};

export default function AdminProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useLanguage();

  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/brands', { params: { all: true } }).then((res) => setBrands(res.data));
    api.get('/categories', { params: { all: true } }).then((res) => setCategories(res.data));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/products/${id}`).then((res) => {
      const p = res.data;
      setForm({
        ...EMPTY_PRODUCT,
        ...p,
        brand: p.brand?._id || p.brand,
        category: p.category?._id || p.category || '',
        ram: p.ram?.join(', ') || '',
        tags: p.tags?.join(', ') || '',
        images: p.images?.length ? p.images : [''],
        colors: p.colors || [],
        storageOptions: p.storageOptions || []
      });
      setLoading(false);
    });
  }, [id, isEdit]);

  function updateField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function updateColor(idx, key, value) {
    setForm((f) => {
      const colors = [...f.colors];
      colors[idx] = { ...colors[idx], [key]: value };
      return { ...f, colors };
    });
  }
  function updateColorImage(idx, imgIdx, value) {
    setForm((f) => {
      const colors = [...f.colors];
      const images = [...(colors[idx].images || [''])];
      images[imgIdx] = value;
      colors[idx] = { ...colors[idx], images };
      return { ...f, colors };
    });
  }
  function addColor() {
    setForm((f) => ({ ...f, colors: [...f.colors, { ...EMPTY_COLOR, images: [''] }] }));
  }
  function removeColor(idx) {
    setForm((f) => ({ ...f, colors: f.colors.filter((_, i) => i !== idx) }));
  }

  function updateStorage(idx, key, value) {
    setForm((f) => {
      const storageOptions = [...f.storageOptions];
      storageOptions[idx] = { ...storageOptions[idx], [key]: value };
      return { ...f, storageOptions };
    });
  }
  function addStorage() {
    setForm((f) => ({ ...f, storageOptions: [...f.storageOptions, { ...EMPTY_STORAGE }] }));
  }
  function removeStorage(idx) {
    setForm((f) => ({ ...f, storageOptions: f.storageOptions.filter((_, i) => i !== idx) }));
  }

  function toggleBadge(b) {
    setForm((f) => ({
      ...f,
      badges: f.badges.includes(b) ? f.badges.filter((x) => x !== b) : [...f.badges, b]
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        images: form.images.filter(Boolean),
        ram: form.ram.split(',').map((s) => s.trim()).filter(Boolean),
        tags: form.tags.split(',').map((s) => s.trim()).filter(Boolean),
        colors: form.colors.map((c) => ({ ...c, images: (c.images || []).filter(Boolean), stock: Number(c.stock) || 0 })),
        storageOptions: form.storageOptions.map((s) => ({
          ...s,
          price: Number(s.price) || 0,
          oldPrice: s.oldPrice ? Number(s.oldPrice) : undefined,
          stock: Number(s.stock) || 0
        })),
        price: form.storageOptions[0]?.price ? Number(form.storageOptions[0].price) : Number(form.price) || 0
      };
      if (!payload.category) delete payload.category;

      if (isEdit) {
        await api.put(`/products/${id}`, payload);
        showToast(t('toast_product_updated'));
      } else {
        await api.post('/products', payload);
        showToast(t('toast_product_created'));
      }
      navigate('/admin/products');
    } catch (err) {
      showToast(err.response?.data?.message || t('toast_product_save_error'), 'error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div>{t('loading_text')}</div>;

  return (
    <form onSubmit={handleSubmit}>
      <div className="admin-toolbar">
        <h2>{isEdit ? t('edit_product') : t('add_product')}</h2>
        <button className="btn btn-primary" disabled={saving}>{saving ? t('btn_saving') : t('btn_save_product')}</button>
      </div>

      <div className="admin-form-section">
        <h4>{t('basic_information')}</h4>
        <div className="admin-form-grid">
          <div className="field">
            <label>{t('field_brand')}</label>
            <select required value={form.brand} onChange={(e) => updateField('brand', e.target.value)}>
              <option value="">{t('select_brand_placeholder')}</option>
              {brands.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label>{t('field_category')}</label>
            <select value={form.category} onChange={(e) => updateField('category', e.target.value)}>
              <option value="">{t('category_none')}</option>
              {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
        </div>
        <div className="admin-form-grid">
          <div className="field">
            <label>{t('field_model')}</label>
            <input required value={form.model} onChange={(e) => updateField('model', e.target.value)} />
          </div>
          <div className="field">
            <label>{t('field_title')}</label>
            <input required value={form.title} onChange={(e) => updateField('title', e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label>{t('field_description')}</label>
          <textarea value={form.description} onChange={(e) => updateField('description', e.target.value)} />
        </div>
        <div className="field">
          <label>{t('field_default_images')}</label>
          <input
            value={form.images.join(', ')}
            onChange={(e) => updateField('images', e.target.value.split(',').map((s) => s.trim()))}
            placeholder="https://…, https://…"
          />
        </div>
      </div>

      <div className="admin-form-section">
        <div className="flex-between" style={{ marginBottom: 16 }}>
          <h4>{t('color_variants')}</h4>
          <button type="button" className="btn btn-outline btn-sm" onClick={addColor}>{t('btn_add_color')}</button>
        </div>
        {form.colors.map((c, idx) => (
          <div className="variant-row" key={idx} style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: 14 }}>
            <div className="field">
              <label>{t('field_color_name')}</label>
              <input value={c.name} onChange={(e) => updateColor(idx, 'name', e.target.value)} placeholder={t('placeholder_color_name')} />
            </div>
            <div className="field" style={{ maxWidth: 110 }}>
              <label>{t('field_hex')}</label>
              <input type="color" value={c.hex} onChange={(e) => updateColor(idx, 'hex', e.target.value)} style={{ padding: 4, height: 42 }} />
            </div>
            <div className="field">
              <label>{t('field_image_url')}</label>
              <input value={c.images?.[0] || ''} onChange={(e) => updateColorImage(idx, 0, e.target.value)} placeholder="https://…" />
            </div>
            <div className="field" style={{ maxWidth: 100 }}>
              <label>{t('field_stock')}</label>
              <input type="number" value={c.stock} onChange={(e) => updateColor(idx, 'stock', e.target.value)} />
            </div>
            <div className="field" style={{ maxWidth: 120 }}>
              <label>{t('field_sku')}</label>
              <input value={c.sku} onChange={(e) => updateColor(idx, 'sku', e.target.value)} />
            </div>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeColor(idx)} style={{ color: 'var(--signal)' }}>{t('btn_remove')}</button>
          </div>
        ))}
        {form.colors.length === 0 && <p className="text-muted" style={{ fontSize: 13 }}>{t('no_colors_yet')}</p>}
      </div>

      <div className="admin-form-section">
        <div className="flex-between" style={{ marginBottom: 16 }}>
          <h4>{t('storage_variants')}</h4>
          <button type="button" className="btn btn-outline btn-sm" onClick={addStorage}>{t('btn_add_storage')}</button>
        </div>
        {form.storageOptions.map((s, idx) => (
          <div className="variant-row" key={idx} style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: 14 }}>
            <div className="field">
              <label>{t('field_capacity')}</label>
              <input value={s.capacity} onChange={(e) => updateStorage(idx, 'capacity', e.target.value)} placeholder="256GB" />
            </div>
            <div className="field">
              <label>{t('field_price')}</label>
              <input type="number" value={s.price} onChange={(e) => updateStorage(idx, 'price', e.target.value)} />
            </div>
            <div className="field">
              <label>{t('field_old_price')}</label>
              <input type="number" value={s.oldPrice} onChange={(e) => updateStorage(idx, 'oldPrice', e.target.value)} />
            </div>
            <div className="field" style={{ maxWidth: 100 }}>
              <label>{t('field_stock')}</label>
              <input type="number" value={s.stock} onChange={(e) => updateStorage(idx, 'stock', e.target.value)} />
            </div>
            <div className="field" style={{ maxWidth: 120 }}>
              <label>{t('field_sku')}</label>
              <input value={s.sku} onChange={(e) => updateStorage(idx, 'sku', e.target.value)} />
            </div>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeStorage(idx)} style={{ color: 'var(--signal)' }}>{t('btn_remove')}</button>
          </div>
        ))}
        {form.storageOptions.length === 0 && <p className="text-muted" style={{ fontSize: 13 }}>{t('no_storage_yet')}</p>}
      </div>

      <div className="admin-form-section">
        <h4>{t('specifications_title')}</h4>
        <div className="admin-form-grid">
          <div className="field"><label>{t('field_ram')}</label><input value={form.ram} onChange={(e) => updateField('ram', e.target.value)} placeholder="8GB, 12GB" /></div>
          <div className="field"><label>{t('field_processor')}</label><input value={form.processor} onChange={(e) => updateField('processor', e.target.value)} /></div>
          <div className="field"><label>{t('field_display')}</label><input value={form.display} onChange={(e) => updateField('display', e.target.value)} /></div>
          <div className="field"><label>{t('field_camera')}</label><input value={form.camera} onChange={(e) => updateField('camera', e.target.value)} /></div>
          <div className="field"><label>{t('field_battery')}</label><input value={form.battery} onChange={(e) => updateField('battery', e.target.value)} /></div>
          <div className="field"><label>{t('field_os')}</label><input value={form.os} onChange={(e) => updateField('os', e.target.value)} /></div>
          <div className="field"><label>{t('field_sim_type')}</label><input value={form.simType} onChange={(e) => updateField('simType', e.target.value)} /></div>
          <div className="field"><label>{t('field_warranty')}</label><input value={form.warranty} onChange={(e) => updateField('warranty', e.target.value)} /></div>
          <div className="field"><label>{t('field_dimensions')}</label><input value={form.dimensions} onChange={(e) => updateField('dimensions', e.target.value)} /></div>
          <div className="field"><label>{t('field_weight')}</label><input value={form.weight} onChange={(e) => updateField('weight', e.target.value)} /></div>
        </div>
        <label className="checkbox-row">
          <input type="checkbox" checked={form.is5G} onChange={(e) => updateField('is5G', e.target.checked)} /> {t('support_5g')}
        </label>
      </div>

      <div className="admin-form-section">
        <h4>{t('organization_title')}</h4>
        <div className="field">
          <label>{t('field_sku')}</label>
          <input value={form.sku} onChange={(e) => updateField('sku', e.target.value)} />
        </div>
        <div className="field">
          <label>{t('field_tags')}</label>
          <input value={form.tags} onChange={(e) => updateField('tags', e.target.value)} placeholder="flagship, camera, gaming" />
        </div>
        <div className="field">
          <label>{t('badges_label')}</label>
          <div className="flex gap-8" style={{ flexWrap: 'wrap' }}>
            {BADGES.map((b) => (
              <label key={b} className="checkbox-row" style={{ border: '1px solid var(--border-light)', padding: '6px 12px', borderRadius: 16 }}>
                <input type="checkbox" checked={form.badges.includes(b)} onChange={() => toggleBadge(b)} /> {b.replace('_', ' ')}
              </label>
            ))}
          </div>
        </div>
        <label className="checkbox-row">
          <input type="checkbox" checked={form.isFeatured} onChange={(e) => updateField('isFeatured', e.target.checked)} /> {t('featured_homepage')}
        </label>
      </div>

      <button className="btn btn-primary" disabled={saving}>{saving ? t('btn_saving') : t('btn_save_product')}</button>
    </form>
  );
}
