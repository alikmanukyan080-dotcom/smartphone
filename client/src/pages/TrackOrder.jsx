import { useState } from 'react';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext.jsx';

const STATUS_STEPS = ['NEW', 'CONFIRMED', 'PROCESSING', 'READY', 'DELIVERED'];

export default function TrackOrder() {
  const { t } = useLanguage();
  const [orderNumber, setOrderNumber] = useState('');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      const res = await api.get(`/orders/track/${orderNumber.trim()}`);
      setOrder(res.data);
    } catch {
      setError(t('order_not_found'));
    } finally {
      setLoading(false);
    }
  }

  const activeIdx = order ? STATUS_STEPS.indexOf(order.status) : -1;

  return (
    <div className="section" style={{ paddingTop: 32 }}>
      <div className="container" style={{ maxWidth: 640 }}>
        <h2 className="section-title" style={{ marginBottom: 24 }}>{t('track_order_title')}</h2>
        <form onSubmit={handleSubmit} className="flex gap-8" style={{ marginBottom: 24 }}>
          <input
            placeholder={t('track_order_placeholder')}
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            style={{ flex: 1, padding: 12, border: '1px solid var(--border-light)', borderRadius: 6 }}
            required
          />
          <button className="btn btn-signal" disabled={loading}>{t('track_button')}</button>
        </form>

        {error && <p className="field-error">{error}</p>}

        {order && (
          <div className="card" style={{ padding: 24 }}>
            <div className="flex-between" style={{ marginBottom: 20 }}>
              <div>
                <div className="text-muted" style={{ fontSize: 13 }}>Order</div>
                <div className="mono" style={{ fontWeight: 700, fontSize: 18 }}>{order.orderNumber}</div>
              </div>
              <span className={`status-pill status-${order.status.toLowerCase()}`}>{order.status}</span>
            </div>

            {order.status !== 'CANCELLED' && (
              <div className="flex-between" style={{ marginBottom: 24 }}>
                {STATUS_STEPS.map((s, idx) => (
                  <div key={s} style={{ textAlign: 'center', flex: 1 }}>
                    <div
                      style={{
                        width: 12, height: 12, borderRadius: '50%', margin: '0 auto 6px',
                        background: idx <= activeIdx ? 'var(--signal)' : 'var(--border-light)'
                      }}
                    />
                    <div style={{ fontSize: 10.5 }} className="mono text-muted">{s}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="text-muted" style={{ fontSize: 14 }}>
              {order.items.length} × · {t('total')} ${order.total.toFixed(2)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
