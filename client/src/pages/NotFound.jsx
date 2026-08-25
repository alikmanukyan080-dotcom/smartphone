import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function NotFound() {
  const { t } = useLanguage();
  return (
    <div className="container" style={{ padding: '120px 24px', textAlign: 'center' }}>
      <div className="mono text-muted" style={{ fontSize: 14 }}>ERROR // 404</div>
      <h1 style={{ fontSize: 48, margin: '12px 0 20px' }}>{t('not_found_title')}</h1>
      <Link to="/" className="btn btn-primary">{t('back_home')}</Link>
    </div>
  );
}
