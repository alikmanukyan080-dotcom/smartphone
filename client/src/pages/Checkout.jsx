import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import api from '../services/api';

const EMPTY_FORM = {
  name: '', phone: '', email: '', address: '', city: '', date: '', time: '', comment: ''
};

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const deliveryFee = subtotal >= 200 ? 0 : 5.99;
  const total = subtotal + deliveryFee;

  if (items.length === 0) {
    return (
      <div className="container empty-state">
        <h3>{t('cart_empty_title')}</h3>
        <Link to="/phones" className="btn btn-primary" style={{ marginTop: 16 }}>{t('shop_phones')}</Link>
      </div>
    );
  }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.phone.trim()) e.phone = 'Required';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Required';
    if (!form.address.trim()) e.address = 'Required';
    if (!form.city.trim()) e.city = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        customer: { name: form.name, phone: form.phone, email: form.email },
        delivery: { address: form.address, city: form.city, date: form.date, time: form.time },
        comment: form.comment,
        items: items.map((i) => ({
          productId: i.productId,
          brand: i.brand,
          color: i.color,
          storage: i.storage,
          quantity: i.quantity
        }))
      };
      const res = await api.post('/orders', payload);
      clearCart();
      navigate(`/order-success/${res.data.orderNumber}`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Error', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="section" style={{ paddingTop: 32 }}>
      <div className="container">
        <h2 className="section-title" style={{ marginBottom: 28 }}>{t('checkout_title')}</h2>
        <form onSubmit={handleSubmit} className="checkout-layout">
          <div className="admin-form-section">
            <h4>{t('delivery_details')}</h4>
            <div className="admin-form-grid">
              <div className="field">
                <label>{t('full_name')}</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                {errors.name && <span className="field-error">{errors.name}</span>}
              </div>
              <div className="field">
                <label>{t('phone')}</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                {errors.phone && <span className="field-error">{errors.phone}</span>}
              </div>
            </div>
            <div className="field">
              <label>{t('email')}</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>
            <div className="field">
              <label>{t('address')}</label>
              <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              {errors.address && <span className="field-error">{errors.address}</span>}
            </div>
            <div className="admin-form-grid">
              <div className="field">
                <label>{t('city')}</label>
                <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                {errors.city && <span className="field-error">{errors.city}</span>}
              </div>
              <div className="field">
                <label>{t('delivery_date')}</label>
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
            </div>
            <div className="field">
              <label>{t('preferred_time')}</label>
              <select value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })}>
                <option value="">{t('any_time')}</option>
                <option value="Morning">{t('morning')}</option>
                <option value="Afternoon">{t('afternoon')}</option>
                <option value="Evening">{t('evening')}</option>
              </select>
            </div>
            <div className="field">
              <label>{t('comment_optional')}</label>
              <textarea value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} />
            </div>
          </div>

          <div className="order-summary">
            <h4 style={{ marginBottom: 16 }}>{t('order_summary')}</h4>
            {items.map((item) => (
              <div className="summary-row" key={`${item.productId}-${item.color}-${item.storage}`}>
                <span>{item.title} {item.color && `(${item.color})`} {item.storage && `· ${item.storage}`} ×{item.quantity}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="summary-row"><span>{t('subtotal')}</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="summary-row"><span>{t('delivery')}</span><span>{deliveryFee === 0 ? t('free') : `$${deliveryFee.toFixed(2)}`}</span></div>
            <div className="summary-row total"><span>{t('total')}</span><span>${total.toFixed(2)}</span></div>
            <button type="submit" className="btn btn-signal btn-block" style={{ marginTop: 20 }} disabled={submitting}>
              {submitting ? t('placing_order') : t('place_order')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
