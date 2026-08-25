import { Link, useParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function OrderSuccess() {
  const { number } = useParams();
  const { t } = useLanguage();
  return (
    <div className="container" style={{ padding: '100px 24px', textAlign: 'center' }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
      <h1 style={{ marginBottom: 12 }}>{t('order_placed_title')}</h1>
      <p className="text-muted" style={{ marginBottom: 24 }}>{t('order_placed_body')}</p>
      <div className="mono" style={{ fontSize: 20, fontWeight: 700, marginBottom: 32 }}>
        Order #{number}
      </div>
      <div className="flex-center gap-12">
        <Link to="/phones" className="btn btn-outline">{t('continue_shopping')}</Link>
        <Link to="/track-order" className="btn btn-primary">{t('track_order')}</Link>
      </div>
    </div>
  );
}
