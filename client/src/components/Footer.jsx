import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <div className="logo logo-light">
            NOVA<span>MOBILE</span>
          </div>
          <p className="text-muted" style={{ marginTop: 14, maxWidth: 280 }}>
            {t('footer_tagline')}
          </p>
        </div>

        <div>
          <h4>{t('footer_shop')}</h4>
          <ul>
            <li><Link to="/phones">{t('footer_all_phones')}</Link></li>
            <li><Link to="/brands">{t('nav_brands')}</Link></li>
            <li><Link to="/phones?sort=discount">{t('nav_deals')}</Link></li>
            <li><Link to="/phones?sort=newest">{t('section_new')}</Link></li>
          </ul>
        </div>

        <div>
          <h4>{t('footer_support')}</h4>
          <ul>
            <li><Link to="/contact">{t('footer_contact')}</Link></li>
            <li><Link to="/track-order">{t('track_order')}</Link></li>
            <li><Link to="/about">{t('nav_about')}</Link></li>
            <li><Link to="/admin/login">{t('footer_admin')}</Link></li>
          </ul>
        </div>

        <div>
          <h4>Spec sheet</h4>
          <div className="mono footer-specs">
            <div>WARRANTY // OFFICIAL, 1–2 YR</div>
            <div>DELIVERY // 1–3 BUSINESS DAYS</div>
            <div>PAYMENT // SECURE CHECKOUT</div>
            <div>SUPPORT // 7 DAYS / WEEK</div>
          </div>
        </div>
      </div>
      <div className="container footer-bottom">
        <span className="text-muted">© {new Date().getFullYear()} Nova Mobile. {t('footer_rights')}</span>
      </div>
    </footer>
  );
}
