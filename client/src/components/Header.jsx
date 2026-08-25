import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useFavorites } from '../context/FavoritesContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { totalQuantity } = useCart();
  const { favorites } = useFavorites();
  const { t, language, setLanguage, languages } = useLanguage();
  const navigate = useNavigate();

  const NAV_LINKS = [
    { to: '/', label: t('nav_home') },
    { to: '/phones', label: t('nav_phones') },
    { to: '/brands', label: t('nav_brands') },
    { to: '/phones?sort=discount', label: t('nav_deals') },
    { to: '/about', label: t('nav_about') },
    { to: '/contact', label: t('nav_contact') }
  ];

  const submitSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/phones?search=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
      setMenuOpen(false);
    }
  };

  return (
    <header className="site-header">
      <div className="container flex-between site-header-inner">
        <Link to="/" className="logo" onClick={() => setMenuOpen(false)}>
          NOVA<span>MOBILE</span>
        </Link>

        <nav className="main-nav">
          {NAV_LINKS.map((link) => (
            <Link key={link.label} to={link.to}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <div className="lang-switcher">
            {languages.map((l) => (
              <button
                key={l.code}
                className={`lang-btn ${language === l.code ? 'active' : ''}`}
                onClick={() => setLanguage(l.code)}
              >
                {l.label}
              </button>
            ))}
          </div>
          <button
            className="icon-btn"
            aria-label="Search"
            onClick={() => setSearchOpen((v) => !v)}
          >
            <SearchIcon />
          </button>
          <Link to="/favorites" className="icon-btn" aria-label="Favorites">
            <HeartIcon />
            {favorites.length > 0 && <span className="icon-badge">{favorites.length}</span>}
          </Link>
          <Link to="/cart" className="icon-btn" aria-label="Cart">
            <CartIcon />
            {totalQuantity > 0 && <span className="icon-badge">{totalQuantity}</span>}
          </Link>
          <button
            className="icon-btn mobile-only"
            aria-label="Menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <MenuIcon open={menuOpen} />
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="search-bar">
          <form className="container" onSubmit={submitSearch}>
            <input
              autoFocus
              type="text"
              placeholder={t('search_placeholder')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" className="btn btn-signal btn-sm">
              {t('search_button')}
            </button>
          </form>
        </div>
      )}

      {menuOpen && (
        <div className="mobile-menu">
          {NAV_LINKS.map((link) => (
            <Link key={link.label} to={link.to} onClick={() => setMenuOpen(false)}>
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
function HeartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
  );
}
function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}
function MenuIcon({ open }) {
  return open ? (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ) : (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}
