import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';

export default function AdminLogin() {
  const { login } = useAdminAuth();
  const { t, language, setLanguage, languages } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || t('login_failed'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="flex-between" style={{ marginBottom: 8 }}>
          <div className="admin-logo" style={{ color: 'var(--ink)' }}>
            NOVA<span>ADMIN</span>
          </div>
          <div className="lang-switcher">
            {languages.map((l) => (
              <button
                key={l.code}
                type="button"
                className={`lang-btn ${language === l.code ? 'active' : ''}`}
                onClick={() => setLanguage(l.code)}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
        <p className="text-muted" style={{ marginBottom: 24, fontSize: 14 }}>
          {t('login_subtitle')}
        </p>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>{t('field_email')}</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label>{t('field_password')}</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <p className="field-error" style={{ marginBottom: 12 }}>{error}</p>}
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? t('btn_signing_in') : t('btn_sign_in')}
          </button>
        </form>
      </div>
    </div>
  );
}
